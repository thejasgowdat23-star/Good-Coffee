import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Send, X, RotateCcw, ArrowLeft, CheckCheck, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';

const APP_LOGO = '/good-day-coffee-logo.png';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const quickQuestions = [
  ['☕', 'Recommend a coffee'],
  ['🍪', 'Show snacks & bakes'],
  ['₹', 'Under ₹150'],
  ['🧊', 'Cold brew / Iced'],
  ['🍫', 'Something sweet']
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
    const localProduct = products.find(item => item.id === product.id);
    if (localProduct && localProduct.inStock !== false && localProduct.available !== false) {
      addToCart(localProduct);
      setAddedItem(product.name);
      setTimeout(() => setAddedItem(null), 2200);
    }
  };

  const resetChat = () => {
    setMessages([{ ...INITIAL_GREETING, time: getCurrentTime() }]);
    setMessage('');
  };

  const handleBack = () => {
    if (window.location.hash.includes('ai-assistant')) {
      window.location.hash = '#/';
    } else {
      setIsOpen(false);
    }
  };

  // WhatsApp Chat UI
  const whatsAppChat = (
    <div className={`wa-chat ${embedded ? 'wa-chat--embedded' : 'wa-chat--floating'}`}>
      {/* WhatsApp Header */}
      <header className="wa-header">
        <div className="wa-header__left">
          <button
            type="button"
            className="wa-header__back"
            onClick={handleBack}
            aria-label="Back to store"
            title="Back"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="wa-header__avatar-box">
            <img src={APP_LOGO} alt="Good Day Coffee" className="wa-header__avatar" />
            <span className="wa-header__online-indicator" />
          </div>
          <div className="wa-header__titles">
            <h2 className="wa-header__title">Good Day AI Barista</h2>
            <p className="wa-header__status">
              {busy ? (
                <span className="wa-typing-badge">typing...</span>
              ) : (
                'online'
              )}
            </p>
          </div>
        </div>

        <div className="wa-header__actions">
          <button
            type="button"
            className="wa-header__btn"
            onClick={resetChat}
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw size={18} />
          </button>
          {!embedded && (
            <button
              type="button"
              className="wa-header__btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      {/* WhatsApp Message Body */}
      <div className="wa-body">
        <div className="wa-body__date-badge">
          <span>TODAY</span>
        </div>

        <div className="wa-body__encryption-note">
          <Lock size={12} className="wa-lock-icon" />
          <span>Messages are generated by Good Day AI with live real-time menu items. Tap + to order directly.</span>
        </div>

        {addedItem && (
          <div className="wa-toast">
            ✓ Added <strong>{addedItem}</strong> to order!
          </div>
        )}

        <div className="wa-messages" aria-live="polite">
          {messages.map((item, index) => {
            const isUser = item.role === 'user';
            return (
              <div
                key={`${item.role}-${index}`}
                className={`wa-msg-row ${isUser ? 'wa-msg-row--sent' : 'wa-msg-row--received'}`}
              >
                <div className={`wa-bubble ${isUser ? 'wa-bubble--sent' : 'wa-bubble--received'}`}>
                  <div className="wa-bubble__text">{item.content}</div>

                  {item.recommendations?.length > 0 && (
                    <div className="wa-rec-list">
                      {item.recommendations.map(product => (
                        <div key={product.id} className="wa-rec-card">
                          <img
                            src={getOptimizedImageUrl(product)}
                            alt={product.name}
                            className="wa-rec-card__img"
                            loading="lazy"
                            onError={event => {
                              if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                                event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                              }
                            }}
                          />
                          <div className="wa-rec-card__details">
                            <span className="wa-rec-card__name">{product.name}</span>
                            <span className="wa-rec-card__price">₹{product.price}</span>
                          </div>
                          <button
                            type="button"
                            className="wa-rec-card__btn"
                            onClick={() => addRecommendation(product)}
                            title="Add to order"
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="wa-bubble__footer">
                    <span className="wa-bubble__time">{item.time || getCurrentTime()}</span>
                    {isUser && <CheckCheck size={16} className="wa-checks" />}
                  </div>
                </div>
              </div>
            );
          })}

          {busy && (
            <div className="wa-msg-row wa-msg-row--received">
              <div className="wa-bubble wa-bubble--received wa-bubble--typing">
                <span className="wa-typing-dots">
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

      {/* WhatsApp Quick Chips */}
      <div className="wa-chips-row">
        {quickQuestions.map(([icon, label]) => (
          <button
            type="button"
            key={label}
            className="wa-chip"
            onClick={() => ask(label)}
            disabled={busy}
          >
            <span className="wa-chip__icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* WhatsApp Input Bar */}
      <form
        className="wa-input-bar"
        onSubmit={event => {
          event.preventDefault();
          ask();
        }}
      >
        <div className="wa-input-container">
          <input
            ref={inputRef}
            value={message}
            maxLength={500}
            onChange={event => setMessage(event.target.value)}
            placeholder="Type a message..."
            aria-label="Type a message"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !message.trim()}
          className="wa-send-btn"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );

  // When embedded on the AI Assistant page
  if (embedded) {
    return (
      <main className="wa-page-wrapper">
        {whatsAppChat}
      </main>
    );
  }

  // Floating trigger on other pages
  return (
    <div className="ai-widget">
      <button
        type="button"
        className={`ai-widget__trigger ${isOpen ? 'is-active' : ''}`}
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
        <span className="ai-widget__trigger-gold-circle">
          <img src={APP_LOGO} alt="Good Day Coffee" className="ai-widget__trigger-logo" />
        </span>
        <span className="ai-widget__trigger-text">
          <strong className="ai-widget__trigger-title">Good Day AI</strong>
          <small className="ai-widget__trigger-subtitle">ASK BARISTA</small>
        </span>
        <span className="ai-widget__trigger-sparkle-wrap">
          <Sparkles size={14} className="ai-widget__trigger-sparkle" />
        </span>
      </button>

      {isOpen && (
        <div className="ai-widget__modal-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
      {isOpen && (
        <div className="ai-widget__modal-container">
          {whatsAppChat}
        </div>
      )}
    </div>
  );
}
