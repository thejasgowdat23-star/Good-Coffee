import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SteamCanvas from './SteamCanvas';
import { ArrowDown, Sparkles, Coffee } from 'lucide-react';
import { useShop } from '../context/ShopContext';

gsap.registerPlugin(ScrollTrigger);

export const HeroCameraPush = () => {
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroImageRef = useRef(null);
  const cremaLayerRef = useRef(null);
  const macroTextRef = useRef(null);
  const { addToCart, products } = useShop();

  // Find signature or featured product for Order Now
  const heroProduct = products.find(p => p.id === 'coffee-latte-sig') || products[0];

  useEffect(() => {
    const container = containerRef.current;
    const heroContent = heroContentRef.current;
    const heroImage = heroImageRef.current;
    const cremaLayer = cremaLayerRef.current;
    const macroText = macroTextRef.current;

    if (!container || !heroContent || !heroImage || !cremaLayer) return;

    // Timeline pinned for smooth continuous camera push
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1
      }
    });

    // Step 1: Text dissolves and scales out as camera starts pushing in
    tl.to(heroContent, {
      opacity: 0,
      y: -80,
      scale: 0.95,
      filter: 'blur(8px)',
      duration: 1,
      ease: 'power2.inOut'
    }, 0);

    // Step 2: Hero background cup scales aggressively, focusing camera into the cup surface
    tl.to(heroImage, {
      scale: 3.2,
      xPercent: 12,
      yPercent: -18,
      filter: 'contrast(1.08) brightness(1.05)',
      duration: 2.5,
      ease: 'power1.inOut'
    }, 0);

    // Step 3: Dissolve seamlessly into the extreme macro crema texture
    tl.fromTo(cremaLayer, {
      opacity: 0,
      scale: 1.3,
      filter: 'blur(10px)'
    }, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.8,
      ease: 'power2.inOut'
    }, 1.2);

    // Step 4: Reveal macro depth inspection text
    tl.fromTo(macroText, {
      opacity: 0,
      y: 40,
      letterSpacing: '0.4em'
    }, {
      opacity: 1,
      y: 0,
      letterSpacing: '0.15em',
      duration: 1.2,
      ease: 'power3.out'
    }, 1.8);

    // Step 5: Dive through the crema into next scene
    tl.to(cremaLayer, {
      scale: 2.2,
      filter: 'brightness(0.6) blur(6px)',
      duration: 1.5,
      ease: 'power2.in'
    }, 2.6);

    tl.to(macroText, {
      opacity: 0,
      scale: 1.2,
      duration: 0.8
    }, 2.8);

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, []);

  // Subtle interactive mouse parallax on hero when sitting at the top
  const handleMouseMove = (e) => {
    if (window.scrollY > 300) return;
    const { clientX, clientY } = e;
    const xPos = (clientX / window.innerWidth - 0.5) * 16;
    const yPos = (clientY / window.innerHeight - 0.5) * 16;
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        x: xPos,
        y: yPos,
        duration: 1.4,
        ease: 'power2.out'
      });
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806'
      }}
    >
      {/* Layer 1: Cinematic Full Viewport Hero Coffee Image */}
      <div
        ref={heroImageRef}
        style={{
          position: 'absolute',
          inset: '-5%',
          width: '110%',
          height: '110%',
          backgroundImage: "url('/images/hero_coffee.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          transformOrigin: '58% 54%',
          willChange: 'transform, filter, opacity',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Warm Sunlight & Radial Shadow Overlays */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(246, 200, 136, 0.25) 0%, transparent 60%), linear-gradient(180deg, rgba(10, 8, 6, 0.3) 0%, transparent 40%, rgba(10, 8, 6, 0.75) 100%)'
          }}
        />
      </div>

      {/* Layer 2: Live Rising Steam & Sunbeam Particles over Hero Cup */}
      <SteamCanvas mode="steam-and-dust" originX={0.62} originY={0.52} density={1.2} />

      {/* Layer 3: Extreme Macro Crema Dive Texture Layer */}
      <div
        ref={cremaLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/images/crema_macro.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'transform, opacity, filter',
          zIndex: 10
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 30%, rgba(14, 10, 7, 0.75) 90%)'
          }}
        />
      </div>

      {/* Macro Text Overlay revealed during the camera push */}
      <div
        ref={macroTextRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 20,
          opacity: 0,
          pointerEvents: 'none',
          padding: '0 20px'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            textTransform: 'uppercase',
            color: 'var(--color-gold-bright)',
            fontWeight: 700,
            letterSpacing: '0.25em',
            marginBottom: '16px'
          }}
        >
          <Sparkles size={16} /> Entering The Roast Depth
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 5vw, 64px)',
            fontWeight: 800,
            color: '#fff',
            textShadow: '0 4px 30px rgba(0,0,0,0.9)',
            maxWidth: '900px',
            lineHeight: 1.15
          }}
        >
          Tiger Crema & Micro-Aromatics
        </h2>
        <p
          style={{
            color: 'var(--color-beige)',
            fontSize: 'clamp(14px, 1.8vw, 20px)',
            maxWidth: '600px',
            marginTop: '12px',
            fontWeight: 400
          }}
        >
          Extracted at exactly 9 bars pressure and 93.5°C water to unlock 800+ volatile flavor compounds.
        </p>
      </div>

      {/* Layer 4: Initial Hero Cinematic Typography & Call To Action */}
      <div
        ref={heroContentRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 48px 48px',
          maxWidth: '1440px',
          margin: '0 auto',
          left: 0,
          right: 0,
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        {/* Top Tagline Pill */}
        <div style={{ pointerEvents: 'auto' }}>
          <div
            className="badge-gold animate-float"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              letterSpacing: '0.12em',
              background: 'rgba(20, 14, 10, 0.65)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <Sparkles size={14} className="text-gold" />
            <span>ARTISAN ROASTERY & ESPRESSO BAR</span>
          </div>
        </div>

        {/* Center Main Text */}
        <div style={{ maxWidth: '780px', pointerEvents: 'auto' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(46px, 7.5vw, 104px)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#fff',
              margin: '0 0 18px 0',
              textShadow: '0 8px 30px rgba(0, 0, 0, 0.85)'
            }}
          >
            GOOD DAY <br />
            <span className="text-gold-gradient">COFFEE</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(20px, 3vw, 34px)',
              fontStyle: 'italic',
              color: 'var(--color-cream-soft)',
              marginBottom: '16px',
              fontWeight: 400,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            “Make Every Day a Good Day.”
          </p>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(15px, 1.4vw, 18px)',
              color: 'var(--color-beige)',
              maxWidth: '560px',
              lineHeight: 1.6,
              marginBottom: '32px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
            }}
          >
            Freshly brewed single-origin coffee, handcrafted warm snacks, and moments worth slowing down for.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <button
              onClick={() => scrollToSection('coffee-collection')}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '15px' }}
            >
              <Coffee size={18} />
              Explore Coffee
            </button>

            <button
              onClick={() => addToCart(heroProduct)}
              className="btn-secondary"
              style={{ padding: '15px 32px', fontSize: '15px' }}
            >
              Order Now • ₹{heroProduct.price}
            </button>
          </div>
        </div>

        {/* Bottom Scroll Indicator with Camera Push Prompt */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto'
          }}
        >
          <div
            onClick={() => scrollToSection('coffee-collection')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: 'var(--color-beige)'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid rgba(229, 168, 92, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'softFloat 2s ease-in-out infinite'
              }}
            >
              <ArrowDown size={16} className="text-gold" />
            </div>
            <span style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              Scroll to Push Camera
            </span>
          </div>

          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-bright)',
              fontWeight: 600
            }}
          >
            01 / 07 • SCENE ONE
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCameraPush;
