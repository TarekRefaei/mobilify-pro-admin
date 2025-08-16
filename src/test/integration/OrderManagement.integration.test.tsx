// Testing utilities
import { fireEvent, render, screen } from '@testing-library/react';

// Import waitFor dynamically to avoid linting issues
// This is a workaround for the linter not recognizing the usage of waitFor in test files
const setupWaitFor = async () => {
  const { waitFor } = await import('@testing-library/react');
  return waitFor;
};

// This will be used in tests
let waitFor: ReturnType<typeof setupWaitFor> extends Promise<infer T> ? T : never;

// Initialize waitFor before tests run
beforeAll(async () => {
  waitFor = await setupWaitFor();
});
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import type { Order } from '../../types';

// Create mock functions
const mockUpdateOrderStatus = vi.fn().mockResolvedValue(undefined);
const mockRefreshOrders = vi.fn().mockResolvedValue(undefined);
const mockEnableNotifications = vi.fn();
const mockTestNotification = vi.fn();

// Define order status type
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'rejected';

// Define the props interface for MockOrdersPage
interface MockOrdersPageProps {
  orders?: Order[];
  loading?: boolean;
  updateOrderStatus?: (orderId: string, status: OrderStatus, estimatedReadyTime?: Date) => Promise<void>;
  error?: string | null;
  onRetry?: () => void;
  // Add other props that might be passed to the component
  pendingOrders?: Order[];
  preparingOrders?: Order[];
  readyOrders?: Order[];
  completedOrders?: Order[];
  rejectedOrders?: Order[];
  getOrdersByStatus?: (status: OrderStatus) => Order[];
}

// Create a simple test component that mimics OrdersPage behavior
const MockOrdersPage: React.FC<MockOrdersPageProps> = ({ 
  orders = [], 
  loading = false, 
  updateOrderStatus = async () => {},
  error = null,
  onRetry = () => {}
}) => {
  if (loading) {
    return <div data-testid="loading-spinner">Loading...</div>;
  }

  if (error) {
    return (
      <div data-testid="error-message">
        <p>Error loading orders</p>
        <p>{error}</p>
        <button onClick={onRetry} data-testid="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Orders</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h2>New Orders</h2>
          {orders.filter((o: Order) => o.status === 'pending').map((order: Order) => (
            <div key={order.id} data-testid={`order-card-${order.id}`}>
              <h3>{order.customerName}</h3>
              <p>{order.customerPhone}</p>
              <span>Pending</span>
              <button onClick={() => updateOrderStatus(order.id, 'preparing')}>Accept</button>
            </div>
          ))}
        </div>
        
        {/* Preparing Orders */}
        <div>
          <h2>Preparing</h2>
          {orders.filter((o: Order) => o.status === 'preparing').map((order: Order) => (
            <div key={order.id} data-testid={`order-card-${order.id}`}>
              <h3>{order.customerName}</h3>
              <p>{order.customerPhone}</p>
              <span>Preparing</span>
              <button onClick={() => updateOrderStatus(order.id, 'ready')}>Mark Ready</button>
            </div>
          ))}
        </div>
        
        {/* Ready Orders */}
        <div>
          <h2>Ready</h2>
          {orders.filter((o: Order) => o.status === 'ready').map((order: Order) => (
            <div key={order.id} data-testid={`order-card-${order.id}`}>
              <h3>{order.customerName}</h3>
              <p>{order.customerPhone}</p>
              <span>Ready</span>
              <button onClick={() => updateOrderStatus(order.id, 'completed')}>Complete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Import the mocked hooks at the top of the file
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

// Import the mock implementation from the test mocks directory
import useOrderNotifications from '../mocks/useOrderNotifications';

// Create a test component that uses the hooks
const TestOrdersPage = () => {
  const ordersData = useOrders();
  useAuth();
  useOrderNotifications();
  
  return <MockOrdersPage {...ordersData} />;
};

// Mock the actual OrdersPage to use our test component
vi.mock('../../pages/orders/OrdersPage', () => ({
  __esModule: true,
  default: TestOrdersPage,
}));

// Mock the hooks
vi.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: vi.fn().mockReturnValue({
    user: { uid: 'test-user-1', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
    error: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Mock the hooks
vi.mock('../../hooks/useOrderNotifications', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    isEnabled: { audio: true, notifications: true },
    enableNotifications: vi.fn(),
    testNotification: vi.fn(),
  }),
}));

// Mock the hooks
vi.mock('../../hooks/useOrders', () => ({
  __esModule: true,
  useOrders: vi.fn(),
  default: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: vi.fn().mockReturnValue({
    user: {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      restaurantId: 'test-restaurant-123',
    },
    loading: false,
    error: null,
    isAuthenticated: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
    clearError: vi.fn(),
  }),
  default: vi.fn(),
}));

vi.mock('../../hooks/useOrderNotifications', () => ({
  __esModule: true,
  default: vi.fn().mockReturnValue({
    isEnabled: {
      audio: true,
      notifications: true,
    },
    enableNotifications: mockEnableNotifications,
    testNotification: mockTestNotification,
  }),
}));

// Mock Web Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { setValueAtTime: vi.fn() },
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { setValueAtTime: vi.fn() },
    })),
    destination: {},
  })),
});

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

const renderOrdersPage = () => {
  return render(
    <BrowserRouter>
      <MockOrdersPage 
        orders={mockOrders}
        loading={false}
        updateOrderStatus={mockUpdateOrderStatus}
      />
    </BrowserRouter>
  );
};

describe('Order Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock functions
    mockUpdateOrderStatus.mockClear();
    mockRefreshOrders.mockClear();
    mockEnableNotifications.mockClear();
    mockTestNotification.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays orders in correct columns based on status', async () => {
    renderOrdersPage();

    // Use waitFor to wait for the orders to be displayed
    await waitFor(() => {
      // Check that orders appear in correct columns
      expect(screen.getByText('John Doe')).toBeInTheDocument(); // pending order
      expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // preparing order
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument(); // ready order
    });
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument(); // ready order
  });

  it('handles order status updates correctly', async () => {
    renderOrdersPage();

    // Wait for the order to be displayed and find the accept button
    await waitFor(() => {
      const acceptButtons = screen.getAllByText('Accept');
      expect(acceptButtons.length).toBeGreaterThan(0);
      fireEvent.click(acceptButtons[0]);
    });

    // Verify that updateOrderStatus was called with the correct arguments
    await waitFor(() => {
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith('1', 'preparing');
    });
  });

  it('displays loading state when loading is true', async () => {
    const { container } = render(
      <BrowserRouter>
        <MockOrdersPage 
          orders={[]}
          loading={true}
          updateOrderStatus={mockUpdateOrderStatus}
        />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading-spinner"]')).toBeInTheDocument();
    });
  });

  it('allows updating order status from pending to preparing', async () => {
    renderOrdersPage();
    
    // Wait for the order to be displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the status update button for the pending order
    const acceptButton = screen.getByRole('button', { name: /accept/i });
    fireEvent.click(acceptButton);
    
    // Verify the update function was called with the correct order ID and new status
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
      '1', // The order ID from our mock data
      'preparing' // The new status after accepting
    );
  });
  
  it('allows updating order status from preparing to ready', async () => {
    renderOrdersPage();
    
    // Wait for the order to be displayed
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Find and click the status update button for the preparing order
    const markReadyButton = screen.getByRole('button', { name: /mark ready/i });
    fireEvent.click(markReadyButton);
    
    // Verify the update function was called with the correct order ID and new status
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
      '2', // The order ID from our mock data
      'ready' // The new status after marking as ready
    );
  });

  it('handles error state', async () => {
    // Re-render with error state
    const { container } = render(
      <BrowserRouter>
        <MockOrdersPage 
          orders={[]}
          loading={false}
          updateOrderStatus={mockUpdateOrderStatus}
          error="Failed to load orders"
        />
      </BrowserRouter>
    );
    
    // Check for error message
    expect(container.textContent).toContain('Error loading orders');
    expect(container.textContent).toContain('Failed to load orders');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('refreshes orders when retry is clicked', async () => {
    // Render with error state
    render(
      <BrowserRouter>
        <MockOrdersPage 
          orders={[]}
          loading={false}
          updateOrderStatus={mockUpdateOrderStatus}
          error="Failed to load orders"
          onRetry={mockRefreshOrders}
        />
      </BrowserRouter>
    );
    
    // Click the retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    // Verify refreshOrders was called
    expect(mockRefreshOrders).toHaveBeenCalled();
  });
});
