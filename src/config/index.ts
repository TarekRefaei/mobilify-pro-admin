// Configuration for Mobilify Pro Admin Panel

// Firebase configuration
export { auth, db, storage, validateFirebaseConfig } from './firebase';

// Environment variables
export const config = {
  // Firebase configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },

  // App configuration
  app: {
    name: 'Mobilify Pro Admin Panel',
    version: '1.0.0',
    description: 'Restaurant management system for Egyptian restaurants',
  },

  // API configuration
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
  },

  // UI configuration
  ui: {
    sidebarWidth: 240, // pixels
    headerHeight: 64, // pixels
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Business rules
  business: {
    maxMenuItems: 200,
    maxNotificationsPerDay: 5,
    loyaltyProgramRange: {
      min: 5,
      max: 20,
    },
    orderStatuses: [
      'pending',
      'preparing',
      'ready',
      'completed',
      'rejected',
    ] as const,
    menuCategories: [
      'Appetizers',
      'Main Dishes',
      'Desserts',
      'Beverages',
      'Specials',
    ] as const,
  },

  // Performance targets
  performance: {
    pageLoadTarget: 1500, // ms
    apiResponseTarget: 200, // ms
    realtimeUpdateTarget: 1000, // ms
    lighthouseScoreTarget: 90,
  },
};

// Validation
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

export const validateConfig = (): boolean => {
  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }

  return true;
};

// Development mode check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Feature flags
export const features = {
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
  enablePerformanceMonitoring: isProduction,
  enableDebugMode: isDevelopment,
};

export default config;
