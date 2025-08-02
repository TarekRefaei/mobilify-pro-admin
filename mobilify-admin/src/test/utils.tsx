import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { User, Order, MenuItem, Customer, Reservation } from '../types';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  restaurantId: 'test-restaurant',
  role: 'admin',
  createdAt: new Date(),
  ...overrides,
});

export const createMockOrder = (overrides?: Partial<Order>): Order => ({
  id: 'test-order-1',
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
  status: 'pending',
  orderType: 'delivery',
  deliveryAddress: '123 Test St',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMenuItem = (overrides?: Partial<MenuItem>): MenuItem => ({
  id: 'test-menu-item-1',
  restaurantId: 'test-restaurant',
  name: 'Test Burger',
  description: 'A delicious test burger',
  price: 12.99,
  category: 'Burgers',
  imageUrl: 'https://example.com/burger.jpg',
  isAvailable: true,
  allergens: ['gluten'],
  nutritionalInfo: {
    calories: 500,
    protein: 25,
    carbs: 40,
    fat: 20,
  },
  preparationTime: 15,
  displayOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: 'test-customer-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  totalOrders: 5,
  totalSpent: 125.50,
  lastOrderDate: new Date(),
  loyaltyPoints: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockReservation = (overrides?: Partial<Reservation>): Reservation => ({
  id: 'test-reservation-1',
  restaurantId: 'test-restaurant',
  customerName: 'Jane Smith',
  customerPhone: '+1234567890',
  customerEmail: 'jane@example.com',
  date: new Date(),
  time: '19:00',
  partySize: 4,
  tableNumber: 'T1',
  status: 'confirmed',
  specialRequests: 'Window seat please',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock service functions
export const createMockAuthService = () => ({
  getCurrentUser: vi.fn(() => createMockUser()),
  signIn: vi.fn(),
  signOut: vi.fn(),
  isAuthenticated: vi.fn(() => true),
  isInitialized: vi.fn(() => true),
  subscribeToAuthChanges: vi.fn(() => () => {}),
});

export const createMockOrderService = () => ({
  subscribeToOrders: vi.fn((callback) => {
    callback([createMockOrder()]);
    return () => {};
  }),
  updateOrderStatus: vi.fn(),
  getOrderById: vi.fn(),
  getOrderStats: vi.fn(() => ({
    todayOrders: 5,
    pendingOrders: 2,
    completedOrders: 3,
    totalRevenue: 125.50,
  })),
});

export const createMockMenuService = () => ({
  subscribeToMenuItems: vi.fn((callback) => {
    callback([createMockMenuItem()]);
    return () => {};
  }),
  addMenuItem: vi.fn(),
  updateMenuItem: vi.fn(),
  deleteMenuItem: vi.fn(),
  getCategories: vi.fn(() => ['Burgers', 'Pizza', 'Salads']),
});

// Test helpers
export const waitForLoadingToFinish = async () => {
  const { findByText } = await import('@testing-library/react');
  try {
    await findByText(/loading/i, {}, { timeout: 100 });
    await findByText(/loading/i, {}, { timeout: 100 }).then(
      () => {},
      () => {} // Ignore if loading text disappears
    );
  } catch {
    // Loading might not appear or might finish quickly
  }
};

export const mockConsoleError = () => {
  const originalError = console.error;
  console.error = vi.fn();
  return () => {
    console.error = originalError;
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  console.warn = vi.fn();
  return () => {
    console.warn = originalWarn;
  };
};

// Firebase mock helpers
export const mockFirestoreSuccess = (data: any) => {
  const { vi } = require('vitest');
  return vi.fn().mockResolvedValue({
    docs: Array.isArray(data) ? data.map(item => ({
      id: item.id,
      data: () => item,
      exists: () => true,
    })) : [],
    empty: Array.isArray(data) ? data.length === 0 : !data,
    size: Array.isArray(data) ? data.length : data ? 1 : 0,
  });
};

export const mockFirestoreError = (error: string = 'Firestore error') => {
  const { vi } = require('vitest');
  return vi.fn().mockRejectedValue(new Error(error));
};

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};
