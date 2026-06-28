import { useState, useEffect } from 'react';
import { RUNNER_KEY } from '../data/constants';
import { ensureStorage } from '../lib/storage';
import type { RunnerIdentity } from '../types/venue';

export function useRunnerIdentity(): RunnerIdentity {
  const [me, setMe] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const storage = ensureStorage();
    (async () => {
      try {
        const r = await storage.get(RUNNER_KEY, false);
        if (mounted && r?.value) {
          const parsed = JSON.parse(r.value) as { me?: string };
          if (parsed.me) setMe(parsed.me);
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
      storage.set(RUNNER_KEY, JSON.stringify({ me }), false).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [me, loaded]);

  return { me, setMe };
}