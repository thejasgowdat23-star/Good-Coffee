import express from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';

const router = express.Router();
const PHONE_PATTERN = /^\d{10}$/;
const STATUS_VALUES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `GDC-${date}-${randomUUID().replaceAll('-', '').slice(-4).toUpperCase()}`;
}

router.post('/', async (req, res) => {
  try {
    const { customer = {}, orderType = 'table', tableNumber, items = [] } = req.body;
    const name = String(customer.name || req.body.customerName || '').trim();
    const phone = normalizePhone(customer.phone || req.body.phoneNumber);

    if (!name || !PHONE_PATTERN.test(phone)) {
      return res.status(400).json({ success: false, message: 'A valid customer name and 10-digit phone number are required.' });
    }
    if (!['delivery', 'pickup', 'table'].includes(orderType)) {
      return res.status(400).json({ success: false, message: 'Invalid order type.' });
    }
    if (orderType === 'table' && !String(tableNumber || '').trim()) {
      return res.status(400).json({ success: false, message: 'A table number is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one order item is required.' });
    }

    const normalizedItems = items.map(item => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      if (!item.productId || !String(item.name || '').trim() || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) {
        throw new Error('INVALID_ITEM');
      }
      return {
        productId: String(item.productId),
        name: String(item.name).trim(),
        quantity,
        price,
        image: String(item.image || ''),
        subtotal: Math.round(price * quantity)
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const order = {
      order_number: createOrderNumber(),
      customer: { name, phone, email: String(customer.email || '') },
      order_type: orderType,
      table_number: String(tableNumber || '').trim(),
      delivery_address: String(req.body.deliveryAddress || ''),
      items: normalizedItems,
      subtotal,
      total: subtotal,
      payment_method: 'in-store',
      order_status: 'Pending'
    };

    const { data: savedOrder, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Order placed successfully', order: toApiOrder(savedOrder) });
  } catch (error) {
    if (error.message === 'INVALID_ITEM') {
      return res.status(400).json({ success: false, message: 'Each order item must include a valid product, quantity, and price.' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Please try placing the order again.' });
    }
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to save the order.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const { data: rows, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const orders = rows.map(toApiOrder);
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Order lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load orders.' });
  }
});

router.patch('/:orderNumber/status', async (req, res) => {
  const { orderStatus } = req.body;
  if (!STATUS_VALUES.includes(orderStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }
  try {
    const { data: row, error } = await supabase.from('orders').update({ order_status: orderStatus, updated_at: new Date().toISOString() }).eq('order_number', req.params.orderNumber).select().single();
    if (error && error.code === 'PGRST116') return res.status(404).json({ success: false, message: 'Order not found.' });
    if (error) throw error;
    return res.json({ success: true, order: toApiOrder(row) });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update order status.' });
  }
});

function toApiOrder(row) {
  return {
    ...row,
    orderNumber: row.order_number,
    orderType: row.order_type,
    tableNumber: row.table_number,
    deliveryAddress: row.delivery_address,
    paymentMethod: row.payment_method,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: row.customer,
    items: row.items
  };
}

export default router;
