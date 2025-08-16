import { vi } from 'vitest';

const mockUseOrders = vi.fn().mockReturnValue({
  orders: [],
  pendingOrders: [],
  preparingOrders: [],
  readyOrders: [],
  completedOrders: [],
  rejectedOrders: [],
  loading: false,
  error: null,
  updateOrderStatus: vi.fn(),
  refreshOrders: vi.fn(),
  stats: {
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    rejected: 0,
  },
});

export default mockUseOrders;
