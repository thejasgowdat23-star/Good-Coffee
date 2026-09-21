import React, { lazy, Suspense, useEffect, useState } from 'react';
import { ShopProvider } from './context/ShopContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CoffeeMenu from './customer/pages/coffee/CoffeeMenu';
import SnacksMenu from './customer/pages/snacks/SnacksMenu';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import MenuAdminModal from './components/MenuAdminModal';
import SearchModal from './components/SearchModal';

const AiAssistant = lazy(() => import('./components/AiAssistant'));

function currentRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'home';
}

function AppContent() {
  const [route, setRoute] = useState(currentRoute);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => setRoute(currentRoute());
    const handleVisibility = () => document.documentElement.classList.toggle('tab-hidden', document.visibilityState === 'hidden');
    window.addEventListener('hashchange', handleRouteChange);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const showAi = () => {
    window.location.hash = '/ai-assistant';
  };

  return (
    <div className="app-shell">
      <Navbar isHome={route === 'home'} onSearchOpen={() => setIsSearchOpen(true)} onAiOpen={showAi} />
      <Suspense fallback={<p className="status-message page-shell">Loading...</p>}>
        <div key={route} className={`route-view ${route === 'home' ? 'route-view--home' : ''}`}>
        {route === 'coffee' && <CoffeeMenu />}
        {route === 'snacks' && <SnacksMenu />}
        {route === 'ai-assistant' && <AiAssistant />}
        {route === 'home' && <HomePage onAiOpen={showAi} />}
        {!['home', 'coffee', 'snacks', 'ai-assistant'].includes(route) && <HomePage onAiOpen={showAi} />}
        </div>
      </Suspense>
      <CartDrawer />
      <CheckoutModal />
      <MenuAdminModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return <ShopProvider><AppContent /></ShopProvider>;
}
