import { vi } from 'vitest';

const useAuth = vi.fn(() => ({
  user: {
    uid: 'test-user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    restaurantId: 'rest-1',
  },
  loading: false,
  error: null,
  isInitialized: true,
  isAuthenticated: true,
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

export default useAuth;
export { useAuth };
// For Vitest compatibility, also export as named property on default
(useAuth as typeof useAuth & { useAuth: typeof useAuth }).useAuth = useAuth;
