import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/dashboard/DashboardPage';
import { analyticsService } from '../../services/analyticsService';
import type { AnalyticsMetrics } from '../../types';

// Mock the analytics service
vi.mock('../../services/analyticsService', () => ({
  analyticsService: {
    subscribeToMetrics: vi.fn(),
    getMetrics: vi.fn(),
  },
}));



const mockMetrics: AnalyticsMetrics = {
  todayOrders: 12,
  todaySales: 485.75,
  pendingOrders: 3,
  weeklyOrders: 89,
  weeklySales: 2750.25,
  popularItems: [
    { name: 'Margherita Pizza', count: 15 },
    { name: 'Caesar Salad', count: 12 },
    { name: 'Grilled Chicken', count: 10 },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'order_created',
      description: 'New order from John Doe',
      timestamp: new Date('2024-01-15T14:30:00Z'),
    },
    {
      id: '2',
      type: 'order_completed',
      description: 'Order #123 completed',
      timestamp: new Date('2024-01-15T14:25:00Z'),
    },
    {
      id: '3',
      type: 'menu_updated',
      description: 'Menu item "Fish Tacos" added',
      timestamp: new Date('2024-01-15T14:20:00Z'),
    },
  ],
};

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
};

describe('Dashboard Analytics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the analytics subscription
    const mockSubscribe = vi.mocked(analyticsService.subscribeToMetrics);
    mockSubscribe.mockImplementation((callback) => {
      setTimeout(() => callback(mockMetrics), 100);
      return vi.fn(); // unsubscribe function
    });

    // Mock getMetrics for initial load
    vi.mocked(analyticsService.getMetrics).mockResolvedValue(mockMetrics);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays key metrics correctly', async () => {
    renderDashboard();

    // Wait for metrics to load
    await waitFor(() => {
      expect(screen.getByText("Today's Orders")).toBeInTheDocument();
    });

    // Check that all key metrics are displayed
    expect(screen.getByText("Today's Orders")).toBeInTheDocument();
    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText('Pending Orders')).toBeInTheDocument();

    // Check metric values
    expect(screen.getByText('12')).toBeInTheDocument(); // today's orders
    expect(screen.getByText('$485.75')).toBeInTheDocument(); // today's sales
    expect(screen.getByText('3')).toBeInTheDocument(); // pending orders
  });

  it('displays recent activity feed', async () => {
    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    // Check that activity items are displayed
    expect(screen.getByText('New order from John Doe')).toBeInTheDocument();
    expect(screen.getByText('Order #123 completed')).toBeInTheDocument();
    expect(screen.getByText('Menu item "Fish Tacos" added')).toBeInTheDocument();
  });

  it('displays popular items correctly', async () => {
    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Popular Items')).toBeInTheDocument();
    });

    // Check that popular items are displayed
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();

    // Check item counts
    expect(screen.getByText('15 orders')).toBeInTheDocument();
    expect(screen.getByText('12 orders')).toBeInTheDocument();
    expect(screen.getByText('10 orders')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock subscription to not call callback immediately
    const mockSubscribe = vi.mocked(analyticsService.subscribeToMetrics);
    mockSubscribe.mockImplementation(() => vi.fn());

    renderDashboard();

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles real-time metric updates', async () => {
    const { rerender } = renderDashboard();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument(); // initial orders count
    });

    // Simulate updated metrics
    const updatedMetrics: AnalyticsMetrics = {
      ...mockMetrics,
      todayOrders: 15,
      todaySales: 625.50,
      pendingOrders: 4,
    };

    // Mock the subscription to return updated metrics
    const mockSubscribe = vi.mocked(analyticsService.subscribeToMetrics);
    mockSubscribe.mockImplementation((callback) => {
      setTimeout(() => callback(updatedMetrics), 100);
      return vi.fn();
    });

    // Re-render to trigger the subscription update
    rerender(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    // Wait for updated values to appear
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // updated orders count
      expect(screen.getByText('$625.50')).toBeInTheDocument(); // updated sales
      expect(screen.getByText('4')).toBeInTheDocument(); // updated pending orders
    });
  });

  it('displays quick actions panel', async () => {
    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    // Check that quick action buttons are present
    expect(screen.getByText('View Orders')).toBeInTheDocument();
    expect(screen.getByText('Add Menu Item')).toBeInTheDocument();
    expect(screen.getByText('Send Notification')).toBeInTheDocument();
  });

  it('formats currency values correctly', async () => {
    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('$485.75')).toBeInTheDocument();
    });

    // Check that currency is formatted properly
    expect(screen.getByText('$485.75')).toBeInTheDocument(); // today's sales
    
    // If weekly sales are displayed
    const weeklySalesElement = screen.queryByText('$2,750.25');
    if (weeklySalesElement) {
      expect(weeklySalesElement).toBeInTheDocument();
    }
  });

  it('displays relative timestamps for activities', async () => {
    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    // Check that relative timestamps are displayed
    // These would be formatted as "X minutes ago", "X hours ago", etc.
    const timeElements = screen.getAllByText(/ago$/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('handles empty state when no data is available', async () => {
    // Mock empty metrics
    const emptyMetrics: AnalyticsMetrics = {
      todayOrders: 0,
      todaySales: 0,
      pendingOrders: 0,
      weeklyOrders: 0,
      weeklySales: 0,
      popularItems: [],
      recentActivity: [],
    };

    const mockSubscribe = vi.mocked(analyticsService.subscribeToMetrics);
    mockSubscribe.mockImplementation((callback) => {
      setTimeout(() => callback(emptyMetrics), 100);
      return vi.fn();
    });

    renderDashboard();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument(); // zero orders
    });

    // Check that zero values are displayed
    expect(screen.getByText('$0.00')).toBeInTheDocument(); // zero sales

    // Check empty states for lists
    const noActivityMessage = screen.queryByText('No recent activity');
    const noPopularItemsMessage = screen.queryByText('No popular items');
    
    // At least one of these should be present
    expect(noActivityMessage || noPopularItemsMessage).toBeTruthy();
  });

  it('subscribes to real-time updates on mount', () => {
    renderDashboard();

    // Verify that subscription was set up
    expect(analyticsService.subscribeToMetrics).toHaveBeenCalledTimes(1);
    expect(analyticsService.subscribeToMetrics).toHaveBeenCalledWith(expect.any(Function));
  });

  it('unsubscribes from updates on unmount', () => {
    const mockUnsubscribe = vi.fn();
    const mockSubscribe = vi.mocked(analyticsService.subscribeToMetrics);
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderDashboard();

    // Unmount the component
    unmount();

    // Verify that unsubscribe was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
