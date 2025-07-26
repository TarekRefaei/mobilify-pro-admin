import { useState, useEffect } from 'react';
import { analyticsService, type DashboardMetrics } from '../services/analyticsService';
import { useAuth } from './useAuth';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set restaurant ID for analytics service
    const restaurantId = user.restaurantId || 'demo-restaurant-123';
    analyticsService.setRestaurantId(restaurantId);

    setLoading(true);
    setError(null);

    // Subscribe to real-time metrics
    const unsubscribe = analyticsService.subscribeToMetrics((newMetrics) => {
      setMetrics(newMetrics);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);

  // Refresh metrics manually
  const refreshMetrics = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const restaurantId = user.restaurantId || 'demo-restaurant-123';
      analyticsService.setRestaurantId(restaurantId);
      const newMetrics = await analyticsService.calculateMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  };
};
