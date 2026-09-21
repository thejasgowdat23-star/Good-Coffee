import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SteamCanvas from './SteamCanvas';
import { Sparkles, Heart, Compass, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STORY_BEATS = [
  {
    tag: 'ORIGIN & CRAFT',
    title: 'The Sacred Roast',
    subtitle: 'High-Altitude Volcanic Soil Arabica',
    desc: 'We source exclusively from organic family cooperatives in Yirgacheffe and Huila. Small-batch drum roasted under cast iron heat to preserve delicate jasmine florals and honeyed molasses.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=80',
    icon: Compass
  },
  {
    tag: 'PRECISION EXTRACTION',
    title: 'The Master Dial-In',
    subtitle: '9 Bars • 93.5°C • 28 Seconds',
    desc: 'Every morning before sunrise, our head baristas recalibrate the burr grinders for ambient humidity. Every shot is pulled with laboratory precision to achieve maximum aromatic clarity.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    icon: Award
  },
  {
    tag: 'THE POUR',
    title: 'The Silky Microfoam',
    subtitle: 'Folded at 65°C to 68°C',
    desc: 'Sweet whole milk stretched until it mirrors wet gloss paint. Hand-swirled and poured in a continuous single gesture that marries dense espresso crema with microfoam.',
    image: '/images/signature_latte.jpg',
    icon: Sparkles
  },
  {
    tag: 'THE PHILOSOPHY',
    title: 'Moments Worth Slowing For',
    subtitle: 'A Sanctuary in a Fast World',
    desc: 'Good Day was created around a simple idea — every good day deserves a good cup of coffee. We designed our space as a warm acoustic haven with soft golden light and honest conversation.',
    image: '/images/hero_coffee.jpg',
    icon: Heart
  }
];

export const BrandStory = () => {
  const containerRef = useRef(null);
  const [activeBeat, setActiveBeat] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${STORY_BEATS.length * 120}%`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      onUpdate: (self) => {
        const step = Math.min(
          STORY_BEATS.length - 1,
          Math.max(0, Math.floor(self.progress * STORY_BEATS.length))
        );
        setActiveBeat(step);
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === container) st.kill();
      });
    };
  }, []);

  const current = STORY_BEATS[activeBeat];
  const IconComponent = current.icon;

  return (
    <section
      id="about-brand"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0806'
      }}
    >
      {/* Dynamic Background Image Layers with Cross-Fade */}
      {STORY_BEATS.map((beat, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${beat.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: activeBeat === idx ? 1 : 0,
            transform: activeBeat === idx ? 'scale(1.04)' : 'scale(1.15)',
            transition: 'opacity 1s ease-in-out, transform 2.5s ease-out',
            filter: 'brightness(0.65) contrast(1.1)',
            zIndex: 1
          }}
        />
      ))}

      {/* Atmospheric dark overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 60% 50%, transparent 20%, rgba(10, 8, 6, 0.75) 70%, rgba(10, 8, 6, 0.95) 100%), linear-gradient(90deg, rgba(10, 8, 6, 0.94) 0%, rgba(10, 8, 6, 0.6) 50%, rgba(10, 8, 6, 0.3) 100%)',
          zIndex: 5
        }}
      />

      <SteamCanvas mode="dust" density={0.7} />

      {/* Floating Section Index Header */}
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
          05 / 07 • CINEMATIC STORY
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '24px',
            color: '#fff',
            margin: 0
          }}
        >
          Brand Philosophy
        </h2>
      </div>

      {/* Main Narrative Display */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1440px',
          height: '100%',
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            background: 'rgba(16, 12, 9, 0.75)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            padding: '48px',
            borderRadius: '32px',
            border: '1px solid rgba(229, 168, 92, 0.28)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(229, 168, 92, 0.12)'
          }}
        >
          {/* Main Brand Motto */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'var(--color-gold-bright)',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              MORE THAN COFFEE.
            </span>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(20px, 2.5vw, 30px)',
                fontStyle: 'italic',
                color: 'var(--color-cream)',
                lineHeight: 1.3
              }}
            >
              “Good Day was created around a simple idea — every good day deserves a good cup of coffee.”
            </p>
          </div>

          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(229, 168, 92, 0.2)',
              marginBottom: '28px'
            }}
          />

          {/* Active Story Beat Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(229, 168, 92, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)'
              }}
            >
              <IconComponent size={18} />
            </div>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--color-gold)',
                fontWeight: 600
              }}
            >
              {current.tag}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '6px'
            }}
          >
            {current.title}
          </h3>

          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-gold-bright)',
              marginBottom: '16px'
            }}
          >
            {current.subtitle}
          </div>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-beige)',
              lineHeight: 1.7,
              marginBottom: '28px'
            }}
          >
            {current.desc}
          </p>

          {/* Chapter Timeline Trackers */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {STORY_BEATS.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '999px',
                  background:
                    activeBeat === idx
                      ? 'linear-gradient(90deg, #f6c888, #e5a85c)'
                      : 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.4s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
