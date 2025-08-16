import { vi } from 'vitest';

// Mock data
export const mockOrder = {
  id: 'order-1',
  restaurantId: 'test-restaurant-id',
  customerName: 'Test Customer',
  customerPhone: '+1234567890',
  items: [
    {
      id: 'item-1',
      name: 'Test Item',
      price: 9.99,
      quantity: 2,
      notes: 'Test notes',
    },
  ],
  totalPrice: 19.98,
  status: 'pending',
  orderType: 'delivery',
  deliveryAddress: '123 Test St',
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock implementation
export const useOrders = vi.fn(() => ({
  orders: [mockOrder],
  pendingOrders: [mockOrder],
  preparingOrders: [],
  readyOrders: [],
  completedOrders: [],
  rejectedOrders: [],
  loading: false,
  error: null,
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  refreshOrders: vi.fn().mockResolvedValue(undefined),
  stats: {
    total: 1,
    pending: 1,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
  },
}));

export default useOrders;
