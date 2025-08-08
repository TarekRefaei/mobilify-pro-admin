import {
  trackError,
  trackEvent,
  trackTiming,
  trackUserEvent,
} from '../config/analytics';
import {
  clearUserContext,
  reportError,
  setUserContext,
} from '../config/sentry';
import {
  firebaseAnalytics,
  type AnalyticsEventParams,
} from './firebaseAnalytics';

// Unified monitoring service that coordinates all monitoring tools
class MonitoringService {
  private isInitialized: boolean = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  // Initialize the monitoring service
  initialize() {
    if (this.isInitialized) return;

    console.log('Initializing monitoring service...');

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
    console.log('Monitoring service initialized successfully');
  }

  // Set user context across all monitoring tools
  setUser(user: { id: string; email?: string; restaurantId?: string }) {
    // Sentry
    setUserContext(user);

    // Firebase Analytics
    firebaseAnalytics.setUser(user.id, {
      restaurant_id: user.restaurantId,
      user_email: user.email,
    });

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: user.id,
        restaurant_id: user.restaurantId ?? '',
      });
    }
  }

  // Clear user context
  clearUser() {
    clearUserContext();
    firebaseAnalytics.clearUser();
  }

  // Track errors across all platforms
  trackError(
    error: Error,
    context?: Record<string, string | number | boolean>,
    fatal: boolean = false
  ) {
    const errorMessage = error.message || 'Unknown error';

    // Sentry (detailed error tracking)
    reportError(error, context);

    // Google Analytics (error metrics)
    trackError(errorMessage, fatal);

    // Firebase Analytics (app stability metrics)
    firebaseAnalytics.trackError('javascript_error', errorMessage, fatal);
  }

  // Track custom events across platforms
  trackEvent(eventName: string, parameters?: AnalyticsEventParams) {
    // Google Analytics
    trackEvent(eventName, parameters);

    // Firebase Analytics
    firebaseAnalytics.trackEvent(eventName, parameters);
  }

  // Track page views
  trackPageView(pageName: string, pageTitle?: string) {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }

    // Firebase Analytics
    firebaseAnalytics.trackPageView(pageName, pageTitle);
  }

  // Track performance metrics
  trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    // Google Analytics
    trackTiming(metricName, value, 'performance');

    // Firebase Analytics
    firebaseAnalytics.trackPerformance(metricName, value, unit);
  }

  // Track business metrics
  trackBusinessMetric(metricName: string, value: number, unit?: string) {
    // Google Analytics
    trackEvent('business_metric', {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
    });

    // Firebase Analytics
    firebaseAnalytics.trackBusinessMetric(metricName, value);
  }

  // Track user actions
  trackUserAction(action: string, userId?: string) {
    trackUserEvent(action, userId);

    if (action === 'login') {
      firebaseAnalytics.trackLogin();
    } else if (action === 'logout') {
      firebaseAnalytics.trackLogout();
    }
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers() {
    // Unhandled JavaScript errors
    window.addEventListener('error', event => {
      this.trackError(
        new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        true
      );
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.trackError(
        new Error(event.reason),
        {
          type: 'unhandled_promise_rejection',
        },
        true
      );
    });
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // Monitor Core Web Vitals
      this.performanceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPerformance(
              'page_load_time',
              navEntry.loadEventEnd - navEntry.loadEventStart
            );
            this.trackPerformance(
              'dom_content_loaded',
              navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart
            );
          }

          if (entry.entryType === 'paint') {
            this.trackPerformance(
              entry.name.replace('-', '_'),
              entry.startTime
            );
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  // Initialize performance monitoring
  private initializePerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Track initial page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance(
            'initial_page_load',
            navigation.loadEventEnd - navigation.fetchStart
          );
        }
      }, 0);
    });
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    this.isInitialized = false;
  }
}

// Create and export singleton instance
export const monitoring = new MonitoringService();

export default monitoring;
