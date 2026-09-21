import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Sparkles, Utensils, ShoppingBag, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const VisualCollision = () => {
  const containerRef = useRef(null);
  const leftItemRef = useRef(null);
  const rightItemRef = useRef(null);
  const burstRef = useRef(null);
  const comboResultRef = useRef(null);
  const headingPromptRef = useRef(null);
  const { products, addToCart } = useShop();

  const comboProduct = products.find(p => p.id === 'combo-good-day-breakfast') || {
    id: 'combo-good-day-breakfast',
    name: 'The Good Day Breakfast Combo',
    price: 219,
    originalPrice: 278,
    image: '/images/croissant.jpg',
    description: 'The iconic morning pairing: freshly poured Good Day Signature Latte + warm flaky Artisan Butter Croissant.',
    inStock: true
  };

  useEffect(() => {
    const container = containerRef.current;
    const leftItem = leftItemRef.current;
    const rightItem = rightItemRef.current;
    const burst = burstRef.current;
    const comboResult = comboResultRef.current;
    const headingPrompt = headingPromptRef.current;

    if (!container || !leftItem || !rightItem || !burst || !comboResult) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1
      }
    });

    // Phase 1: Two elements approach each other from opposite horizons
    tl.fromTo(leftItem, {
      xPercent: -130,
      rotation: -12,
      opacity: 0.2
    }, {
      xPercent: 15,
      rotation: -2,
      opacity: 1,
      duration: 2,
      ease: 'power2.inOut'
    }, 0);

    tl.fromTo(rightItem, {
      xPercent: 130,
      rotation: 12,
      opacity: 0.2
    }, {
      xPercent: -15,
      rotation: 2,
      opacity: 1,
      duration: 2,
      ease: 'power2.inOut'
    }, 0);

    tl.to(headingPrompt, {
      opacity: 0,
      scale: 0.9,
      duration: 1
    }, 0.8);

    // Phase 2: Visual collision moment! Light burst erupts
    tl.fromTo(burst, {
      scale: 0,
      opacity: 0
    }, {
      scale: 2.8,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.in'
    }, 1.9);

    // Phase 3: Dissolve the approaching pair into the burst
    tl.to([leftItem, rightItem], {
      opacity: 0,
      scale: 1.4,
      filter: 'blur(12px)',
      duration: 0.8
    }, 2.2);

    // Burst fades out while the combined Good Day Breakfast emerges
    tl.to(burst, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    }, 2.5);

    tl.fromTo(comboResult, {
      opacity: 0,
      scale: 0.88,
      filter: 'blur(10px)'
    }, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.6,
      ease: 'power2.out'
    }, 2.4);

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="collision-section"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0c0907'
      }}
    >
      <SteamCanvas mode="dust" density={0.8} />

      {/* Top Scene Tracker */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '48px',
          zIndex: 30
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: 'var(--color-gold-bright)',
            fontWeight: 700,
            display: 'block'
          }}
        >
          04 / 07 • VISUAL COLLISION
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            color: '#fff',
            margin: 0
          }}
        >
          Harmony of Morning
        </h2>
      </div>

      {/* Approaching Visual 1: Coffee Cup (Left) */}
      <div
        ref={leftItemRef}
        style={{
          position: 'absolute',
          top: '20%',
          left: '8%',
          width: '42vw',
          height: '56vh',
          borderRadius: '28px',
          overflow: 'hidden',
          backgroundImage: "url('/images/hero_coffee.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(229, 168, 92, 0.2)',
          border: '1px solid rgba(229, 168, 92, 0.3)',
          zIndex: 10,
          willChange: 'transform, opacity'
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            background: 'rgba(12, 9, 7, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '8px 18px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-gold-bright)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          ☕ The Single-Origin Brew
        </div>
      </div>

      {/* Approaching Visual 2: Flaky Croissant (Right) */}
      <div
        ref={rightItemRef}
        style={{
          position: 'absolute',
          top: '24%',
          right: '8%',
          width: '42vw',
          height: '56vh',
          borderRadius: '28px',
          overflow: 'hidden',
          backgroundImage: "url('/images/croissant.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(229, 168, 92, 0.2)',
          border: '1px solid rgba(229, 168, 92, 0.3)',
          zIndex: 11,
          willChange: 'transform, opacity'
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            background: 'rgba(12, 9, 7, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '8px 18px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-gold-bright)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          🥐 The 72-Layer Croissant
        </div>
      </div>

      {/* Initial Center Collision Tease Text */}
      <div
        ref={headingPromptRef}
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(229, 168, 92, 0.2)',
            border: '1px solid rgba(229, 168, 92, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--color-gold-bright)'
          }}
        >
          <Zap size={24} />
        </div>
        <p
          style={{
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--color-cream)'
          }}
        >
          Scroll to Collide Flavors
        </p>
      </div>

      {/* Explosive Gold & Light Burst Node */}
      <div
        ref={burstRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(246, 200, 136, 0.95) 0%, rgba(229, 168, 92, 0.8) 40%, rgba(201, 130, 63, 0.4) 70%, transparent 100%)',
          zIndex: 25,
          pointerEvents: 'none',
          filter: 'blur(14px)'
        }}
      />

      {/* Final Collided Result: "GOOD DAY BREAKFAST" */}
      <div
        ref={comboResultRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
          zIndex: 28,
          opacity: 0,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            maxWidth: '1200px',
            width: '100%',
            background: 'rgba(18, 14, 11, 0.85)',
            backdropFilter: 'blur(25px)',
            borderRadius: '32px',
            border: '1px solid rgba(229, 168, 92, 0.35)',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(229, 168, 92, 0.2)',
            pointerEvents: 'auto'
          }}
        >
          {/* Left Visual Collage */}
          <div
            style={{
              position: 'relative',
              minHeight: '420px',
              backgroundImage: "url('/images/hero_coffee.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Croissant Floating Inset */}
            <div
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px',
                width: '180px',
                height: '130px',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundImage: "url('/images/croissant.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                border: '2px solid rgba(229, 168, 92, 0.5)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'linear-gradient(135deg, #f6c888, #e5a85c)',
                color: '#120e0b',
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Morning Symphony Combo
            </div>
          </div>

          {/* Right Editorial Info */}
          <div
            style={{
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span className="badge-gold" style={{ width: 'max-content', marginBottom: '16px' }}>
              <Sparkles size={13} /> Visual Collision Transformation
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 3.5vw, 48px)',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.1,
                marginBottom: '14px'
              }}
            >
              The Good Day <br />
              <span className="text-gold-gradient">Breakfast Ritual</span>
            </h2>

            <p
              style={{
                color: 'var(--color-beige)',
                fontSize: '15px',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              When velvety single-origin roast meets 72 golden butter pastry layers, the morning transforms. Served hot and fresh every morning until noon.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '32px',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '12px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--color-cream)' }}>
                ☕ 1x Signature Latte (Hot)
              </div>
              <div style={{ color: 'var(--color-gold)' }}>+</div>
              <div style={{ fontSize: '13px', color: 'var(--color-cream)' }}>
                🥐 1x Butter Croissant
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                  Combo Price
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '38px',
                      fontWeight: 800,
                      color: 'var(--color-gold-bright)'
                    }}
                  >
                    ₹{comboProduct.price}
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      color: 'var(--color-muted)',
                      textDecoration: 'line-through'
                    }}
                  >
                    ₹{comboProduct.originalPrice}
                  </span>
                </div>
              </div>

              <button
                onClick={() => addToCart(comboProduct)}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '14px' }}
              >
                <ShoppingBag size={16} />
                Order Breakfast Bundle
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisualCollision;
