import { vi } from 'vitest';

// Simple, clean mock implementation
const mockUseOrders = vi.fn(() => ({
  orders: [],
  loading: false,
  error: null,
  pendingOrders: [],
  preparingOrders: [],
  readyOrders: [],
  completedOrders: [],
  rejectedOrders: [],
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  refreshOrders: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue('mock-order-id'),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
  stats: {
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  },
  getOrderById: vi.fn(() => undefined),
  getOrdersByStatus: vi.fn(() => []),
}));

// Mock orders data for tests
export const mockOrders = [
  {
    id: '1',
    restaurantId: 'test-restaurant',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    items: [
      {
        id: 'item-1',
        name: 'Test Burger',
        price: 12.99,
        quantity: 2,
        specialInstructions: 'No onions',
      },
    ],
    totalPrice: 25.98,
    status: 'pending' as const,
    orderType: 'delivery' as const,
    deliveryAddress: '123 Test St',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock order service
export const mockOrderService = {
  subscribeToOrders: vi.fn((_restaurantId, onUpdate, _onError) => {
    if (typeof onUpdate === 'function') {
      onUpdate(mockOrders);
    }
    return vi.fn(); // unsubscribe function
  }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  getOrders: vi.fn().mockResolvedValue(mockOrders),
  createOrder: vi.fn().mockResolvedValue('mock-order-id'),
  deleteOrder: vi.fn().mockResolvedValue(undefined),
};

// Export both named and default for maximum compatibility
export const useOrders = mockUseOrders;
export default mockUseOrders;
