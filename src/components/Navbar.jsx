import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Search, Volume2, VolumeX, Sparkles, Settings2, Menu, X } from 'lucide-react';

export const Navbar = ({ onSearchOpen, onAiOpen }) => {
  const { cartCount, setIsCartOpen, setIsAdminOpen, isAudioPlaying, toggleAudio } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 50);
      setScrollProgress(docHeight > 0 ? (y / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100,
          padding: scrolled ? '12px 24px' : '22px 36px',
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none'
        }}
      >
        <div
          className="navbar-container"
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 24px',
            borderRadius: '999px',
            background: scrolled
              ? 'rgba(16, 12, 9, 0.85)'
              : 'rgba(22, 16, 12, 0.35)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: scrolled
              ? '1px solid rgba(229, 168, 92, 0.28)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: scrolled
              ? '0 12px 35px rgba(0, 0, 0, 0.65), 0 0 25px rgba(229, 168, 92, 0.12)'
              : '0 4px 20px rgba(0, 0, 0, 0.25)',
            pointerEvents: 'auto',
            transition: 'all 0.4s ease'
          }}
        >
          {/* Brand Left */}
          <div
            onClick={() => scrollToSection('hero')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(229, 168, 92, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxShadow: '0 0 16px rgba(229, 168, 92, 0.25)'
              }}
            >
              <img
                src="/favicon.svg"
                alt="Good Day Coffee Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  lineHeight: 1.1
                }}
              >
                GOOD DAY
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '9px',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold-bright)',
                  fontWeight: 600
                }}
              >
                EST. ROASTERY
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav
            className="desktop-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px'
            }}
          >
            {[
              { label: 'Home', id: 'hero' },
              { label: 'Coffee', id: 'coffee-collection' },
              { label: 'Signature', id: 'signature-section' },
              { label: 'Snacks', id: 'snack-journey' },
              { label: 'Breakfast', id: 'collision-section' },
              { label: 'About', id: 'about-brand' },
              { label: 'AI Barista', id: 'ai-assistant', highlight: true }
            ].map(link => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: link.highlight ? 'var(--color-gold-bright)' : 'var(--color-cream)',
                  fontSize: '14px',
                  fontWeight: link.highlight ? 600 : 500,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  padding: '6px 0',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'color 0.25s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = link.highlight
                    ? 'var(--color-gold-bright)'
                    : 'var(--color-cream)')
                }
              >
                {link.highlight && <Sparkles size={13} className="text-gold" />}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            {/* Ambient Soundscape Toggle */}
            <button
              onClick={toggleAudio}
              title={isAudioPlaying ? 'Mute Cafe Ambience' : 'Play Cafe Ambience'}
              style={{
                background: isAudioPlaying
                  ? 'rgba(229, 168, 92, 0.25)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(229, 168, 92, 0.3)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAudioPlaying ? 'var(--color-gold-bright)' : 'var(--color-beige)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Live Menu Admin Trigger */}
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Shop Owner Menu Manager"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-beige)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Settings2 size={16} />
            </button>

            {/* Quick Search */}
            <button
              onClick={onSearchOpen}
              title="Search Menu"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-beige)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Search size={16} />
            </button>

            {/* Cart Trigger with live count */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(229, 168, 92, 0.3)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#e5a85c',
                    color: '#0e0b08',
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(229, 168, 92, 0.8)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Order Now Button */}
            <button
              onClick={() => scrollToSection('coffee-collection')}
              className="btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '13px'
              }}
            >
              Order Now
            </button>

            {/* Mobile Hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Scroll Progress line below navbar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${scrollProgress}%`,
            height: '2px',
            background: 'linear-gradient(90deg, #c9823f, #e5a85c, #f6c888)',
            boxShadow: '0 0 10px rgba(229, 168, 92, 0.7)',
            transition: 'width 0.1s linear'
          }}
        />
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 8, 6, 0.96)',
            backdropFilter: 'blur(25px)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          {[
            { label: 'Home', id: 'hero' },
            { label: 'Coffee Collection', id: 'coffee-collection' },
            { label: 'Signature Latte', id: 'signature-section' },
            { label: 'Artisan Snacks', id: 'snack-journey' },
            { label: 'Breakfast Combo', id: 'collision-section' },
            { label: 'Brand Story', id: 'about-brand' },
            { label: 'AI Barista Assistant', id: 'ai-assistant' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '22px',
                fontFamily: 'var(--font-serif)',
                cursor: 'pointer',
                padding: '8px 16px'
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsCartOpen(true);
            }}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            View Cart ({cartCount})
          </button>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 990px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
