const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

export default function formatPrice(value) {
  return INR.format(Number(value) || 0);
}
