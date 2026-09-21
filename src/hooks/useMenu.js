import { useEffect, useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const matchesCategory = (product, category) => (product.menuCategory || (product.category === 'Coffee' || product.category === 'Cold Drinks' ? 'coffee' : product.category === 'Combos' ? 'combos' : 'snacks')) === category;

export default function useMenu(category) {
  const { products } = useShop();
  const fallback = useMemo(() => products.filter(product => matchesCategory(product, category)), [category, products]);
  const [remoteItems, setRemoteItems] = useState(null);
  const items = remoteItems || fallback;
  const [loading, setLoading] = useState(Boolean(API_BASE));

  useEffect(() => {
    let active = true;
    if (!API_BASE) {
      return () => { active = false; };
    }

    fetch(`${API_BASE}/api/products?category=${encodeURIComponent(category)}`)
      .then(response => {
        if (!response.ok) throw new Error('Menu unavailable');
        return response.json();
      })
      .then(payload => {
        if (!active) return;
        const remoteItems = Array.isArray(payload) ? payload : payload.products;
        setRemoteItems(Array.isArray(remoteItems) ? remoteItems : null);
      })
      .catch(() => {
        if (active) setRemoteItems(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [category]);

  return { items, loading };
}
