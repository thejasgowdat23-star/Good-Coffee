import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

const INITIAL_PRODUCTS = [
  // COFFEE COLLECTION
  {
    id: 'coffee-latte-sig',
    name: 'Good Day Signature Latte',
    category: 'Coffee',
    price: 149,
    originalPrice: 180,
    image: '/images/signature_latte.jpg',
    description: 'Crafted for moments that deserve a little more. Double shot reserve espresso folded into velvety microfoam with hand-poured swan latte art.',
    tastingNotes: 'Velvety Caramel • Roasted Hazelnut • Silky Cream',
    roastLevel: 'Medium-Dark Roast',
    intensity: '4 / 5',
    inStock: true,
    isSignature: true,
    badge: 'Signature Flagship',
    calories: '160 kcal',
    temp: 'Hot 68°C'
  },
  {
    id: 'coffee-espresso',
    name: 'Artisan Double Espresso',
    category: 'Coffee',
    price: 119,
    originalPrice: 140,
    image: '/images/espresso.jpg',
    description: 'Intense, aromatic double extraction boasting thick golden tiger-striped crema. The pure heart of Good Day coffee beans.',
    tastingNotes: 'Dark Cacao • Molasses • Smokey Cedar',
    roastLevel: 'Dark Italian Roast',
    intensity: '5 / 5',
    inStock: true,
    badge: 'Pure Energy',
    calories: '5 kcal',
    temp: 'Hot 72°C'
  },
  {
    id: 'coffee-cappuccino',
    name: 'Velvet Cloud Cappuccino',
    category: 'Coffee',
    price: 139,
    originalPrice: 160,
    image: '/images/hero_coffee.jpg',
    description: 'Equal thirds of espresso, steamed whole milk, and dense airy microfoam dusted with raw Madagascan cocoa powder.',
    tastingNotes: 'Sweet Cocoa • Toasted Almond • Balanced Body',
    roastLevel: 'Medium Roast',
    intensity: '3.5 / 5',
    inStock: true,
    badge: 'Classic Choice',
    calories: '140 kcal',
    temp: 'Hot 65°C'
  },
  {
    id: 'coffee-americano',
    name: 'Long Black Americano',
    category: 'Coffee',
    price: 109,
    originalPrice: 130,
    image: '/images/crema_macro.jpg',
    description: 'Double espresso pulled directly over steaming mineral hot water, preserving the delicate aromatics and bright floral crema ring.',
    tastingNotes: 'Citrus Zest • Mild Honey • Roasted Pecan',
    roastLevel: 'Light-Medium Roast',
    intensity: '3 / 5',
    inStock: true,
    badge: 'Smooth Crisp',
    calories: '8 kcal',
    temp: 'Hot 75°C'
  },
  {
    id: 'coffee-mocha',
    name: 'Dark Chocolate Iced Mocha',
    category: 'Cold Drinks',
    price: 169,
    originalPrice: 199,
    image: '/images/iced_mocha.jpg',
    description: 'Handcrafted Dutch dark cocoa syrup swirled with chilled espresso, cold creamy milk, and hand-cracked crystal ice cubes.',
    tastingNotes: 'Belgian Fudge • Chilled Espresso • Creamy Delight',
    roastLevel: 'Medium Roast',
    intensity: '3 / 5',
    inStock: true,
    badge: 'Decadent Iced',
    calories: '280 kcal',
    temp: 'Iced 4°C'
  },
  {
    id: 'coffee-cold-brew',
    name: 'Good Day 18H Cold Brew',
    category: 'Cold Drinks',
    price: 159,
    originalPrice: 185,
    image: '/images/iced_mocha.jpg',
    description: 'Slow cold-steeped for eighteen continuous hours. Ultra-smooth, zero bitterness, naturally sweet with a crisp refreshing finish.',
    tastingNotes: 'Blueberry Finish • Brown Sugar • Low Acidity',
    roastLevel: 'Single Origin Arabica',
    intensity: '4 / 5',
    inStock: true,
    badge: '18hr Slow Steep',
    calories: '15 kcal',
    temp: 'Chilled 3°C'
  },

  // SNACK JOURNEY
  {
    id: 'snack-croissant',
    name: 'Artisan Butter Croissant',
    category: 'Snacks',
    price: 129,
    originalPrice: 150,
    image: '/images/croissant.jpg',
    description: 'Classic French laminated pastry with 72 delicate buttery layers. Crisp crackling crust on the outside, airy honeycomb interior.',
    tastingNotes: 'Normandy Butter • Flaky Honeycomb • Light Salt',
    inStock: true,
    badge: 'Freshly Baked Today',
    calories: '260 kcal',
    pairing: 'Pairs divine with Signature Latte'
  },
  {
    id: 'snack-muffin',
    name: 'Belgian Chocolate Chunk Muffin',
    category: 'Desserts',
    price: 119,
    originalPrice: 140,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    description: 'Moist dark chocolate sponge bursting with melted 70% dark Belgian couverture chocolate pockets.',
    tastingNotes: 'Molten Fudge • Semi-Sweet Couverture',
    inStock: true,
    badge: 'Warm & Gooey',
    calories: '320 kcal',
    pairing: 'Pairs with Americano or Cappuccino'
  },
  {
    id: 'snack-sandwich',
    name: 'Truffle Mushroom Panini',
    category: 'Snacks',
    price: 189,
    originalPrice: 220,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    description: 'Artisanal sourdough pressed with balsamic glazed wild mushrooms, smoked provolone cheese, and fragrant black truffle aioli.',
    tastingNotes: 'Earthy Truffle • Melted Provolone • Tangy Sourdough',
    inStock: true,
    badge: 'Chef Special',
    calories: '420 kcal',
    pairing: 'Satisfying Lunch Bite'
  },
  {
    id: 'snack-garlic-bread',
    name: 'Rustic Herb Garlic Baguette',
    category: 'Snacks',
    price: 139,
    originalPrice: 165,
    image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=800&q=80',
    description: 'Crusty French baguette slices slathered with roasted garlic butter, parsley, rosemary, and sea salt.',
    tastingNotes: 'Roasted Garlic • Golden Rosemary Butter',
    inStock: true,
    badge: 'Toasted Crisp',
    calories: '280 kcal',
    pairing: 'Snack Favorite'
  },
  {
    id: 'snack-cookies',
    name: 'Sea Salt Dark Chocolate Cookies',
    category: 'Desserts',
    price: 89,
    originalPrice: 110,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    description: 'Chewy centered cookies studded with dark chocolate chunks and finished with Maldon sea salt flakes.',
    tastingNotes: 'Sweet Butter • Salted Dark Chocolate',
    inStock: true,
    badge: 'Daily Batch',
    calories: '190 kcal',
    pairing: 'Dip in hot Latte'
  },
  {
    id: 'snack-brownie',
    name: 'Warm Fudge Walnut Brownie',
    category: 'Desserts',
    price: 149,
    originalPrice: 175,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    description: 'Dense, fudgy brownie with toasted California walnuts, topped with warm ganache drizzle.',
    tastingNotes: 'Rich Ganache • Roasted Walnut Crunch',
    inStock: true,
    badge: 'Best Seller',
    calories: '360 kcal',
    pairing: 'Sublime with Double Espresso'
  },
  {
    id: 'snack-puff',
    name: 'Crispy Spiced Veg Puff',
    category: 'Snacks',
    price: 79,
    originalPrice: 95,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    description: 'Golden flaky puff pastry envelops a savory filling of garden vegetables and aromatic Indian spices.',
    tastingNotes: 'Crisp Layers • Warm Cumin & Peppercorn',
    inStock: true,
    badge: 'Street Classic',
    calories: '210 kcal',
    pairing: 'Tea or Black Coffee'
  },

  // COLLISION COMBO
  {
    id: 'combo-good-day-breakfast',
    name: 'The Good Day Breakfast Combo',
    category: 'Combos',
    price: 219,
    originalPrice: 278,
    image: '/images/croissant.jpg',
    description: 'The iconic morning pairing: freshly poured Good Day Signature Latte + warm flaky Artisan Butter Croissant.',
    tastingNotes: 'Caramel Crema meets Golden Flaky Butter',
    inStock: true,
    badge: 'Combo Save ₹59',
    calories: '420 kcal',
    isCombo: true
  }
];

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('good_day_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('good_day_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  // Sync products and cart to localStorage
  useEffect(() => {
    localStorage.setItem('good_day_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('good_day_cart', JSON.stringify(cart));
  }, [cart]);

  // Audio Synthesizer: Warm cafe vinyl crackle & soft coffee hum
  useEffect(() => {
    let intervalId;
    if (isAudioPlaying) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);

      // Low warm drone (representing warm espresso bar acoustics)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 warm drone
      gain1.gain.setValueAtTime(0.04, ctx.currentTime);

      // Second harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(165, ctx.currentTime); // E3 warm fifth
      gain2.gain.setValueAtTime(0.02, ctx.currentTime);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start();
      osc2.start();

      return () => {
        try {
          osc1.stop();
          osc2.stop();
          ctx.close();
        } catch {
          // ignore
        }
      };
    }
  }, [isAudioPlaying]);

  const toggleAudio = () => {
    setIsAudioPlaying(prev => !prev);
  };

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    if (!product.inStock) return;
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
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
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST
  const cartTotal = cartSubtotal + cartTax;

  // Live Menu Management (Admin)
  const updateProduct = (id, updates) => {
    setProducts(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const resetMenuToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
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
        cartTax,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAdminOpen,
        setIsAdminOpen,
        isAudioPlaying,
        toggleAudio
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
