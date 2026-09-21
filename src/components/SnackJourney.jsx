import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Plus, Sparkles, UtensilsCrossed, ChevronRight, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const SnackJourney = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const { products, addToCart } = useShop();

  // Get all snack and bakery items
  const snackItems = products.filter(
    p => p.category === 'Snacks' || p.category === 'Desserts'
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Calculate total horizontal scroll needed
    const totalPanels = snackItems.length;
    // Pinned horizontal track driven by vertical scroll
    const scrollTween = gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth + 800}`,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // Animate each panel's inner image for Image -> Video cinematic feel
    const panels = track.querySelectorAll('.snack-panel');
    panels.forEach(panel => {
      const img = panel.querySelector('.snack-img');
      const light = panel.querySelector('.snack-light');

      gsap.fromTo(img, {
        scale: 1.05,
        filter: 'brightness(0.85) contrast(1.1)'
      }, {
        scale: 1.22,
        filter: 'brightness(1.1) contrast(1.02)',
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: scrollTween,
          start: 'left right',
          end: 'right left',
          scrub: true
        }
      });

      if (light) {
        gsap.fromTo(light, {
          xPercent: -80,
          opacity: 0.1
        }, {
          xPercent: 120,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: scrollTween,
            start: 'left right',
            end: 'right left',
            scrub: true
          }
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, [snackItems]);

  return (
    <section
      id="snack-journey"
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806'
      }}
    >
      {/* Background Ambience */}
      <SteamCanvas mode="dust" density={0.7} />

      {/* Floating Section Track Header */}
      <div
        style={{
          position: 'absolute',
          top: '90px',
          left: '48px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div>
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
            03 / 07 • HORIZONTAL CAMERA PAN
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(22px, 2.5vw, 32px)',
              color: '#fff',
              fontWeight: 700,
              margin: 0
            }}
          >
            The Artisan Snack Journey
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(22, 16, 12, 0.65)',
            backdropFilter: 'blur(12px)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(229, 168, 92, 0.25)',
            color: 'var(--color-beige)',
            fontSize: '12px'
          }}
        >
          <span>Scroll down to travel right</span>
          <ChevronRight size={14} className="text-gold" />
        </div>
      </div>

      {/* Horizontal Pannable Track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          height: '100vh',
          width: 'max-content',
          willChange: 'transform',
          alignItems: 'center',
          paddingLeft: '48px',
          paddingRight: '120px'
        }}
      >
        {snackItems.map((item, index) => (
          <div
            key={item.id}
            className="snack-panel"
            style={{
              width: 'clamp(340px, 42vw, 560px)',
              height: '74vh',
              marginRight: '36px',
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#120e0b',
              border: '1px solid rgba(229, 168, 92, 0.2)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              flexShrink: 0
            }}
          >
            {/* Zooming / Living Food Photography */}
            <div
              className="snack-img"
              style={{
                position: 'absolute',
                inset: '-10%',
                width: '120%',
                height: '120%',
                backgroundImage: `url('${item.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                willChange: 'transform, filter'
              }}
            />

            {/* Living Light Sweep effect */}
            <div
              className="snack-light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '60%',
                height: '100%',
                background:
                  'linear-gradient(90deg, transparent, rgba(246, 200, 136, 0.25), transparent)',
                transform: 'skewX(-20deg)',
                pointerEvents: 'none',
                zIndex: 4
              }}
            />

            {/* Gradient Dark Shades */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(10, 8, 6, 0.2) 0%, rgba(10, 8, 6, 0.4) 40%, rgba(10, 8, 6, 0.94) 100%)',
                zIndex: 5
              }}
            />

            {/* Floating Top Badge */}
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span className="badge-gold">
                <Sparkles size={12} /> {item.badge || 'Artisan Bake'}
              </span>
              <span
                style={{
                  background: 'rgba(10, 8, 6, 0.65)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  color: 'var(--color-cream)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {item.calories}
              </span>
            </div>

            {/* Bottom Content & Order Action */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '32px 28px',
                zIndex: 10
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-gold-bright)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '6px'
                }}
              >
                {item.pairing || 'Freshly Baked Daily'}
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(22px, 2.2vw, 32px)',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1.1,
                  marginBottom: '10px'
                }}
              >
                {item.name}
              </h3>

              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-beige)',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {item.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                    Fresh Price
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '28px',
                        fontWeight: 800,
                        color: 'var(--color-gold-bright)'
                      }}
                    >
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span
                        style={{
                          fontSize: '13px',
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
                    style={{ padding: '10px 22px', fontSize: '13px' }}
                  >
                    <Plus size={15} /> Add to Bag
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#f87171',
                      padding: '8px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      borderRadius: '999px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Currently Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SnackJourney;
