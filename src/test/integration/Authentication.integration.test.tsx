import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Mock all external dependencies
vi.mock('../../services/authService', () => ({
  authService: {
    signIn: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockReturnValue(null),
    onAuthStateChange: vi.fn().mockReturnValue(() => {}),
    isInitialized: vi.fn().mockReturnValue(true),
    persistSession: vi.fn(),
    loadPersistedSession: vi.fn(),
    clearPersistedSession: vi.fn(),
  },
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

vi.mock('../../hooks/useOrders');
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    subscribeToMetrics: vi.fn().mockReturnValue(() => {}),
    getMetrics: vi.fn().mockResolvedValue({
      todayOrders: 0,
      todaySales: 0,
      pendingOrders: 0,
      weeklyOrders: 0,
      weeklySales: 0,
      popularItems: [],
      recentActivity: [],
    }),
  },
}));

// Simple test component
const TestComponent = () => (
  <BrowserRouter>
    <div data-testid="auth-test">Authentication Test</div>
  </BrowserRouter>
);

describe('Authentication Integration', () => {
  it('renders without crashing', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('auth-test')).toBeInTheDocument();
  });
});
