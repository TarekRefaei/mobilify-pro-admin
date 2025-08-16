import { useCallback, useEffect, useState } from 'react';
import { orderService, type OrderServiceError } from '../services';
import type { Order } from '../types/index';
import { useAuth } from './useAuth';

export interface UseOrdersReturn {
  // State
  orders: Order[];
  loading: boolean;
  error: string | null;

  // Computed values
  pendingOrders: Order[];
  preparingOrders: Order[];
  readyOrders: Order[];
  completedOrders: Order[];
  rejectedOrders: Order[];

  // Actions
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    estimatedReadyTime?: Date
  ) => Promise<void>;
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id'>) => Promise<string>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Statistics
  stats: {
    total: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    rejected: number;
    todayOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  };

  // Methods for test compatibility
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
}

export const useOrders = (): UseOrdersReturn => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get restaurant ID from authenticated user
  const restaurantId = user?.restaurantId;

  // Computed values - filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const rejectedOrders = orders.filter(order => order.status === 'rejected');

  // Additional computed values for test compatibility
  const today = new Date();
  const todayOrders = orders.filter(order => {
    let orderDate: Date;
    if (order.createdAt instanceof Date) {
      orderDate = order.createdAt;
    } else if (
      order.createdAt &&
      typeof order.createdAt.toDate === 'function'
    ) {
      orderDate = order.createdAt.toDate();
    } else {
      return false;
    }
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );

  // Statistics
  const stats = {
    total: orders.length,
    pending: pendingOrders.length,
    preparing: preparingOrders.length,
    ready: readyOrders.length,
    completed: completedOrders.length,
    rejected: rejectedOrders.length,
    todayOrders: todayOrders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
  };

  // Error handler
  const handleError = useCallback((error: OrderServiceError | Error) => {
    console.error('Orders error:', error);
    setError(error.message);
    setLoading(false);
  }, []);

  // Success handler for order updates
  const handleOrdersUpdate = useCallback((updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    setError(null);
    setLoading(false);
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      status: Order['status'],
      estimatedReadyTime?: Date
    ) => {
      if (!restaurantId) {
        throw new Error('No restaurant ID available');
      }

      try {
        setError(null);
        await orderService.updateOrderStatus(
          orderId,
          status,
          estimatedReadyTime
        );
        // The real-time listener will update the orders automatically
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error('An unknown error occurred')
        );
        throw error;
      }
    },
    [restaurantId, handleError]
  );

  // Refresh orders manually
  const refreshOrders = useCallback(async () => {
    if (!restaurantId) {
      setError('No restaurant ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getOrders(restaurantId);
      setOrders(fetchedOrders);
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('An unknown error occurred')
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId, handleError]);

  // Create new order
  const createOrder = useCallback(
    async (orderData: Omit<Order, 'id'>): Promise<string> => {
      if (!restaurantId) {
        throw new Error('No restaurant ID available');
      }

      try {
        setError(null);
        const orderId = await orderService.createOrder({
          ...orderData,
          restaurantId,
        });
        // The real-time listener will update the orders automatically
        return orderId;
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error('An unknown error occurred')
        );
        throw error;
      }
    },
    [restaurantId, handleError]
  );

  // Delete order
  const deleteOrder = useCallback(
    async (orderId: string) => {
      try {
        setError(null);
        await orderService.deleteOrder(orderId);
        // The real-time listener will update the orders automatically
      } catch (error) {
        handleError(
          error instanceof Error
            ? error
            : new Error('An unknown error occurred')
        );
        throw error;
      }
    },
    [handleError]
  );

  // Methods required by tests
  const getOrderById = useCallback(
    (id: string) => {
      return orders.find(order => order.id === id);
    },
    [orders]
  );

  const getOrdersByStatus = useCallback(
    (status: Order['status']) => {
      return orders.filter(order => order.status === status);
    },
    [orders]
  );

  // Set up real-time subscription when component mounts or restaurantId changes
  useEffect(() => {
    if (!restaurantId) {
      setOrders([]);
      setLoading(false);
      setError('No restaurant ID available');
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = orderService.subscribeToOrders(
      restaurantId,
      handleOrdersUpdate,
      handleError
    );

    // Cleanup subscription on unmount or dependency change
    return () => {
      unsubscribe();
    };
  }, [restaurantId, handleOrdersUpdate, handleError]);

  return {
    // State
    orders,
    loading,
    error,

    // Computed values
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    rejectedOrders,

    // Actions
    updateOrderStatus,
    refreshOrders,
    createOrder,
    deleteOrder,

    // Statistics
    stats,

    // Methods for test compatibility
    getOrderById,
    getOrdersByStatus,
  };
};

export default useOrders;
