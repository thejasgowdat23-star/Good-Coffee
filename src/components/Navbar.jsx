import React, { useEffect, useState } from 'react';
import { MessageCircle, Search, ShoppingBag, Settings2, Menu, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function Navbar({ onSearchOpen, onAiOpen, isHome = false }) {
  const { cartCount, setIsCartOpen, setIsAdminOpen } = useShop();
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

  const links = [['Home', '#/'], ['Coffee', '#/coffee'], ['Snacks', '#/snacks']];
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
    <header className={`site-navbar ${isHome ? 'site-navbar--hero' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
      <a className="brand-mark" href="#/" aria-label="Good Day Coffee home">
        <img src="/favicon.svg" alt="" width="40" height="40" />
        <span>GOOD DAY<br /><small>COFFEE</small></span>
      </a>
      <nav className="main-nav" aria-label="Main navigation">
        {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        <button type="button" onClick={onAiOpen}><MessageCircle size={15} /> AI Assistant</button>
      </nav>
      <div className="nav-actions">
        <button className="icon-button" type="button" onClick={onSearchOpen} aria-label="Search menu" title="Search menu"><Search size={17} /></button>
        <button key={cartCount} className={`icon-button ${cartCount > 0 ? 'cart-bounce' : ''}`} type="button" onClick={() => setIsCartOpen(true)} aria-label={`Cart with ${cartCount} items`} title="Cart"><ShoppingBag size={17} />{cartCount > 0 && <b className="cart-badge-pop">{cartCount}</b>}</button>
        <button className="button button--primary nav-order" type="button" onClick={() => { window.location.hash = '/coffee'; }}>Order Now</button>
        <button className="icon-button admin-trigger" type="button" onClick={() => setIsAdminOpen(true)} aria-label="Open menu manager" title="Menu manager"><Settings2 size={17} /></button>
      </div>
      <button className="mobile-menu-trigger" type="button" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
    {mobileOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">
      {links.map(([label, href]) => <a key={label} href={href} onClick={closeMobile}>{label}</a>)}
      <button type="button" onClick={() => { closeMobile(); onAiOpen(); }}><MessageCircle size={18} /> AI Assistant</button>
      <button type="button" onClick={() => { closeMobile(); onSearchOpen(); }}><Search size={18} /> Search</button>
      <button type="button" onClick={() => { closeMobile(); setIsCartOpen(true); }}><ShoppingBag size={18} /> Cart {cartCount > 0 && `(${cartCount})`}</button>
      <button className="button button--order" type="button" onClick={() => { closeMobile(); window.location.hash = '/coffee'; }}>Order Now</button>
    </nav>}
    {!isHome && <div className="offer-strip" aria-label="Good Day Coffee offers"><div className="offer-strip__track">Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte&nbsp;&nbsp; · &nbsp;&nbsp;Fresh brewed daily&nbsp;&nbsp; · &nbsp;&nbsp;Free delivery above ₹300&nbsp;&nbsp; · &nbsp;&nbsp;Try our Signature Latte</div></div>}
    </>
  );
}
