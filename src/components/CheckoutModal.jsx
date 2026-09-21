import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Coffee, Sparkles, MapPin, Phone, User, ArrowRight } from 'lucide-react';

export const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotal,
    clearCart
  } = useShop();

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'upi',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please provide your name and phone number.');
      return;
    }
    if (orderType === 'delivery' && !formData.address) {
      alert('Please enter your delivery address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `GDC-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrder({
        id: orderId,
        items: [...cart],
        total: cartTotal,
        customer: { ...formData },
        orderType: orderType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setIsSubmitting(false);
      setIsConfirmed(true);
      clearCart();

    }, 900);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsConfirmed(false);
  };

  return (
    <div
      className="checkout-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div
        className="checkout-panel"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#120e0b',
          borderRadius: '28px',
          border: '1px solid rgba(229, 168, 92, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(229, 168, 92, 0.15)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cream)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={18} />
        </button>

        {/* Confirmation Screen */}
        {isConfirmed ? (
          <div
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Animated Coffee Cup & Steam Glow */}
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f6c888, #e5a85c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                boxShadow: '0 0 40px rgba(229, 168, 92, 0.6)',
                marginBottom: '24px',
              }}
            >
              ☕
            </div>

            <div className="badge-gold" style={{ marginBottom: '14px' }}>
              <Sparkles size={13} /> Order Received & Brewing
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 900,
                color: '#fff',
                marginBottom: '10px'
              }}
            >
              Order Confirmed ☕
            </h2>

            <p
              style={{
                fontSize: '15px',
                color: 'var(--color-beige)',
                maxWidth: '440px',
                lineHeight: 1.6,
                marginBottom: '28px'
              }}
            >
              Thank you, <strong style={{ color: '#fff' }}>{confirmedOrder?.customer.name}</strong>! Your artisanal brew is being freshly extracted by our master baristas.
            </p>

            {/* Receipt Summary Card */}
            <div
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(229, 168, 92, 0.2)',
                borderRadius: '18px',
                padding: '20px 24px',
                textAlign: 'left',
                marginBottom: '32px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Order ID:</span>
                <span style={{ color: 'var(--color-gold-bright)', fontWeight: 700 }}>{confirmedOrder?.id}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Type:</span>
                <span style={{ color: '#fff', textTransform: 'capitalize' }}>
                  {confirmedOrder?.orderType} ({confirmedOrder?.orderType === 'delivery' ? 'Est. 25-30 mins' : 'Ready in 10 mins'})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-muted)' }}>Phone Contact:</span>
                <span style={{ color: '#fff' }}>{confirmedOrder?.customer.phone}</span>
              </div>

              {confirmedOrder?.orderType === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Delivery Address:</span>
                  <span style={{ color: '#fff', maxWidth: '240px', textAlign: 'right' }}>
                    {confirmedOrder?.customer.address}
                  </span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 700
                }}
              >
                <span style={{ color: '#fff' }}>Amount Paid:</span>
                <span style={{ color: 'var(--color-gold-bright)' }}>₹{confirmedOrder?.total}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn-primary"
              style={{ padding: '14px 36px', fontSize: '15px' }}
            >
              Back to Experience
            </button>
          </div>
        ) : (
          /* Checkout Input Form */
          <form onSubmit={handleSubmitOrder} style={{ padding: '36px 36px 40px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="badge-gold" style={{ marginBottom: '8px' }}>
                <Coffee size={13} /> Finalize Your Craft
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: '#fff' }}>
                Checkout & Delivery
              </h3>
            </div>

            {/* Delivery vs Pickup Toggle */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: orderType === 'delivery' ? 'var(--color-gold)' : 'transparent',
                  color: orderType === 'delivery' ? '#120e0b' : 'var(--color-cream)',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.16s ease, opacity 0.16s ease'
                }}
              >
                🚴 Direct Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: orderType === 'pickup' ? 'var(--color-gold)' : 'transparent',
                  color: orderType === 'pickup' ? '#120e0b' : 'var(--color-cream)',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.16s ease, opacity 0.16s ease'
                }}
              >
                ☕ Roastery Counter Pickup
              </button>
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-gold)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(229, 168, 92, 0.25)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Phone Number (For Order SMS / Call) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-gold)' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(229, 168, 92, 0.25)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Delivery Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--color-gold)' }} />
                    <textarea
                      required
                      rows={2}
                      placeholder="Apartment, building, street, landmark..."
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(229, 168, 92, 0.25)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'upi', label: 'UPI / GPay' },
                    { id: 'card', label: 'Card' },
                    { id: 'cash', label: 'Pay on Arrival' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        background:
                          formData.paymentMethod === method.id
                            ? 'rgba(229, 168, 92, 0.2)'
                            : 'rgba(255, 255, 255, 0.03)',
                        border:
                          formData.paymentMethod === method.id
                            ? '1px solid var(--color-gold)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        color:
                          formData.paymentMethod === method.id
                            ? 'var(--color-gold-bright)'
                            : 'var(--color-cream)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Display & Place Order Button */}
            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                  Final Amount
                </span>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                  ₹{cartTotal}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '15px' }}
              >
                {isSubmitting ? 'Brewing Order...' : 'Place Order'}
                <ArrowRight size={17} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
