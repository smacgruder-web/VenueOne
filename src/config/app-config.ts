// Environment Configuration
// This file should be created by the user based on their deployment environment

// Vite environment variables
// https://vitejs.dev/guide/env-and-mode.html

// Application Configuration
export const APP_CONFIG = {
  name: "Venue One",
  version: "1.0.0",
  description: "Restaurant ordering dashboard for Riverside Arena"
};

// Feature Flags
export const FEATURES = {
  enableAnalytics: true,
  enableDelivery: true,
  enableSelfOrder: true,
  enableRunnerApp: true,
  enablePrintReports: true
};

// API Endpoints
export const API_CONFIG = {
  storageUrl: "https://storage.googleapis.com/venue-ledger",
  backupUrl: "https://backup.venue-one.com/backups"
};

// UI Configuration
export const UI_CONFIG = {
  theme: "dark",
  primaryColor: "#F5A623",
  secondaryColor: "#2A9D4A",
  maxOrdersToStore: 200,
  autoProgressIntervals: {
    preparing: 8000,
    ready: 6000
  }
};

// Security Configuration
export const SECURITY_CONFIG = {
  enableAuth: false,
  allowCors: true,
  storageEncryption: true,
  privacyLevel: "device"
};