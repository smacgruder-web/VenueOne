export interface StorageResult {
  value: string;
}

export interface StorageAPI {
  get: (key: string, shared: boolean) => Promise<StorageResult | null>;
  set: (key: string, value: string, shared: boolean) => Promise<void>;
  delete: (key: string, shared: boolean) => Promise<void>;
}

function prefixKey(key: string, shared: boolean): string {
  return shared ? `venue-shared:${key}` : `venue-local:${key}`;
}

const localStorageAPI: StorageAPI = {
  async get(key, shared) {
    const value = localStorage.getItem(prefixKey(key, shared));
    return value ? { value } : null;
  },
  async set(key, value, shared) {
    localStorage.setItem(prefixKey(key, shared), value);
  },
  async delete(key, shared) {
    localStorage.removeItem(prefixKey(key, shared));
  },
};

declare global {
  interface Window {
    storage?: StorageAPI;
  }
}

export function ensureStorage(): StorageAPI {
  if (!window.storage) {
    window.storage = localStorageAPI;
  }
  return window.storage;
}