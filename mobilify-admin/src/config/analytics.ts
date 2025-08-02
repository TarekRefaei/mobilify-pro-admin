// Google Analytics 4 configuration - no external imports needed

// Google Analytics 4 configuration
export const initGoogleAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  
  if (!measurementId) {
    console.log('Google Analytics Measurement ID not provided, skipping initialization');
    return;
  }

  // Only track in production or staging
  if (environment === 'development') {
    console.log('Google Analytics disabled in development environment');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }

  gtag('js', new Date());
  gtag('config', measurementId, {
    // Privacy settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    
    // Custom configuration
    custom_map: {
      custom_parameter_1: 'restaurant_id',
      custom_parameter_2: 'user_role',
    },
    
    // Enhanced ecommerce for restaurant analytics
    send_page_view: true,
  });

  // Make gtag available globally
  window.gtag = gtag;

  console.log(`Google Analytics initialized with ID: ${measurementId}`);
};

// Custom event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'restaurant_admin',
      event_label: parameters?.label || '',
      value: parameters?.value || 0,
      ...parameters,
    });
  }
};

// Restaurant-specific analytics events
export const trackOrderEvent = (action: string, orderId: string, value?: number) => {
  trackEvent('order_action', {
    event_category: 'orders',
    event_label: action,
    order_id: orderId,
    value: value || 0,
  });
};

export const trackMenuEvent = (action: string, itemId: string, category?: string) => {
  trackEvent('menu_action', {
    event_category: 'menu',
    event_label: action,
    item_id: itemId,
    item_category: category || 'unknown',
  });
};

export const trackUserEvent = (action: string, userId?: string) => {
  trackEvent('user_action', {
    event_category: 'authentication',
    event_label: action,
    user_id: userId || 'anonymous',
  });
};

export const trackPageView = (pageName: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }
};

// Performance tracking
export const trackTiming = (name: string, value: number, category: string = 'performance') => {
  trackEvent('timing_complete', {
    event_category: category,
    name,
    value: Math.round(value),
  });
};

// Error tracking (complement to Sentry)
export const trackError = (error: string, fatal: boolean = false) => {
  trackEvent('exception', {
    description: error,
    fatal,
  });
};

// Business metrics tracking
export const trackBusinessMetric = (metric: string, value: number, unit?: string) => {
  trackEvent('business_metric', {
    event_category: 'business',
    metric_name: metric,
    metric_value: value,
    metric_unit: unit || 'count',
  });
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      custom_map: properties,
    });
  }
};

// Declare global gtag interface
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default {
  initGoogleAnalytics,
  trackEvent,
  trackOrderEvent,
  trackMenuEvent,
  trackUserEvent,
  trackPageView,
  trackTiming,
  trackError,
  trackBusinessMetric,
  setUserProperties,
};
