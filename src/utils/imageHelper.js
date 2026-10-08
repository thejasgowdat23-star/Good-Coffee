const IMAGE_MAP = {
  'signature_latte': '/images/3d/signature_latte.webp',
  'espresso': '/images/3d/espresso.webp',
  'hero_coffee': '/images/3d/hero_coffee.webp',
  'crema_macro': '/images/3d/crema_macro.webp',
  'iced_mocha': '/images/3d/iced_mocha.webp',
  'croissant': '/images/3d/croissant.webp',
  'muffin': '/images/3d/muffin.webp',
  'sandwich': '/images/3d/sandwich.webp',
  'garlic_bread': '/images/3d/garlic_bread.webp',
  'garlic-bread': '/images/3d/garlic_bread.webp',
  'cookies': '/images/3d/cookies.webp',
  'brownie': '/images/3d/brownie.webp',
  'puff': '/images/3d/puff.webp',
  'samosa': '/images/3d/samosa.webp',
  'slider': '/images/3d/slider.webp',
  'fries': '/images/3d/fries.webp',
  'panini': '/images/3d/panini.webp',
  // Coffee
  'coffee-filter': '/images/3d/filter_coffee.webp',
  'coffee-espresso': '/images/3d/espresso.webp',
  'coffee-americano': '/images/3d/crema_macro.webp',
  'coffee-cappuccino': '/images/3d/hero_coffee.webp',
  'coffee-latte': '/images/3d/cafe_latte.webp',
  'coffee-flat-white': '/images/3d/flat_white.webp',
  'coffee-mocha': '/images/3d/iced_mocha.webp',
  'coffee-caramel-macchiato': '/images/3d/caramel_macchiato.webp',
  'coffee-latte-sig': '/images/3d/signature_latte.webp',
  'coffee-cold-brew': '/images/3d/cold_brew.webp',

  // Bakery & Desserts
  'bakery-croissant': '/images/3d/croissant.webp',
  'bakery-pain-au-chocolat': '/images/3d/pain_au_chocolat.webp',
  'bakery-brownie': '/images/3d/brownie.webp',
  'bakery-muffin': '/images/3d/muffin.webp',
  'bakery-cinnamon-roll': '/images/3d/cinnamon_roll.webp',
  'bakery-banana-cake': '/images/3d/banana_cake.webp',
  'bakery-cheesecake': '/images/3d/cheesecake.webp',
  'bakery-red-velvet': '/images/3d/red_velvet.webp',
  'bakery-biscotti': '/images/3d/biscotti.webp',

  // Hot & Savory Snacks
  'snack-veg-curry-puff': '/images/3d/curry_puff.webp',
  'snack-paneer-tikka-puff': '/images/3d/paneer_puff.webp',
  'snack-chicken-keema-puff': '/images/3d/keema_puff.webp',
  'snack-cheese-chilli-toast': '/images/3d/garlic_bread.webp',
  'snack-bombay-masala-sandwich': '/images/3d/sandwich.webp',
  'snack-paneer-makhani-sliders': '/images/3d/slider.webp',
  'snack-peri-peri-fries': '/images/3d/fries.webp',
  'snack-cocktail-samosas': '/images/3d/samosa.webp',
  'snack-chicken-tikka-panini': '/images/3d/panini.webp',

  // Combos
  'combo-good-day-breakfast': '/images/3d/breakfast_combo.webp'
};

export const DEFAULT_FALLBACK_IMAGE = '/images/3d/hero_coffee.webp';

export function getOptimizedImageUrl(productOrUrl) {
  if (!productOrUrl) return DEFAULT_FALLBACK_IMAGE;

  // If a product object was passed
  if (typeof productOrUrl === 'object') {
    const id = String(productOrUrl.id || '');
    if (id && IMAGE_MAP[id]) {
      return IMAGE_MAP[id];
    }
    return getOptimizedImageUrl(productOrUrl.image);
  }

  const src = String(productOrUrl).trim();
  if (!src) return DEFAULT_FALLBACK_IMAGE;

  // If already pointing to /images/3d/ with .webp
  if (src.startsWith('/images/3d/') && src.endsWith('.webp')) {
    return src;
  }

  // Check matching key from map (case-insensitive substring match)
  const lowerSrc = src.toLowerCase();
  for (const [key, webpPath] of Object.entries(IMAGE_MAP)) {
    if (lowerSrc.includes(key.toLowerCase())) {
      return webpPath;
    }
  }

  // If it's a local /images/ path with jpg/png, map to /images/3d/*.webp
  if (src.startsWith('/images/')) {
    const filename = src.split('/').pop().replace(/\.(jpe?g|png)$/i, '.webp');
    return `/images/3d/${filename}`;
  }

  return src;
}
