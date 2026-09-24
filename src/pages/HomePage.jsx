import React from 'react';
import useReveal from '../hooks/useReveal';

export default function HomePage({ onAiOpen }) {
  const { setRef, visible } = useReveal();

  return (
    <main className="home-page home-page--hero">
      <section ref={setRef} className={`hero-only ${visible ? 'is-motion-visible' : ''}`} aria-labelledby="hero-title">
        <picture className="hero-only__media">
          <source media="(max-width: 767px)" srcSet="/images/hero-mobile.webp" />
          <img src="/images/hero-desktop.webp" alt="A freshly brewed Good Day Coffee cup" width="1920" height="1080" fetchPriority="high" />
        </picture>
        <div className="hero-only__beam" aria-hidden="true" />
        <div className="hero-only__steam" aria-hidden="true">
          <i className="hero-steam hero-steam--one" />
          <i className="hero-steam hero-steam--two" />
          <i className="hero-steam hero-steam--three" />
        </div>
        <div className="hero-only__content">
          <p className="eyebrow">Small batch. Hii Dear's.</p>
          <h1 id="hero-title">Welcome to the <span>Good Day Coffee</span></h1>
          <p className="hero-only__tagline">Make Every Day a Good Day.</p>
          <p className="hero-only__description">Freshly brewed single-origin coffee, handcrafted warm snacks, and moments worth slowing down for.</p>
          <div className="hero-actions">
            <a className="button button--order" href="#/coffee">Order Coffee</a>
            <a className="button button--hero-outline" href="#/snacks">Order Snacks</a>
          </div>
        </div>
      </section>
    </main>
  );
}
