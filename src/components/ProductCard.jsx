import React, { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getOptimizedImageUrl, DEFAULT_FALLBACK_IMAGE } from '../utils/imageHelper';
import PriceTag from './PriceTag';

function ProductCard({ product }) {
  const { addToCart, setIsCheckoutOpen } = useShop();
  const [added, setAdded] = useState(false);
  const available = product.inStock !== false && product.available !== false;
  const imageSrc = getOptimizedImageUrl(product);
  const category = `${product.menuCategory || product.category || ''}`.toLowerCase();
  const tintClass = category.includes('cold') ? 'product-card--cold' : category.includes('snack') || category.includes('dessert') || category.includes('bakery') ? 'product-card--snack' : 'product-card--coffee';
  const originalPrice = Number(product.originalPrice || product.price);
  const finalPrice = Number(product.finalPrice ?? product.price);
  const discountPercent = Number(product.discountPercent || 0);

  return (
    <article className={`product-card ${tintClass} ${available ? '' : 'product-card--unavailable'}`}>
      <img
        src={imageSrc}
        alt={product.name}
        width="640"
        height="480"
        loading="lazy"
        decoding="async"
        onError={event => {
          if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
            event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
          }
        }}
      />
      {discountPercent > 0 && <span className="discount-badge">{discountPercent}% OFF</span>}
      <div className="product-card__body">
        <div>
          <span className="product-card__category">{product.menuCategory === 'snacks' ? 'Snacks' : product.category}</span>
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
          <div className="product-card__price-row"><PriceTag value={finalPrice} className="product-card__price" />{discountPercent > 0 && <del><PriceTag value={originalPrice} /></del>}</div>
        </div>
      </div>
      <div className="product-card__actions">
        <button type="button" className="button button--order product-card__order" disabled={!available} onClick={() => { addToCart(product); setIsCheckoutOpen(true); }}>
          {available ? (
            <>
              <span className="text-desktop">Order Now</span>
              <span className="text-mobile">Order</span>
            </>
          ) : (
            'Currently Unavailable'
          )}
        </button>
        <button type="button" className="icon-button product-card__add" disabled={!available} onClick={() => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 900); }} aria-label={available ? `Add ${product.name} to cart` : `${product.name} unavailable`} title={available ? 'Add to cart' : 'Currently unavailable'}>{added ? '✓' : <Plus size={18} />}</button>
      </div>
      {(product.tag || product.dietary || product.menuCategory === 'snacks' || category.includes('snack') || category.includes('dessert')) && (
        <span className={`product-card__tag ${(product.tag === 'Veg' || product.dietary === 'Veg') ? 'product-card__tag--veg' : (product.tag === 'Non-Veg' || product.dietary === 'Non-Veg') ? 'product-card__tag--non-veg' : (product.tag === 'Vegan' || product.dietary === 'Vegan') ? 'product-card__tag--vegan' : ''}`}>
          {product.tag || product.dietary || 'Snacks'}
        </span>
      )}
      {!available && <p className="product-card__unavailable">Currently Unavailable</p>}
    </article>
  );
}

export default memo(ProductCard);
