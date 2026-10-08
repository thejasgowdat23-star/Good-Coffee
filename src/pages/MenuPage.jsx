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
  const isCoffee = category === 'coffee';
  const availableChips = isCoffee
    ? ['All', 'Hot', 'Cold', 'Veg', 'Vegan']
    : ['All', 'Bakery', 'Desserts', 'Snacks', 'Veg', 'Non-Veg'];

  const filteredItems = useMemo(() => items.filter(item => {
    const text = `${item.name} ${item.category} ${item.temp || ''} ${item.badge || ''} ${item.tag || ''} ${item.dietary || ''}`.toLowerCase();
    const tag = (item.tag || item.dietary || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    let matchesFilter = true;
    if (filter === 'All') {
      matchesFilter = true;
    } else if (filter === 'Hot') {
      matchesFilter = !text.includes('cold') && !text.includes('iced');
    } else if (filter === 'Cold') {
      matchesFilter = text.includes('cold') || text.includes('iced');
    } else if (filter === 'Bakery') {
      matchesFilter = cat === 'bakery' || text.includes('croissant') || text.includes('muffin') || text.includes('cake') || text.includes('roll') || text.includes('biscotti');
    } else if (filter === 'Desserts') {
      matchesFilter = cat === 'desserts' || text.includes('cheesecake') || text.includes('cupcake') || text.includes('brownie');
    } else if (filter === 'Snacks') {
      matchesFilter = cat === 'snacks' || text.includes('puff') || text.includes('toast') || text.includes('sandwich') || text.includes('sliders') || text.includes('fries') || text.includes('samosa') || text.includes('panini');
    } else if (filter === 'Veg') {
      matchesFilter = tag === 'veg';
    } else if (filter === 'Non-Veg') {
      matchesFilter = tag === 'non-veg';
    } else if (filter === 'Vegan') {
      matchesFilter = tag === 'vegan';
    }

    return matchesFilter && item.name.toLowerCase().includes(query.toLowerCase());
  }), [filter, items, query]);

  return (
    <>
    <main className="menu-page page-shell">
      <header className="page-heading">
        <p className="eyebrow">Good Day Coffee</p>
        <h1>{isCoffee ? 'Coffee, made well.' : 'Something warm to share.'}</h1>
        <p>{isCoffee ? 'Single-origin espresso, quiet precision, and cups made for the day ahead.' : 'Fresh bakes, desserts, and savory bites made to pair with your cup.'}</p>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${category}...`} aria-label={`Search ${category}`} />
        <div className="category-chips" aria-label="Filter menu">
          {availableChips.map(option => <button key={option} type="button" className={`category-chip ${filter === option ? 'is-active' : ''}`} onClick={() => setFilter(option)}>{option}</button>)}
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
