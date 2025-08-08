import { useEffect, useState } from 'react';
import { loyaltyService } from '../services/loyaltyService';
import type { Customer, CustomerLoyalty, LoyaltyProgram } from '../types/index';

export const useLoyalty = () => {
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(
    null
  );
  const [customerLoyalty, setCustomerLoyalty] = useState<
    (CustomerLoyalty & { customer: Customer })[]
  >([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalRewardsRedeemed: 0,
    averageStamps: 0,
    completionRate: 0,
    recentRedemptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProgram: (() => void) | undefined;
    let unsubscribeCustomers: (() => void) | undefined;

    const initializeLoyalty = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to loyalty program updates
        unsubscribeProgram = loyaltyService.subscribeLoyaltyProgram(program => {
          setLoyaltyProgram(program);
        });

        // Subscribe to customer loyalty updates
        unsubscribeCustomers = loyaltyService.subscribeCustomerLoyalty(
          customers => {
            setCustomerLoyalty(customers);

            // Calculate stats
            const totalCustomers = customers.length;
            const activeCustomers = customers.filter(
              c =>
                c.customer.lastOrderDate &&
                new Date(c.customer.lastOrderDate) >
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length;

            const totalStamps = customers.reduce(
              (sum, c) => sum + c.currentStamps,
              0
            );
            const averageStamps =
              totalCustomers > 0 ? totalStamps / totalCustomers : 0;

            const completedCustomers = customers.filter(
              c =>
                loyaltyProgram &&
                c.currentStamps >= loyaltyProgram.purchasesRequired
            ).length;
            const completionRate =
              totalCustomers > 0
                ? (completedCustomers / totalCustomers) * 100
                : 0;

            const totalRewardsRedeemed = customers.reduce(
              (sum, c) => sum + c.totalRewardsRedeemed,
              0
            );

            // Recent redemptions (last 7 days)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentRedemptions = customers.filter(
              c => c.lastRedemption && new Date(c.lastRedemption) > weekAgo
            ).length;

            setStats({
              totalCustomers,
              activeCustomers,
              totalRewardsRedeemed,
              averageStamps,
              completionRate,
              recentRedemptions,
            });
          }
        );

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize loyalty data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load loyalty data'
        );
        setLoading(false);
      }
    };

    initializeLoyalty();

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeProgram) {
        unsubscribeProgram();
      }
      if (unsubscribeCustomers) {
        unsubscribeCustomers();
      }
    };
  }, [loyaltyProgram]); // Re-calculate stats when program changes

  const updateLoyaltyProgram = async (
    updates: Partial<LoyaltyProgram>
  ): Promise<void> => {
    try {
      await loyaltyService.updateLoyaltyProgram(updates);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to update loyalty program:', err);
      throw err;
    }
  };

  const addStampsToCustomer = async (
    customerId: string,
    stamps: number
  ): Promise<void> => {
    try {
      await loyaltyService.addStampsToCustomer(customerId, stamps);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to add stamps to customer:', err);
      throw err;
    }
  };

  const redeemReward = async (customerId: string): Promise<void> => {
    try {
      if (!loyaltyProgram) {
        throw new Error('No loyalty program configured');
      }
      await loyaltyService.redeemReward(
        customerId,
        loyaltyProgram.purchasesRequired
      );
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to redeem reward:', err);
      throw err;
    }
  };

  const createCustomerLoyalty = async (customerId: string): Promise<void> => {
    try {
      await loyaltyService.createCustomerLoyalty(customerId);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to create customer loyalty:', err);
      throw err;
    }
  };

  return {
    loyaltyProgram,
    customerLoyalty,
    stats,
    loading,
    error,
    updateLoyaltyProgram,
    addStampsToCustomer,
    redeemReward,
    createCustomerLoyalty,
  };
};
