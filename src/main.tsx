import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize monitoring services
import { initSentry } from './config/sentry';
import { initGoogleAnalytics } from './config/analytics';
import { monitoring } from './services/monitoring';

// Initialize Sentry first (for error tracking during initialization)
initSentry();

// Initialize Google Analytics
initGoogleAnalytics();

// Initialize unified monitoring service
monitoring.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
