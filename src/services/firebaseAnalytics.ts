import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../config/firebase';

// Define a type for analytics event parameters
export type AnalyticsEventParams = Record<string, string | number | boolean | undefined | null>;

// Firebase Analytics service for restaurant-specific events
class FirebaseAnalyticsService {
  private isEnabled: boolean = false;

  constructor() {
    // Check if analytics is available
    this.isEnabled = !!analytics && typeof window !== 'undefined';
    
    if (this.isEnabled) {
      console.log('Firebase Analytics service initialized');
    } else {
      console.log('Firebase Analytics service disabled (analytics not available)');
    }
  }

  // Set user properties for restaurant admin
  setUser(userId: string, properties?: AnalyticsEventParams) {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserId(analytics, userId);
      
      if (properties) {
        setUserProperties(analytics, {
          user_role: 'restaurant_admin',
          ...properties,
        });
      }
    } catch (error) {
      console.warn('Failed to set Firebase Analytics user:', error);
    }
  }

  // Clear user data
  clearUser() {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserId(analytics, null);
    } catch (error) {
      console.warn('Failed to clear Firebase Analytics user:', error);
    }
  }

  // Track custom events
  trackEvent(eventName: string, parameters?: AnalyticsEventParams) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, eventName, {
        app_name: 'mobilify_admin',
        timestamp: new Date().toISOString(),
        ...parameters,
      });
    } catch (error) {
      console.warn('Failed to track Firebase Analytics event:', error);
    }
  }

  // Restaurant-specific event tracking
  trackLogin(method: string = 'email') {
    this.trackEvent('login', {
      method,
      user_type: 'restaurant_admin',
    });
  }

  trackLogout() {
    this.trackEvent('logout', {
      user_type: 'restaurant_admin',
    });
  }

  trackOrderAction(action: string, orderId: string, orderValue?: number) {
    this.trackEvent('order_management', {
      action,
      order_id: orderId,
      order_value: orderValue || 0,
      currency: 'EGP',
    });
  }

  trackMenuAction(action: string, itemId: string, category?: string) {
    this.trackEvent('menu_management', {
      action,
      item_id: itemId,
      item_category: category || 'unknown',
    });
  }

  trackReservationAction(action: string, reservationId: string) {
    this.trackEvent('reservation_management', {
      action,
      reservation_id: reservationId,
    });
  }

  trackNotificationSent(type: string, recipientCount: number) {
    this.trackEvent('notification_sent', {
      notification_type: type,
      recipient_count: recipientCount,
    });
  }

  trackPageView(pageName: string, pageTitle?: string) {
    this.trackEvent('page_view', {
      page_name: pageName,
      page_title: pageTitle || pageName,
      page_location: window.location.href,
    });
  }

  trackError(errorType: string, errorMessage: string, fatal: boolean = false) {
    this.trackEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Limit message length
      fatal,
    });
  }

  trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
    });
  }

  trackBusinessMetric(metricName: string, value: number, period: string = 'daily') {
    this.trackEvent('business_metric', {
      metric_name: metricName,
      metric_value: value,
      metric_period: period,
      currency: 'EGP',
    });
  }

  // Feature usage tracking
  trackFeatureUsage(featureName: string, action: string = 'used') {
    this.trackEvent('feature_usage', {
      feature_name: featureName,
      action,
    });
  }

  // Settings changes
  trackSettingsChange(settingName: string, oldValue: string | number | boolean | null | undefined, newValue: string | number | boolean | null | undefined) {
    this.trackEvent('settings_change', {
      setting_name: settingName,
      old_value: String(oldValue).substring(0, 50),
      new_value: String(newValue).substring(0, 50),
    });
  }

  // Search and filter usage
  trackSearch(searchTerm: string, resultCount: number, context: string) {
    this.trackEvent('search', {
      search_term: searchTerm.substring(0, 50),
      result_count: resultCount,
      search_context: context,
    });
  }

  // Export/import actions
  trackDataAction(action: string, dataType: string, recordCount?: number) {
    this.trackEvent('data_management', {
      action,
      data_type: dataType,
      record_count: recordCount || 0,
    });
  }
}

// Create and export singleton instance
export const firebaseAnalytics = new FirebaseAnalyticsService();

export default firebaseAnalytics;