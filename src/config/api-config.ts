export interface ApiConfig {
  storageUrl: string;
  backupUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const API_CONFIG: ApiConfig = {
  storageUrl: "https://storage.googleapis.com/venue-ledger",
  backupUrl: "https://backup.venue-one.com/backups",
  timeout: 5000,
  retryAttempts: 3
};