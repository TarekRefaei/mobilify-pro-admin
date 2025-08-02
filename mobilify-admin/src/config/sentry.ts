import * as Sentry from '@sentry/react';

// Sentry configuration for error tracking and performance monitoring
export const initSentry = () => {
  // Only initialize Sentry in production or when DSN is provided
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  
  if (!dsn) {
    console.log('Sentry DSN not provided, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration({
        // Set up automatic route change tracking for React Router
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Error Sampling
    sampleRate: 1.0, // Capture 100% of errors
    
    // Release tracking
    release: `mobilify-admin@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // User context
    beforeSend(event, hint) {
      // Filter out non-critical errors in production
      if (environment === 'production') {
        const error = hint.originalException;
        
        // Skip network errors that are not actionable
        if (error instanceof Error) {
          if (error.message.includes('Network Error') || 
              error.message.includes('Failed to fetch')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional configuration
    attachStacktrace: true,
    debug: environment === 'development',
    
    // Privacy settings
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data from breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Set user context for restaurant admin
  Sentry.setContext('application', {
    name: 'Mobilify Pro Admin Panel',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment,
  });

  console.log(`Sentry initialized for ${environment} environment`);
};

// Custom error reporting functions
export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('error_context', context);
    }
    Sentry.captureException(error);
  });
};

export const reportMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

// Performance monitoring
export const startTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({ name, op });
};

// User context management
export const setUserContext = (user: { id: string; email?: string; restaurantId?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    restaurant_id: user.restaurantId,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

// React imports for routing instrumentation
import React, { useEffect } from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';

export default { initSentry, reportError, reportMessage, setUserContext, clearUserContext };
