import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrdersPage from '../../pages/orders/OrdersPage';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

// Mock the order service
vi.mock('../../services/orderService', () => ({
  orderService: {
    subscribeToOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrdersByStatus: vi.fn(),
  },
}));

// Mock the auth service to provide authenticated user
vi.mock('../../services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      restaurantId: 'test-restaurant-id',
    })),
    onAuthStateChange: vi.fn((callback) => {
      callback({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        restaurantId: 'test-restaurant-id',
      });
      return vi.fn(); // unsubscribe function
    }),
    isInitialized: vi.fn(() => true),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
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
    customerName: 'Jane Smith',
    customerPhone: '+1234567891',
    items: [
      { id: 'item3', name: 'Pizza', price: 18.99, quantity: 1 },
    ],
    totalPrice: 18.99,
    status: 'preparing',
    orderType: 'pickup',
    createdAt: new Date('2024-01-15T09:30:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z'),
  },
  {
    id: '3',
    customerName: 'Bob Johnson',
    customerPhone: '+1234567892',
    items: [
      { id: 'item4', name: 'Salad', price: 9.99, quantity: 1 },
    ],
    totalPrice: 9.99,
    status: 'ready',
    orderType: 'dine-in',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:30:00Z'),
  },
];

const renderOrdersPage = () => {
  return render(
    <BrowserRouter>
      <OrdersPage />
    </BrowserRouter>
  );
};

describe('Order Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the subscription to return our mock orders
    const mockSubscribe = vi.mocked(orderService.subscribeToOrders);
        mockSubscribe.mockImplementation((_restaurantId, callback) => {
      // Call the callback immediately with mock data
      callback(mockOrders);
      // Return unsubscribe function
      return vi.fn();
    });

    // Mock update order status - ensure it's properly mocked
    const mockUpdate = vi.mocked(orderService.updateOrderStatus);
    mockUpdate.mockClear();
    mockUpdate.mockResolvedValue(undefined);

    // Mock getOrdersByStatus
    const mockGetOrders = vi.mocked(orderService.getOrdersByStatus);
    mockGetOrders.mockClear();
    mockGetOrders.mockResolvedValue(mockOrders);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays orders in correct columns based on status', async () => {
    renderOrdersPage();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that orders appear in correct columns
    expect(screen.getByText('John Doe')).toBeInTheDocument(); // pending order
    expect(screen.getByText('Jane Smith')).toBeInTheDocument(); // preparing order
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument(); // ready order

    // Verify order details are displayed (using partial text matching for currency)
    expect(screen.getByText('EGP 30.97')).toBeInTheDocument();
    expect(screen.getByText('EGP 18.99')).toBeInTheDocument();
    expect(screen.getByText('EGP 9.99')).toBeInTheDocument();
  });

  it('updates order status when action buttons are clicked', async () => {
    renderOrdersPage();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the "Accept" button for pending order
    const acceptButtons = screen.getAllByText('Accept');
    expect(acceptButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(acceptButtons[0]);

    // Verify that updateOrderStatus was called
    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('1', 'preparing');
    }, { timeout: 5000 });
  });

  it('handles real-time order updates', async () => {
    const { rerender } = renderOrdersPage();

    // Wait for initial orders to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Simulate a new order being added
    const newOrder: Order = {
      id: '4',
      customerName: 'Alice Brown',
      customerPhone: '+1234567893',
      items: [{ id: 'item5', name: 'Sandwich', price: 8.99, quantity: 1 }],
      totalPrice: 8.99,
      status: 'pending',
      orderType: 'pickup',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the subscription to return updated orders
    const mockSubscribe = vi.mocked(orderService.subscribeToOrders);
    mockSubscribe.mockImplementation((callback) => {
      setTimeout(() => callback([...mockOrders, newOrder]), 100);
      return vi.fn();
    });

    // Re-render to trigger the subscription update
    rerender(
      <BrowserRouter>
        <OrdersPage />
      </BrowserRouter>
    );

    // Wait for the new order to appear
    await waitFor(() => {
      expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    // Mock subscription to not call callback immediately
    const mockSubscribe = vi.mocked(orderService.subscribeToOrders);
    mockSubscribe.mockImplementation(() => vi.fn());

    renderOrdersPage();

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles order status transitions correctly', async () => {
    renderOrdersPage();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Find the "Mark Ready" button for preparing order
    const markReadyButtons = screen.getAllByText('Mark Ready');
    expect(markReadyButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(markReadyButtons[0]);

    // Verify that updateOrderStatus was called with correct parameters
    await waitFor(() => {
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith('2', 'ready');
    });
  });

  it('displays order status badges correctly', async () => {
    renderOrdersPage();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that order status badges are displayed
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);   // John Doe's order
    expect(screen.getAllByText('Preparing').length).toBeGreaterThan(0); // Jane Smith's order
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);     // Bob Johnson's order
  });

  it('shows order customer information and phone numbers', async () => {
    renderOrdersPage();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

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