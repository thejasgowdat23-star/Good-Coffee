import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Clock, History, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';
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
    setIsCheckoutOpen,
    orders,
    activeOrder,
    trackOrder,
    reorder,
    drawerTab,
    setDrawerTab
  } = useShop();

  const { isAuthenticated, openAuth } = useAuth();

  if (!isCartOpen) return null;

  const handleOpenTracking = (order) => {
    setIsCartOpen(false);
    trackOrder(order || activeOrder);
  };

  const activeOrdersCount = orders.filter(o => !['Completed', 'Cancelled'].includes(o.orderStatus || o.status)).length;

  return (
    <div
      className="cart-drawer-overlay"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="cart-drawer-panel"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-header__info">
            <div className="cart-drawer-header__icon">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3>Good Day Orders</h3>
              <span>{cart.length} in bag • {orders.length} in history</span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="cart-drawer-close"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="drawer-tabs-nav">
          <button
            type="button"
            className={`drawer-tab-btn ${drawerTab === 'cart' ? 'is-active' : ''}`}
            onClick={() => setDrawerTab('cart')}
          >
            <ShoppingBag size={14} />
            <span>Bag</span>
            {cart.length > 0 && <span className="tab-pill">{cart.length}</span>}
          </button>

          <button
            type="button"
            className={`drawer-tab-btn ${drawerTab === 'tracking' ? 'is-active' : ''}`}
            onClick={() => setDrawerTab('tracking')}
          >
            <Clock size={14} />
            <span>Active Order</span>
            {activeOrdersCount > 0 && <span className="tab-pill tab-pill--active">{activeOrdersCount}</span>}
          </button>

          <button
            type="button"
            className={`drawer-tab-btn ${drawerTab === 'history' ? 'is-active' : ''}`}
            onClick={() => setDrawerTab('history')}
          >
            <History size={14} />
            <span>History</span>
            {orders.length > 0 && <span className="tab-pill">{orders.length}</span>}
          </button>
        </div>

        {/* TAB 1: CART / BAG */}
        {drawerTab === 'cart' && (
          <>
            <div className="cart-drawer-body">
              {cart.length === 0 ? (
                <div className="drawer-empty-state">
                  <div className="drawer-empty-icon">☕</div>
                  <h4>Your Bag is Empty</h4>
                  <p>Explore our signature coffees and warm pastries to start your order.</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      window.location.hash = '/coffee';
                    }}
                    className="button button--primary"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                cart.map(item => {
                  const price = item.product.finalPrice ?? item.product.price;
                  return (
                    <div className="cart-item-row" key={item.product.id}>
                      <div className="cart-item-row__thumb">
                        <img
                          src={getOptimizedImageUrl(item.product)}
                          alt={item.product?.name || ''}
                          width="60"
                          height="60"
                          loading="lazy"
                          decoding="async"
                          onError={event => {
                            if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                              event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                            }
                          }}
                        />
                      </div>

                      <div className="cart-item-row__info">
                        <h4>{item.product.name}</h4>
                        <div className="cart-item-row__price">
                          <PriceTag value={price} />
                        </div>

                        <div className="cart-qty-controls">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-row__right">
                        <span className="cart-item-row__subtotal">
                          <PriceTag value={price * item.quantity} />
                        </span>
                        <button
                          type="button"
                          className="cart-item-delete"
                          onClick={() => removeFromCart(item.product.id)}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-summary-line">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="cart-summary-line cart-summary-line--total">
                  <span>Estimated Total</span>
                  <strong>₹{cartTotal}</strong>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    if (!isAuthenticated) {
                      openAuth(() => setIsCheckoutOpen(true));
                    } else {
                      setIsCheckoutOpen(true);
                    }
                  }}
                  className="button button--primary btn-checkout-submit"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* TAB 2: ACTIVE ORDER TRACKING PREVIEW */}
        {drawerTab === 'tracking' && (
          <div className="cart-drawer-body">
            {!activeOrder ? (
              <div className="drawer-empty-state">
                <div className="drawer-empty-icon">☕</div>
                <h4>No Active Order</h4>
                <p>You do not have an order currently in progress.</p>
                <button
                  onClick={() => setDrawerTab('cart')}
                  className="button button--primary"
                >
                  View Order Bag
                </button>
              </div>
            ) : (
              <div className="active-order-preview-card">
                <div className="active-order-header">
                  <div>
                    <span className="order-badge">ACTIVE ORDER</span>
                    <h4>{activeOrder.orderId || activeOrder.orderNumber}</h4>
                  </div>
                  <span className={`status-pill status-pill--${String(activeOrder.orderStatus || activeOrder.status || 'placed').toLowerCase().replace(/\s+/g, '-')}`}>
                    {activeOrder.orderStatus || activeOrder.status || 'Order Placed'}
                  </span>
                </div>

                <div className="active-order-meta">
                  <span><Clock size={13} /> Est. {activeOrder.estimatedPrepTime || '10-15 mins'}</span>
                  <span><MapPin size={13} /> {activeOrder.tableNumber || 'Table 01'}</span>
                </div>

                <div className="active-order-items">
                  <strong>Items ({activeOrder.items?.length || 0}):</strong>
                  <ul>
                    {(activeOrder.items || []).map((item, i) => (
                      <li key={i}>{item.quantity}× {item.name} (₹{item.price * item.quantity})</li>
                    ))}
                  </ul>
                </div>

                <div className="active-order-total">
                  <span>Total Amount</span>
                  <strong>₹{activeOrder.totalAmount ?? activeOrder.total ?? 0}</strong>
                </div>

                <button
                  type="button"
                  className="button button--primary btn-full-track"
                  onClick={() => handleOpenTracking(activeOrder)}
                >
                  <Eye size={16} /> Open Full Live Tracker
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDER HISTORY */}
        {drawerTab === 'history' && (
          <div className="cart-drawer-body">
            {orders.length === 0 ? (
              <div className="drawer-empty-state">
                <div className="drawer-empty-icon">☕</div>
                <h4>No Previous Orders</h4>
                <p>Order your favourite coffee and snacks!</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    window.location.hash = '/coffee';
                  }}
                  className="button button--primary"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="history-cards-drawer-list">
                {orders.map((order, i) => {
                  const oId = order.orderId || order.orderNumber || `GDC-${i}`;
                  const status = order.orderStatus || order.status || 'Order Placed';
                  return (
                    <div className="history-mini-card" key={oId}>
                      <div className="history-mini-card__top">
                        <strong>{oId}</strong>
                        <span className={`status-pill status-pill--${String(status).toLowerCase().replace(/\s+/g, '-')}`}>
                          {status}
                        </span>
                      </div>
                      <div className="history-mini-card__details">
                        <small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}</small>
                        <span>{order.tableNumber || 'Table 01'}</span>
                      </div>
                      <div className="history-mini-card__items-preview">
                        {(order.items || []).map(item => `${item.quantity}× ${item.name}`).join(', ')}
                      </div>
                      <div className="history-mini-card__footer">
                        <strong>₹{order.totalAmount ?? order.total ?? 0}</strong>
                        <div className="history-mini-card__actions">
                          <button
                            type="button"
                            className="btn-order-action btn-order-action--view"
                            onClick={() => handleOpenTracking(order)}
                          >
                            Track
                          </button>
                          <button
                            type="button"
                            className="btn-order-action btn-order-action--reorder"
                            onClick={() => reorder(order)}
                          >
                            Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
