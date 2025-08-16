import { vi } from 'vitest';

const mockUseAuth = vi.fn().mockReturnValue({
  user: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    // Add any other required user properties here
  },
  loading: false,
  error: null,
  isAuthenticated: true,
  signIn: vi.fn(),
  signOut: vi.fn(),
  clearError: vi.fn(),
});

export default mockUseAuth;
