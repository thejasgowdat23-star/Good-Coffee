import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, History, ShoppingBag, Eye, MapPin, Calendar, ArrowRight, Coffee, RefreshCw } from 'lucide-react';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function OrderHistoryModal() {
  const {
    orders,
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    trackOrder,
    reorder,
    saveCompletedOrder
  } = useShop();

  const [loading, setLoading] = useState(false);

  if (!isOrderHistoryOpen) return null;

  const close = () => setIsOrderHistoryOpen(false);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          data.orders.forEach(o => saveCompletedOrder(o));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (order) => {
    trackOrder(order);
  };

  const handleReorder = (order) => {
    reorder(order);
  };

  return (
    <div className="order-modal-overlay" onClick={close}>
      <div className="order-modal-panel order-history-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="order-modal-header">
          <div className="order-modal-header__brand">
            <div className="order-brand-icon">
              <History size={20} />
            </div>
            <div>
              <h3>Order History</h3>
              <small>{orders.length} past & active order{orders.length === 1 ? '' : 's'}</small>
            </div>
          </div>
          <div className="order-modal-header__actions">
            <button type="button" className="icon-btn-subtle" onClick={refreshOrders} title="Refresh orders">
              <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            </button>
            <button type="button" className="icon-btn-subtle" onClick={close} aria-label="Close history">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Orders List */}
        <div className="order-history-body">
          {orders.length === 0 ? (
            <div className="order-empty-state">
              <div className="order-empty-icon">☕</div>
              <h4>No orders yet</h4>
              <p>Order your favourite coffee and snacks!</p>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  close();
                  window.location.hash = '/coffee';
                }}
              >
                <span>Explore Menu</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="order-cards-grid">
              {orders.map((order, index) => {
                const orderId = order.orderId || order.orderNumber || order.id || `GDC-${index}`;
                const status = order.orderStatus || order.status || 'Order Placed';
                const statusClass = String(status).toLowerCase().replace(/\s+/g, '-');
                const total = order.totalAmount ?? order.total ?? order.totalPrice ?? 0;
                const dateStr = order.createdAt
                  ? new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Recent Order';

                return (
                  <article className="order-card" key={orderId}>
                    <div className="order-card__header">
                      <div className="order-card__id-group">
                        <span className="order-card__badge">ORDER</span>
                        <strong className="order-card__number">{orderId}</strong>
                      </div>
                      <span className={`status-pill status-pill--${statusClass}`}>
                        {status}
                      </span>
                    </div>

                    <div className="order-card__meta">
                      <span className="order-card__date">
                        <Calendar size={13} /> {dateStr}
                      </span>
                      <span className="order-card__table">
                        <MapPin size={13} /> {order.tableNumber || 'Table 01'}
                      </span>
                    </div>

                    {/* Items Preview */}
                    <div className="order-card__items-preview">
                      <div className="order-card__thumbs">
                        {(order.items || []).slice(0, 4).map((item, idx) => (
                          <div className="order-card__mini-thumb" key={idx} title={`${item.name} (${item.quantity}x)`}>
                            <img
                              src={getOptimizedImageUrl(item)}
                              alt={item.name}
                              width="36"
                              height="36"
                              loading="lazy"
                              decoding="async"
                              onError={e => {
                                if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                                }
                              }}
                            />
                            {item.quantity > 1 && <span className="mini-qty">{item.quantity}</span>}
                          </div>
                        ))}
                        {(order.items || []).length > 4 && (
                          <div className="order-card__more-items">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="order-card__items-summary">
                        <p>{(order.items || []).map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="order-card__footer">
                      <div className="order-card__total">
                        <small>Total Amount</small>
                        <strong>₹{total}</strong>
                      </div>

                      <div className="order-card__actions">
                        <button
                          type="button"
                          className="btn-order-action btn-order-action--view"
                          onClick={() => handleTrack(order)}
                        >
                          <Eye size={14} /> Track Order
                        </button>
                        <button
                          type="button"
                          className="btn-order-action btn-order-action--reorder"
                          onClick={() => handleReorder(order)}
                        >
                          <ShoppingBag size={14} /> Reorder
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
