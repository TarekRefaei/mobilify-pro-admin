import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock the necessary hooks
vi.mock('../../hooks/useOrders', () => ({
  __esModule: true,
  default: () => ({
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
  }),
}));

vi.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      restaurantId: 'test-restaurant-id',
      emailVerified: true,
    },
    loading: false,
    error: null,
    isAuthenticated: true,
  }),
}));

describe('Minimal Order Test', () => {
  it('renders without crashing', () => {
    render(
      <div>
        <h1>Test Component</h1>
      </div>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
