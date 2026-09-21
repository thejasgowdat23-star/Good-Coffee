import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Coffee, ArrowUp, Heart, MapPin, Clock, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const FinalHero = () => {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef(null);
  const { products, addToCart } = useShop();

  const featuredProduct = products[0];

  useEffect(() => {
    const container = containerRef.current;
    const visual = visualRef.current;
    const content = contentRef.current;
    if (!container || !visual || !content) return;

    // Slow camera pullback as the user enters the final scene
    gsap.fromTo(visual, {
      scale: 1.25,
      filter: 'brightness(0.7)'
    }, {
      scale: 1,
      filter: 'brightness(1.02)',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    gsap.fromTo(content, {
      opacity: 0,
      y: 50
    }, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCollection = () => {
    const el = document.getElementById('coffee-collection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Living Cinematic Background with Camera Pullback */}
      <div
        ref={visualRef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/images/hero_coffee.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          willChange: 'transform, filter'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 45%, transparent 20%, rgba(10, 8, 6, 0.65) 60%, rgba(10, 8, 6, 0.96) 100%), linear-gradient(180deg, rgba(10, 8, 6, 0.9) 0%, transparent 35%, rgba(10, 8, 6, 0.95) 90%)'
          }}
        />
      </div>

      {/* Atmospheric Live Steam Rising Above the Cup */}
      <SteamCanvas mode="steam-and-dust" originX={0.5} originY={0.58} density={1.2} />

      {/* Main Closing Cinematic Statement */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '160px 24px 60px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div className="badge-gold" style={{ marginBottom: '20px' }}>
          <Coffee size={14} /> YOUR DAILY SANCTUARY
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(40px, 7vw, 92px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            textShadow: '0 8px 35px rgba(0, 0, 0, 0.9)'
          }}
        >
          MAKE EVERY DAY <br />
          <span className="text-gold-gradient">A GOOD DAY.</span>
        </h2>

        <p
          style={{
            color: 'var(--color-beige)',
            fontSize: 'clamp(16px, 1.8vw, 22px)',
            maxWidth: '620px',
            lineHeight: 1.6,
            marginBottom: '36px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
          }}
        >
          Freshly poured single-origins, warm morning pastries, and moments that stay with you long after the last drop.
        </p>

        {/* Order Your Coffee Button */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={scrollToCollection}
            className="btn-primary"
            style={{ padding: '18px 44px', fontSize: '16px' }}
          >
            <Coffee size={20} />
            Order Your Coffee
          </button>

          <button
            onClick={scrollToTop}
            className="btn-secondary"
            style={{ padding: '16px 28px', fontSize: '15px' }}
          >
            <ArrowUp size={18} />
            Back to Top
          </button>
        </div>

        {/* Grand Brand Text below */}
        <div
          style={{
            marginTop: '80px',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4vw, 56px)',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.18)',
            userSelect: 'none'
          }}
        >
          GOOD DAY COFFEE
        </div>
      </div>

      {/* Living Atmospheric Footer Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          borderTop: '1px solid rgba(229, 168, 92, 0.2)',
          background: 'rgba(10, 8, 6, 0.88)',
          backdropFilter: 'blur(20px)',
          padding: '36px 48px'
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold-bright)', marginBottom: '8px' }}>
              <MapPin size={16} />
              <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Flagship Roastery
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-beige)' }}>
              108 Artisans Lane, Central Roastery Estate, Karnataka 560001
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold-bright)', marginBottom: '8px' }}>
              <Clock size={16} />
              <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Roasting Hours
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-beige)' }}>
              Mon – Sun: 6:30 AM – 10:30 PM (Daily Fresh Bakes)
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold-bright)', marginBottom: '8px' }}>
              <ShieldCheck size={16} />
              <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Ethical Sourcing
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-beige)' }}>
              100% Direct Fair Trade • Biodegradable Packaging
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
              © {new Date().getFullYear()} Good Day Coffee Co. All rights reserved.
            </span>
            <div style={{ fontSize: '11px', color: 'var(--color-gold-bright)', marginTop: '4px' }}>
              Crafted with Passion & Cinematic Motion
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FinalHero;
