import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, Coffee, Phone, User, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
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
  const { isCheckoutOpen, setIsCheckoutOpen, cart, cartSubtotal, clearCart } = useShop();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
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
    const nextErrors = validateForm(form);
    if (cart.length === 0) {
      setSubmitError('Your order bag is empty. Please add an item before ordering.');
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (!API_BASE) {
      setSubmitError("We couldn't place your order. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone: form.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')
          },
          orderType: 'table',
          tableNumber: form.tableNumber,
          items: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: itemPrice(item),
            image: item.product.image
          }))
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 409 || payload.code === 'PRODUCT_UNAVAILABLE') throw new Error('UNAVAILABLE');
        throw new Error('FAILED');
      }
      const order = payload.order || payload;
      setConfirmedOrder({
        ...order,
        customerName: order.customer?.name || order.customerName || form.name,
        tableNumber: order.tableNumber || form.tableNumber,
        totalPrice: order.total ?? order.totalPrice ?? total
      });
      clearCart();
    } catch (error) {
      setSubmitError(error.message === 'UNAVAILABLE'
        ? 'Sorry, one of the items in your order is currently unavailable. Please review your cart.'
        : "We couldn't place your order. Please try again.");
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
            <div className="checkout-success__mark"><Check size={34} strokeWidth={2.5} /></div>
            <p className="checkout-kicker"><Coffee size={14} /> Good Day Coffee</p>
            <h2>Order Successfully Placed!</h2>
            <p>Thank you, <strong>{confirmedOrder.customerName}</strong>.</p>
            <p>Your order is being prepared.</p>
            <div className="checkout-success__details">
              <strong>{confirmedOrder.tableNumber}</strong>
              <strong>{confirmedOrder.orderNumber}</strong>
              <strong>₹{confirmedOrder.totalPrice}</strong>
            </div>
            <p className="checkout-success__wait">Please wait for your order.</p>
            <button className="button button--primary" type="button" onClick={returnToMenu}>Back to Menu</button>
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
                      <img src={item.product.image} alt="" />
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
