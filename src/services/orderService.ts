import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order } from '../types/index';

// Local type for Firestore document data
type DocumentData = { [field: string]: any };

// Firestore collection name
const ORDERS_COLLECTION = 'orders';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | Date | undefined): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(); // Default to current date if timestamp is undefined
};

// Helper function to convert Order to Firestore document
const orderToFirestore = (order: Omit<Order, 'id'>): DocumentData => ({
  ...order,
  createdAt: Timestamp.fromDate(order.createdAt),
  updatedAt: Timestamp.fromDate(order.updatedAt),
  estimatedReadyTime: order.estimatedReadyTime 
    ? Timestamp.fromDate(order.estimatedReadyTime) 
    : null,
});

// Helper function to convert Firestore document to Order
const firestoreToOrder = (doc: DocumentData): Order => ({
  id: doc.id,
  ...doc.data(),
  createdAt: convertTimestamp(doc.data().createdAt),
  updatedAt: convertTimestamp(doc.data().updatedAt),
  estimatedReadyTime: doc.data().estimatedReadyTime 
    ? convertTimestamp(doc.data().estimatedReadyTime) 
    : undefined,
});

export interface OrderServiceError {
  code: string;
  message: string;
}

class OrderService {
  // Subscribe to real-time order updates for a restaurant
  subscribeToOrders(
    restaurantId: string,
    callback: (orders: Order[]) => void,
    onError?: (error: OrderServiceError) => void
  ): () => void {
    try {
      const ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orders: Order[] = [];
          snapshot.forEach((doc) => {
            orders.push(firestoreToOrder(doc));
          });
          callback(orders);
        },
        (error: any) => {
          console.error('Error subscribing to orders:', error);

          // If it's a permissions error and we're using demo restaurant, return demo data
          if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
            console.log('Returning demo orders due to subscription permissions error');
            callback(this.getDemoOrders());
            return;
          }

          if (onError) {
            onError({
              code: error.code || 'subscription-error',
              message: error.message || 'Failed to subscribe to orders',
            });
          }
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up orders subscription:', error);
      if (onError) {
        onError({
          code: error.code || 'setup-error',
          message: error.message || 'Failed to setup orders subscription',
        });
      }
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get all orders for a restaurant
  async getOrders(restaurantId: string): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ordersQuery);
      const orders: Order[] = [];

      snapshot.forEach((doc) => {
        orders.push(firestoreToOrder(doc));
      });

      return orders;
    } catch (error: any) {
      console.error('Error fetching orders:', error);

      // If it's a permissions error and we're using demo restaurant, return demo data
      if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
        console.log('Returning demo orders due to permissions error');
        return this.getDemoOrders();
      }

      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Get a specific order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
      
      if (!orderDoc.exists()) {
        return null;
      }

      return firestoreToOrder(orderDoc);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  // Create a new order
  async createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
      const firestoreData = orderToFirestore(orderData);
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), firestoreData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating order:', error);

      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && orderData.restaurantId === 'demo-restaurant-123') {
        console.log('Simulating order creation for demo restaurant');
        return `demo-order-${Date.now()}`;
      }

      throw new Error(error.message || 'Failed to create order');
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string, 
    status: Order['status'],
    estimatedReadyTime?: Date
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      if (estimatedReadyTime) {
        updateData.estimatedReadyTime = Timestamp.fromDate(estimatedReadyTime);
      }

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Update order details
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert Date fields to Timestamps
      if (updates.estimatedReadyTime) {
        updateData.estimatedReadyTime = Timestamp.fromDate(updates.estimatedReadyTime);
      }

      // Remove id field if present
      delete updateData.id;

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);
    } catch (error: any) {
      console.error('Error updating order:', error);
      throw new Error(error.message || 'Failed to update order');
    }
  }

  // Delete an order
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    } catch (error: any) {
      console.error('Error deleting order:', error);
      throw new Error(error.message || 'Failed to delete order');
    }
  }

  // Get orders by status
  async getOrdersByStatus(restaurantId: string, status: Order['status']): Promise<Order[]> {
    try {
      const ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ordersQuery);
      const orders: Order[] = [];
      
      snapshot.forEach((doc) => {
        orders.push(firestoreToOrder(doc));
      });

      return orders;
    } catch (error: any) {
      console.error('Error fetching orders by status:', error);
      throw new Error(error.message || 'Failed to fetch orders by status');
    }
  }

  // Get today's orders
  async getTodaysOrders(restaurantId: string): Promise<Order[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        where('createdAt', '>=', Timestamp.fromDate(today)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(ordersQuery);
      const orders: Order[] = [];
      
      snapshot.forEach((doc) => {
        orders.push(firestoreToOrder(doc));
      });

      return orders;
    } catch (error: any) {
      console.error('Error fetching today\'s orders:', error);
      throw new Error(error.message || 'Failed to fetch today\'s orders');
    }
  }

  // Get demo orders (for when Firebase is not accessible)
  getDemoOrders(): Order[] {
    return [
      {
        id: 'demo-order-1',
        restaurantId: 'demo-restaurant-123',
        customerName: 'Ahmed Hassan',
        customerPhone: '+20 100 123 4567',
        items: [
          { menuItemId: 'item-001', name: 'Margherita Pizza', price: 120, quantity: 2 },
          { menuItemId: 'item-002', name: 'Caesar Salad', price: 80, quantity: 1 },
        ],
        totalPrice: 320,
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        updatedAt: new Date(),
        notes: 'Extra cheese on pizza please',
      },
      {
        id: 'demo-order-2',
        restaurantId: 'demo-restaurant-123',
        customerName: 'Fatma Ali',
        customerPhone: '+20 101 234 5678',
        items: [
          { menuItemId: 'item-003', name: 'Chicken Shawarma', price: 60, quantity: 3 },
          { menuItemId: 'item-004', name: 'French Fries', price: 30, quantity: 2 },
        ],
        totalPrice: 240,
        status: 'preparing',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
        updatedAt: new Date(),
        estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000),
      },
      {
        id: 'demo-order-3',
        restaurantId: 'demo-restaurant-123',
        customerName: 'Omar Mahmoud',
        customerPhone: '+20 102 345 6789',
        items: [
          { menuItemId: 'item-005', name: 'Beef Burger', price: 90, quantity: 1 },
          { menuItemId: 'item-006', name: 'Onion Rings', price: 40, quantity: 1 },
        ],
        totalPrice: 130,
        status: 'ready',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 60 * 1000),
        estimatedReadyTime: new Date(Date.now() - 5 * 60 * 1000),
      }
    ];
  }

  // Demo function for development
  async createDemoOrders(restaurantId: string): Promise<void> {
    const demoOrders: Omit<Order, 'id'>[] = [
      {
        restaurantId,
        customerName: 'Ahmed Hassan',
        customerPhone: '+20 100 123 4567',
        items: [
          { menuItemId: 'item-001', name: 'Margherita Pizza', price: 120, quantity: 2 },
          { menuItemId: 'item-002', name: 'Caesar Salad', price: 80, quantity: 1 },
        ],
        totalPrice: 320,
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        updatedAt: new Date(),
        notes: 'Extra cheese on pizza please',
      },
      {
        restaurantId,
        customerName: 'Fatma Ali',
        customerPhone: '+20 101 234 5678',
        items: [
          { menuItemId: 'item-003', name: 'Chicken Shawarma', price: 60, quantity: 3 },
          { menuItemId: 'item-004', name: 'French Fries', price: 30, quantity: 2 },
        ],
        totalPrice: 240,
        status: 'preparing',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
        updatedAt: new Date(),
        estimatedReadyTime: new Date(Date.now() + 15 * 60 * 1000),
      },
    ];

    for (const order of demoOrders) {
      await this.createOrder(order);
    }
  }
}

// Create and export a singleton instance
export const orderService = new OrderService();
export default orderService;