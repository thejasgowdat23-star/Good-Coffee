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
      setMessages(previous => [...previous, { role: 'assistant', content: 'Sorry, Good Day AI is momentarily resting. Please ask again in a moment.', recommendations: [] }]);
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
