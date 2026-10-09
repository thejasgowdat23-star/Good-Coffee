import React, { useEffect, useState } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CoffeeMenu from './customer/pages/coffee/CoffeeMenu';
import SnacksMenu from './customer/pages/snacks/SnacksMenu';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import MenuAdminModal from './components/MenuAdminModal';
import SearchModal from './components/SearchModal';
import AiAssistant from './components/AiAssistant';
import OrderTrackingModal from './components/OrderTrackingModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import AuthModal from './components/AuthModal';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function currentRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'home';
}

function AppContent() {
  const [route, setRoute] = useState(currentRoute);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setIsOrderTrackingOpen, setIsOrderHistoryOpen } = useShop();

  useEffect(() => {
    const handleRouteChange = () => {
      const r = currentRoute();
      setRoute(r);
      if (r === 'tracking' || r === 'track-order') {
        setIsOrderTrackingOpen(true);
      } else if (r === 'history' || r === 'orders' || r === 'order-history') {
        setIsOrderHistoryOpen(true);
      }
    };
    const handleVisibility = () => document.documentElement.classList.toggle('tab-hidden', document.visibilityState === 'hidden');
    window.addEventListener('hashchange', handleRouteChange);
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Check initial route
    const initial = currentRoute();
    if (initial === 'tracking' || initial === 'track-order') setIsOrderTrackingOpen(true);
    if (initial === 'history' || initial === 'orders' || initial === 'order-history') setIsOrderHistoryOpen(true);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [setIsOrderTrackingOpen, setIsOrderHistoryOpen]);

  const showAi = () => {
    window.location.hash = '/ai-assistant';
  };

  return (
    <div className={`app-shell ${route === 'ai-assistant' ? 'app-shell--ai-active' : ''}`}>
      <Navbar isHome={route === 'home'} onSearchOpen={() => setIsSearchOpen(true)} onAiOpen={showAi} />
      <div key={route} className={`route-view ${route === 'home' ? 'route-view--home' : ''}`}>
        {route === 'coffee' && <CoffeeMenu />}
        {route === 'snacks' && <SnacksMenu />}
        {route === 'ai-assistant' && <AiAssistant embedded />}
        {route === 'home' && <HomePage onAiOpen={showAi} />}
        {!['home', 'coffee', 'snacks', 'ai-assistant'].includes(route) && <HomePage onAiOpen={showAi} />}
      </div>
      <CartDrawer />
      <CheckoutModal />
      <MenuAdminModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {route !== 'ai-assistant' && <AiAssistant />}
      <OrderTrackingModal />
      <OrderHistoryModal />
      <AuthModal />
    </div>
  );
}

export default function App() {
  if (!CLERK_KEY) {
    console.error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
    return <div style={{ padding: 40, textAlign: 'center', color: '#e4572e' }}>⚠️ Clerk key missing. Add VITE_CLERK_PUBLISHABLE_KEY to .env and restart.</div>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/#/">
      <AuthProvider>
        <ShopProvider>
          <AppContent />
        </ShopProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}
