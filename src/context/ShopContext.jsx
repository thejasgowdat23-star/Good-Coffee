import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '../utils/imageHelper';

const ShopContext = createContext();

const normalizeProduct = product => {
  const discountPercent = Number.isFinite(Number(product.discountPercent))
    ? Math.max(0, Math.min(90, Number(product.discountPercent)))
    : product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;
  return {
    ...product,
    image: getOptimizedImageUrl(product),
    discountPercent,
    finalPrice: Math.round(Number(product.price || 0) * (1 - discountPercent / 100))
  };
};

const INITIAL_PRODUCTS = [
  // COFFEE COLLECTION (#1 to #8 + Signature & Cold Brew)
  {
    id: 'coffee-filter',
    itemNumber: 1,
    name: 'South Indian Filter Coffee',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 70,
    originalPrice: 85,
    image: '/images/3d/filter_coffee.webp',
    description: 'Authentic chicory-infused decoction with frothed hot milk.',
    tastingNotes: 'Authentic Chicory Decoction • Frothed Hot Milk • Traditional Dabarah Aroma',
    roastLevel: 'Dark Chikmagalur Roast',
    intensity: '4.5 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    temp: 'Hot 72°C'
  },
  {
    id: 'coffee-espresso',
    itemNumber: 2,
    name: 'Espresso (Single / Double)',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 80,
    originalPrice: 100,
    image: '/images/3d/espresso.webp',
    description: 'Intense shot extracted from dark roast Arabica beans.',
    tastingNotes: 'Dark Roast Arabica • Golden Tiger Crema • Pure Espresso Shot',
    roastLevel: 'Dark Italian Roast',
    intensity: '5 / 5',
    tag: 'Vegan',
    dietary: 'Vegan',
    inStock: true,
    available: true,
    badge: 'Vegan',
    calories: '5 kcal',
    temp: 'Hot 72°C'
  },
  {
    id: 'coffee-americano',
    itemNumber: 3,
    name: 'Café Americano',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 110,
    originalPrice: 130,
    image: '/images/3d/crema_macro.webp',
    description: 'Espresso diluted with hot water for a smooth, bold body.',
    tastingNotes: 'Smooth Bold Body • Delicate Aromatics • Hot Mineral Water',
    roastLevel: 'Light-Medium Roast',
    intensity: '3 / 5',
    tag: 'Vegan',
    dietary: 'Vegan',
    inStock: true,
    available: true,
    badge: 'Vegan',
    calories: '8 kcal',
    temp: 'Hot 75°C'
  },
  {
    id: 'coffee-cappuccino',
    itemNumber: 4,
    name: 'Classic Cappuccino',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 130,
    originalPrice: 155,
    image: '/images/3d/hero_coffee.webp',
    description: 'Equal parts espresso, steamed milk, and dense velvety microfoam.',
    tastingNotes: 'Dense Microfoam • Steamed Whole Milk • Rich Espresso Heart',
    roastLevel: 'Medium Roast',
    intensity: '3.5 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '140 kcal',
    temp: 'Hot 65°C'
  },
  {
    id: 'coffee-latte',
    itemNumber: 5,
    name: 'Café Latte',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 140,
    originalPrice: 165,
    image: '/images/3d/cafe_latte.webp',
    description: 'Creamy espresso beverage topped with a light layer of milk froth.',
    tastingNotes: 'Creamy Espresso • Light Milk Froth • Handcrafted Swan Art',
    roastLevel: 'Medium-Dark Roast',
    intensity: '4 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '160 kcal',
    temp: 'Hot 68°C'
  },
  {
    id: 'coffee-flat-white',
    itemNumber: 6,
    name: 'Flat White',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 150,
    originalPrice: 175,
    image: '/images/3d/flat_white.webp',
    description: 'Double ristretto shot blended with thin, silky steamed milk.',
    tastingNotes: 'Double Ristretto Shot • Thin Silky Steamed Milk • Velvety Texture',
    roastLevel: 'Medium Roast',
    intensity: '4 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '150 kcal',
    temp: 'Hot 65°C'
  },
  {
    id: 'coffee-mocha',
    itemNumber: 7,
    name: 'Café Mocha',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 160,
    originalPrice: 190,
    image: '/images/3d/iced_mocha.webp',
    description: 'Espresso combined with bittersweet Belgian chocolate ganache & milk.',
    tastingNotes: 'Belgian Chocolate Ganache • Bittersweet Cocoa • Rich Espresso Swirl',
    roastLevel: 'Medium Roast',
    intensity: '3.5 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '280 kcal',
    temp: 'Hot / Iced'
  },
  {
    id: 'coffee-caramel-macchiato',
    itemNumber: 8,
    name: 'Caramel Macchiato',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 170,
    originalPrice: 200,
    image: '/images/3d/caramel_macchiato.webp',
    description: 'Steamed milk layered with espresso and drizzled with salted caramel.',
    tastingNotes: 'Layered Vanilla Milk • Espresso Float • Salted Caramel Drizzle',
    roastLevel: 'Medium Roast',
    intensity: '3 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '240 kcal',
    temp: 'Hot 68°C'
  },
  {
    id: 'coffee-latte-sig',
    name: 'Good Day Signature Latte',
    category: 'Coffee',
    menuCategory: 'coffee',
    price: 149,
    originalPrice: 180,
    image: '/images/3d/signature_latte.webp',
    description: 'Crafted for moments that deserve a little more. Double shot reserve espresso folded into velvety microfoam with hand-poured swan latte art.',
    tastingNotes: 'Velvety Caramel • Roasted Hazelnut • Silky Cream',
    roastLevel: 'Medium-Dark Roast',
    intensity: '4 / 5',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    isSignature: true,
    badge: 'Signature Flagship',
    calories: '160 kcal',
    temp: 'Hot 68°C'
  },
  {
    id: 'coffee-cold-brew',
    name: 'Good Day 18H Cold Brew',
    category: 'Cold Drinks',
    menuCategory: 'coffee',
    price: 159,
    originalPrice: 185,
    image: '/images/3d/cold_brew.webp',
    description: 'Slow cold-steeped for eighteen continuous hours. Ultra-smooth, zero bitterness, naturally sweet with a crisp refreshing finish.',
    tastingNotes: 'Blueberry Finish • Brown Sugar • Low Acidity',
    roastLevel: 'Single Origin Arabica',
    intensity: '4 / 5',
    tag: 'Vegan',
    dietary: 'Vegan',
    inStock: true,
    available: true,
    badge: '18hr Slow Steep',
    calories: '15 kcal',
    temp: 'Chilled 3°C'
  },

  // BAKERY & DESSERTS (#17 to #25)
  {
    id: 'bakery-croissant',
    itemNumber: 17,
    name: 'French Butter Croissant',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 100,
    originalPrice: 120,
    image: '/images/3d/croissant.webp',
    description: 'Flaky, golden multi-layered butter pastry.',
    tastingNotes: '72 Buttery Layers • Crisp Crackling Crust • Airy Honeycomb Center',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '260 kcal',
    pairing: 'Pairs divine with Café Latte'
  },
  {
    id: 'bakery-pain-au-chocolat',
    itemNumber: 18,
    name: 'Pain au Chocolat',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 130,
    originalPrice: 155,
    image: '/images/3d/pain_au_chocolat.webp',
    description: 'Laminated butter puff pastry folded around rich dark chocolate batons.',
    tastingNotes: 'Laminated Butter Pastry • Dark Chocolate Batons • Flaky French Crust',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '310 kcal',
    pairing: 'Superb with Cappuccino'
  },
  {
    id: 'bakery-brownie',
    itemNumber: 19,
    name: 'Chocolate Fudge Brownie',
    category: 'Desserts',
    menuCategory: 'snacks',
    price: 110,
    originalPrice: 135,
    image: '/images/3d/brownie.webp',
    description: 'Dense, gooey walnut fudge brownie with dark cocoa.',
    tastingNotes: 'Dense Dark Cocoa • Gooey Fudge Center • Toasted California Walnuts',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '360 kcal',
    pairing: 'Sublime with Double Espresso'
  },
  {
    id: 'bakery-muffin',
    itemNumber: 20,
    name: 'Blueberry Streusel Muffin',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 100,
    originalPrice: 120,
    image: '/images/3d/muffin.webp',
    description: 'Moist vanilla muffin loaded with blueberries and butter crumble.',
    tastingNotes: 'Wild Blueberries • Butter Streusel Crumble • Moist Vanilla Sponge',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '320 kcal',
    pairing: 'Pairs with Americano or Latte'
  },
  {
    id: 'bakery-cinnamon-roll',
    itemNumber: 21,
    name: 'Warm Cinnamon Roll',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 120,
    originalPrice: 145,
    image: '/images/3d/cinnamon_roll.webp',
    description: 'Swirled spiced pastry finished with cream cheese glaze.',
    tastingNotes: 'Ceylon Cinnamon Swirl • Melted Cream Cheese Glaze • Warm Fluffy Pastry',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '380 kcal',
    pairing: 'Warm Treat with Flat White'
  },
  {
    id: 'bakery-banana-cake',
    itemNumber: 22,
    name: 'Banana Walnut Tea Cake Slice',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 90,
    originalPrice: 110,
    image: '/images/3d/banana_cake.webp',
    description: 'Old-fashioned moist spiced banana loaf with crunchy walnuts.',
    tastingNotes: 'Spiced Banana Loaf • Crunchy Roasted Walnuts • Caramelized Crumb',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '280 kcal',
    pairing: 'Tea or Filter Coffee'
  },
  {
    id: 'bakery-cheesecake',
    itemNumber: 23,
    name: 'New York Baked Cheesecake',
    category: 'Desserts',
    menuCategory: 'snacks',
    price: 180,
    originalPrice: 215,
    image: '/images/3d/cheesecake.webp',
    description: 'Rich cream cheese cake on a graham cracker base with berry compote.',
    tastingNotes: 'Velvety Cream Cheese • Graham Cracker Base • Tart Red Berry Compote',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '440 kcal',
    pairing: 'Indulgent Dessert'
  },
  {
    id: 'bakery-red-velvet',
    itemNumber: 24,
    name: 'Red Velvet Cupcake',
    category: 'Desserts',
    menuCategory: 'snacks',
    price: 90,
    originalPrice: 110,
    image: '/images/3d/red_velvet.webp',
    description: 'Cocoa-buttermilk sponge topped with smooth cream cheese swirl.',
    tastingNotes: 'Crimson Cocoa Sponge • Smooth Cream Cheese Swirl • Red Velvet Crumbs',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '290 kcal',
    pairing: 'Sweet Companion'
  },
  {
    id: 'bakery-biscotti',
    itemNumber: 25,
    name: 'Almond Biscotti (2 pcs)',
    category: 'Bakery',
    menuCategory: 'snacks',
    price: 60,
    originalPrice: 75,
    image: '/images/3d/biscotti.webp',
    description: 'Twice-baked crunchy Italian almond biscuits, ideal for dipping.',
    tastingNotes: 'Twice-Baked Crunch • Whole Toasted Almonds • Perfect Coffee Dipper',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg',
    calories: '150 kcal',
    pairing: 'Dip into hot Espresso or Cappuccino'
  },

  // NEW POPULAR SNACKS COLLECTION
  {
    id: 'snack-veg-curry-puff',
    itemNumber: 26,
    name: 'Classic Veg Curry Puff',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 50,
    originalPrice: 60,
    image: '/images/3d/puff.webp',
    description: 'Crisp puff pastry stuffed with spiced potato and peas filling.',
    tastingNotes: 'Crisp Flaky Pastry • Spiced Potato & Peas Filling',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-paneer-tikka-puff',
    itemNumber: 27,
    name: 'Paneer Tikka Puff',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 75,
    originalPrice: 90,
    image: '/images/3d/paneer_puff.webp',
    description: 'Flaky pastry turnover packed with smoky tandoori cottage cheese.',
    tastingNotes: 'Smoky Tandoori Cottage Cheese • Golden Flaky Turnover',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-chicken-keema-puff',
    itemNumber: 28,
    name: 'Chicken Keema Puff',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 90,
    originalPrice: 110,
    image: '/images/3d/keema_puff.webp',
    description: 'Golden pastry layered with aromatic minced chicken masala.',
    tastingNotes: 'Minced Chicken Masala • Layered Golden Crust',
    tag: 'Non-Veg',
    dietary: 'Non-Veg',
    inStock: true,
    available: true,
    badge: 'Non-Veg'
  },
  {
    id: 'snack-cheese-chilli-toast',
    itemNumber: 29,
    name: 'Cheese Chilli Garlic Toast',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 130,
    originalPrice: 155,
    image: '/images/3d/garlic_bread.webp',
    description: 'Sourdough slices toasted with cheddar, garlic, and fresh green chillies.',
    tastingNotes: 'Melted Cheddar • Roasted Garlic • Fresh Green Chillies',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-bombay-masala-sandwich',
    itemNumber: 30,
    name: 'Bombay Masala Grilled Sandwich',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 140,
    originalPrice: 165,
    image: '/images/3d/sandwich.webp',
    description: 'Triple-layer sandwich with spiced potato, veggies, cheese & mint chutney.',
    tastingNotes: 'Spiced Potato • Fresh Veggies • Mint Chutney & Melted Cheese',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-paneer-makhani-sliders',
    itemNumber: 31,
    name: 'Paneer Makhani Sliders (2 pcs)',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 170,
    originalPrice: 200,
    image: '/images/3d/slider.webp',
    description: 'Soft mini brioche buns stuffed with grilled paneer and makhani mayo.',
    tastingNotes: 'Mini Brioche Buns • Grilled Paneer • Makhani Mayo',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-peri-peri-fries',
    itemNumber: 32,
    name: 'Peri-Peri Crinkle Fries',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 110,
    originalPrice: 130,
    image: '/images/3d/fries.webp',
    description: 'Crispy seasoned potato fries served with garlic dip.',
    tastingNotes: 'Crinkle Cut • Peri-Peri Spice • Creamy Garlic Dip',
    tag: 'Vegan',
    dietary: 'Vegan',
    inStock: true,
    available: true,
    badge: 'Vegan'
  },
  {
    id: 'snack-cocktail-samosas',
    itemNumber: 33,
    name: 'Cocktail Samosas (4 pcs)',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 90,
    originalPrice: 110,
    image: '/images/3d/samosa.webp',
    description: 'Mini crispy spiced potato pockets with sweet-tangy chutney.',
    tastingNotes: 'Crispy Potato Pockets • Sweet-Tangy Chutney Dip',
    tag: 'Veg',
    dietary: 'Veg',
    inStock: true,
    available: true,
    badge: 'Veg'
  },
  {
    id: 'snack-chicken-tikka-panini',
    itemNumber: 34,
    name: 'Chicken Tikka & Cheese Panini',
    category: 'Snacks',
    menuCategory: 'snacks',
    price: 180,
    originalPrice: 215,
    image: '/images/3d/panini.webp',
    description: 'Toasted herb panini filled with roasted spiced chicken and mozzarella.',
    tastingNotes: 'Roasted Spiced Chicken • Stretched Mozzarella • Toasted Herb Bread',
    tag: 'Non-Veg',
    dietary: 'Non-Veg',
    inStock: true,
    available: true,
    badge: 'Non-Veg'
  },

  // COLLISION COMBO
  {
    id: 'combo-good-day-breakfast',
    name: 'The Good Day Breakfast Combo',
    category: 'Combos',
    price: 219,
    originalPrice: 278,
    image: '/images/3d/breakfast_combo.webp',
    description: 'The iconic morning pairing: freshly poured Good Day Signature Latte + warm flaky Artisan Butter Croissant.',
    tastingNotes: 'Caramel Crema meets Golden Flaky Butter',
    inStock: true,
    badge: 'Combo Save ₹59',
    calories: '420 kcal',
    isCombo: true
  }
];

const MENU_VERSION = 'v4_unique_images';

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const currentVersion = localStorage.getItem('good_day_menu_version');
    const saved = localStorage.getItem('good_day_products');
    if (currentVersion !== MENU_VERSION || !saved) {
      localStorage.setItem('good_day_menu_version', MENU_VERSION);
      localStorage.setItem('good_day_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS.map(normalizeProduct);
    }
    try {
      const parsed = JSON.parse(saved);
      const existingIds = new Set(parsed.map(p => p.id));
      const newItems = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
      const merged = [...parsed, ...newItems];
      return merged.map(normalizeProduct);
    } catch {
      return INITIAL_PRODUCTS.map(normalizeProduct);
    }
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('good_day_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('good_day_customer_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeOrder, setActiveOrder] = useState(() => {
    const saved = localStorage.getItem('good_day_active_order');
    return saved ? JSON.parse(saved) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('cart'); // 'cart' | 'tracking' | 'history'

  // Sync products, cart, and orders to localStorage
  useEffect(() => {
    localStorage.setItem('good_day_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('good_day_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('good_day_customer_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('good_day_active_order', JSON.stringify(activeOrder));
    }
  }, [activeOrder]);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    if (product.inStock === false || product.available === false) return;
    const orderProduct = normalizeProduct(product);
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === orderProduct.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === orderProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product: orderProduct, quantity }];
    });
    setDrawerTab('cart');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.finalPrice ?? item.product.price) * item.quantity, 0);
  const cartTotal = cartSubtotal;

  // Order operations
  const saveCompletedOrder = (newOrder) => {
    const standardized = {
      id: newOrder.orderNumber || newOrder.orderId || newOrder.id,
      orderId: newOrder.orderNumber || newOrder.orderId || newOrder.id,
      orderNumber: newOrder.orderNumber || newOrder.orderId || newOrder.id,
      customerName: newOrder.customer?.name || newOrder.customerName || 'Valued Guest',
      phoneNumber: newOrder.customer?.phone || newOrder.phoneNumber || '',
      tableNumber: newOrder.tableNumber || newOrder.table_number || 'Takeaway',
      items: newOrder.items || [],
      totalAmount: Number(newOrder.total ?? newOrder.totalPrice ?? newOrder.totalAmount ?? 0),
      status: newOrder.orderStatus || newOrder.status || 'Order Placed',
      estimatedPrepTime: newOrder.estimatedPrepTime || '10-15 mins',
      createdAt: newOrder.createdAt || newOrder.created_at || new Date().toISOString()
    };

    setOrders(prev => {
      const filtered = prev.filter(o => (o.orderId || o.orderNumber) !== standardized.orderId);
      return [standardized, ...filtered];
    });
    setActiveOrder(standardized);
    return standardized;
  };

  const trackOrder = (orderIdOrObject) => {
    if (typeof orderIdOrObject === 'string') {
      const found = orders.find(o => (o.orderId || o.orderNumber) === orderIdOrObject);
      if (found) {
        setActiveOrder(found);
      } else {
        // If not in local array, set placeholder with id so tracker can fetch from server
        setActiveOrder({ orderId: orderIdOrObject, orderNumber: orderIdOrObject, status: 'Order Placed' });
      }
    } else if (orderIdOrObject) {
      setActiveOrder(orderIdOrObject);
    }
    setIsOrderTrackingOpen(true);
    setIsOrderHistoryOpen(false);
  };

  const reorder = (order) => {
    if (!order || !Array.isArray(order.items)) return;
    order.items.forEach(item => {
      const matched = products.find(p => p.id === item.productId || p.name === item.name);
      if (matched && matched.inStock !== false && matched.available !== false) {
        addToCart(matched, item.quantity || 1);
      } else {
        // Fallback reconstructed product
        addToCart({
          id: item.productId || item.name,
          name: item.name,
          price: item.price,
          image: item.image,
          inStock: true,
          available: true
        }, item.quantity || 1);
      }
    });
    setIsOrderTrackingOpen(false);
    setIsOrderHistoryOpen(false);
    setDrawerTab('cart');
    setIsCartOpen(true);
  };

  const syncActiveOrderStatus = (updatedOrder) => {
    if (!updatedOrder) return;
    const orderId = updatedOrder.orderId || updatedOrder.orderNumber;
    setActiveOrder(prev => (prev && (prev.orderId === orderId || prev.orderNumber === orderId) ? { ...prev, ...updatedOrder } : prev));
    setOrders(prev => prev.map(o => ((o.orderId === orderId || o.orderNumber === orderId) ? { ...o, ...updatedOrder } : o)));
  };

  // Live Menu Management (Admin)
  const updateProduct = (id, updates) => {
    setProducts(prev =>
      prev.map(item => (item.id === id ? normalizeProduct({ ...item, ...updates }) : item))
    );
  };

  const resetMenuToDefault = () => {
    setProducts(INITIAL_PRODUCTS.map(normalizeProduct));
    localStorage.removeItem('good_day_products');
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        updateProduct,
        resetMenuToDefault,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal,
        orders,
        activeOrder,
        saveCompletedOrder,
        trackOrder,
        reorder,
        syncActiveOrderStatus,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAdminOpen,
        setIsAdminOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        drawerTab,
        setDrawerTab
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

