import { useState, useEffect, useCallback, useRef } from 'react';
import type { Order } from '../types/index';
import { notificationService } from '../services';

export interface UseNotificationsReturn {
  isEnabled: {
    audio: boolean;
    notifications: boolean;
  };
  enableNotifications: () => Promise<void>;
  testNotification: () => Promise<void>;
  notifyNewOrder: (order: Order) => Promise<void>;
  notifyOrderReady: (order: Order) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isEnabled, setIsEnabled] = useState({
    audio: false,
    notifications: false,
  });

  // Check notification status
  const checkStatus = useCallback(() => {
    const status = notificationService.isEnabled();
    setIsEnabled(status);
    return status;
  }, []);

  // Enable notifications (requires user interaction)
  const enableNotifications = useCallback(async () => {
    try {
      const status = await notificationService.enableNotifications();
      setIsEnabled(status);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  }, []);

  // Test notification
  const testNotification = useCallback(async () => {
    try {
      await notificationService.testNotification();
    } catch (error) {
      console.error('Failed to test notification:', error);
    }
  }, []);

  // Notify new order
  const notifyNewOrder = useCallback(async (order: Order) => {
    try {
      await notificationService.notifyNewOrder(
        order.customerName,
        order.totalPrice
      );
    } catch (error) {
      console.error('Failed to notify new order:', error);
    }
  }, []);

  // Notify order ready
  const notifyOrderReady = useCallback(async (order: Order) => {
    try {
      await notificationService.notifyOrderReady(order.customerName, order.id);
    } catch (error) {
      console.error('Failed to notify order ready:', error);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isEnabled,
    enableNotifications,
    testNotification,
    notifyNewOrder,
    notifyOrderReady,
  };
};

// Hook to automatically handle order notifications
export const useOrderNotifications = (orders: Order[]) => {
  const notifications = useNotifications();
  const previousOrdersRef = useRef<Map<string, Order>>(new Map());

  useEffect(() => {
    const previousOrders = previousOrdersRef.current;

    // Check for new orders
    orders.forEach(order => {
      const previousOrder = previousOrders.get(order.id);

      if (!previousOrder) {
        // New order detected
        if (order.status === 'pending') {
          notifications.notifyNewOrder(order);
        }
      } else {
        // Check for status changes
        if (previousOrder.status !== order.status) {
          if (order.status === 'ready') {
            notifications.notifyOrderReady(order);
          }
        }
      }
    });

    // Update previous orders reference
    const newPreviousOrders = new Map();
    orders.forEach(order => {
      newPreviousOrders.set(order.id, { ...order });
    });
    previousOrdersRef.current = newPreviousOrders;
  }, [orders, notifications]);

  return notifications;
};

export default useNotifications;
