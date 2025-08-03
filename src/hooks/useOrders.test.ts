import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../test/utils';
import { useOrders } from './useOrders';
import { createMockOrder, createMockOrderService } from '../test/utils';
import { authService } from '../test/mocks/authService';

// Mock the order service
const mockOrderService = createMockOrderService();
vi.mock('../services/orderService', () => ({
  orderService: mockOrderService,
}));

// Mock the auth service
vi.mock('../services/authService', () => authService);

describe('useOrders Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback([]);
      return () => {};
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useOrders());

    expect(result.current.orders).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.stats).toEqual({
      todayOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
    });
  });

  it('loads orders from service', () => {
    const mockOrders = [
      createMockOrder({ id: '1', status: 'pending' }),
      createMockOrder({ id: '2', status: 'completed' }),
    ];

    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback(mockOrders);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    expect(result.current.orders).toEqual(mockOrders);
    expect(result.current.loading).toBe(false);
  });

  it('calculates stats correctly', () => {
    const today = new Date();
    const mockOrders = [
      createMockOrder({ 
        id: '1', 
        status: 'pending', 
        totalPrice: 25.99,
        createdAt: today 
      }),
      createMockOrder({ 
        id: '2', 
        status: 'completed', 
        totalPrice: 15.50,
        createdAt: today 
      }),
      createMockOrder({ 
        id: '3', 
        status: 'completed', 
        totalPrice: 30.00,
        createdAt: new Date(Date.now() - 86400000) // Yesterday
      }),
    ];

    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback(mockOrders);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    expect(result.current.stats.todayOrders).toBe(2);
    expect(result.current.stats.pendingOrders).toBe(1);
    expect(result.current.stats.completedOrders).toBe(2);
    expect(result.current.stats.totalRevenue).toBe(71.49);
  });

  it('updates order status successfully', async () => {

    mockOrderService.updateOrderStatus.mockResolvedValue();

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.updateOrderStatus('1', 'preparing');
    });

    expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('1', 'preparing');
    expect(result.current.error).toBeNull();
  });

  it('handles update order status error', async () => {
    const errorMessage = 'Failed to update order';
    mockOrderService.updateOrderStatus.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.updateOrderStatus('1', 'preparing');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('gets order by id', () => {
    const mockOrders = [
      createMockOrder({ id: '1', customerName: 'John Doe' }),
      createMockOrder({ id: '2', customerName: 'Jane Smith' }),
    ];

    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback(mockOrders);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    const order = result.current.getOrderById('1');
    expect(order).toEqual(mockOrders[0]);
    expect(order?.customerName).toBe('John Doe');
  });

  it('returns undefined for non-existent order id', () => {
    const { result } = renderHook(() => useOrders());

    const order = result.current.getOrderById('non-existent');
    expect(order).toBeUndefined();
  });

  it('filters orders by status', () => {
    const mockOrders = [
      createMockOrder({ id: '1', status: 'pending' }),
      createMockOrder({ id: '2', status: 'preparing' }),
      createMockOrder({ id: '3', status: 'pending' }),
      createMockOrder({ id: '4', status: 'completed' }),
    ];

    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback(mockOrders);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    const pendingOrders = result.current.getOrdersByStatus('pending');
    expect(pendingOrders).toHaveLength(2);
    expect(pendingOrders.every(order => order.status === 'pending')).toBe(true);
  });

  it('subscribes to orders on mount', () => {
    renderHook(() => useOrders());

    expect(mockOrderService.subscribeToOrders).toHaveBeenCalled();
  });

  it('unsubscribes from orders on unmount', () => {
    const unsubscribe = vi.fn();
    mockOrderService.subscribeToOrders.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useOrders());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('handles subscription errors', () => {
    const errorMessage = 'Subscription failed';
    mockOrderService.subscribeToOrders.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { result } = renderHook(() => useOrders());

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('refreshes orders data', async () => {
    const { result } = renderHook(() => useOrders());

    await act(async () => {
      result.current.refreshOrders();
    });

    // Should trigger a new subscription
    expect(mockOrderService.subscribeToOrders).toHaveBeenCalledTimes(2);
  });

  it('calculates today revenue correctly', () => {
    const today = new Date();
    const mockOrders = [
      createMockOrder({ 
        totalPrice: 25.99,
        createdAt: today,
        status: 'completed'
      }),
      createMockOrder({ 
        totalPrice: 15.50,
        createdAt: today,
        status: 'completed'
      }),
      createMockOrder({ 
        totalPrice: 30.00,
        createdAt: today,
        status: 'pending' // Should not count towards revenue
      }),
    ];

    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback(mockOrders);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    expect(result.current.stats.totalRevenue).toBe(41.49);
  });

  it('handles empty orders list', () => {
    mockOrderService.subscribeToOrders.mockImplementation((callback) => {
      callback([]);
      return () => {};
    });

    const { result } = renderHook(() => useOrders());

    expect(result.current.orders).toEqual([]);
    expect(result.current.stats.todayOrders).toBe(0);
    expect(result.current.stats.pendingOrders).toBe(0);
    expect(result.current.stats.completedOrders).toBe(0);
    expect(result.current.stats.totalRevenue).toBe(0);
  });
});
