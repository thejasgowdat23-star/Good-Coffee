import { supabase } from './supabase.js';

function normalizeProduct(product) {
  const price = Number(product.finalPrice ?? product.price);
  const available = product.available !== undefined ? product.available !== false : product.inStock !== false;
  return {
    id: String(product.id || product.productId || product._id || ''),
    name: String(product.name || '').trim(),
    category: String(product.menuCategory || product.category || '').trim(),
    description: String(product.description || '').trim(),
    price,
    available
  };
}

let cachedMenu = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function getCurrentMenu(clientMenu = []) {
  // If client provided a valid menu array, use it directly for instant response
  if (Array.isArray(clientMenu) && clientMenu.length > 0) {
    const normalized = clientMenu.map(normalizeProduct).filter(product => product.id && product.name && Number.isFinite(product.price));
    if (normalized.length > 0) return normalized;
  }

  // Check in-memory cache
  const now = Date.now();
  if (cachedMenu && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedMenu;
  }

  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      cachedMenu = data.map(normalizeProduct).filter(product => product.id && product.name && Number.isFinite(product.price));
      lastCacheTime = now;
      return cachedMenu;
    }
  } catch (error) {
    console.warn('AI menu lookup fell back to cached/browser menu:', error.message);
  }

  return cachedMenu || [];
}

export function publicAvailableMenu(menu) {
  return menu.filter(product => product.available).map(product => {
    const { available: _available, ...publicProduct } = product;
    return publicProduct;
  });
}