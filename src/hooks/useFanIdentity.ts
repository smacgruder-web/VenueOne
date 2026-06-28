import { useState, useEffect, useCallback } from 'react';
import { FAN_KEY } from '../data/constants';
import { ensureStorage } from '../lib/storage';
import type { FanIdentity } from '../types/venue';

export function useFanIdentity(): FanIdentity {
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const storage = ensureStorage();
    (async () => {
      try {
        const r = await storage.get(FAN_KEY, false);
        if (mounted && r?.value) {
          const parsed = JSON.parse(r.value) as { activeOrderId?: string; myOrderIds?: string[] };
          if (parsed.activeOrderId) setActiveOrderId(parsed.activeOrderId);
          if (Array.isArray(parsed.myOrderIds)) setMyOrderIds(parsed.myOrderIds);
        }
      } catch {
        /* nothing saved yet */
      }
      if (mounted) setLoaded(true);
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
        .set(FAN_KEY, JSON.stringify({ activeOrderId, myOrderIds: myOrderIds.slice(0, 50) }), false)
        .catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [activeOrderId, myOrderIds, loaded]);

  const trackOrder = useCallback((id: string) => {
    setActiveOrderId(id);
    setMyOrderIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  }, []);

  return { activeOrderId, setActiveOrderId, myOrderIds, trackOrder };
}