import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { X, History, ShoppingBag, Eye, MapPin, Calendar, ArrowRight, Coffee, RefreshCw, UserCheck, LogIn } from 'lucide-react';
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

  const { user, isAuthenticated, openAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  // Filter orders for the authenticated user only
  const userOrders = useMemo(() => {
    if (!isAuthenticated || !user) return [];
    const userId = user.id || user.userId;
    const phone = user.phone || user.phoneNumber;

    return orders.filter(o => {
      const matchId = userId && (o.userId === userId || o.customerId === userId || o.user_id === userId);
      const matchPhone = phone && (o.phoneNumber === phone || o.customer?.phone === phone);
      return matchId || matchPhone;
    });
  }, [orders, user, isAuthenticated]);

  const activeOrders = userOrders.filter(o => !['Completed', 'Cancelled'].includes(o.orderStatus || o.status));
  const pastOrders = userOrders.filter(o => ['Completed', 'Cancelled'].includes(o.orderStatus || o.status));

  const refreshOrders = async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      const queryParam = user.phone ? `phone=${encodeURIComponent(user.phone)}` : `userId=${encodeURIComponent(user.id)}`;
      const res = await fetch(`${API_BASE}/api/orders?${queryParam}`);
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

  useEffect(() => {
    if (isOrderHistoryOpen && isAuthenticated) {
      refreshOrders();
    }
  }, [isOrderHistoryOpen, isAuthenticated]);

  if (!isOrderHistoryOpen) return null;

  const close = () => setIsOrderHistoryOpen(false);

  const handleTrack = (order) => {
    trackOrder(order);
  };

  const handleReorder = (order) => {
    reorder(order);
  };

  const renderOrderCard = (order, isTopActive = false) => {
    const orderId = order.orderId || order.orderNumber || order.id || 'GDC-ORDER';
    const status = order.orderStatus || order.status || 'Order Placed';
    const statusClass = String(status).toLowerCase().replace(/\s+/g, '-');
    const total = order.totalAmount ?? order.total ?? order.totalPrice ?? 0;
    const dateStr = order.createdAt
      ? new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : 'Recent Order';

    return (
      <article className={`order-card ${isTopActive ? 'order-card--active-highlight' : ''}`} key={orderId}>
        <div className="order-card__header">
          <div className="order-card__id-group">
            <span className={`order-card__badge ${isTopActive ? 'order-card__badge--active' : ''}`}>
              {isTopActive ? 'CURRENT ORDER' : 'ORDER'}
            </span>
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
              <small>
                {isAuthenticated
                  ? `${userOrders.length} order${userOrders.length === 1 ? '' : 's'} for ${user?.name || user?.phone || 'you'}`
                  : 'Please sign in to view your orders'}
              </small>
            </div>
          </div>
          <div className="order-modal-header__actions">
            {isAuthenticated && (
              <button type="button" className="icon-btn-subtle" onClick={refreshOrders} title="Refresh orders">
                <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
              </button>
            )}
            <button type="button" className="icon-btn-subtle" onClick={close} aria-label="Close history">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Orders List */}
        <div className="order-history-body">
          {!isAuthenticated ? (
            <div className="order-empty-state">
              <div className="order-empty-icon">☕</div>
              <h4>Sign In to View Orders</h4>
              <p>Your order history is securely saved to your phone or Google account.</p>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  close();
                  openAuth(() => setIsOrderHistoryOpen(true));
                }}
              >
                <LogIn size={16} />
                <span>Sign In / Verify Phone</span>
              </button>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="order-empty-state">
              <div className="order-empty-icon">☕</div>
              <h4>No orders yet</h4>
              <p className="order-empty-quote">“No orders yet. Your first good day is just one coffee away ☕”</p>
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
              {/* Active Orders First */}
              {activeOrders.map(order => renderOrderCard(order, true))}
              {/* Past Orders Next */}
              {pastOrders.map(order => renderOrderCard(order, false))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
