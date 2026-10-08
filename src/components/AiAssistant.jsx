import React, { useState } from 'react';
import { Sparkles, Plus, Send, X, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const quickQuestions = [
  ['☕', 'Recommend a coffee'],
  ['🍪', 'Show snacks & bakes'],
  ['₹', 'Under ₹150'],
  ['🧊', 'Cold brew / Iced'],
  ['🍫', 'Something sweet']
];

const INITIAL_GREETING = {
  role: 'assistant',
  content: 'Hello! I am your Good Day AI Barista. What coffee, fresh bake, or savory bite can I recommend for you today?',
  recommendations: []
};

function getClientFallback(query, products = []) {
  const q = (query || '').toLowerCase().trim();
  const available = Array.isArray(products)
    ? products.filter(p => p.available !== false && p.inStock !== false)
    : [];

  if (q.includes('under 150') || q.includes('under ₹150') || q.includes('budget') || q.includes('cheap')) {
    const items = available.filter(p => Number(p.price) <= 150).slice(0, 3);
    return {
      reply: 'Here are some great handcrafted options under ₹150 from our menu!',
      recommendations: items
    };
  }

  if (q.includes('cold') || q.includes('iced') || q.includes('brew')) {
    const items = available.filter(p =>
      p.name?.toLowerCase().includes('cold') ||
      p.name?.toLowerCase().includes('iced') ||
      p.name?.toLowerCase().includes('brew')
    ).slice(0, 3);
    return {
      reply: 'Looking for a refreshing chill? Here are our top iced and cold brew favorites!',
      recommendations: items.length > 0 ? items : available.slice(0, 2)
    };
  }

  if (q.includes('snack') || q.includes('bake') || q.includes('food') || q.includes('eat') || q.includes('croissant') || q.includes('cookie')) {
    const items = available.filter(p =>
      p.category === 'Snacks' ||
      p.menuCategory === 'snacks' ||
      p.category === 'Bakery'
    ).slice(0, 3);
    return {
      reply: 'Here are some freshly baked treats and snacks that pair wonderfully with coffee!',
      recommendations: items.length > 0 ? items : available.slice(0, 2)
    };
  }

  if (q.includes('sweet') || q.includes('dessert') || q.includes('chocolate')) {
    const items = available.filter(p =>
      p.name?.toLowerCase().includes('chocolate') ||
      p.name?.toLowerCase().includes('sweet') ||
      p.name?.toLowerCase().includes('muffin') ||
      p.name?.toLowerCase().includes('cake')
    ).slice(0, 3);
    return {
      reply: 'Craving something sweet? Indulge in these delightful sweet treats!',
      recommendations: items.length > 0 ? items : available.slice(0, 2)
    };
  }

  if (q === 'hi' || q === 'hello' || q.startsWith('hi ') || q.startsWith('hello ') || q.startsWith('hey')) {
    return {
      reply: 'Hello! Welcome to Good Day Coffee. What kind of coffee, iced brew, or fresh bake can I recommend for you today?',
      recommendations: available.slice(0, 2)
    };
  }

  const words = q.split(/\s+/).filter(w => w.length > 2);
  const matched = available.filter(p => {
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return words.some(w => name.includes(w) || desc.includes(w));
  }).slice(0, 3);

  if (matched.length > 0) {
    return {
      reply: 'Here are our best menu recommendations for you:',
      recommendations: matched
    };
  }

  return {
    reply: "I'd love to help you find your perfect cup or bake! Here are some of our popular house favorites.",
    recommendations: available.slice(0, 3)
  };
}

export default function AiAssistant({ embedded = false }) {
  const { products, addToCart } = useShop();
  const [isOpen, setIsOpen] = useState(embedded);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [busy, setBusy] = useState(false);

  async function ask(value = message) {
    const content = value.trim().slice(0, 500);
    if (!content || busy) return;
    setMessage('');
    const history = messages.slice(-4).map(item => ({ role: item.role, content: item.content }));
    setMessages(previous => [...previous, { role: 'user', content }]);
    setBusy(true);
    try {
      const lightweightMenu = Array.isArray(products)
        ? products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category || p.menuCategory, available: p.available !== false && p.inStock !== false }))
        : [];
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, menu: lightweightMenu })
      });
      if (!response.ok) throw new Error('AI unavailable');
      const result = await response.json();
      setMessages(previous => [...previous, { role: 'assistant', content: result.reply, recommendations: result.recommendations || [] }]);
    } catch {
      const fallback = getClientFallback(content, products);
      setMessages(previous => [...previous, { role: 'assistant', content: fallback.reply, recommendations: fallback.recommendations }]);
    } finally {
      setBusy(false);
    }
  }

  const addRecommendation = product => {
    const localProduct = products.find(item => item.id === product.id);
    if (localProduct && localProduct.inStock !== false && localProduct.available !== false) addToCart(localProduct);
  };

  const resetChat = () => {
    setMessages([INITIAL_GREETING]);
    setMessage('');
  };

  const chatWindow = (
    <section className={`ai-widget__panel${embedded ? ' ai-widget__panel--embedded' : ''}`} aria-label="Good Day AI Barista chat">
      <header className="ai-widget__header">
        <div className="ai-widget__identity">
          <div className="ai-widget__avatar-wrap">
            <img src="/images/ai-barista-logo.svg" className="ai-widget__logo" alt="Good Day AI Barista" />
            <span className="ai-widget__status-dot" title="Online" />
          </div>
          <div>
            <div className="ai-widget__title-row">
              <strong>GOOD DAY AI</strong>
              <span className="ai-widget__badge"><Sparkles size={11} /> Barista</span>
            </div>
            <small>Personal Coffee & Bakery Companion</small>
          </div>
        </div>
        <div className="ai-widget__header-actions">
          <button type="button" className="ai-widget__action-btn" onClick={resetChat} aria-label="Reset chat" title="Reset chat">
            <RotateCcw size={15} />
          </button>
          {!embedded && (
            <button type="button" className="ai-widget__close" onClick={() => setIsOpen(false)} aria-label="Close Good Day AI">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <div className="ai-widget__messages" aria-live="polite">
        {messages.map((item, index) => (
          <div key={`${item.role}-${index}`} className={`ai-widget__message ai-widget__message--${item.role}`}>
            <p>{item.content}</p>
            {item.recommendations?.length > 0 && (
              <div className="ai-widget__recommendations">
                {item.recommendations.map(product => (
                  <button type="button" key={product.id} onClick={() => addRecommendation(product)} title="Add to Order">
                    <div className="ai-rec__thumb">
                      <img
                        src={getOptimizedImageUrl(product)}
                        alt={product.name}
                        width="36"
                        height="36"
                        loading="lazy"
                        decoding="async"
                        onError={event => {
                          if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                            event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }
                        }}
                      />
                    </div>
                    <span className="ai-rec__details">
                      <strong>{product.name}</strong>
                      <small>₹{product.price}</small>
                    </span>
                    <span className="ai-rec__add-icon"><Plus size={14} /></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="ai-widget__message ai-widget__message--assistant">
            <p>
              Barista is thinking
              <span className="ai-widget__typing" aria-label="Thinking">
                <i /><i /><i />
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="ai-widget__quick-actions">
        {quickQuestions.map(([icon, label]) => (
          <button type="button" key={label} onClick={() => ask(label)} disabled={busy}>
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      <form className="ai-widget__form" onSubmit={event => { event.preventDefault(); ask(); }}>
        <input
          value={message}
          maxLength={500}
          onChange={event => setMessage(event.target.value)}
          placeholder="Ask our AI Barista anything..."
          aria-label="Ask Good Day AI Barista"
        />
        <button type="submit" disabled={busy || !message.trim()} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </section>
  );

  if (embedded) {
    return (
      <main className="ai-page page-shell">
        <div className="ai-page__header">
          <div className="ai-page__brand-hero">
            <img src="/images/ai-barista-logo.svg" className="ai-page__hero-logo" alt="Good Day AI Barista Logo" />
          </div>
          <p className="eyebrow">Interactive AI Barista</p>
          <h1>A better cup starts with a good question.</h1>
          <p>Real-time suggestions crafted specifically from today&apos;s handcrafted menu and live bakery items.</p>
        </div>
        {chatWindow}
      </main>
    );
  }

  return (
    <div className="ai-widget">
      <button
        type="button"
        className={`ai-widget__trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        aria-label="Open Good Day AI Barista"
      >
        <span className="ai-widget__trigger-avatar">
          <img src="/images/ai-barista-logo.svg" alt="" aria-hidden="true" />
          <span className="ai-widget__pulse-ring" />
        </span>
        <span className="ai-widget__trigger-text">
          <strong>Good Day AI</strong>
          <small>Ask Barista</small>
        </span>
        <Sparkles size={16} className="ai-widget__trigger-sparkle" />
      </button>
      {isOpen && chatWindow}
    </div>
  );
}
