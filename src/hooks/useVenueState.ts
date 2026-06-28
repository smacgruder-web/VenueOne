import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_STATS,
  DELIVERY_FEE,
  LEDGER_KEY,
  MENU,
  RUNNERS,
  SECTIONS,
  WINDOWS,
} from '../data/constants';
import { ensureStorage } from '../lib/storage';
import type { CartItem, EventStats, Fulfillment, Order, OrderStatus } from '../types/venue';
import { genId } from '../utils/format';
import { scheduleAutoProgress, withStatus } from '../utils/order';

export function useVenueState() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [eventStats, setEventStats] = useState<EventStats>(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const storage = ensureStorage();
    (async () => {
      try {
        const result = await storage.get(LEDGER_KEY, true);
        if (mounted && result?.value) {
          const parsed = JSON.parse(result.value) as { orders?: Order[]; eventStats?: EventStats };
          if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
          if (parsed.eventStats) setEventStats(parsed.eventStats);
        }
      } catch {
        /* start fresh */
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const storage = ensureStorage();
    const t = setTimeout(() => {
      storage
        .set(LEDGER_KEY, JSON.stringify({ orders: orders.slice(0, 200), eventStats }), true)
        .catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [orders, eventStats, loaded]);

  const registerOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setEventStats((prev) => {
      const newTotal = prev.totalRevenue + order.total;
      const newOrders = prev.totalOrders + 1;
      return {
        ...prev,
        totalRevenue: newTotal,
        totalOrders: newOrders,
        scans: prev.scans + Math.floor(Math.random() * 3) + 1,
        avgOrderValue: newTotal / newOrders,
        perCap: newTotal / prev.attendance,
      };
    });
  }, []);

  const addOrder = useCallback(
    (
      items: CartItem[],
      section: string,
      fulfillment: Fulfillment = 'pickup',
      seatInfo: string | null = null,
      tip = 0,
    ): Order => {
      const baseTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const total = baseTotal + (fulfillment === 'delivery' ? DELIVERY_FEE : 0);
      const isDelivery = fulfillment === 'delivery';
      const order: Order = {
        id: genId(),
        items,
        total,
        tip: isDelivery ? tip : 0,
        section,
        fulfillment,
        window: isDelivery ? null : WINDOWS[Math.floor(Math.random() * WINDOWS.length)],
        seat: isDelivery ? seatInfo : null,
        runner: null,
        status: 'received',
        ts: Date.now(),
        statusHistory: [{ status: 'received', ts: Date.now() }],
        name: ['Alex M.', 'Jordan K.', 'Sam T.', 'Riley P.', 'Casey W.'][Math.floor(Math.random() * 5)],
      };
      registerOrder(order);
      scheduleAutoProgress(setOrders, order.id, isDelivery);
      return order;
    },
    [registerOrder],
  );

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? withStatus(o, status) : o)));
  }, []);

  const claimOrder = useCallback((id: string, runnerName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              runner: runnerName,
              statusHistory: [...(o.statusHistory || []), { status: 'claimed', ts: Date.now() }],
            }
          : o,
      ),
    );
  }, []);

  const resetData = useCallback(async () => {
    setOrders([]);
    setEventStats(DEFAULT_STATS);
    try {
      await ensureStorage().delete(LEDGER_KEY, true);
    } catch {
      /* nothing to clear */
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const tick = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const items: CartItem[] = Array.from({ length: count }, () => {
        const m = MENU[Math.floor(Math.random() * MENU.length)];
        return { ...m, qty: 1 };
      });
      const section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
      const isDelivery = Math.random() < 0.35;
      const baseTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const total = baseTotal + (isDelivery ? DELIVERY_FEE : 0);
      const tipPct = isDelivery && Math.random() < 0.7 ? [0.15, 0.18, 0.2, 0.25][Math.floor(Math.random() * 4)] : 0;
      const tip = isDelivery ? Math.round(baseTotal * tipPct * 100) / 100 : 0;
      const order: Order = {
        id: genId(),
        items,
        total,
        tip,
        section,
        fulfillment: isDelivery ? 'delivery' : 'pickup',
        window: isDelivery ? null : WINDOWS[Math.floor(Math.random() * WINDOWS.length)],
        seat: isDelivery
          ? `Sec ${section}, Row ${Math.floor(Math.random() * 20) + 1}, Seat ${Math.floor(Math.random() * 30) + 1}`
          : null,
        runner: isDelivery ? RUNNERS[Math.floor(Math.random() * RUNNERS.length)] : null,
        status: 'received',
        ts: Date.now(),
        statusHistory: [{ status: 'received', ts: Date.now() }],
        name: ['Taylor B.', 'Morgan L.', 'Drew F.', 'Jamie C.', 'Quinn R.'][Math.floor(Math.random() * 5)],
        auto: true,
      };
      setOrders((prev) => [order, ...prev.slice(0, 199)]);
      setEventStats((prev) => {
        const newTotal = prev.totalRevenue + total;
        const newOrders = prev.totalOrders + 1;
        return {
          ...prev,
          totalRevenue: newTotal,
          totalOrders: newOrders,
          scans: prev.scans + Math.floor(Math.random() * 4) + 1,
          avgOrderValue: newTotal / newOrders,
          perCap: newTotal / prev.attendance,
        };
      });
      scheduleAutoProgress(setOrders, order.id, isDelivery);
    };
    const interval = setInterval(tick, 14000 + Math.random() * 8000);
    const t1 = setTimeout(tick, 1000);
    const t2 = setTimeout(tick, 3000);
    const t3 = setTimeout(tick, 5500);
    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loaded]);

  const newOrders = orders.filter((o) => o.status === 'received').length;
  const unclaimedCount = orders.filter(
    (o) => o.fulfillment === 'delivery' && o.status === 'ready' && !o.runner,
  ).length;

  return {
    orders,
    eventStats,
    addOrder,
    updateStatus,
    claimOrder,
    resetData,
    loaded,
    newOrders,
    unclaimedCount,
  };
}