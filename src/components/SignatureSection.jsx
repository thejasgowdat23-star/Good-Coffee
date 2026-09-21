import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Sparkles, Award, CheckCircle2, ShoppingBag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const SignatureSection = () => {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const textGroupRef = useRef(null);
  const spotlightRef = useRef(null);
  const { products, addToCart } = useShop();

  const signatureProduct = products.find(p => p.id === 'coffee-latte-sig') || {
    id: 'coffee-latte-sig',
    name: 'Good Day Signature Latte',
    price: 149,
    image: '/images/signature_latte.jpg'
  };

  useEffect(() => {
    const container = containerRef.current;
    const visual = visualRef.current;
    const textGroup = textGroupRef.current;
    const spotlight = spotlightRef.current;

    if (!container || !visual || !textGroup) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // Dramatic entrance: Image slowly pulls back while spotlight sweeps
    tl.fromTo(visual, {
      scale: 1.18,
      filter: 'brightness(0.7) contrast(1.15)',
      y: 40
    }, {
      scale: 1,
      filter: 'brightness(1.05) contrast(1.02)',
      y: 0,
      ease: 'power2.out',
      duration: 2
    }, 0);

    if (spotlight) {
      tl.fromTo(spotlight, {
        opacity: 0.2,
        xPercent: -40,
        rotation: -15
      }, {
        opacity: 0.8,
        xPercent: 10,
        rotation: 0,
        ease: 'power1.inOut',
        duration: 2.2
      }, 0);
    }

    // Gradual stagger reveal of signature typography
    const textChildren = textGroup.children;
    tl.fromTo(textChildren, {
      opacity: 0,
      y: 45,
      filter: 'blur(8px)'
    }, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      stagger: 0.25,
      ease: 'power3.out',
      duration: 1.6
    }, 0.4);

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="signature-section"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Visual Background */}
      <div
        ref={visualRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/images/signature_latte.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          willChange: 'transform, filter'
        }}
      >
        {/* Cinematic Vignette & Shadow Gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 65% 45%, transparent 25%, rgba(10, 8, 6, 0.6) 65%, rgba(10, 8, 6, 0.95) 100%), linear-gradient(90deg, rgba(10, 8, 6, 0.92) 0%, rgba(10, 8, 6, 0.6) 45%, transparent 100%)'
          }}
        />
      </div>

      {/* Moving Golden Spotlight Beam */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '60%',
          height: '140%',
          background:
            'radial-gradient(ellipse at center, rgba(246, 200, 136, 0.18) 0%, rgba(229, 168, 92, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
          transform: 'rotate(-5deg)',
          zIndex: 8
        }}
      />

      {/* Live Rising Steam Simulation directly over the cup */}
      <SteamCanvas mode="steam-and-dust" originX={0.65} originY={0.48} density={1.4} />

      {/* Foreground Content Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '100px 48px',
          display: 'flex',
          justifyContent: 'flex-start'
        }}
      >
        <div
          ref={textGroupRef}
          style={{
            maxWidth: '650px',
            background: 'rgba(16, 12, 9, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '48px',
            borderRadius: '28px',
            border: '1px solid rgba(229, 168, 92, 0.3)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(229, 168, 92, 0.15)'
          }}
        >
          {/* Badge */}
          <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <span className="badge-gold">
              <Award size={14} /> FLAGSHIP MASTERPIECE
            </span>
          </div>

          {/* Section Header */}
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(36px, 5vw, 68px)',
              fontWeight: 900,
              lineHeight: 1.05,
              color: '#fff',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}
          >
            THE GOOD DAY <br />
            <span className="text-gold-gradient">SIGNATURE</span>
          </h2>

          {/* Quotation */}
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontStyle: 'italic',
              color: 'var(--color-cream-soft)',
              marginBottom: '20px',
              fontWeight: 400
            }}
          >
            “Crafted for the moments that deserve a little more.”
          </p>

          <p
            style={{
              color: 'var(--color-beige)',
              fontSize: '16px',
              lineHeight: 1.7,
              marginBottom: '28px'
            }}
          >
            A symphony of 100% Ethiopian Yirgacheffe espresso folded into silky, hand-steamed Jersey whole milk with swan microfoam latte art. Finished with a trace of crystallized raw coconut blossom nectar.
          </p>

          {/* Tasting Notes & Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '32px'
            }}
          >
            {[
              'Handcrafted Swan Microfoam Latte Art',
              'Subtle Notes of Toasted Almond & Salted Caramel',
              'Silky Velvet Mouthfeel with Zero Harshness'
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--color-cream)'
                }}
              >
                <CheckCircle2 size={16} className="text-gold" />
                <span style={{ fontSize: '14px' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Price & Order Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(229, 168, 92, 0.2)'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
                Signature Cup
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '44px',
                    fontWeight: 900,
                    color: 'var(--color-gold-bright)'
                  }}
                >
                  ₹149
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: 'var(--color-muted)',
                    textDecoration: 'line-through'
                  }}
                >
                  ₹180
                </span>
              </div>
            </div>

            <button
              onClick={() => addToCart(signatureProduct)}
              className="btn-primary"
              style={{
                padding: '16px 36px',
                fontSize: '15px'
              }}
            >
              <ShoppingBag size={18} />
              Order This Coffee
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignatureSection;
