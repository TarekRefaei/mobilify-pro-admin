import { vi } from 'vitest';

// Mock user data
export const mockUser = {
  uid: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  restaurantId: 'test-restaurant',
  emailVerified: true,
};

// Mock implementation
export const useAuth = vi.fn(() => ({
  user: mockUser,
  loading: false,
  error: null,
  isAuthenticated: true,
  signIn: vi.fn().mockResolvedValue({ user: mockUser }),
  signOut: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
}));

export default useAuth;
