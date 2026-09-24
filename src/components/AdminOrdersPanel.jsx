import React, { useState } from 'react';
import { ClipboardList, RefreshCw, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function AdminOrdersPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    if (!API_BASE) {
      setStatus('Orders are available when the backend API is configured.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders`);
      if (!response.ok) throw new Error('Unable to load orders');
      const payload = await response.json();
      setOrders(Array.isArray(payload) ? payload : payload.orders || []);
      setStatus('');
    } catch {
      setStatus('Unable to load orders right now.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderNumber, nextStatus) => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: nextStatus })
      });
      if (!response.ok) throw new Error('Unable to update order');
      await loadOrders();
    } catch {
      setStatus('Unable to update this order right now.');
    }
  };

  return (
    <>
      <button type="button" className="admin-orders-trigger" onClick={() => { setIsOpen(true); loadOrders(); }}>
        <ClipboardList size={15} /> Orders
      </button>
      {isOpen && (
        <div className="admin-orders-overlay" onClick={() => setIsOpen(false)}>
          <section className="admin-orders-panel" onClick={event => event.stopPropagation()}>
            <header>
              <div><p className="checkout-kicker"><ClipboardList size={14} /> Good Day Coffee</p><h2>Table Orders</h2></div>
              <div className="admin-orders-actions">
                <button type="button" onClick={loadOrders} aria-label="Refresh orders"><RefreshCw size={16} /></button>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close orders"><X size={18} /></button>
              </div>
            </header>
            {status && <p className="admin-orders-status" role="status">{status}</p>}
            <div className="admin-orders-list">
              {loading && <p className="admin-orders-empty">Loading orders...</p>}
              {!loading && orders.length === 0 && !status && <p className="admin-orders-empty">No table orders yet.</p>}
              {!loading && orders.map(order => (
                <article className="admin-order-card" key={order.orderNumber}>
                  <div className="admin-order-card__header"><strong>{order.orderNumber}</strong><span>{new Date(order.createdAt).toLocaleString()}</span></div>
                  <div className="admin-order-card__details">
                    <span>{order.customer?.name || order.customerName}</span><span>{order.customer?.phone || order.phoneNumber}</span><span>{order.tableNumber}</span>
                  </div>
                  <ul>{(order.items || []).map(item => <li key={`${order.orderNumber}-${item.productId}`}>{item.quantity} x {item.name || item.productName}</li>)}</ul>
                  <div className="admin-order-card__footer"><strong>Total: ₹{order.total ?? order.totalPrice}</strong><label>Status<select value={order.orderStatus} onChange={event => updateStatus(order.orderNumber, event.target.value)}>{STATUSES.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
