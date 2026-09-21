import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import CustomerSupport from './CustomerSupport';
import CustomerFooter from './CustomerFooter';
import support from '../config/support';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const chips = ['Something sweet', 'Strong coffee', 'Best sellers', 'Track my order', 'Opening hours'];

function localReply(message, products) {
  const text = message.toLowerCase();
  if (text.includes('track') || text.includes('order')) return `I can help with order tracking once the shop server is connected. Please share your order number or call ${support.phone}.`;
  if (text.includes('hour') || text.includes('open')) return 'We are open daily from 7:00 AM to 9:00 PM at 12 Roast House Lane, Bengaluru.';
  const available = products.filter(product => product.inStock !== false);
  const match = text.includes('strong') ? available.find(product => product.id === 'coffee-espresso') : text.includes('sweet') ? available.find(product => product.id === 'snack-brownie') : available[0];
  return match ? `I recommend ${match.name} at ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(match.finalPrice ?? match.price)}. It is available today.` : `I could not find an available match today. Please call ${support.phone}.`;
}

export default function AiAssistant() {
  const { products } = useShop();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi, I am Good Day AI. What kind of coffee or snack sounds right today?' }]);
  const [busy, setBusy] = useState(false);

  async function ask(value = message) {
    const content = value.trim().slice(0, 500);
    if (!content || busy) return;
    setMessage('');
    setMessages(previous => [...previous.slice(-9), { role: 'user', content }]);
    setBusy(true);
    try {
      if (!API_BASE) throw new Error('Local fallback');
      const response = await fetch(`${API_BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: content, history: messages.slice(-10) }) });
      if (!response.ok) throw new Error('Chat unavailable');
      const result = await response.json();
      setMessages(previous => [...previous, { role: 'assistant', content: result.message || result.reply }]);
    } catch {
      setMessages(previous => [...previous, { role: 'assistant', content: localReply(content, products) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="ai-page page-shell">
      <div className="ai-page__header">
        <span className="ai-icon"><Bot size={24} /></span>
        <p className="eyebrow">Good Day AI</p>
        <h1>A better cup starts with a good question.</h1>
        <p>Recommendations use today&apos;s menu. We never invent an item or price.</p>
      </div>
      <div className="chat-panel">
        <div className="chat-messages" aria-live="polite">
          {messages.map((item, index) => <p key={`${item.role}-${index}`} className={`chat-message chat-message--${item.role}`}>{item.content}</p>)}
          {busy && <p className="chat-message chat-message--assistant">Let me check today&apos;s menu...</p>}
        </div>
        <div className="chat-chips">{chips.map(chip => <button type="button" key={chip} onClick={() => ask(chip)}>{chip}</button>)}</div>
        <form className="chat-form" onSubmit={event => { event.preventDefault(); ask(); }}>
          <input value={message} maxLength={500} onChange={event => setMessage(event.target.value)} placeholder="Ask about coffee, snacks, hours, or an order..." aria-label="Message Good Day AI" />
          <button className="icon-button" type="submit" disabled={busy} aria-label="Send message"><Send size={18} /></button>
        </form>
      </div>
      <div className="ai-recommendations">{products.filter(product => product.inStock !== false).slice(0, 3).map(product => <ProductCard key={product.id} product={product} />)}</div>
      <CustomerSupport />
      <CustomerFooter />
    </main>
  );
}
