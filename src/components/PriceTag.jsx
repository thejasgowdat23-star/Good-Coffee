import React from 'react';
import formatPrice from '../utils/formatPrice';

export default function PriceTag({ value, className = '' }) {
  return <span className={className}>{formatPrice(value)}</span>;
}
