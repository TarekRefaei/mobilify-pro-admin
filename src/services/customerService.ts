import {
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Customer, CustomerLoyalty } from '../types/index';
import { authService } from './authService';

class CustomerService {
  private collectionName = 'customers';
  private loyaltyCollectionName = 'customer_loyalty';

  // Get current restaurant ID
  private getCurrentRestaurantId(): string {
    const user = authService.getCurrentUser();
    return user?.restaurantId || 'demo-restaurant';
  }

  // Convert Firestore document to Customer
  private convertFirestoreDoc(doc: DocumentSnapshot): Customer {
    const data = doc.data();
    return {
      id: doc.id,
      name: data?.name,
      email: data?.email || null,
      phone: data?.phone || null,
      totalOrders: data?.totalOrders || 0,
      totalSpent: data?.totalSpent || 0,
      lastOrderDate: data?.lastOrderDate?.toDate() || null,
      loyaltyPoints: data?.loyaltyPoints || 0,
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    };
  }

  // Get demo customers data
  private getDemoCustomers(): Customer[] {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'demo-customer-1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        totalOrders: 15,
        totalSpent: 287.5,
        lastOrderDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        loyaltyPoints: 8,
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'demo-customer-2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 234-5678',
        totalOrders: 8,
        totalSpent: 156.75,
        lastOrderDate: lastWeek,
        loyaltyPoints: 3,
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: lastWeek,
      },
      {
        id: 'demo-customer-3',
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1 (555) 345-6789',
        totalOrders: 22,
        totalSpent: 445.25,
        lastOrderDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        loyaltyPoints: 12,
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'demo-customer-4',
        name: 'Emily Wilson',
        email: 'emily.wilson@email.com',
        phone: '+1 (555) 456-7890',
        totalOrders: 5,
        totalSpent: 89.5,
        lastOrderDate: lastMonth,
        loyaltyPoints: 1,
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: lastMonth,
      },
      {
        id: 'demo-customer-5',
        name: 'David Brown',
        email: 'david.brown@email.com',
        phone: '+1 (555) 567-8901',
        totalOrders: 31,
        totalSpent: 672.8,
        lastOrderDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        loyaltyPoints: 18,
        createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'demo-customer-6',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '+1 (555) 678-9012',
        totalOrders: 12,
        totalSpent: 234.6,
        lastOrderDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        loyaltyPoints: 6,
        createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  // Get all customers for restaurant
  async getCustomers(
    pageSize: number = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{
    customers: Customer[];
    hasMore: boolean;
    lastDoc?: DocumentSnapshot;
  }> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      console.log('👥 Fetching customers for restaurant:', restaurantId);

      let q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        orderBy('lastOrderDate', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const customers = querySnapshot.docs.map(doc =>
        this.convertFirestoreDoc(doc)
      );

      console.log('✅ Customers fetched:', customers.length);

      return {
        customers,
        hasMore: querySnapshot.docs.length === pageSize,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('❌ Failed to fetch customers:', error);
      console.log('👥 Using demo customers data');
      return {
        customers: this.getDemoCustomers(),
        hasMore: false,
      };
    }
  }

  // Subscribe to customers changes
  subscribeToCustomers(callback: (customers: Customer[]) => void): () => void {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      console.log('👥 Subscribing to customers for restaurant:', restaurantId);

      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        orderBy('lastOrderDate', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        console.log(
          '👥 Customers snapshot received:',
          snapshot.docs.length,
          'documents'
        );
        const customers = snapshot.docs.map(doc =>
          this.convertFirestoreDoc(doc)
        );
        callback(customers);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to subscribe to customers:', error);
      console.log('👥 Using demo customers data');
      callback(this.getDemoCustomers());
      return () => {}; // Return empty cleanup function
    }
  }

  // Get customer loyalty information
  async getCustomerLoyalty(
    customerId: string
  ): Promise<CustomerLoyalty | null> {
    try {
      const restaurantId = this.getCurrentRestaurantId();

      const q = query(
        collection(db, this.loyaltyCollectionName),
        where('customerId', '==', customerId),
        where('restaurantId', '==', restaurantId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId,
          restaurantId: data.restaurantId,
          currentStamps: data.currentStamps || 0,
          totalRedeemed: data.totalRedeemed || 0,
          lastPurchase: data.lastPurchase?.toDate() || new Date(),
          lastRedemption: data.lastRedemption
            ? data.lastRedemption.toDate()
            : null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to fetch customer loyalty:', error);
      return null;
    }
  }

  // Search customers by name, email, or phone
  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      if (!searchTerm.trim()) {
        const result = await this.getCustomers();
        return result.customers;
      }

      // For demo purposes, filter demo customers
      const demoCustomers = this.getDemoCustomers();
      const searchLower = searchTerm.toLowerCase();

      return demoCustomers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchTerm)
      );
    } catch (error) {
      console.error('❌ Failed to search customers:', error);
      return [];
    }
  }

  // Get customer statistics
  getCustomerStats(customers: Customer[]) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      c => c.lastOrderDate && c.lastOrderDate > lastMonth
    ).length;
    const newCustomers = customers.filter(c => c.createdAt > lastWeek).length;
    const loyaltyMembers = customers.filter(c => c.loyaltyPoints > 0).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue =
      totalCustomers > 0
        ? totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0)
        : 0;

    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      loyaltyMembers,
      totalRevenue,
      averageOrderValue,
    };
  }
}

export const customerService = new CustomerService();
