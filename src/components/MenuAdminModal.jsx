import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Settings2, Check, RefreshCw, AlertCircle, Edit2, Save } from 'lucide-react';
import AdminOrdersPanel from './AdminOrdersPanel';

export const MenuAdminModal = () => {
  const {
    products,
    updateProduct,
    resetMenuToDefault,
    isAdminOpen,
    setIsAdminOpen
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [statusMsg, setStatusMsg] = useState('');

  if (!isAdminOpen) return null;

  const categories = ['All', 'Coffee', 'Snacks', 'Cold Drinks', 'Desserts'];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price,
      discountPercent: product.discountPercent || 0,
      description: product.description,
      category: product.category,
      inStock: product.inStock
    });
  };

  const saveEdit = (id) => {
    updateProduct(id, {
      name: editFormData.name,
      price: Number(editFormData.price),
      discountPercent: Math.max(0, Math.min(90, Number(editFormData.discountPercent) || 0)),
      description: editFormData.description,
      category: editFormData.category,
      inStock: editFormData.inStock
    });
    setEditingId(null);
    showNotice('Product updated successfully and synced in real-time!');
  };

  const toggleStock = (product) => {
    const updated = !product.inStock;
    updateProduct(product.id, { inStock: updated });
    showNotice(
      `${product.name} is now marked as ${updated ? 'Available' : 'Currently Unavailable'}.`
    );
  };

  const showNotice = (msg) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  return (
    <div
      className="admin-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        padding: '24px'
      }}
      onClick={() => setIsAdminOpen(false)}
    >
      <div
        className="admin-panel"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          backgroundColor: '#140f0c',
          borderRadius: '28px',
          border: '1px solid rgba(229, 168, 92, 0.4)',
          boxShadow: '0 30px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(229, 168, 92, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(20, 15, 12, 0.9)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(229, 168, 92, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold-bright)'
              }}
            >
              <Settings2 size={18} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff' }}>
                Live Shop Menu Management
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--color-beige)' }}>
                Real-time stock availability, pricing & catalog sync
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AdminOrdersPanel />
            <button
              onClick={() => {
                if (window.confirm('Reset all items to default roastery menu?')) {
                  resetMenuToDefault();
                  showNotice('Menu reset to defaults.');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-beige)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} /> Reset Defaults
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-cream)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Notification Bar */}
        {statusMsg && (
          <div
            style={{
              background: 'rgba(229, 168, 92, 0.2)',
              borderBottom: '1px solid rgba(229, 168, 92, 0.3)',
              color: 'var(--color-gold-bright)',
              padding: '10px 32px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Check size={16} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Category Selector Filter */}
        <div
          style={{
            padding: '14px 32px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: selectedCategory === cat ? '1px solid var(--color-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: selectedCategory === cat ? 'rgba(229, 168, 92, 0.2)' : 'transparent',
                color: selectedCategory === cat ? 'var(--color-gold-bright)' : 'var(--color-beige)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Table / Cards */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {filteredProducts.map(product => {
            const isEditing = editingId === product.id;

            return (
              <div
                key={product.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: product.inStock ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundImage: `url('${product.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
                  }}
                />

                {/* Details / Inline Edit */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid var(--color-gold)',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="number"
                          value={editFormData.price}
                          onChange={e => setEditFormData({ ...editFormData, price: e.target.value })}
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid var(--color-gold)',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '90px'
                          }}
                        />
                        <select
                          value={editFormData.category}
                          onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid var(--color-gold)',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        >
                          <option value="Coffee">Coffee</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Cold Drinks">Cold Drinks</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Combos">Combos</option>
                        </select>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-beige)', fontSize: '12px' }}>
                        Discount %
                        <input
                          type="number"
                          min="0"
                          max="90"
                          value={editFormData.discountPercent}
                          onChange={e => setEditFormData({ ...editFormData, discountPercent: e.target.value })}
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid var(--color-gold)',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '14px',
                            width: '76px'
                          }}
                        />
                        <span>Final: ₹{Math.round(Number(editFormData.price || 0) * (1 - Math.max(0, Math.min(90, Number(editFormData.discountPercent) || 0)) / 100))}</span>
                      </label>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: '#fff' }}>
                          {product.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--color-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                          {product.category}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '420px',
                          marginTop: '2px'
                        }}
                      >
                        {product.description}
                      </p>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-gold-bright)', marginTop: '4px' }}>
                        ₹{product.price}
                      </div>
                    </div>
                  )}
                </div>

                {/* Real-Time Availability Switch */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => toggleStock(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      border: 'none',
                      background: product.inStock
                        ? 'rgba(34, 197, 94, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                      color: product.inStock ? '#86efac' : '#fca5a5',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'transform 0.16s ease, opacity 0.16s ease'
                    }}
                  >
                    {product.inStock ? (
                      <>
                        <Check size={14} /> In Stock
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} /> Currently Unavailable
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(product.id)}
                      style={{
                        background: 'linear-gradient(135deg, #f6c888, #e5a85c)',
                        color: '#120e0b',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Save size={14} /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(product)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--color-cream)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MenuAdminModal;
