import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import PriceTag from './PriceTag';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartTotal,
    setIsCheckoutOpen
  } = useShop();

  if (!isCartOpen) return null;

  return (
    <div
      className="cart-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        transition: 'opacity 0.16s ease'
      }}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="cart-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#120e0b',
          borderLeft: '1px solid rgba(229, 168, 92, 0.3)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(18, 14, 11, 0.85)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(229, 168, 92, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)'
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff' }}>
                Your Order Bag
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-beige)' }}>
                {cart.length} unique handcrafted items
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cream)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(229, 168, 92, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '16px'
                }}
              >
                ☕
              </div>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>
                Your Bag is Empty
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', maxWidth: '260px', marginBottom: '24px' }}>
                Explore our signature coffees and warm pastries to start your order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                Explore Menu
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '14px',
                  borderRadius: '16px',
                  alignItems: 'center'
                }}
              >
                {/* Product Thumbnail */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundImage: `url('${item.product.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }}
                />

                {/* Info & Adjustments */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '15px',
                      color: '#fff',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.product.name}
                  </h4>
                  <div style={{ fontSize: '13px', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                    <PriceTag value={item.product.finalPrice ?? item.product.price} />
                  </div>

                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      marginTop: '8px'
                    }}
                  >
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-cream)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff', minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-cream)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    <PriceTag value={(item.product.finalPrice ?? item.product.price) * item.quantity} />
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Summary & Checkout Action */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '24px 28px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(16, 12, 9, 0.95)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--color-muted)' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--color-cream)' }}>₹{cartSubtotal}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '20px'
              }}
            >
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: '#fff' }}>
                Estimated Total
              </span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 800, color: 'var(--color-gold-bright)' }}>
                ₹{cartTotal}
              </span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px'
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
