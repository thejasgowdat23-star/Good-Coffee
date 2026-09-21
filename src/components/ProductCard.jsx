import React, { memo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import PriceTag from './PriceTag';

function ProductCard({ product }) {
  const { addToCart, setIsCheckoutOpen } = useShop();
  const [added, setAdded] = useState(false);
  const available = product.inStock !== false && product.available !== false;
  const localImage = product.image?.startsWith('/images/')
    ? `/images/3d/${product.image.split('/').pop().replace(/\.(jpe?g|png)$/i, '.webp')}`
    : product.image;
  const category = `${product.menuCategory || product.category || ''}`.toLowerCase();
  const tintClass = category.includes('cold') ? 'product-card--cold' : category.includes('snack') || category.includes('dessert') || category.includes('bakery') ? 'product-card--snack' : 'product-card--coffee';
  const originalPrice = Number(product.originalPrice || product.price);
  const finalPrice = Number(product.finalPrice ?? product.price);
  const discountPercent = Number(product.discountPercent || 0);

  return (
    <article className={`product-card ${tintClass} ${available ? '' : 'product-card--unavailable'}`}>
      <img
        src={localImage}
        alt={product.name}
        width="640"
        height="480"
        loading="lazy"
        onError={event => {
          event.currentTarget.src = product.image?.startsWith('/images/') ? product.image : '/images/hero_coffee.jpg';
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
        <button type="button" className="button button--order product-card__order" disabled={!available} onClick={() => { addToCart(product); setIsCheckoutOpen(true); }}>{available ? 'Order Now' : 'Currently Unavailable'}</button>
        <button type="button" className="icon-button product-card__add" disabled={!available} onClick={() => { addToCart(product); setAdded(true); window.setTimeout(() => setAdded(false), 900); }} aria-label={available ? `Add ${product.name} to cart` : `${product.name} unavailable`} title={available ? 'Add to cart' : 'Currently unavailable'}>{added ? '✓' : <Plus size={18} />}</button>
      </div>
      {(product.menuCategory === 'snacks' || category.includes('snack') || category.includes('dessert')) && <span className="product-card__tag">Snacks</span>}
      {!available && <p className="product-card__unavailable">Currently Unavailable</p>}
    </article>
  );
}

export default memo(ProductCard);
