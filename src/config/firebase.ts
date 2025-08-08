import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'mobilify-admin-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mobilify-admin-demo',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'mobilify-admin-demo.appspot.com',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Analytics (only in supported environments)
let analytics: import('firebase/analytics').Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    })
    .catch(error => {
      console.warn('Firebase Analytics initialization failed:', error);
    });
}

export { analytics };

// Export the app instance
export default app;

// Environment validation
export const validateFirebaseConfig = (): boolean => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn('Missing Firebase environment variables:', missingVars);
    console.warn(
      'Using demo configuration. Please set up proper Firebase config for production.'
    );
    return false;
  }

  return true;
};

// Call validation on module load
validateFirebaseConfig();
