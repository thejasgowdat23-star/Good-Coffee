import express from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { localOrderStore } from '../lib/orderStore.js';

const router = express.Router();
const PHONE_PATTERN = /^\d{10}$/;
const STATUS_VALUES = ['Order Placed', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const seq = String(Math.floor(100 + Math.random() * 900));
  return `GDC-${date}-${seq}`;
}

function toApiOrder(row) {
  if (!row) return null;
  const status = row.order_status === 'Pending' ? 'Order Placed' : (row.order_status || row.orderStatus || 'Order Placed');
  const orderId = row.order_number || row.orderNumber || row.id;
  const customer = row.customer || {};
  const customerName = customer.name || row.customer_name || row.customerName || '';
  const phoneNumber = customer.phone || row.phone_number || row.phoneNumber || '';
  const customerEmail = customer.email || row.customer_email || row.customerEmail || '';
  const userId = row.user_id || row.userId || row.customer_id || (phoneNumber ? `usr_${phoneNumber}` : 'guest');
  const tableNumber = row.table_number || row.tableNumber || '';
  const total = Number(row.total ?? row.totalPrice ?? row.totalAmount ?? row.subtotal ?? 0);

  return {
    id: row.id || orderId,
    orderId,
    orderNumber: orderId,
    userId,
    user_id: userId,
    customerId: userId,
    customerName,
    phoneNumber,
    customerEmail,
    customer: { name: customerName, phone: phoneNumber, email: customerEmail },
    orderType: row.order_type || row.orderType || 'table',
    tableNumber,
    deliveryAddress: row.delivery_address || row.deliveryAddress || '',
    items: row.items || [],
    subtotal: total,
    total,
    totalAmount: total,
    totalPrice: total,
    paymentMethod: row.payment_method || row.paymentMethod || 'in-store',
    status,
    orderStatus: status,
    estimatedPrepTime: row.estimated_prep_time || '10-15 mins',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { customer = {}, orderType = 'table', tableNumber, items = [] } = req.body;
    const name = String(customer.name || req.body.customerName || '').trim();
    const phone = normalizePhone(customer.phone || req.body.phoneNumber);
    const email = String(customer.email || req.body.customerEmail || '').trim();
    const userId = String(req.body.userId || req.body.user_id || req.body.customerId || (phone ? `usr_${phone}` : randomUUID()));

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
    const orderNumber = createOrderNumber();
    const order = {
      order_number: orderNumber,
      orderNumber,
      user_id: userId,
      userId,
      customer_id: userId,
      customerId: userId,
      customer: { name, phone, email },
      customerName: name,
      phoneNumber: phone,
      customerEmail: email,
      order_type: orderType,
      orderType,
      table_number: String(tableNumber || '').trim(),
      tableNumber: String(tableNumber || '').trim(),
      delivery_address: String(req.body.deliveryAddress || ''),
      items: normalizedItems,
      subtotal,
      total: subtotal,
      totalAmount: subtotal,
      totalPrice: subtotal,
      payment_method: 'in-store',
      order_status: 'Order Placed',
      orderStatus: 'Order Placed',
      estimated_prep_time: '10-15 mins',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to local persistent store
    localOrderStore.save(order);

    // Also attempt to save to Supabase
    try {
      const insertPayload = {
        order_number: order.order_number,
        customer: order.customer,
        order_type: order.order_type,
        table_number: order.table_number,
        delivery_address: order.delivery_address,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        payment_method: order.payment_method,
        order_status: 'Order Placed'
      };

      // Add user_id to insert if available
      if (userId) {
        insertPayload.user_id = userId;
      }

      const { data: savedOrder, error } = await supabase.from('orders').insert(insertPayload).select().single();

      if (error) {
        console.error('Supabase insert error:', { code: error.code, message: error.message, details: error.details, hint: error.hint });
      }

      if (!error && savedOrder) {
        localOrderStore.save({ ...order, id: savedOrder.id });
        return res.status(201).json({ success: true, message: 'Order placed successfully', order: toApiOrder(savedOrder) });
      }
    } catch (dbErr) {
      console.error('Supabase insert exception (falling back to local persistent store):', dbErr.message);
    }

    return res.status(201).json({ success: true, message: 'Order placed successfully', order: toApiOrder(order) });
  } catch (error) {
    if (error.message === 'INVALID_ITEM') {
      return res.status(400).json({ success: false, message: 'Each order item must include a valid product, quantity, and price.' });
    }
    console.error('Order creation failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to save the order.' });
  }
});

// GET /api/orders - Get all orders or filter by customer userId / phone
router.get('/', async (req, res) => {
  const phone = req.query.phone || req.query.phoneNumber;
  const userId = req.query.userId || req.query.user_id || req.query.customerId;

  try {
    let orders = [];
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data: rows, error } = await query;
      if (!error && Array.isArray(rows)) {
        orders = rows.map(toApiOrder);
      }
    } catch (e) {
      console.warn('Supabase fetch error, using local fallback:', e.message);
    }

    // Merge with local persistent store
    const localOrders = localOrderStore.getAll().map(toApiOrder);
    const orderMap = new Map();
    [...orders, ...localOrders].forEach(o => {
      if (o && o.orderNumber) orderMap.set(o.orderNumber, o);
    });

    let merged = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (userId || phone) {
      const cleanPhone = phone ? normalizePhone(phone) : null;
      merged = merged.filter(o => {
        const matchUser = userId && (o.userId === userId || o.customerId === userId || o.user_id === userId);
        const matchPhone = cleanPhone && normalizePhone(o.phoneNumber || o.customer?.phone) === cleanPhone;
        return matchUser || matchPhone;
      });
    }

    return res.json({ success: true, orders: merged });
  } catch (error) {
    console.error('Order lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load orders.' });
  }
});

// GET /api/orders/:orderId - Get single order by order number or ID
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    // Check Supabase first
    try {
      const { data: row, error } = await supabase.from('orders').select('*').or(`order_number.eq.${orderId},id.eq.${orderId}`).maybeSingle();
      if (!error && row) {
        return res.json({ success: true, order: toApiOrder(row) });
      }
    } catch (e) {
      // ignore, fallback
    }

    // Check local store
    const local = localOrderStore.getById(orderId);
    if (local) {
      return res.json({ success: true, order: toApiOrder(local) });
    }

    return res.status(404).json({ success: false, message: 'Order not found.' });
  } catch (error) {
    console.error('Single order lookup failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load order details.' });
  }
});

// PATCH /api/orders/:orderId/status - Update order status
router.patch('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, status: altStatus } = req.body;
  const newStatus = orderStatus || altStatus;

  if (!STATUS_VALUES.includes(newStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }

  try {
    let updatedOrder = null;
    localOrderStore.updateStatus(orderId, newStatus);

    try {
      const { data: row, error } = await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('order_number', orderId)
        .select()
        .single();
      if (!error && row) {
        updatedOrder = toApiOrder(row);
      }
    } catch (e) {
      // ignore
    }

    if (!updatedOrder) {
      const local = localOrderStore.getById(orderId);
      if (local) updatedOrder = toApiOrder(local);
    }

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Order status update failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update order status.' });
  }
});

export default router;
