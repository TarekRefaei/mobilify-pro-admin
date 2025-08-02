import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, MenuItem } from '../types';

export interface DashboardMetrics {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  totalReservations: number;
  weeklyOrders: number;
  weeklySales: number;
  popularItems: Array<{ name: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'menu' | 'reservation';
    message: string;
    timestamp: Date;
    icon: string;
  }>;
}

class AnalyticsService {
  private restaurantId: string = 'demo-restaurant-123';

  setRestaurantId(id: string) {
    this.restaurantId = id;
  }

  // Get today's date range
  private getTodayRange() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return { startOfDay, endOfDay };
  }

  // Get this week's date range
  private getWeekRange() {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()) + 1);
    return { startOfWeek, endOfWeek };
  }

  // Calculate metrics from orders
  async calculateMetrics(): Promise<DashboardMetrics> {
    try {
      const { startOfDay, endOfDay } = this.getTodayRange();
      const { startOfWeek, endOfWeek } = this.getWeekRange();

      // Get today's orders
      const todayOrdersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', this.restaurantId),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay))
      );

      // Get this week's orders
      const weekOrdersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', this.restaurantId),
        where('createdAt', '>=', Timestamp.fromDate(startOfWeek)),
        where('createdAt', '<', Timestamp.fromDate(endOfWeek))
      );

      // Get pending orders
      const pendingOrdersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', this.restaurantId),
        where('status', '==', 'pending')
      );

      // Get recent activity (last 10 items)
      const recentActivityQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', this.restaurantId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const [todayOrdersSnap, weekOrdersSnap, pendingOrdersSnap, recentActivitySnap] = await Promise.all([
        getDocs(todayOrdersQuery),
        getDocs(weekOrdersQuery),
        getDocs(pendingOrdersQuery),
        getDocs(recentActivityQuery)
      ]);

      // Calculate today's metrics
      const todayOrders = todayOrdersSnap.docs;
      const todaySales = todayOrders.reduce((sum, doc) => {
        const order = doc.data() as Order;
        return sum + (order.totalPrice || 0);
      }, 0);

      // Calculate weekly metrics
      const weeklyOrders = weekOrdersSnap.docs;
      const weeklySales = weeklyOrders.reduce((sum, doc) => {
        const order = doc.data() as Order;
        return sum + (order.totalPrice || 0);
      }, 0);

      // Calculate popular items
      const itemCounts: Record<string, number> = {};
      weeklyOrders.forEach(doc => {
        const order = doc.data() as Order;
        order.items?.forEach(item => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      const popularItems = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Format recent activity
      const recentActivity = recentActivitySnap.docs.map(doc => {
        const order = doc.data() as Order;
        return {
          id: doc.id,
          type: 'order' as const,
          message: `${order.status === 'pending' ? 'New order' : 'Order updated'} from ${order.customerName}`,
          timestamp: order.createdAt.toDate(),
          icon: order.status === 'pending' ? '📋' : order.status === 'completed' ? '✅' : '🔄'
        };
      });

      return {
        todayOrders: todayOrders.length,
        todaySales,
        pendingOrders: pendingOrdersSnap.docs.length,
        totalReservations: 0, // Will be implemented in Phase 6
        weeklyOrders: weeklyOrders.length,
        weeklySales,
        popularItems,
        recentActivity
      };

    } catch (error) {
      console.error('Error calculating metrics:', error);
      // Return demo data on error
      return this.getDemoMetrics();
    }
  }

  // Subscribe to real-time metrics updates
  subscribeToMetrics(callback: (metrics: DashboardMetrics) => void): () => void {
    try {
      const { startOfDay, endOfDay } = this.getTodayRange();

      // Subscribe to today's orders for real-time updates
      const todayOrdersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', this.restaurantId),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay))
      );

      const unsubscribe = onSnapshot(todayOrdersQuery, async () => {
        const metrics = await this.calculateMetrics();
        callback(metrics);
      });

      // Initial load
      this.calculateMetrics().then(callback);

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to metrics:', error);
      // Fallback to demo data
      callback(this.getDemoMetrics());
      return () => {};
    }
  }

  // Demo data for development
  private getDemoMetrics(): DashboardMetrics {
    return {
      todayOrders: 12,
      todaySales: 2450,
      pendingOrders: 3,
      totalReservations: 8,
      weeklyOrders: 89,
      weeklySales: 15680,
      popularItems: [
        { name: 'Koshari', count: 23 },
        { name: 'Ful Medames', count: 18 },
        { name: 'Shawarma', count: 15 },
        { name: 'Molokhia', count: 12 },
        { name: 'Mahshi', count: 9 }
      ],
      recentActivity: [
        {
          id: '1',
          type: 'order',
          message: 'New order from Ahmed Hassan',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          icon: '📋'
        },
        {
          id: '2',
          type: 'order',
          message: 'Order #1234 completed',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          icon: '✅'
        },
        {
          id: '3',
          type: 'menu',
          message: 'Menu item "Koshari" updated',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          icon: '🍽️'
        },
        {
          id: '4',
          type: 'order',
          message: 'Order from Fatma Ali in progress',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          icon: '🔄'
        },
        {
          id: '5',
          type: 'reservation',
          message: 'New reservation for 4 people',
          timestamp: new Date(Date.now() - 120 * 60 * 1000),
          icon: '📅'
        }
      ]
    };
  }
}

export const analyticsService = new AnalyticsService();
