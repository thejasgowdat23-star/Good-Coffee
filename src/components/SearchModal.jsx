import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, Plus } from 'lucide-react';
import PriceTag from './PriceTag';

export const SearchModal = ({ isOpen, onClose }) => {
  const { products, addToCart } = useShop();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = products.filter(item => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tastingNotes && item.tastingNotes.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="search-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '100px 20px 20px'
      }}
      onClick={onClose}
    >
      <div
        className="search-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '75vh',
          backgroundColor: '#140f0c',
          borderRadius: '24px',
          border: '1px solid rgba(229, 168, 92, 0.35)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.9), 0 0 35px rgba(229, 168, 92, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Search size={20} className="text-gold" />
          <input
            type="text"
            autoFocus
            placeholder="Search coffees, croissants, tasting notes..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '17px',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cream)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
              No matches found for “{query}”.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      backgroundImage: `url('${item.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: '#fff' }}>
                      {item.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--color-gold-bright)', fontWeight: 600 }}>
                      <PriceTag value={item.finalPrice ?? item.price} /> • {item.category}
                    </span>
                  </div>
                </div>

                {item.inStock ? (
                  <button
                    onClick={() => {
                      addToCart(item);
                      onClose();
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '12px' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#f87171' }}>Unavailable</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
