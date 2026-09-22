import React, { useState } from 'react';
import { Bot, Coffee, Plus, Send, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const quickQuestions = [
  ['☕', 'Recommend a coffee'],
  ['🍪', 'Show snacks'],
  ['₹', 'Under ₹150'],
  ['🧊', 'Cold coffee'],
  ['🍫', 'Something sweet']
];

export default function AiAssistant({ embedded = false }) {
  const { products, addToCart } = useShop();
  const [isOpen, setIsOpen] = useState(embedded);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi, I am Good Day AI. What kind of coffee or snack sounds right today?', recommendations: [] }]);
  const [busy, setBusy] = useState(false);

  async function ask(value = message) {
    const content = value.trim().slice(0, 500);
    if (!content || busy) return;
    setMessage('');
    const history = messages.slice(-8).map(item => ({ role: item.role, content: item.content }));
    setMessages(previous => [...previous.slice(-9), { role: 'user', content }]);
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, menu: products })
      });
      if (!response.ok) throw new Error('AI unavailable');
      const result = await response.json();
      setMessages(previous => [...previous, { role: 'assistant', content: result.reply, recommendations: result.recommendations || [] }]);
    } catch {
      setMessages(previous => [...previous, { role: 'assistant', content: 'Sorry, Good Day AI is unavailable right now. Please try again.', recommendations: [] }]);
    } finally {
      setBusy(false);
    }
  }

  const addRecommendation = product => {
    const localProduct = products.find(item => item.id === product.id);
    if (localProduct && localProduct.inStock !== false && localProduct.available !== false) addToCart(localProduct);
  };

  const chatWindow = <section className={`ai-widget__panel${embedded ? ' ai-widget__panel--embedded' : ''}`} aria-label="Good Day AI chat">
    <header className="ai-widget__header">
      <div className="ai-widget__identity"><span className="ai-widget__avatar"><Coffee size={18} /></span><div><strong>GOOD DAY AI</strong><small>Your coffee companion</small></div></div>
      {!embedded && <button type="button" className="ai-widget__close" onClick={() => setIsOpen(false)} aria-label="Close Good Day AI"><X size={18} /></button>}
    </header>
    <div className="ai-widget__messages" aria-live="polite">
      {messages.map((item, index) => <div key={`${item.role}-${index}`} className={`ai-widget__message ai-widget__message--${item.role}`}><p>{item.content}</p>{item.recommendations?.length > 0 && <div className="ai-widget__recommendations">{item.recommendations.map(product => <button type="button" key={product.id} onClick={() => addRecommendation(product)}><span><strong>{product.name}</strong><small>₹{product.price}</small></span><Plus size={15} /></button>)}</div>}</div>)}
      {busy && <div className="ai-widget__message ai-widget__message--assistant"><p>Good Day AI is thinking<span className="ai-widget__typing" aria-label="Thinking"><i /><i /><i /></span></p></div>}
    </div>
    <div className="ai-widget__quick-actions">{quickQuestions.map(([icon, label]) => <button type="button" key={label} onClick={() => ask(label)} disabled={busy}>{icon} {label}</button>)}</div>
    <form className="ai-widget__form" onSubmit={event => { event.preventDefault(); ask(); }}><input value={message} maxLength={500} onChange={event => setMessage(event.target.value)} placeholder="Ask Good Day AI..." aria-label="Ask Good Day AI" /><button type="submit" disabled={busy || !message.trim()} aria-label="Send message"><Send size={17} /></button></form>
  </section>;

  if (embedded) return <main className="ai-page page-shell"><div className="ai-page__header"><span className="ai-icon"><Bot size={24} /></span><p className="eyebrow">Good Day AI</p><h1>A better cup starts with a good question.</h1><p>Recommendations use today&apos;s menu and current availability.</p></div>{chatWindow}</main>;

  return <div className="ai-widget"><button type="button" className="ai-widget__trigger" onClick={() => setIsOpen(open => !open)} aria-expanded={isOpen} aria-label="Open Good Day AI"><Coffee size={18} /> <span>Good Day AI</span></button>{isOpen && chatWindow}</div>;
}
