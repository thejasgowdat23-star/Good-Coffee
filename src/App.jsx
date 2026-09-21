import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import HeroCameraPush from './components/HeroCameraPush';
import CoffeeCollection from './components/CoffeeCollection';
import SignatureSection from './components/SignatureSection';
import SnackJourney from './components/SnackJourney';
import VisualCollision from './components/VisualCollision';
import AiAssistant from './components/AiAssistant';
import BrandStory from './components/BrandStory';
import FinalHero from './components/FinalHero';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import MenuAdminModal from './components/MenuAdminModal';
import SearchModal from './components/SearchModal';

gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Initialize Lenis Smooth Scrolling for cinematic momentum
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="cinematic-app" style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      {/* Film Grain & Vignette Overlays for Cinema Feel */}
      <div className="film-grain" />
      <div className="vignette-overlay" />

      {/* Floating Dynamic Navbar */}
      <Navbar onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Main Cinematic Film Journey */}
      <main>
        {/* 1. Full-Screen Hero & Scroll-driven Camera Push into Crema Depth */}
        <HeroCameraPush />

        {/* 2. Full-Screen Morphing Coffee Lineage (Espresso, Cappuccino, Latte, Americano, Mocha, Cold Brew) */}
        <CoffeeCollection />

        {/* 3. The Dramatic Good Day Signature Latte Experience */}
        <SignatureSection />

        {/* 4. Horizontal Artisan Snack Journey (Vertical Scroll -> Horizontal Camera Pan) */}
        <SnackJourney />

        {/* 5. Visual Collision Transition (Coffee + Croissant = Good Day Breakfast Combo) */}
        <VisualCollision />

        {/* 6. Good Day AI Assistant (Conversational Flavor Sommelier) */}
        <AiAssistant />

        {/* 7. Cinematic Brand Story (More Than Coffee) */}
        <BrandStory />

        {/* 8. Final Atmospheric Hero & Footer (Camera Pullback & Live Steam) */}
        <FinalHero />
      </main>

      {/* Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <MenuAdminModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
