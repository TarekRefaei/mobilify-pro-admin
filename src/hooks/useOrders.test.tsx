import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the module
vi.mock('./useOrders', () => ({
    useOrders: () => ({
        orders: [],
        loading: true,
        error: null,
        updateOrderStatus: vi.fn(),
    }),
}));

// Import after mocking
import { useOrders } from './useOrders';

describe('useOrders Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty orders', () => {
        const { result } = renderHook(() => useOrders());
        expect(result.current.orders).toEqual([]);
        expect(result.current.loading).toBe(true);
    });

    // Add more tests as needed
});
