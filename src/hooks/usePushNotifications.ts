import { useEffect, useState } from 'react';
import { pushNotificationService } from '../services/pushNotificationService';
import type { NotificationFormData, PushNotification } from '../types/index';

export const usePushNotifications = () => {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    thisWeek: 0,
    totalRecipients: 0,
    openRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to real-time updates
        unsubscribe = pushNotificationService.subscribeToNotifications((updatedNotifications) => {
          setNotifications(updatedNotifications);
          
          // Calculate stats
          const sentNotifications = updatedNotifications.filter(n => n.status === 'sent');
          const totalSent = sentNotifications.length;
          
          // This week notifications
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const thisWeek = sentNotifications.filter(n => 
            new Date(n.sentAt || n.createdAt) > weekAgo
          ).length;
          
          // Total recipients
          const totalRecipients = sentNotifications.reduce((sum, n) => sum + n.recipientCount, 0);
          
          // Open rate
          const totalOpened = sentNotifications.reduce((sum, n) => sum + (n.openedCount || 0), 0);
          const totalDelivered = sentNotifications.reduce((sum, n) => sum + (n.deliveredCount || 0), 0);
          const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
          
          setStats({
            totalSent,
            thisWeek,
            totalRecipients,
            openRate,
          });
          
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to initialize notifications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        setLoading(false);
      }
    };

    initializeNotifications();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const sendNotification = async (notificationData: NotificationFormData): Promise<void> => {
    try {
      await pushNotificationService.sendNotification(notificationData);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to send notification:', err);
      throw err;
    }
  };

  const scheduleNotification = async (
    notificationData: NotificationFormData,
    scheduledFor: Date
  ): Promise<void> => {
    try {
      await pushNotificationService.scheduleNotification(notificationData, scheduledFor);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to schedule notification:', err);
      throw err;
    }
  };

  const cancelScheduledNotification = async (notificationId: string): Promise<void> => {
    try {
      await pushNotificationService.cancelScheduledNotification(notificationId);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to cancel scheduled notification:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await pushNotificationService.deleteNotification(notificationId);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to delete notification:', err);
      throw err;
    }
  };

  // Helper functions for filtering and analytics
  const getNotificationsByStatus = (status: PushNotification['status']) => {
    return notifications.filter(notification => notification.status === status);
  };

  const getNotificationsByAudience = (audience: string) => {
    return notifications.filter(notification => notification.targetAudience === audience);
  };

  const getRecentNotifications = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return notifications.filter(notification => 
      new Date(notification.createdAt) > cutoffDate
    );
  };

  const getNotificationStats = () => {
    const sent = getNotificationsByStatus('sent');
    const scheduled = getNotificationsByStatus('scheduled');
    const failed = getNotificationsByStatus('failed');
    
    return {
      total: notifications.length,
      sent: sent.length,
      scheduled: scheduled.length,
      failed: failed.length,
      recent: getRecentNotifications().length,
    };
  };

  return {
    notifications,
    stats,
    loading,
    error,
    sendNotification,
    scheduleNotification,
    cancelScheduledNotification,
    deleteNotification,
    getNotificationsByStatus,
    getNotificationsByAudience,
    getRecentNotifications,
    getNotificationStats,
  };
};
