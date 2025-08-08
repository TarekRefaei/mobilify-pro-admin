import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/auth/LoginPage';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import ProtectedRoute from '../../components/ProtectedRoute';
import { authService } from '../mocks/authService';
import type { User } from '../../types';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  authService: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    onAuthStateChanged: vi.fn(),
    isInitialized: vi.fn(),
    persistSession: vi.fn(),
    loadPersistedSession: vi.fn(),
    clearPersistedSession: vi.fn(),
  },
}));

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Mock analytics service for dashboard
vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    subscribeToMetrics: vi.fn(),
    getMetrics: vi.fn(),
  },
}));

const mockUser: User = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  restaurantId: 'test-restaurant',
};

const TestApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Default auth service mocks
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);
    vi.mocked(authService.isInitialized).mockReturnValue(true);
    vi.mocked(authService.onAuthStateChanged).mockImplementation(callback => {
      // Simulate no user initially
      setTimeout(() => callback(null), 100);
      return vi.fn(); // unsubscribe function
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated users to login page', async () => {
    // Mock no authenticated user
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(<TestApp />);

    // Navigate to protected route
    window.history.pushState({}, '', '/dashboard');

    // Should redirect to login
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('allows authenticated users to access protected routes', async () => {
    // Mock authenticated user
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
    vi.mocked(authService.onAuthStateChanged).mockImplementation(callback => {
      setTimeout(() => callback(mockUser), 100);
      return vi.fn();
    });

    // Mock analytics service for dashboard
    const mockAnalyticsService = await import(
      '../../services/analyticsService'
    );
    vi.mocked(
      mockAnalyticsService.analyticsService.subscribeToMetrics
    ).mockImplementation(callback => {
      setTimeout(
        () =>
          callback({
            todayOrders: 5,
            todaySales: 150.75,
            pendingOrders: 2,
            weeklyOrders: 35,
            weeklySales: 1250.5,
            popularItems: [],
            recentActivity: [],
          }),
        100
      );
      return vi.fn();
    });

    render(<TestApp />);

    // Navigate to protected route
    window.history.pushState({}, '', '/dashboard');

    // Should show dashboard content
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('handles successful login flow', async () => {
    // Mock successful sign in
    vi.mocked(authService.signIn).mockResolvedValue(mockUser);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(<TestApp />);

    // Navigate to login page
    window.history.pushState({}, '', '/login');

    // Wait for login form to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    // Fill in login form
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(signInButton);

    // Verify sign in was called
    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  it('handles login errors correctly', async () => {
    // Mock failed sign in
    vi.mocked(authService.signIn).mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(<TestApp />);

    // Navigate to login page
    window.history.pushState({}, '', '/login');

    // Wait for login form to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    // Fill in login form with invalid credentials
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit form
    fireEvent.click(signInButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('handles remember me functionality', async () => {
    // Mock successful sign in
    vi.mocked(authService.signIn).mockResolvedValue(mockUser);
    vi.mocked(authService.persistSession).mockResolvedValue(undefined);

    render(<TestApp />);

    // Navigate to login page
    window.history.pushState({}, '', '/login');

    // Wait for login form to appear
    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    // Fill in login form and check remember me
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(rememberMeCheckbox);

    // Submit form
    fireEvent.click(signInButton);

    // Verify credentials were persisted
    await waitFor(() => {
      expect(authService.persistSession).toHaveBeenCalled();
    });
  });

  it('loads persisted credentials on page load', async () => {
    // Mock persisted credentials
    vi.mocked(authService.loadPersistedSession).mockResolvedValue({
      email: 'test@example.com',
      password: 'password123',
    });

    render(<TestApp />);

    // Navigate to login page
    window.history.pushState({}, '', '/login');

    // Wait for form to load with persisted values
    await waitFor(() => {
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput.value).toBe('test@example.com');
    });

    // Remember me should be checked
    const rememberMeCheckbox = screen.getByLabelText(
      'Remember me'
    ) as HTMLInputElement;
    expect(rememberMeCheckbox.checked).toBe(true);
  });

  it('handles logout flow correctly', async () => {
    // Start with authenticated user
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);
    vi.mocked(authService.signOut).mockResolvedValue(undefined);
    vi.mocked(authService.clearPersistedSession).mockResolvedValue(undefined);

    // Mock analytics service for dashboard
    const mockAnalyticsService = await import(
      '../../services/analyticsService'
    );
    vi.mocked(
      mockAnalyticsService.analyticsService.subscribeToMetrics
    ).mockImplementation(callback => {
      setTimeout(
        () =>
          callback({
            todayOrders: 5,
            todaySales: 150.75,
            pendingOrders: 2,
            weeklyOrders: 35,
            weeklySales: 1250.5,
            popularItems: [],
            recentActivity: [],
          }),
        100
      );
      return vi.fn();
    });

    render(<TestApp />);

    // Navigate to dashboard
    window.history.pushState({}, '', '/dashboard');

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Find and click logout button (assuming it exists in the layout)
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Verify sign out was called
    await waitFor(() => {
      expect(authService.signOut).toHaveBeenCalled();
      expect(authService.clearPersistedSession).toHaveBeenCalled();
    });
  });

  it('shows loading state during authentication check', () => {
    // Mock auth service as not initialized
    vi.mocked(authService.isInitialized).mockReturnValue(false);

    render(<TestApp />);

    // Navigate to protected route
    window.history.pushState({}, '', '/dashboard');

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles auth state changes correctly', async () => {
    let authCallback: ((user: User | null) => void) | null = null;

    // Mock auth state change listener
    vi.mocked(authService.onAuthStateChanged).mockImplementation(callback => {
      authCallback = callback;
      return vi.fn();
    });

    render(<TestApp />);

    // Navigate to protected route
    window.history.pushState({}, '', '/dashboard');

    // Initially should redirect to login
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    // Simulate user authentication
    if (authCallback) {
      authCallback(mockUser);
    }

    // Mock analytics service for dashboard
    const mockAnalyticsService = await import(
      '../../services/analyticsService'
    );
    vi.mocked(
      mockAnalyticsService.analyticsService.subscribeToMetrics
    ).mockImplementation(callback => {
      setTimeout(
        () =>
          callback({
            todayOrders: 5,
            todaySales: 150.75,
            pendingOrders: 2,
            weeklyOrders: 35,
            weeklySales: 1250.5,
            popularItems: [],
            recentActivity: [],
          }),
        100
      );
      return vi.fn();
    });

    // Should now show dashboard
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
