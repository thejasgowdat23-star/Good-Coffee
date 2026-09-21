import React, { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import useMenu from '../hooks/useMenu';
import CustomerSupport from '../components/CustomerSupport';
import CustomerFooter from '../components/CustomerFooter';

export default function MenuPage({ category }) {
  const { items, loading } = useMenu(category);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filteredItems = useMemo(() => items.filter(item => {
    const text = `${item.name} ${item.category} ${item.temp || ''} ${item.badge || ''}`.toLowerCase();
    const matchesFilter = filter === 'All' || (filter === 'Hot' && !text.includes('cold') && !text.includes('iced')) || (filter === 'Cold' && (text.includes('cold') || text.includes('iced'))) || (filter === 'Bakery' && (text.includes('snack') || text.includes('dessert') || category === 'snacks'));
    return matchesFilter && item.name.toLowerCase().includes(query.toLowerCase());
  }), [category, filter, items, query]);

  return (
    <>
    <main className="menu-page page-shell">
      <header className="page-heading">
        <p className="eyebrow">Good Day Coffee</p>
        <h1>{category === 'coffee' ? 'Coffee, made well.' : 'Something warm to share.'}</h1>
        <p>{category === 'coffee' ? 'Single-origin espresso, quiet precision, and cups made for the day ahead.' : 'Fresh bakes and savory bites made to pair with your cup.'}</p>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${category}...`} aria-label={`Search ${category}`} />
        <div className="category-chips" aria-label="Filter menu">
          {['All', 'Hot', 'Cold', 'Bakery'].map(option => <button key={option} type="button" className={`category-chip ${filter === option ? 'is-active' : ''}`} onClick={() => setFilter(option)}>{option}</button>)}
        </div>
      </header>
      {!loading && filteredItems.length === 0 && <p className="status-message">Nothing matches today. Please check back soon.</p>}
      <div className="product-grid">
        {loading ? Array.from({ length: 4 }, (_, index) => <div className="skeleton-card" key={index} aria-hidden="true" />) : filteredItems.map((product, index) => <Reveal key={product.id} delay={index * 60}><ProductCard product={product} /></Reveal>)}
      </div>
    </main>
    <CustomerSupport />
    <CustomerFooter />
    </>
  );
}
