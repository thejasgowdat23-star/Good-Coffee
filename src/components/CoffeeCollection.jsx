import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Plus, Check, Sparkles, Flame, Droplets, Thermometer } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const CoffeeCollection = () => {
  const containerRef = useRef(null);
  const { products, addToCart } = useShop();
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter coffees
  const coffeeItems = products.filter(
    p => p.category === 'Coffee' || p.category === 'Cold Drinks'
  ).slice(0, 6);

  const slidesRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || coffeeItems.length === 0) return;

    const totalSlides = coffeeItems.length;

    // Pin the container for the duration of morphing all 6 coffees
    const scrollLength = (totalSlides - 1) * 150; // percentage of viewport

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${scrollLength}%`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const rawIdx = Math.round(self.progress * (totalSlides - 1));
          setActiveIndex(Math.min(totalSlides - 1, Math.max(0, rawIdx)));
        }
      }
    });

    // Animate between consecutive slides
    slidesRef.current.forEach((slide, i) => {
      if (i < totalSlides - 1) {
        const nextSlide = slidesRef.current[i + 1];
        const currentBg = slide.querySelector('.coffee-bg-img');
        const nextBg = nextSlide ? nextSlide.querySelector('.coffee-bg-img') : null;
        const currentContent = slide.querySelector('.coffee-content');
        const nextContent = nextSlide ? nextSlide.querySelector('.coffee-content') : null;
        const lightSweep = slide.querySelector('.light-sweep-bar');

        const stepTime = i * 2;

        // Current slide zooms, rotates slightly, light sweep passes, and fades out
        tl.to(currentBg, {
          scale: 1.4,
          rotation: 3,
          xPercent: -8,
          filter: 'blur(8px) brightness(0.6)',
          ease: 'power2.inOut',
          duration: 2
        }, stepTime);

        tl.to(currentContent, {
          opacity: 0,
          y: -60,
          filter: 'blur(6px)',
          ease: 'power2.in',
          duration: 1.2
        }, stepTime);

        if (lightSweep) {
          tl.fromTo(lightSweep, {
            xPercent: -120,
            opacity: 0.8
          }, {
            xPercent: 180,
            opacity: 0,
            duration: 1.4,
            ease: 'power1.inOut'
          }, stepTime);
        }

        // Next slide emerges from depth with scale-in and counter-rotation
        if (nextSlide && nextBg && nextContent) {
          tl.fromTo(nextSlide, {
            opacity: 0,
            pointerEvents: 'none'
          }, {
            opacity: 1,
            pointerEvents: 'auto',
            duration: 0.1
          }, stepTime + 0.6);

          tl.fromTo(nextBg, {
            scale: 0.8,
            rotation: -4,
            xPercent: 8,
            filter: 'blur(10px) brightness(1.3)'
          }, {
            scale: 1,
            rotation: 0,
            xPercent: 0,
            filter: 'blur(0px) brightness(1)',
            duration: 2,
            ease: 'power2.out'
          }, stepTime + 0.6);

          tl.fromTo(nextContent, {
            opacity: 0,
            y: 80,
            filter: 'blur(8px)'
          }, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'power3.out'
          }, stepTime + 0.9);
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, [coffeeItems]);

  return (
    <section
      id="coffee-collection"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806'
      }}
    >
      {/* Background Ambience & Steam Particles */}
      <SteamCanvas mode="steam-and-dust" originX={0.5} originY={0.65} density={0.8} />

      {/* Floating Section Tracker Header */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '48px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
            color: 'var(--color-gold-bright)',
            fontWeight: 700
          }}
        >
          02 / 07 • CAMERA MORPH
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            color: '#fff',
            fontWeight: 700
          }}
        >
          The Coffee Lineage
        </h2>
      </div>

      {/* Coffee Slides Container */}
      {coffeeItems.map((item, index) => (
        <div
          key={item.id}
          ref={el => (slidesRef.current[index] = el)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: index === 0 ? 1 : 0,
            pointerEvents: index === 0 ? 'auto' : 'none',
            zIndex: 10 + index
          }}
        >
          {/* Background Visual with Morphing Transform */}
          <div
            className="coffee-bg-img"
            style={{
              position: 'absolute',
              inset: '-8%',
              width: '116%',
              height: '116%',
              backgroundImage: `url('${item.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'transform, filter, opacity',
              transform: 'scale(1)'
            }}
          >
            {/* Dark & Amber Contrast Gradients */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 70% 50%, transparent 20%, rgba(10, 8, 6, 0.7) 70%, rgba(10, 8, 6, 0.95) 100%), linear-gradient(90deg, rgba(10, 8, 6, 0.9) 0%, rgba(10, 8, 6, 0.6) 45%, transparent 100%)'
              }}
            />
          </div>

          {/* Light sweep flash beam during transition */}
          <div
            className="light-sweep-bar"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '40%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(246, 200, 136, 0.35), transparent)',
              transform: 'skewX(-25deg)',
              pointerEvents: 'none',
              opacity: 0,
              zIndex: 15
            }}
          />

          {/* Product Detail Overlay (Left-aligned luxury editorial typography) */}
          <div
            className="coffee-content"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 64px',
              maxWidth: '1440px',
              margin: '0 auto',
              right: 0,
              zIndex: 20
            }}
          >
            <div style={{ maxWidth: '580px' }}>
              {/* Product Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}
              >
                <span className="badge-gold">
                  <Sparkles size={13} /> {item.badge || 'Single Origin'}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-beige)',
                    letterSpacing: '0.1em'
                  }}
                >
                  {item.category}
                </span>
              </div>

              {/* Product Title */}
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(38px, 5.5vw, 76px)',
                  fontWeight: 900,
                  lineHeight: 1.02,
                  color: '#fff',
                  marginBottom: '20px',
                  textShadow: '0 4px 25px rgba(0, 0, 0, 0.9)'
                }}
              >
                {item.name}
              </h1>

              {/* Description */}
              <p
                style={{
                  fontSize: 'clamp(15px, 1.3vw, 18px)',
                  color: 'var(--color-cream-soft)',
                  lineHeight: 1.6,
                  marginBottom: '24px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
                }}
              >
                {item.description}
              </p>

              {/* Coffee Specs Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '14px',
                  marginBottom: '32px',
                  background: 'rgba(20, 15, 11, 0.65)',
                  backdropFilter: 'blur(16px)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(229, 168, 92, 0.2)'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Flame size={12} className="text-gold" /> Roast
                  </span>
                  <strong style={{ fontSize: '13px', color: '#fff', display: 'block', marginTop: '4px' }}>
                    {item.roastLevel || 'Medium'}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Droplets size={12} className="text-gold" /> Notes
                  </span>
                  <strong style={{ fontSize: '13px', color: '#fff', display: 'block', marginTop: '4px' }}>
                    {item.intensity || 'Rich & Crisp'}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Thermometer size={12} className="text-gold" /> Temp
                  </span>
                  <strong style={{ fontSize: '13px', color: '#fff', display: 'block', marginTop: '4px' }}>
                    {item.temp || 'Fresh Hot'}
                  </strong>
                </div>
              </div>

              {/* Price & Action Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    Craft Price
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '34px',
                        fontWeight: 800,
                        color: 'var(--color-gold-bright)'
                      }}
                    >
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span
                        style={{
                          fontSize: '16px',
                          color: 'var(--color-muted)',
                          textDecoration: 'line-through'
                        }}
                      >
                        ₹{item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {item.inStock ? (
                  <button
                    onClick={() => addToCart(item)}
                    className="btn-primary"
                    style={{ padding: '14px 30px', fontSize: '14px' }}
                  >
                    <Plus size={16} /> Order {item.name.split(' ')[0]}
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '999px',
                      color: '#fca5a5',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.05em'
                    }}
                  >
                    Currently Unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Progress Bar & Step Navigation */}
      <div
        style={{
          position: 'absolute',
          bottom: '36px',
          right: '48px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(16, 12, 9, 0.7)',
          backdropFilter: 'blur(16px)',
          padding: '10px 20px',
          borderRadius: '999px',
          border: '1px solid rgba(229, 168, 92, 0.2)'
        }}
      >
        {coffeeItems.map((c, idx) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div
              style={{
                width: activeIndex === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: '999px',
                background:
                  activeIndex === idx
                    ? 'linear-gradient(90deg, #f6c888, #e5a85c)'
                    : 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.35s ease'
              }}
            />
            {activeIndex === idx && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-gold-bright)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {c.name.split(' ')[0]}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoffeeCollection;
