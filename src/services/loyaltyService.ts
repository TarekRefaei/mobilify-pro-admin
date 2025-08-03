import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Customer, CustomerLoyalty, LoyaltyProgram } from '../types/index';
import { authService } from './authService';

class LoyaltyService {
  private loyaltyProgramCollection = 'loyaltyPrograms';
  private customerLoyaltyCollection = 'customerLoyalty';
  private customersCollection = 'customers';

  // Get current restaurant ID from auth service
  private getCurrentRestaurantId(): string {
    const user = authService.getCurrentUser();
    if (!user?.restaurantId) {
      throw new Error('No restaurant ID found. Please log in again.');
    }
    return user.restaurantId;
  }

  // Convert Firestore document to LoyaltyProgram object
  private convertLoyaltyProgramDoc(doc: any): LoyaltyProgram {
    const data = doc.data();
    return {
      id: doc.id,
      restaurantId: data.restaurantId,
      isActive: data.isActive,
      purchasesRequired: data.purchasesRequired,
      rewardType: data.rewardType,
      description: data.description,
      termsAndConditions: data.termsAndConditions,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  // Convert Firestore document to CustomerLoyalty object with customer data
  private convertCustomerLoyaltyDoc(doc: any, customerData: Customer): CustomerLoyalty & { customer: Customer } {
    const data = doc.data();
    return {
      id: doc.id,
      customerId: data.customerId,
      restaurantId: data.restaurantId,
      currentStamps: data.currentStamps,
      totalRewardsRedeemed: data.totalRewardsRedeemed,
      lastPurchase: data.lastPurchase.toDate(),
      lastRedemption: data.lastRedemption ? data.lastRedemption.toDate() : null,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      customer: customerData,
    };
  }

  // Subscribe to loyalty program updates
  subscribeLoyaltyProgram(callback: (program: LoyaltyProgram | null) => void): () => void {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      const q = query(
        collection(db, this.loyaltyProgramCollection),
        where('restaurantId', '==', restaurantId)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (snapshot.docs.length > 0) {
          const program = this.convertLoyaltyProgramDoc(snapshot.docs[0]);
          callback(program);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error in loyalty program subscription:', error);
        // Fallback to demo data if Firebase fails
        callback(this.getDemoLoyaltyProgram());
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to loyalty program:', error);
      // Return demo data immediately and empty unsubscribe function
      callback(this.getDemoLoyaltyProgram());
      return () => {};
    }
  }

  // Subscribe to customer loyalty updates
  subscribeCustomerLoyalty(callback: (customers: (CustomerLoyalty & { customer: Customer })[]) => void): () => void {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      const q = query(
        collection(db, this.customerLoyaltyCollection),
        where('restaurantId', '==', restaurantId)
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const customerLoyaltyData = await Promise.all(
            snapshot.docs.map(async (loyaltyDoc) => {
              const loyaltyData = loyaltyDoc.data();
              
              // Get customer data
              const customerDoc = await getDoc(doc(db, this.customersCollection, loyaltyData.customerId));
              if (customerDoc.exists()) {
                const customerData = customerDoc.data() as Customer;
                return this.convertCustomerLoyaltyDoc(loyaltyDoc, {
                  ...customerData,
                  id: customerDoc.id,
                });
              }
              return null;
            })
          );

          const validCustomers = customerLoyaltyData.filter(Boolean) as (CustomerLoyalty & { customer: Customer })[];
          callback(validCustomers);
        } catch (error) {
          console.error('Error processing customer loyalty data:', error);
          callback(this.getDemoCustomerLoyalty());
        }
      }, (error) => {
        console.error('Error in customer loyalty subscription:', error);
        // Fallback to demo data if Firebase fails
        callback(this.getDemoCustomerLoyalty());
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to customer loyalty:', error);
      // Return demo data immediately and empty unsubscribe function
      callback(this.getDemoCustomerLoyalty());
      return () => {};
    }
  }

  // Update or create loyalty program
  async updateLoyaltyProgram(updates: Partial<LoyaltyProgram>): Promise<void> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      const now = new Date();

      // Check if program exists
      const q = query(
        collection(db, this.loyaltyProgramCollection),
        where('restaurantId', '==', restaurantId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        // Update existing program
        const docRef = doc(db, this.loyaltyProgramCollection, snapshot.docs[0].id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: Timestamp.fromDate(now),
        });
        console.log('✅ Loyalty program updated successfully');
      } else {
        // Create new program
        const programData = {
          restaurantId,
          isActive: true,
          purchasesRequired: 10,
          rewardType: 'free_item',
          description: 'Buy 10 items, get 1 free!',
          termsAndConditions: 'Loyalty program terms and conditions.',
          ...updates,
          createdAt: Timestamp.fromDate(now),
          updatedAt: Timestamp.fromDate(now),
        };

        const docRef = doc(collection(db, this.loyaltyProgramCollection));
        await setDoc(docRef, programData);
        console.log('✅ Loyalty program created successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update loyalty program:', error);
      throw new Error('Failed to update loyalty program. Please try again.');
    }
  }

  // Add stamps to customer
  async addStampsToCustomer(customerId: string, stamps: number): Promise<void> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      // Check if customer loyalty record exists
      const q = query(
        collection(db, this.customerLoyaltyCollection),
        where('customerId', '==', customerId),
        where('restaurantId', '==', restaurantId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        // Update existing record
        const docRef = doc(db, this.customerLoyaltyCollection, snapshot.docs[0].id);
        await updateDoc(docRef, {
          currentStamps: increment(stamps),
          lastPurchase: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      } else {
        // Create new customer loyalty record
        await this.createCustomerLoyalty(customerId);
        // Then add stamps
        await this.addStampsToCustomer(customerId, stamps);
      }
      
      console.log('✅ Stamps added to customer successfully');
    } catch (error) {
      console.error('❌ Failed to add stamps to customer:', error);
      throw new Error('Failed to add stamps to customer. Please try again.');
    }
  }

  // Redeem reward for customer
  async redeemReward(customerId: string, requiredStamps: number): Promise<void> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      const q = query(
        collection(db, this.customerLoyaltyCollection),
        where('customerId', '==', customerId),
        where('restaurantId', '==', restaurantId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        const docRef = doc(db, this.customerLoyaltyCollection, snapshot.docs[0].id);
        const currentData = snapshot.docs[0].data();
        
        if (currentData.currentStamps >= requiredStamps) {
          await updateDoc(docRef, {
            currentStamps: increment(-requiredStamps),
            totalRewardsRedeemed: increment(1),
            lastRedemption: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          });
          console.log('✅ Reward redeemed successfully');
        } else {
          throw new Error('Insufficient stamps for reward redemption');
        }
      } else {
        throw new Error('Customer loyalty record not found');
      }
    } catch (error) {
      console.error('❌ Failed to redeem reward:', error);
      throw new Error('Failed to redeem reward. Please try again.');
    }
  }

  // Create customer loyalty record
  async createCustomerLoyalty(customerId: string): Promise<void> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      const now = new Date();

      const loyaltyData = {
        customerId,
        restaurantId,
        currentStamps: 0,
        totalRewardsRedeemed: 0,
        lastPurchase: Timestamp.fromDate(now),
        lastRedemption: null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = doc(collection(db, this.customerLoyaltyCollection));
      await setDoc(docRef, loyaltyData);
      console.log('✅ Customer loyalty record created successfully');
    } catch (error) {
      console.error('❌ Failed to create customer loyalty record:', error);
      throw new Error('Failed to create customer loyalty record. Please try again.');
    }
  }

  // Demo data for development/fallback
  private getDemoLoyaltyProgram(): LoyaltyProgram {
    return {
      id: 'demo-loyalty-program',
      restaurantId: 'demo-restaurant',
      isActive: true,
      purchasesRequired: 10,
      rewardType: 'free_item',
      description: 'Buy 10 items, get 1 free!',
      termsAndConditions: 'This is a demo loyalty program. Terms and conditions would be displayed here.',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    };
  }

  private getDemoCustomerLoyalty(): (CustomerLoyalty & { customer: Customer })[] {
    const now = new Date();
    return [
      {
        id: 'demo-loyalty-1',
        customerId: 'demo-customer-1',
        restaurantId: 'demo-restaurant',
        currentStamps: 7,
        totalRewardsRedeemed: 2,
        lastPurchase: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastRedemption: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        customer: {
          id: 'demo-customer-1',
          restaurantId: 'demo-restaurant',
          name: 'Ahmed Hassan',
          email: 'ahmed@example.com',
          phone: '+20 100 123 4567',
          totalOrders: 15,
          totalSpent: 450.75,
          lastOrderDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      {
        id: 'demo-loyalty-2',
        customerId: 'demo-customer-2',
        restaurantId: 'demo-restaurant',
        currentStamps: 3,
        totalRewardsRedeemed: 0,
        lastPurchase: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        lastRedemption: null,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        customer: {
          id: 'demo-customer-2',
          restaurantId: 'demo-restaurant',
          name: 'Fatma Ali',
          email: 'fatma@example.com',
          phone: '+20 101 234 5678',
          totalOrders: 8,
          totalSpent: 240.50,
          lastOrderDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
      },
    ];
  }
}

export const loyaltyService = new LoyaltyService();