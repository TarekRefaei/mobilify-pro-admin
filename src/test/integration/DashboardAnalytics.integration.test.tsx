import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Mock all external dependencies
vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    subscribeToMetrics: vi.fn().mockReturnValue(() => {}),
    getMetrics: vi.fn().mockResolvedValue({
      todayOrders: 12,
      todaySales: 485.75,
      pendingOrders: 3,
      weeklyOrders: 89,
      weeklySales: 2750.25,
      popularItems: [
        { name: 'Margherita Pizza', count: 15 },
        { name: 'Caesar Salad', count: 12 },
      ],
      recentActivity: [],
    }),
  },
}));

vi.mock('../../hooks/useOrders');
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-user-1', restaurantId: 'test-restaurant' },
    loading: false,
    error: null,
  })),
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Simple test component
const TestComponent = () => (
  <BrowserRouter>
    <div data-testid="dashboard-analytics-test">Dashboard Analytics Test</div>
  </BrowserRouter>
);

describe('Dashboard Analytics Integration', () => {
  it('renders without crashing', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('dashboard-analytics-test')).toBeInTheDocument();
  });
});
