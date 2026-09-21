import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import SteamCanvas from './SteamCanvas';
import { Sparkles, Send, Bot, Check, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';

export const AiAssistant = () => {
  const { products, addToCart } = useShop();
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [recommendation, setRecommendation] = useState({
    title: 'Dark Chocolate Iced Mocha',
    productId: 'coffee-mocha',
    headline: 'Sweet • Cold • Chocolatey',
    explanation:
      'Because you appreciate layered sweetness with a crisp temperature drop, our Iced Mocha pairs chilled double espresso with artisan Dutch cocoa syrup and crystal ice.',
    flavorNotes: ['Belgian Fudge', 'Chilled Arabica', 'Whipped Micro-cream'],
    confidence: '98% Taste Match'
  });

  const presetQueries = [
    'I want something sweet and cold',
    'Intense wake-up kick without sugar',
    'Creamy warm latte for a rainy day',
    'Refreshing low-calorie cold brew'
  ];

  const handleAskAi = (queryText) => {
    const query = (queryText || inputQuery).trim();
    if (!query) return;

    setIsThinking(true);

    setTimeout(() => {
      const lower = query.toLowerCase();

      let targetProduct;
      let headline = '';
      let explanation = '';
      let notes = [];

      if (lower.includes('sweet') && (lower.includes('cold') || lower.includes('ice'))) {
        targetProduct = products.find(p => p.id === 'coffee-mocha');
        headline = 'Sweet • Cold • Chocolatey';
        explanation =
          'Our handcrafted Iced Mocha balances Dutch chocolate syrup with chilled single-origin espresso and whole milk over cracked ice.';
        notes = ['Rich Cocoa', 'Cold Espresso', 'Sweet Cream'];
      } else if (lower.includes('intense') || lower.includes('strong') || lower.includes('kick') || lower.includes('sugar free') || lower.includes('espresso')) {
        targetProduct = products.find(p => p.id === 'coffee-espresso');
        headline = 'Bold • Unfiltered • Pure Crema';
        explanation =
          'Artisan Double Espresso delivers an intense rush of roasted notes, dense tiger-stripe crema, and zero added sugars.';
        notes = ['Dark Cacao', 'Smoky Cedar', '100% Arabica'];
      } else if (lower.includes('warm') || lower.includes('creamy') || lower.includes('latte') || lower.includes('rain')) {
        targetProduct = products.find(p => p.id === 'coffee-latte-sig');
        headline = 'Velvety • Caramel Notes • Microfoam';
        explanation =
          'The Good Day Signature Latte is gently textured at 68°C with swan latte art and toasted hazelnut nuances.';
        notes = ['Caramel Crema', 'Steamed Whole Milk', 'Swan Art'];
      } else if (lower.includes('cold brew') || lower.includes('refresh') || lower.includes('light') || lower.includes('low')) {
        targetProduct = products.find(p => p.id === 'coffee-cold-brew');
        headline = 'Crisp • Smooth • Zero Bitterness';
        explanation =
          'Steeped for 18 continuous hours in mineral cold water to remove astringency and reveal delicate blueberry tasting notes.';
        notes = ['18-Hour Slow Steep', 'Blueberry Undertone', '15 kcal'];
      } else {
        targetProduct = products.find(p => p.id === 'coffee-cappuccino');
        headline = 'Balanced • Airy Microfoam • Madagascan Cocoa';
        explanation =
          'The Velvet Cloud Cappuccino offers the quintessential golden-ratio espresso experience with fluffy steamed foam.';
        notes = ['Dust of Cocoa', 'Toasted Almond', 'Harmonious Body'];
      }

      setRecommendation({
        title: targetProduct ? targetProduct.name : 'Good Day Signature Latte',
        productId: targetProduct ? targetProduct.id : 'coffee-latte-sig',
        headline: headline,
        explanation: explanation,
        flavorNotes: notes,
        confidence: `${94 + Math.floor(Math.random() * 5)}% Taste Match`
      });

      setIsThinking(false);
    }, 600);
  };

  const currentRecommendedProduct = products.find(
    p => p.id === recommendation.productId
  );

  return (
    <section
      id="ai-assistant"
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#0a0806',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(229, 168, 92, 0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(201, 130, 63, 0.08) 0%, transparent 50%)'
        }}
      />
      <SteamCanvas mode="dust" density={0.6} />

      <div
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Header Badges */}
        <div className="badge-gold" style={{ marginBottom: '16px' }}>
          <Sparkles size={14} /> INTELLIGENT FLAVOR SOMMELIER
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.05,
            marginBottom: '14px'
          }}
        >
          Good Day <span className="text-gold-gradient">AI Barista</span>
        </h2>

        <p
          style={{
            color: 'var(--color-beige)',
            fontSize: 'clamp(16px, 1.6vw, 20px)',
            maxWidth: '650px',
            lineHeight: 1.5,
            marginBottom: '36px'
          }}
        >
          “Not sure what to order? Let Good Day AI find your perfect coffee based on mood, temperature, and flavor cravings.”
        </p>

        {/* Preset Quick Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '28px',
            maxWidth: '850px'
          }}
        >
          {presetQueries.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(preset);
                handleAskAi(preset);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(229, 168, 92, 0.25)',
                color: 'var(--color-cream)',
                padding: '8px 18px',
                borderRadius: '999px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(229, 168, 92, 0.18)';
                e.currentTarget.style.borderColor = 'var(--color-gold)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(229, 168, 92, 0.25)';
              }}
            >
              “{preset}”
            </button>
          ))}
        </div>

        {/* Interactive Chat Prompt Input */}
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            position: 'relative',
            marginBottom: '48px'
          }}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAskAi()}
            placeholder="Type: 'I want something sweet and cold' or 'strong morning boost'..."
            style={{
              width: '100%',
              padding: '20px 70px 20px 28px',
              borderRadius: '999px',
              background: 'rgba(22, 16, 12, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(229, 168, 92, 0.4)',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(229, 168, 92, 0.15)'
            }}
          />

          <button
            onClick={() => handleAskAi()}
            disabled={isThinking}
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              bottom: '8px',
              width: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f6c888, #e5a85c)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#120e0b',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            {isThinking ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* AI Recommendation Result Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            background: 'rgba(20, 15, 11, 0.75)',
            backdropFilter: 'blur(25px)',
            borderRadius: '28px',
            border: '1px solid rgba(229, 168, 92, 0.35)',
            padding: '36px 40px',
            textAlign: 'left',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(229, 168, 92, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(229, 168, 92, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold-bright)'
                }}
              >
                <Bot size={18} />
              </div>
              <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold-bright)', fontWeight: 700 }}>
                Barista Recommendation
              </span>
            </div>

            <span
              style={{
                fontSize: '12px',
                color: '#86efac',
                fontWeight: 600,
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(34, 197, 94, 0.25)'
              }}
            >
              {recommendation.confidence}
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '4px'
              }}
            >
              I recommend:
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(26px, 3.2vw, 40px)',
                fontWeight: 900,
                color: '#fff',
                marginBottom: '8px'
              }}
            >
              {recommendation.title}
            </h3>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--color-gold-bright)',
                letterSpacing: '0.05em',
                marginBottom: '12px'
              }}
            >
              {recommendation.headline}
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-beige)',
                lineHeight: 1.6
              }}
            >
              {recommendation.explanation}
            </p>
          </div>

          {/* Flavor Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {recommendation.flavorNotes.map((note, i) => (
              <span
                key={i}
                style={{
                  fontSize: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(229, 168, 92, 0.2)',
                  color: 'var(--color-cream)',
                  padding: '5px 12px',
                  borderRadius: '999px'
                }}
              >
                • {note}
              </span>
            ))}
          </div>

          {/* Action Button */}
          {currentRecommendedProduct && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: 'var(--color-gold-bright)'
                  }}
                >
                  ₹{currentRecommendedProduct.price}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  Freshly Prepared
                </span>
              </div>

              <button
                onClick={() => addToCart(currentRecommendedProduct)}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                <ShoppingBag size={16} /> Order {currentRecommendedProduct.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AiAssistant;
