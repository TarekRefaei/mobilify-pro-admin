import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  capitalize,
  cn,
  debounce,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  generateId,
  getOrderStatusColor,
  getOrderStatusText,
  isValidEgyptianPhone,
  isValidEmail,
  storage,
  timeAgo,
  truncateText,
} from './index';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency in Egyptian Pounds', () => {
      const result = formatCurrency(100);
      expect(result).toContain('ج.م.'); // Egyptian Pound symbol
      expect(typeof result).toBe('string');
    });

    it('handles zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toContain('ج.م.');
      expect(typeof result).toBe('string');
    });

    it('handles negative amounts', () => {
      const result = formatCurrency(-50);
      expect(result).toContain('-');
      expect(result).toContain('ج.م.');
    });

    it('handles decimal amounts', () => {
      const result = formatCurrency(123.45);
      expect(result).toContain('ج.م.');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/15/);
      expect(result).toMatch(/2024/);
    });

    it('handles different months', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date);
      expect(result).toMatch(/Dec/);
    });
  });

  describe('formatTime', () => {
    it('formats time with AM/PM', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatTime(date);
      expect(result).toMatch(/PM|AM/);
      expect(result).toMatch(/:/);
    });

    it('handles midnight', () => {
      const date = new Date('2024-01-15T00:00:00');
      const result = formatTime(date);
      expect(result).toMatch(/12:00/);
      expect(result).toMatch(/AM/);
    });
  });

  describe('formatDateTime', () => {
    it('combines date and time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/at/);
      expect(result).toMatch(/PM|AM/);
    });
  });

  describe('timeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for recent times', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(timeAgo(recent)).toBe('Just now');
    });

    it('returns minutes ago', () => {
      const now = new Date();
      const minutes = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(timeAgo(minutes)).toBe('5 minutes ago');
    });

    it('returns singular minute', () => {
      const now = new Date();
      const minute = new Date(now.getTime() - 60 * 1000); // 1 minute ago
      expect(timeAgo(minute)).toBe('1 minute ago');
    });

    it('returns hours ago', () => {
      const now = new Date();
      const hours = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(timeAgo(hours)).toBe('3 hours ago');
    });

    it('returns days ago', () => {
      const now = new Date();
      const days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      expect(timeAgo(days)).toBe('2 days ago');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test.example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidEgyptianPhone', () => {
    it('validates correct Egyptian phone numbers', () => {
      expect(isValidEgyptianPhone('+201234567890')).toBe(true);
      expect(isValidEgyptianPhone('+201098765432')).toBe(true);
    });

    it('rejects invalid Egyptian phone numbers', () => {
      expect(isValidEgyptianPhone('01234567890')).toBe(false);
      expect(isValidEgyptianPhone('+2012345678')).toBe(false);
      expect(isValidEgyptianPhone('+20123456789012')).toBe(false);
      expect(isValidEgyptianPhone('+1234567890')).toBe(false);
      expect(isValidEgyptianPhone('')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('generates alphanumeric IDs', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('does not change other letters', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateText(longText, 20);
      expect(result).toBe('This is a very long ...');
      expect(result.length).toBe(23); // 20 + '...'
    });

    it('does not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);
      expect(result).toBe('Short text');
    });

    it('handles exact length', () => {
      const text = 'Exactly twenty chars';
      const result = truncateText(text, 20);
      expect(result).toBe('Exactly twenty chars');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('cn (className utility)', () => {
    it('joins valid class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('filters out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, false, 'class3')).toBe(
        'class1 class2 class3'
      );
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });
  });

  describe('getOrderStatusColor', () => {
    it('returns correct colors for each status', () => {
      expect(getOrderStatusColor('pending')).toBe(
        'bg-yellow-100 text-yellow-800'
      );
      expect(getOrderStatusColor('preparing')).toBe(
        'bg-blue-100 text-blue-800'
      );
      expect(getOrderStatusColor('ready')).toBe('bg-green-100 text-green-800');
      expect(getOrderStatusColor('completed')).toBe(
        'bg-gray-100 text-gray-800'
      );
      expect(getOrderStatusColor('rejected')).toBe('bg-red-100 text-red-800');
    });

    it('returns default color for unknown status', () => {
      expect(getOrderStatusColor('unknown' as string)).toBe(
        'bg-gray-100 text-gray-800'
      );
    });
  });

  describe('getOrderStatusText', () => {
    it('returns correct text for each status', () => {
      expect(getOrderStatusText('pending')).toBe('New Order');
      expect(getOrderStatusText('preparing')).toBe('In Progress');
      expect(getOrderStatusText('ready')).toBe('Ready');
      expect(getOrderStatusText('completed')).toBe('Completed');
      expect(getOrderStatusText('rejected')).toBe('Rejected');
    });

    it('returns original status for unknown status', () => {
      expect(getOrderStatusText('unknown' as string)).toBe('unknown');
    });
  });

  describe('storage', () => {
    beforeEach(() => {
      // Clear the mock localStorage
      const mockLocalStorage = window.localStorage as Partial<Storage> & {
        _storage?: Record<string, string>;
        getItem: vi.MockInstance;
        setItem: vi.MockInstance;
        removeItem: vi.MockInstance;
        clear: vi.MockInstance;
      };
      mockLocalStorage.getItem.mockClear();
      mockLocalStorage.setItem.mockClear();
      mockLocalStorage.removeItem.mockClear();
      mockLocalStorage.clear.mockClear();
    });

    it('stores and retrieves data', () => {
      const data = { test: 'value' };
      const mockLocalStorage = window.localStorage as Partial<Storage> & {
        _storage?: Record<string, string>;
        getItem: vi.MockInstance;
        setItem: vi.MockInstance;
        removeItem: vi.MockInstance;
        clear: vi.MockInstance;
      };

      // Mock the localStorage behavior
      mockLocalStorage.setItem.mockImplementation(
        (key: string, value: string) => {
          mockLocalStorage._storage = mockLocalStorage._storage || {};
          mockLocalStorage._storage[key] = value;
        }
      );

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        return mockLocalStorage._storage?.[key] || null;
      });

      storage.set('test-key', data);
      expect(storage.get('test-key')).toEqual(data);
    });

    it('returns null for non-existent keys', () => {
      const mockLocalStorage = window.localStorage as Partial<Storage> & {
        getItem: vi.MockInstance;
      };
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(storage.get('non-existent')).toBeNull();
    });

    it('removes data', () => {
      const mockLocalStorage = window.localStorage as Partial<Storage> & {
        _storage?: Record<string, string>;
        getItem: vi.MockInstance;
        removeItem: vi.MockInstance;
      };
      mockLocalStorage._storage = { 'test-key': JSON.stringify('value') };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        return mockLocalStorage._storage?.[key] || null;
      });

      mockLocalStorage.removeItem.mockImplementation((key: string) => {
        if (mockLocalStorage._storage) {
          delete mockLocalStorage._storage[key];
        }
      });

      storage.remove('test-key');
      expect(storage.get('test-key')).toBeNull();
    });

    it('handles invalid JSON gracefully', () => {
      const mockLocalStorage = window.localStorage as Partial<Storage> & {
        getItem: vi.MockInstance;
      };
      mockLocalStorage.getItem.mockReturnValue('invalid{json');
      expect(storage.get('invalid-json')).toBeNull();
    });
  });
});
