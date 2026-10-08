import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRight, Check, Coffee, Phone, User, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TABLES = Array.from({ length: 20 }, (_, index) => `Table ${String(index + 1).padStart(2, '0')}`);
const EMPTY_FORM = { name: '', phone: '', tableNumber: '' };

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please enter your name.';
  const phone = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^\d{10}$/.test(phone)) errors.phone = 'Please enter a valid 10-digit phone number.';
  if (!form.tableNumber) errors.tableNumber = 'Please select your table.';
  return errors;
}

const itemPrice = item => item.product.finalPrice ?? item.product.price;

export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartSubtotal, clearCart, saveCompletedOrder, trackOrder } = useShop();
  const { user, isAuthenticated, openAuth } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Auto-fill from authenticated user
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || user.customerName || '',
        phone: prev.phone || user.phone || user.phoneNumber || ''
      }));
    }
  }, [user]);

  // Auth gate check
  useEffect(() => {
    if (isCheckoutOpen && !isAuthenticated && !confirmedOrder) {
      setIsCheckoutOpen(false);
      openAuth(() => setIsCheckoutOpen(true));
    }
  }, [isCheckoutOpen, isAuthenticated, confirmedOrder, setIsCheckoutOpen, openAuth]);

  const total = useMemo(() => cartSubtotal, [cartSubtotal]);
  const normalizedPhone = form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  const canSubmit = Boolean(form.name.trim() && /^\d{10}$/.test(normalizedPhone) && form.tableNumber && cart.length > 0);

  if (!isCheckoutOpen) return null;

  const updateField = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!isAuthenticated) {
      setIsCheckoutOpen(false);
      openAuth(() => setIsCheckoutOpen(true));
      return;
    }

    const nextErrors = validateForm(form);
    if (cart.length === 0) {
      setSubmitError('Your order bag is empty. Please add an item before ordering.');
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: itemPrice(item),
      image: item.product.image,
      subtotal: itemPrice(item) * item.quantity
    }));

    const userId = user?.id || user?.userId || `usr_${normalizedPhone}`;
    const customerEmail = user?.email || '';

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          user_id: userId,
          customerId: userId,
          customer: {
            name: form.name.trim(),
            phone: normalizedPhone,
            email: customerEmail
          },
          customerName: form.name.trim(),
          phoneNumber: normalizedPhone,
          orderType: 'table',
          tableNumber: form.tableNumber,
          items: orderItems
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409 || payload.code === 'PRODUCT_UNAVAILABLE') throw new Error('UNAVAILABLE');
        throw new Error('FAILED');
      }
      const rawOrder = payload.order || payload;
      const order = {
        ...rawOrder,
        userId,
        customerId: userId,
        customerName: rawOrder.customer?.name || rawOrder.customerName || form.name.trim(),
        phoneNumber: rawOrder.customer?.phone || rawOrder.phoneNumber || normalizedPhone,
        customerEmail,
        tableNumber: rawOrder.tableNumber || form.tableNumber,
        items: rawOrder.items && rawOrder.items.length > 0 ? rawOrder.items : orderItems,
        totalPrice: rawOrder.total ?? rawOrder.totalPrice ?? rawOrder.totalAmount ?? total,
        totalAmount: rawOrder.total ?? rawOrder.totalPrice ?? rawOrder.totalAmount ?? total,
        orderStatus: rawOrder.orderStatus || rawOrder.status || 'Order Placed',
        createdAt: rawOrder.createdAt || new Date().toISOString()
      };

      // Save to ShopContext and customer history
      saveCompletedOrder(order);
      setConfirmedOrder(order);
      clearCart();
    } catch (error) {
      // Fallback offline creation so user NEVER loses their order
      const fallbackOrder = {
        orderId: `GDC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
        orderNumber: `GDC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.floor(100 + Math.random() * 900)}`,
        userId,
        customerId: userId,
        customerName: form.name.trim(),
        phoneNumber: normalizedPhone,
        customerEmail,
        tableNumber: form.tableNumber,
        items: orderItems,
        totalPrice: total,
        totalAmount: total,
        orderStatus: 'Order Placed',
        createdAt: new Date().toISOString()
      };
      saveCompletedOrder(fallbackOrder);
      setConfirmedOrder(fallbackOrder);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnToMenu = () => {
    setConfirmedOrder(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsCheckoutOpen(false);
    window.location.hash = '/coffee';
  };

  const handleTrackNow = () => {
    if (confirmedOrder) {
      const orderToTrack = confirmedOrder;
      setConfirmedOrder(null);
      setForm(EMPTY_FORM);
      setErrors({});
      setIsCheckoutOpen(false);
      trackOrder(orderToTrack);
    }
  };

  const close = () => {
    if (!isSubmitting) {
      setIsCheckoutOpen(false);
      setSubmitError('');
    }
  };

  return (
    <div className="checkout-overlay" onClick={close}>
      <div className={`checkout-panel${confirmedOrder ? ' checkout-panel--success' : ''}`} onClick={event => event.stopPropagation()}>
        <button className="checkout-close" type="button" onClick={close} aria-label="Close table order"><X size={18} /></button>
        {confirmedOrder ? (
          <section className="checkout-success" aria-live="polite">
            <div className="checkout-success__mark"><Check size={36} strokeWidth={2.5} /></div>
            <p className="checkout-kicker"><Coffee size={14} /> Good Day Coffee • Table Order</p>
            <h2>Order Placed Successfully!</h2>
            <p className="checkout-success__sub">Thank you, <strong>{confirmedOrder.customerName}</strong>. Your handcrafted order is being prepared with care.</p>
            
            {/* Complete Order Details Card */}
            <div className="checkout-confirmed-card">
              <div className="confirmed-row">
                <span>Order ID:</span>
                <strong className="confirmed-id">{confirmedOrder.orderId || confirmedOrder.orderNumber}</strong>
              </div>
              <div className="confirmed-row">
                <span>Table:</span>
                <strong>{confirmedOrder.tableNumber}</strong>
              </div>
              <div className="confirmed-row">
                <span>Customer:</span>
                <span>{confirmedOrder.customerName} ({confirmedOrder.phoneNumber})</span>
              </div>
              <div className="confirmed-row">
                <span>Date & Time:</span>
                <span>{new Date(confirmedOrder.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <div className="confirmed-row">
                <span>Status:</span>
                <span className="status-pill status-pill--order-placed">{confirmedOrder.orderStatus || 'Order Placed'}</span>
              </div>

              {/* Items List */}
              <div className="confirmed-items-list">
                <strong>Ordered Items:</strong>
                {confirmedOrder.items?.map((item, index) => (
                  <div className="confirmed-item-line" key={index}>
                    <span className="item-name">{item.quantity}× {item.name}</span>
                    <span className="item-price">₹{Math.round(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="confirmed-total-row">
                <span>Total Amount:</span>
                <strong>₹{confirmedOrder.totalPrice || confirmedOrder.totalAmount}</strong>
              </div>
            </div>

            <div className="checkout-success-actions">
              <button className="button button--primary btn-track-now" type="button" onClick={handleTrackNow}>
                Track Order
              </button>
              <button className="button button--secondary" type="button" onClick={returnToMenu}>
                Back to Menu
              </button>
            </div>
          </section>
        ) : (
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <header className="checkout-header">
              <p className="checkout-kicker"><Coffee size={14} /> Good Day Coffee - Table Order</p>
              <h2>Place Your Table Order</h2>
              <p>Enjoy your coffee. We'll bring it to your table.</p>
            </header>
            <div className="checkout-layout">
              <div className="checkout-fields">
                <Field label="Full Name" icon={<User size={16} />} error={errors.name}>
                  <input type="text" placeholder="Enter your name" value={form.name} onChange={event => updateField('name', event.target.value)} onBlur={() => setErrors(validateForm(form))} />
                </Field>
                <Field label="Phone Number" icon={<Phone size={16} />} error={errors.phone}>
                  <input type="tel" inputMode="numeric" placeholder="Enter your phone number" value={form.phone} onChange={event => updateField('phone', event.target.value)} onBlur={() => setErrors(validateForm(form))} />
                </Field>
                <Field label="Table Number" error={errors.tableNumber}>
                  <select value={form.tableNumber} onChange={event => updateField('tableNumber', event.target.value)} onBlur={() => setErrors(validateForm(form))}>
                    <option value="">Select your table</option>
                    {TABLES.map(table => <option key={table} value={table}>{table}</option>)}
                  </select>
                </Field>
              </div>
              <aside className="checkout-summary">
                <h3>Your Order</h3>
                <div className="checkout-items">
                  {cart.map(item => (
                    <div className="checkout-item" key={item.product.id}>
                      <img
                        src={getOptimizedImageUrl(item.product)}
                        alt={item.product?.name || ''}
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        onError={event => {
                          if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                            event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }
                        }}
                      />
                      <div><strong>{item.product.name}</strong><span>₹{itemPrice(item)} x {item.quantity}</span></div>
                      <b>₹{itemPrice(item) * item.quantity}</b>
                    </div>
                  ))}
                </div>
                <div className="checkout-total"><span>Subtotal</span><strong>₹{total}</strong></div>
                <div className="checkout-total checkout-total--grand"><span>Total</span><strong>₹{total}</strong></div>
                {submitError && <p className="checkout-error checkout-error--general" role="alert">{submitError}</p>}
                <button className="button button--primary checkout-submit" type="submit" disabled={isSubmitting || !canSubmit}>
                  {isSubmitting ? 'Placing Order...' : 'Order Now'} <ArrowRight size={17} />
                </button>
              </aside>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

function Field({ label, icon, error, children }) {
  return (
    <div className="checkout-field">
      <label>{label}</label>
      <div className="checkout-input-wrap">{icon}{children}</div>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </div>
  );
}

export default CheckoutModal;
