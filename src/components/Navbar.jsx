import React, { useEffect, useState, useRef } from 'react';
import { MessageCircle, Search, ShoppingBag, Settings2, Menu, X, Clock, History, User, LogOut, ChevronDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearchOpen, onAiOpen, isHome = false }) {
  const {
    cartCount,
    setIsCartOpen,
    setIsAdminOpen,
    setIsOrderTrackingOpen,
    setIsOrderHistoryOpen,
    setDrawerTab,
    orders
  } = useShop();

  const { user, isAuthenticated, openAuth, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        frame = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    ['Home', '#/'],
    ['Coffee', '#/coffee'],
    ['Snacks', '#/snacks']
  ];

  const closeMobile = () => setMobileOpen(false);

  const activeOrdersCount = orders.filter(o => !['Completed', 'Cancelled'].includes(o.orderStatus || o.status)).length;
  const badgeCount = cartCount > 0 ? cartCount : (activeOrdersCount > 0 ? activeOrdersCount : 0);

  const openTracking = () => {
    closeMobile();
    setAccountDropdownOpen(false);
    setIsOrderTrackingOpen(true);
  };

  const openHistory = () => {
    closeMobile();
    setAccountDropdownOpen(false);
    if (!isAuthenticated) {
      openAuth(() => setIsOrderHistoryOpen(true));
    } else {
      setIsOrderHistoryOpen(true);
    }
  };

  const openCartDrawer = () => {
    closeMobile();
    setDrawerTab('cart');
    setIsCartOpen(true);
  };

  const handleOrderNowClick = () => {
    closeMobile();
    if (!isAuthenticated) {
      openAuth(() => {
        window.location.hash = '/coffee';
      });
    } else {
      window.location.hash = '/coffee';
    }
  };

  const displayName = user?.name || (user?.phone ? `+91 ${user.phone.slice(-4)}` : 'Guest');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className={`site-navbar ${isHome ? 'site-navbar--hero' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="brand-mark" href="#/" aria-label="Good Day Coffee home">
          <img src="/good-day-coffee-logo.png" alt="Good Day Coffee logo" width="40" height="40" />
          <span>GOOD DAY<br /><small>COFFEE</small></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          <button type="button" onClick={openTracking} className="nav-link-btn" title="Track your active order">
            <Clock size={15} /> Order Tracking
            {activeOrdersCount > 0 && <span className="nav-mini-badge">{activeOrdersCount}</span>}
          </button>
          <button type="button" onClick={openHistory} className="nav-link-btn" title="View past orders">
            <History size={15} /> Order History
          </button>
          <button type="button" onClick={onAiOpen} className="nav-link-btn">
            <MessageCircle size={15} /> AI Assistant
          </button>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" type="button" onClick={onSearchOpen} aria-label="Search menu" title="Search menu"><Search size={17} /></button>
          
          {/* Order / Bag Icon with functional badge */}
          <button
            key={badgeCount}
            className={`icon-button ${badgeCount > 0 ? 'cart-bounce' : ''}`}
            type="button"
            onClick={openCartDrawer}
            aria-label={`Orders & Bag (${badgeCount} active)`}
            title="Orders & Bag"
          >
            <ShoppingBag size={17} />
            {badgeCount > 0 && <b className="cart-badge-pop">{badgeCount}</b>}
          </button>

          {/* Account / Sign In Access Point */}
          <div className="nav-account-container" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="nav-user-pill-btn"
                  onClick={() => setAccountDropdownOpen(prev => !prev)}
                  aria-expanded={accountDropdownOpen}
                  aria-label="My Account"
                >
                  <span className="nav-user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={displayName} width="26" height="26" style={{ borderRadius: '50%', width: 26, height: 26, objectFit: 'cover' }} />
                    ) : userInitial}
                  </span>
                  <span className="nav-user-label">{displayName}</span>
                  <ChevronDown size={14} />
                </button>

                {accountDropdownOpen && (
                  <div className="nav-account-dropdown" role="menu">
                    <div className="nav-dropdown-user-info">
                      <strong>{displayName}</strong>
                      <small>{user?.phone ? `+91 ${user.phone}` : (user?.email || 'Authenticated User')}</small>
                    </div>
                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={openHistory}
                      role="menuitem"
                    >
                      <History size={15} /> My Orders
                    </button>
                    <button
                      type="button"
                      className="nav-dropdown-item"
                      onClick={openTracking}
                      role="menuitem"
                    >
                      <Clock size={15} /> Track Current Order
                    </button>
                    <button
                      type="button"
                      className="nav-dropdown-item nav-dropdown-item--signout"
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        logout();
                      }}
                      role="menuitem"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                type="button"
                className="nav-sign-in-btn"
                onClick={() => openAuth()}
              >
                <User size={15} /> Sign In
              </button>
            )}
          </div>

          <button
            className="button button--primary nav-order"
            type="button"
            onClick={handleOrderNowClick}
          >
            <span className="text-desktop">Order Now</span>
            <span className="text-mobile">Order</span>
          </button>
          
          <button className="icon-button admin-trigger" type="button" onClick={() => setIsAdminOpen(true)} aria-label="Open menu manager" title="Menu manager"><Settings2 size={16} /></button>

          <button
            className="mobile-menu-trigger"
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={closeMobile} aria-hidden="true" />
          <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
            <div className="mobile-nav-header">
              <div className="mobile-nav-brand">
                <img src="/good-day-coffee-logo.png" alt="Good Day Coffee" width="28" height="28" />
                <span>Good Day Menu</span>
              </div>
              <button type="button" className="mobile-nav-close-btn" onClick={closeMobile} aria-label="Close menu">
                <X size={16} />
              </button>
            </div>

            <div className="mobile-nav-links">
              {links.map(([label, href]) => (
                <a key={label} href={href} onClick={closeMobile} className="mobile-nav-item">
                  <span>{label}</span>
                </a>
              ))}
            </div>

            <div className="mobile-nav-divider" />

            <div className="mobile-nav-actions-list">
              <button type="button" className="mobile-nav-action-btn" onClick={openTracking}>
                <Clock size={16} className="mobile-nav-icon" />
                <span>Order Tracking</span>
                {activeOrdersCount > 0 && <span className="mobile-nav-badge">{activeOrdersCount}</span>}
              </button>
              <button type="button" className="mobile-nav-action-btn" onClick={openHistory}>
                <History size={16} className="mobile-nav-icon" />
                <span>Order History</span>
              </button>
              <button type="button" className="mobile-nav-action-btn" onClick={() => { closeMobile(); onAiOpen(); }}>
                <MessageCircle size={16} className="mobile-nav-icon mobile-nav-icon--ai" />
                <span>AI Barista Assistant</span>
              </button>
              <button type="button" className="mobile-nav-action-btn" onClick={() => { closeMobile(); onSearchOpen(); }}>
                <Search size={16} className="mobile-nav-icon" />
                <span>Search Drinks & Snacks</span>
              </button>
              <button type="button" className="mobile-nav-action-btn" onClick={openCartDrawer}>
                <ShoppingBag size={16} className="mobile-nav-icon" />
                <span>Orders & Cart Bag</span>
                {badgeCount > 0 && <span className="mobile-nav-badge mobile-nav-badge--bag">{badgeCount}</span>}
              </button>
            </div>

            <div className="mobile-nav-divider" />

            <div className="mobile-nav-user-section">
              {isAuthenticated ? (
                <div className="mobile-nav-user-row">
                  <div className="mobile-nav-user-info">
                    <span className="nav-user-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={displayName} width="24" height="24" style={{ borderRadius: '50%', width: 24, height: 24, objectFit: 'cover' }} />
                      ) : userInitial}
                    </span>
                    <span className="mobile-nav-user-name">{displayName}</span>
                  </div>
                  <button
                    type="button"
                    className="mobile-nav-signout-btn"
                    onClick={() => {
                      closeMobile();
                      logout();
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="mobile-nav-signin-btn"
                  onClick={() => {
                    closeMobile();
                    openAuth();
                  }}
                >
                  <User size={16} /> Sign In to Account
                </button>
              )}
            </div>

            <button className="button button--order mobile-nav-order-cta" type="button" onClick={handleOrderNowClick}>
              ☕ Order
            </button>
          </nav>
        </>
      )}

      {!isHome && <div className="offer-strip" aria-label="Good Day Coffee offers"><div className="offer-strip__track">Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte&nbsp;&nbsp; · &nbsp;&nbsp;Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte</div></div>}
    </>
  );
}
