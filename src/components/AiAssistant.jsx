import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Send, X, RotateCcw, ArrowLeft, CheckCheck, Sparkle, Coffee } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const APP_LOGO = '/good-day-coffee-logo.png';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const quickQuestions = [
  ['☕', 'Recommend a coffee'],
  ['🍪', 'Show snacks & bakes'],
  ['✨', 'Best-selling items']
];

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_GREETING = {
  role: 'assistant',
  content: 'Hello! I am your Good Day AI Barista. What coffee, fresh bake, or savory bite can I recommend for you today?',
  recommendations: [],
  time: getCurrentTime()
};

function getClientFallback(query, products = []) {
  const q = (query || '').toLowerCase().trim();
  const available = Array.isArray(products)
    ? products.filter(p => p.available !== false && p.inStock !== false)
    : [];

  if (q.includes('best') || q.includes('popular') || q.includes('top') || q.includes('selling') || q.includes('bestseller') || q.includes('special')) {
    const items = available.filter(p =>
      p.id?.includes('filter') ||
      p.name?.toLowerCase().includes('filter') ||
      p.name?.toLowerCase().includes('cappuccino') ||
      p.name?.toLowerCase().includes('croissant') ||
      p.name?.toLowerCase().includes('cold')
    ).slice(0, 3);
    return {
      reply: 'Here are our most-loved, best-selling house favorites handcrafted fresh daily!',
      recommendations: items.length > 0 ? items : available.slice(0, 3)
    };
  }

  if (q.includes('coffee') || q.includes('recommend') || q.includes('espresso') || q.includes('brew') || q.includes('latte') || q.includes('cappuccino')) {
    const items = available.filter(p =>
      p.category === 'Coffee' ||
      p.menuCategory === 'coffee' ||
      p.name?.toLowerCase().includes('coffee')
    ).slice(0, 3);
    return {
      reply: 'Here are our signature artisanal coffee brews crafted with single-origin beans:',
      recommendations: items.length > 0 ? items : available.slice(0, 3)
    };
  }

  if (q.includes('snack') || q.includes('bake') || q.includes('food') || q.includes('eat') || q.includes('croissant') || q.includes('cookie') || q.includes('samosa') || q.includes('puff')) {
    const items = available.filter(p =>
      p.category === 'Snacks' ||
      p.menuCategory === 'snacks' ||
      p.category === 'Bakery'
    ).slice(0, 3);
    return {
      reply: 'Here are fresh, oven-baked treats and savory snacks that pair wonderfully with coffee:',
      recommendations: items.length > 0 ? items : available.slice(0, 3)
    };
  }

  if (q.includes('cold') || q.includes('iced') || q.includes('chill')) {
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
  const [addedItem, setAddedItem] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function ask(value = message) {
    const content = value.trim().slice(0, 500);
    if (!content || busy) return;
    setMessage('');
    const history = messages.slice(-4).map(item => ({ role: item.role, content: item.content }));
    setMessages(previous => [...previous, { role: 'user', content, time: getCurrentTime() }]);
    setBusy(true);

    try {
      const lightweightMenu = Array.isArray(products)
        ? products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category || p.menuCategory,
            description: p.description || '',
            available: p.available !== false && p.inStock !== false
          }))
        : [];
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, menu: lightweightMenu })
      });
      if (!response.ok) throw new Error('AI unavailable');
      const result = await response.json();
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: result.reply,
          recommendations: result.recommendations || [],
          time: getCurrentTime()
        }
      ]);
    } catch {
      const fallback = getClientFallback(content, products);
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          content: fallback.reply,
          recommendations: fallback.recommendations,
          time: getCurrentTime()
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  const addRecommendation = product => {
    const localProduct = products.find(item => item.id === product.id) || product;
    if (localProduct && localProduct.inStock !== false && localProduct.available !== false) {
      addToCart(localProduct);
      setAddedItem(product.name);
      setTimeout(() => setAddedItem(null), 2400);
    }
  };

  const resetChat = () => {
    setMessages([{ ...INITIAL_GREETING, time: getCurrentTime() }]);
    setMessage('');
  };

  const handleBack = () => {
    if (window.location.hash.includes('ai-assistant')) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = '#/';
      }
    } else {
      setIsOpen(false);
    }
  };

  // Espresso Gold Chat Window
  const chatWindow = (
    <div className={`espresso-chat ${embedded ? 'espresso-chat--embedded' : 'espresso-chat--modal'}`}>
      {/* Espresso Gold Header */}
      <header className="espresso-chat__header">
        <div className="espresso-chat__header-left">
          <button
            type="button"
            className="espresso-chat__back-btn"
            onClick={handleBack}
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="espresso-chat__badge-avatar">
            <img src={APP_LOGO} alt="Good Day Coffee" className="espresso-chat__avatar-img" />
            <span className="espresso-chat__online-dot" title="Online" />
          </div>

          <div className="espresso-chat__identity">
            <h2 className="espresso-chat__title">Good Day AI Barista</h2>
            <div className="espresso-chat__status-row">
              <span className="espresso-chat__status-indicator" />
              <span className="espresso-chat__status-text">
                {busy ? 'typing...' : 'online'}
              </span>
            </div>
          </div>
        </div>

        <div className="espresso-chat__header-actions">
          <button
            type="button"
            className="espresso-chat__action-btn"
            onClick={resetChat}
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw size={17} />
          </button>
          {!embedded && (
            <button
              type="button"
              className="espresso-chat__action-btn espresso-chat__close-btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close"
            >
              <X size={19} />
            </button>
          )}
        </div>
      </header>

      {/* Espresso Chat Body */}
      <div className="espresso-chat__body">
        {addedItem && (
          <div className="espresso-chat__toast">
            <span className="espresso-chat__toast-icon">✓</span> Added <strong>{addedItem}</strong> to order!
          </div>
        )}

        <div className="espresso-chat__messages" aria-live="polite">
          {messages.map((item, index) => {
            const isUser = item.role === 'user';
            return (
              <div
                key={`${item.role}-${index}`}
                className={`espresso-bubble-row ${isUser ? 'espresso-bubble-row--user' : 'espresso-bubble-row--assistant'}`}
              >
                <div className={`espresso-bubble ${isUser ? 'espresso-bubble--user' : 'espresso-bubble--assistant'}`}>
                  <p className="espresso-bubble__text">{item.content}</p>

                  {item.recommendations?.length > 0 && (
                    <div className="espresso-recommendations">
                      {item.recommendations.map(product => (
                        <div key={product.id} className="espresso-product-card">
                          <div className="espresso-product-card__thumb-wrap">
                            <img
                              src={getOptimizedImageUrl(product)}
                              alt={product.name}
                              className="espresso-product-card__img"
                              loading="lazy"
                              onError={event => {
                                if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                                  event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                                }
                              }}
                            />
                          </div>

                          <div className="espresso-product-card__info">
                            <strong className="espresso-product-card__name">{product.name}</strong>
                            {product.description && (
                              <p className="espresso-product-card__desc">{product.description}</p>
                            )}
                            <span className="espresso-product-card__price">₹{product.price}</span>
                          </div>

                          <button
                            type="button"
                            className="espresso-product-card__add-btn"
                            onClick={() => addRecommendation(product)}
                            title={`Add ${product.name} to order`}
                          >
                            <Plus size={15} />
                            <span>Add to Order</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="espresso-bubble__meta">
                    <span className="espresso-bubble__time">{item.time || getCurrentTime()}</span>
                    {isUser && <CheckCheck size={14} className="espresso-bubble__ticks" />}
                  </div>
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="espresso-bubble-row espresso-bubble-row--assistant">
              <div className="espresso-bubble espresso-bubble--assistant espresso-bubble--typing">
                <span className="espresso-typing-label">Barista is thinking</span>
                <span className="espresso-typing-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Action Chips */}
      <div className="espresso-chat__chips-bar">
        {quickQuestions.map(([icon, label]) => (
          <button
            type="button"
            key={label}
            className="espresso-chip"
            onClick={() => ask(label)}
            disabled={busy}
          >
            <span className="espresso-chip__icon">{icon}</span>
            <span className="espresso-chip__label">{label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <form
        className="espresso-chat__input-bar"
        onSubmit={event => {
          event.preventDefault();
          ask();
        }}
      >
        <div className="espresso-chat__input-pill">
          <input
            ref={inputRef}
            value={message}
            maxLength={500}
            onChange={event => setMessage(event.target.value)}
            placeholder="Type a message..."
            aria-label="Ask Good Day AI Barista"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="espresso-chat__send-btn"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );

  // Full-page embedded view
  if (embedded) {
    return (
      <main className="espresso-ai-page-wrapper">
        {chatWindow}
      </main>
    );
  }

  // Floating Espresso Gold trigger button on homepage / other views
  return (
    <div className="espresso-ai-widget">
      <button
        type="button"
        className={`espresso-ai-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => {
          if (window.innerWidth <= 768) {
            window.location.hash = '/ai-assistant';
          } else {
            setIsOpen(open => !open);
          }
        }}
        aria-expanded={isOpen}
        aria-label="Good Day AI - Ask Barista"
      >
        <span className="espresso-ai-trigger__badge">
          <img src={APP_LOGO} alt="Good Day Coffee" className="espresso-ai-trigger__logo" />
        </span>
        <span className="espresso-ai-trigger__text">
          <strong className="espresso-ai-trigger__title">Good Day AI</strong>
          <small className="espresso-ai-trigger__subtitle">ASK BARISTA</small>
        </span>
        <span className="espresso-ai-trigger__sparkle">
          <Sparkles size={14} />
        </span>
      </button>

      {isOpen && (
        <div
          className="espresso-ai-modal-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      {isOpen && (
        <div className="espresso-ai-modal-container">
          {chatWindow}
        </div>
      )}
    </div>
  );
}
