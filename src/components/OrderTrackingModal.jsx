import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, CheckCircle2, Clock, MapPin, Phone, User, RefreshCw, ShoppingBag, Coffee, ArrowRight, History } from 'lucide-react';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const STAGES = [
  { key: 'Order Placed', label: 'Order Placed', icon: '📝', desc: 'Order received & sent to barista' },
  { key: 'Confirmed', label: 'Confirmed', icon: '☕', desc: 'Order verified by our cafe team' },
  { key: 'Preparing', label: 'Preparing', icon: '🔥', desc: 'Fresh coffee & bakes in the making' },
  { key: 'Ready', label: 'Ready', icon: '✨', desc: 'Ready for table service / pickup' },
  { key: 'Completed', label: 'Completed', icon: '🎉', desc: 'Served & enjoyed' }
];

function getStageIndex(status) {
  if (!status) return 0;
  const s = String(status).toLowerCase();
  if (s === 'pending' || s === 'order placed') return 0;
  if (s === 'confirmed') return 1;
  if (s === 'preparing') return 2;
  if (s === 'ready') return 3;
  if (s === 'completed') return 4;
  if (s === 'cancelled') return -1;
  return 0;
}

export default function OrderTrackingModal() {
  const {
    activeOrder,
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    setIsOrderHistoryOpen,
    syncActiveOrderStatus,
    reorder
  } = useShop();

  const [order, setOrder] = useState(activeOrder);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const orderId = activeOrder?.orderId || activeOrder?.orderNumber || activeOrder?.id;

  // Poll order status from backend
  const fetchLatestStatus = async (silent = false) => {
    if (!orderId) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          syncActiveOrderStatus(data.order);
        }
      }
    } catch {
      // offline or network blip - keep local state
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrder) {
      setOrder(activeOrder);
      fetchLatestStatus(true);
    }
  }, [activeOrder, orderId]);

  // Live polling every 4 seconds when tracker is open
  useEffect(() => {
    if (!isOrderTrackingOpen || !orderId) return;
    const interval = setInterval(() => {
      fetchLatestStatus(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOrderTrackingOpen, orderId]);

  if (!isOrderTrackingOpen) return null;

  const currentStageIdx = getStageIndex(order?.orderStatus || order?.status);
  const isCancelled = (order?.orderStatus || order?.status) === 'Cancelled';

  const close = () => setIsOrderTrackingOpen(false);

  const openHistory = () => {
    setIsOrderTrackingOpen(false);
    setIsOrderHistoryOpen(true);
  };

  const handleReorder = () => {
    if (order) reorder(order);
  };

  return (
    <div className="order-modal-overlay" onClick={close}>
      <div className="order-modal-panel order-tracking-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="order-modal-header">
          <div className="order-modal-header__brand">
            <div className="order-brand-icon">
              <Coffee size={20} />
            </div>
            <div>
              <h3>Live Order Tracking</h3>
              <small>Good Day Coffee • Handcrafted Roastery</small>
            </div>
          </div>
          <div className="order-modal-header__actions">
            <button type="button" className="icon-btn-subtle" onClick={() => fetchLatestStatus(false)} title="Refresh status">
              <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
            </button>
            <button type="button" className="icon-btn-subtle" onClick={close} aria-label="Close tracking">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        {!order ? (
          <div className="order-empty-state">
            <Coffee size={42} />
            <h4>No Active Order Found</h4>
            <p>You have not placed any orders recently. Order some fresh brews and pastries!</p>
            <button
              className="button button--primary"
              type="button"
              onClick={() => {
                close();
                window.location.hash = '/coffee';
              }}
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="order-tracking-body">
            {/* Top Order ID & Estimated Prep Banner */}
            <div className="order-info-banner">
              <div className="order-info-banner__left">
                <span className="order-badge">ORDER ID</span>
                <strong className="order-id-code">{order.orderId || order.orderNumber}</strong>
                <span className="order-date-text">
                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Today'}
                </span>
              </div>
              <div className="order-info-banner__right">
                <div className="order-est-pill">
                  <Clock size={15} />
                  <span>Est. {order.estimatedPrepTime || '10-15 mins'}</span>
                </div>
                <div className="order-table-pill">
                  <MapPin size={14} />
                  <span>{order.tableNumber || 'Table 01'}</span>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="order-progress-card">
              <div className="order-progress-title-row">
                <h4>Status Progress</h4>
                <span className={`status-pill status-pill--${String(order.orderStatus || order.status || 'placed').toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.orderStatus || order.status || 'Order Placed'}
                </span>
              </div>

              {isCancelled ? (
                <div className="order-cancelled-notice">
                  <span>⚠️ This order was cancelled. Please contact our barista team.</span>
                </div>
              ) : (
                <div className="order-stepper">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    const isUpcoming = idx > currentStageIdx;

                    return (
                      <div
                        key={stage.key}
                        className={`stepper-step ${isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${isUpcoming ? 'is-upcoming' : ''}`}
                      >
                        <div className="stepper-step__marker">
                          {isCompleted ? (
                            <span className="stepper-check"><CheckCircle2 size={18} /></span>
                          ) : isCurrent ? (
                            <span className="stepper-active-dot"><i className="pulse-aura" /></span>
                          ) : (
                            <span className="stepper-empty-circle" />
                          )}
                          {idx < STAGES.length - 1 && (
                            <div className={`stepper-line ${isCompleted ? 'is-completed' : ''}`} />
                          )}
                        </div>
                        <div className="stepper-step__content">
                          <strong className="stepper-step__label">
                            <span className="stepper-icon">{stage.icon}</span> {stage.label}
                          </strong>
                          <small className="stepper-step__desc">{stage.desc}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Details & Table */}
            <div className="order-meta-grid">
              <div className="order-meta-item">
                <User size={15} />
                <div>
                  <small>Customer Name</small>
                  <strong>{order.customerName || order.customer?.name || 'Valued Guest'}</strong>
                </div>
              </div>
              <div className="order-meta-item">
                <Phone size={15} />
                <div>
                  <small>Phone Number</small>
                  <strong>{order.phoneNumber || order.customer?.phone || 'In-store'}</strong>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="order-items-card">
              <h4>Ordered Items ({order.items?.length || 0})</h4>
              <div className="order-items-list">
                {(order.items || []).map((item, idx) => (
                  <div className="order-item-row" key={`${item.productId || item.name}-${idx}`}>
                    <div className="order-item-row__thumb">
                      <img
                        src={getOptimizedImageUrl(item)}
                        alt={item.name}
                        width="46"
                        height="46"
                        loading="lazy"
                        decoding="async"
                        onError={e => {
                          if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }
                        }}
                      />
                    </div>
                    <div className="order-item-row__info">
                      <strong>{item.name}</strong>
                      <span>₹{item.price} × {item.quantity}</span>
                    </div>
                    <div className="order-item-row__total">
                      ₹{Math.round(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total-summary">
                <div className="order-total-summary__row">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount ?? order.total ?? 0}</span>
                </div>
                <div className="order-total-summary__row order-total-summary__row--grand">
                  <span>Grand Total</span>
                  <strong>₹{order.totalAmount ?? order.total ?? 0}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions-bar">
              <button type="button" className="button button--secondary" onClick={openHistory}>
                <History size={15} /> View Order History
              </button>
              <button type="button" className="button button--primary" onClick={handleReorder}>
                <ShoppingBag size={15} /> Reorder These Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
