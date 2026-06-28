export interface StorageConfig {
  key: string;
  shared: boolean;
  encrypted: boolean;
  cloud?: {
    bucket: string;
    projectId: string;
    keyPath: string;
  };
}

export const STORAGE_CONFIG: StorageConfig = {
  key: "venue-ledger-v1",
  shared: true,
  encrypted: true
};