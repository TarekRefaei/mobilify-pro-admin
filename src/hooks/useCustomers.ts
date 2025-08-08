import { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import type { Customer } from '../types/index';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to real-time customer updates
        unsubscribe = customerService.subscribeToCustomers(customersData => {
          console.log('👥 Customers updated:', customersData.length);
          setCustomers(customersData);
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to initialize customers:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load customers'
        );
        setLoading(false);
      }
    };

    initializeCustomers();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = customers.filter(
        customer =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [customers, searchTerm]);

  const searchCustomers = async (term: string): Promise<void> => {
    try {
      setSearchTerm(term);
      if (term.trim()) {
        const results = await customerService.searchCustomers(term);
        setFilteredCustomers(results);
      }
    } catch (err) {
      console.error('Failed to search customers:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to search customers'
      );
    }
  };

  const refreshCustomers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await customerService.getCustomers();
      setCustomers(result.customers);
    } catch (err) {
      console.error('Failed to refresh customers:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to refresh customers'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCustomerStats = () => {
    return customerService.getCustomerStats(customers);
  };

  return {
    customers: filteredCustomers,
    allCustomers: customers,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    searchCustomers,
    refreshCustomers,
    getCustomerStats,
  };
};
