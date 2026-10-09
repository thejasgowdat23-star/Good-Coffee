/**
 * Order Tracking & Timing Helper for Good Day Coffee
 * Manages the automatic 15-minute live delivery timeline and order status computation.
 */

export function getEffectiveOrderStatus(order) {
  if (!order) return 'Order Placed';
  const status = order.orderStatus || order.status;
  if (status === 'Cancelled') return 'Cancelled';
  if (status === 'Completed' || status === 'Delivered') return 'Completed';

  const createdAt = order.createdAt || order.created_at;
  if (createdAt) {
    const elapsedMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    // After 15 minutes, the order is automatically marked Delivered / Completed
    if (elapsedMinutes >= 15) {
      return 'Completed';
    } else if (elapsedMinutes >= 8) {
      return 'Ready';
    } else if (elapsedMinutes >= 3) {
      return 'Preparing';
    }
  }
  return status || 'Order Placed';
}

export function getDeliveryCountdown(order) {
  if (!order) {
    return { isDelivered: false, minutesRemaining: 15, text: 'Est. 10-15 mins' };
  }
  const status = order.orderStatus || order.status;
  if (status === 'Cancelled') {
    return { isDelivered: false, isCancelled: true, minutesRemaining: 0, text: 'Cancelled' };
  }
  if (status === 'Completed' || status === 'Delivered') {
    return { isDelivered: true, minutesRemaining: 0, text: 'Delivered (Completed)' };
  }

  const createdAt = order.createdAt || order.created_at;
  if (!createdAt) {
    return { isDelivered: false, minutesRemaining: 15, text: 'Est. 10-15 mins' };
  }

  const elapsedMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
  if (elapsedMinutes >= 15) {
    return { isDelivered: true, minutesRemaining: 0, text: 'Delivered (Completed)' };
  }

  const remaining = Math.max(1, Math.ceil(15 - elapsedMinutes));
  return {
    isDelivered: false,
    minutesRemaining: remaining,
    text: `Arriving in ~${remaining} min${remaining === 1 ? '' : 's'}`
  };
}
