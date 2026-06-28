import type { Dispatch, SetStateAction } from 'react';
import type { Order, OrderStatus } from '../types/venue';

export const STATUS_ORDER: OrderStatus[] = ['received', 'preparing', 'ready', 'delivered'];

export function withStatus(order: Order, status: OrderStatus): Order {
  return {
    ...order,
    status,
    statusHistory: [...(order.statusHistory || []), { status, ts: Date.now() }],
  };
}

export function advanceIfLater(order: Order, status: OrderStatus): Order {
  if (STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(order.status)) return order;
  return withStatus(order, status);
}

export function nextAction(order: Order): { next: OrderStatus; label: string } | null {
  if (order.status === 'received') return { next: 'preparing', label: '▶ START PREPARING' };
  if (order.status === 'preparing') {
    return {
      next: 'ready',
      label: order.fulfillment === 'delivery' ? '🛵 STAGE FOR RUNNER' : '✓ MARK READY',
    };
  }
  return null;
}

export function scheduleAutoProgress(
  setOrders: Dispatch<SetStateAction<Order[]>>,
  orderId: string,
  isDelivery: boolean,
): void {
  setTimeout(() => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? advanceIfLater(o, 'preparing') : o)));
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? advanceIfLater(o, 'ready') : o)));
      if (isDelivery) {
        setTimeout(() => {
          setOrders((prev) =>
            prev.map((o) => {
              if (o.id !== orderId || !o.runner) return o;
              return advanceIfLater(o, 'delivered');
            }),
          );
        }, 6000 + Math.random() * 5000);
      }
    }, 8000 + Math.random() * 6000);
  }, 2000 + Math.random() * 3000);
}

export function playChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    /* audio not available */
  }
}