import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Order } from '../../types';

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    restaurantId: 'test-restaurant-id',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    items: [
      { id: 'item1', name: 'Burger', price: 12.99, quantity: 2 },
      { id: 'item2', name: 'Fries', price: 4.99, quantity: 1 },
    ],
    totalPrice: 30.97,
    status: 'pending',
    orderType: 'delivery',
    deliveryAddress: '123 Main St',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    restaurantId: 'test-restaurant-id',
    customerName: 'Jane Smith',
    customerPhone: '+1234567891',
    items: [{ id: 'item3', name: 'Pizza', price: 18.99, quantity: 1 }],
    totalPrice: 18.99,
    status: 'preparing',
    orderType: 'pickup',
    createdAt: new Date('2024-01-15T09:30:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z'),
  },
  {
    id: '3',
    restaurantId: 'test-restaurant-id',
    customerName: 'Bob Johnson',
    customerPhone: '+1234567892',
    items: [{ id: 'item4', name: 'Salad', price: 9.99, quantity: 1 }],
    totalPrice: 9.99,
    status: 'ready',
    orderType: 'pickup',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:30:00Z'),
  },
];

describe('Order Management Integration Tests', () => {
  let mockUpdateOrderStatus: ReturnType<typeof vi.fn>;
  let mockRefreshOrders: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create fresh mock functions for each test
    mockUpdateOrderStatus = vi.fn().mockResolvedValue(undefined);
    mockRefreshOrders = vi.fn().mockResolvedValue(undefined);

    // Mock the hooks with proper TypeScript support
    vi.doMock('../../hooks/useOrders', () => ({
      default: () => ({
        orders: mockOrders,
        pendingOrders: mockOrders.filter(o => o.status === 'pending'),
        preparingOrders: mockOrders.filter(o => o.status === 'preparing'),
        readyOrders: mockOrders.filter(o => o.status === 'ready'),
        completedOrders: mockOrders.filter(o => o.status === 'completed'),
        rejectedOrders: mockOrders.filter(o => o.status === 'rejected'),
        loading: false,
        error: null,
        updateOrderStatus: mockUpdateOrderStatus,
        refreshOrders: mockRefreshOrders,
        stats: {
          total: mockOrders.length,
          pending: mockOrders.filter(o => o.status === 'pending').length,
          preparing: mockOrders.filter(o => o.status === 'preparing').length,
          ready: mockOrders.filter(o => o.status === 'ready').length,
          completed: mockOrders.filter(o => o.status === 'completed').length,
          rejected: mockOrders.filter(o => o.status === 'rejected').length,
        },
      }),
    }));

    vi.doMock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        user: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          restaurantId: 'test-restaurant-id',
        },
        loading: false,
        error: null,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        clearError: vi.fn(),
      }),
    }));

    vi.doMock('../../hooks/useOrderNotifications', () => ({
      default: () => ({
        isEnabled: {
          audio: true,
          notifications: true,
        },
        enableNotifications: vi.fn(),
        testNotification: vi.fn(),
      }),
    }));

    // Mock components to avoid dependency issues
    vi.doMock('../../components', () => ({
      OrderCard: ({
        order,
        onStatusChange,
      }: {
        order: Order;
        onStatusChange: (id: string, status: string) => void;
      }) => (
        <div data-testid={`order-card-${order.id}`}>
          <h3>{order.customerName}</h3>
          <p>{order.customerPhone}</p>
          <span>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          {order.status === 'pending' && (
            <button onClick={() => onStatusChange(order.id, 'preparing')}>
              Prepare
            </button>
          )}
          {order.status === 'preparing' && (
            <button onClick={() => onStatusChange(order.id, 'ready')}>
              Ready
            </button>
          )}
          {order.status === 'ready' && (
            <button onClick={() => onStatusChange(order.id, 'completed')}>
              Complete
            </button>
          )}
        </div>
      ),
      LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
      Button: ({
        children,
        onClick,
        disabled,
        ...props
      }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        [key: string]: unknown;
      }) => (
        <button onClick={onClick} disabled={disabled} {...props}>
          {children}
        </button>
      ),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderOrdersPage = async () => {
    const { default: OrdersPage } = await import(
      '../../pages/orders/OrdersPage'
    );
    return render(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );
  };

  it('displays orders in correct columns based on status', async () => {
    await renderOrdersPage();

    // Check that orders are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Check that orders appear with correct status
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('handles order status updates correctly', async () => {
    await renderOrdersPage();

    // Find and click the "Accept" button for pending order
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    // Verify that updateOrderStatus was called
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('1', 'preparing');
  });

  it('displays loading state initially', async () => {
    // Override the mock to return loading state for this test
    vi.doMock('../../hooks/useOrders', () => ({
      default: () => ({
        orders: [],
        pendingOrders: [],
        preparingOrders: [],
        readyOrders: [],
        completedOrders: [],
        rejectedOrders: [],
        loading: true,
        error: null,
        updateOrderStatus: mockUpdateOrderStatus,
        refreshOrders: mockRefreshOrders,
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

    await renderOrdersPage();

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles order status transitions correctly', async () => {
    await renderOrdersPage();

    // Find the "Mark Ready" button for preparing order
    const markReadyButton = screen.getByText('Mark Ready');
    fireEvent.click(markReadyButton);

    // Verify that updateOrderStatus was called with correct parameters
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('2', 'ready');
  });

  it('displays order status badges correctly', async () => {
    await renderOrdersPage();

    // Check that order status badges are displayed
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('shows order customer information and phone numbers', async () => {
    await renderOrdersPage();

    // Check customer names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Check phone numbers are displayed
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('+1234567891')).toBeInTheDocument();
    expect(screen.getByText('+1234567892')).toBeInTheDocument();
  });
});
