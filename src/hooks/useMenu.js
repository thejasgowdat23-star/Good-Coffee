import { useEffect, useMemo } from 'react';
import { useShop } from '../context/ShopContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const matchesCategory = (product, category) => {
  if (!category || category === 'all') return true;
  const target = String(category).toLowerCase();
  const prodMenuCat = String(product.menuCategory || '').toLowerCase();
  const prodCat = String(product.category || '').toLowerCase();

  if (target === 'coffee') {
    return prodMenuCat === 'coffee' || prodCat === 'coffee' || prodCat === 'cold drinks';
  }
  if (target === 'snacks') {
    return prodMenuCat === 'snacks' || prodCat === 'snacks' || prodCat === 'bakery' || prodCat === 'desserts';
  }
  if (target === 'combos') {
    return prodCat === 'combos' || Boolean(product.isCombo);
  }
  return prodMenuCat === target || prodCat === target;
};

export default function useMenu(category) {
  const { products } = useShop();
  const items = useMemo(() => products.filter(product => matchesCategory(product, category)), [category, products]);
  const loading = false;

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
