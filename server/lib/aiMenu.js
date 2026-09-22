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

export async function getCurrentMenu(clientMenu = []) {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map(normalizeProduct).filter(product => product.id && product.name && Number.isFinite(product.price));
    }
  } catch (error) {
    console.warn('AI menu lookup fell back to the browser menu:', error.message);
  }

  return Array.isArray(clientMenu)
    ? clientMenu.map(normalizeProduct).filter(product => product.id && product.name && Number.isFinite(product.price))
    : [];
}

export function publicAvailableMenu(menu) {
  return menu.filter(product => product.available).map(product => {
    const { available: _available, ...publicProduct } = product;
    return publicProduct;
  });
}