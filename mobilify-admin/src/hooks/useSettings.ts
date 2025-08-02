import { useState, useEffect } from 'react';
import type { RestaurantSettings, SettingsFormData } from '../types';
import { settingsService } from '../services/settingsService';

export const useSettings = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to real-time settings updates
        unsubscribe = settingsService.subscribeToSettings((settingsData) => {
          console.log('🔧 Settings updated:', settingsData);
          setSettings(settingsData);
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to initialize settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings');
        setLoading(false);
      }
    };

    initializeSettings();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const updateSettings = async (settingsData: SettingsFormData): Promise<void> => {
    try {
      await settingsService.updateSettings(settingsData);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    }
  };

  const refreshSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await settingsService.getSettings();
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to refresh settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh settings');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
  };
};
