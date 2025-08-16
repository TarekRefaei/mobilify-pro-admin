import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock data
export const mockUser = {
  uid: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  restaurantId: 'test-restaurant',
  emailVerified: true,
};

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

// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    signIn: vi.fn().mockResolvedValue({ user: mockUser }),
    signOut: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
  })),
}));

vi.mock('../hooks/useOrders', () => ({
  default: vi.fn(() => ({
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
  })),
}));

vi.mock('../hooks/useOrderNotifications', () => ({
  default: vi.fn(() => ({
    isEnabled: {
      audio: true,
      notifications: true,
    },
    enableNotifications: vi.fn(),
    testNotification: vi.fn(),
  })),
}));

// Custom render with router
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
};

export * from '@testing-library/react';
export { customRender as render };
