import React, { useEffect, useState } from 'react';
import { MessageCircle, Search, ShoppingBag, Settings2, Menu, X, Clock, History } from 'lucide-react';
import { useShop } from '../context/ShopContext';

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

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setIsOrderTrackingOpen(true);
  };

  const openHistory = () => {
    closeMobile();
    setIsOrderHistoryOpen(true);
  };

  const openCartDrawer = () => {
    closeMobile();
    setDrawerTab('cart');
    setIsCartOpen(true);
  };

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

        <button className="button button--primary nav-order" type="button" onClick={() => { window.location.hash = '/coffee'; }}>Order Now</button>
        <button className="icon-button admin-trigger" type="button" onClick={() => setIsAdminOpen(true)} aria-label="Open menu manager" title="Menu manager"><Settings2 size={17} /></button>
      </div>
      <button className="mobile-menu-trigger" type="button" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
    {mobileOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
      {links.map(([label, href]) => <a key={label} href={href} onClick={closeMobile}>{label}</a>)}
      <button type="button" onClick={openTracking}><Clock size={18} /> Order Tracking {activeOrdersCount > 0 && `(${activeOrdersCount})`}</button>
      <button type="button" onClick={openHistory}><History size={18} /> Order History</button>
      <button type="button" onClick={() => { closeMobile(); onAiOpen(); }}><MessageCircle size={18} /> AI Assistant</button>
      <button type="button" onClick={() => { closeMobile(); onSearchOpen(); }}><Search size={18} /> Search</button>
      <button type="button" onClick={openCartDrawer}><ShoppingBag size={18} /> Orders & Bag {badgeCount > 0 && `(${badgeCount})`}</button>
      <button className="button button--order" type="button" onClick={() => { closeMobile(); window.location.hash = '/coffee'; }}>Order Now</button>
    </nav>}
    {!isHome && <div className="offer-strip" aria-label="Good Day Coffee offers"><div className="offer-strip__track">Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte&nbsp;&nbsp; · &nbsp;&nbsp;Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte</div></div>}
    </>
  );
}
