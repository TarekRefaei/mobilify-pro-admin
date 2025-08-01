import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../test/utils';
import { useAuth } from './useAuth';
import { createMockAuthService, createMockUser } from '../test/utils';

// Mock the auth service
vi.mock('../services/authService', () => ({
  authService: createMockAuthService(),
}));

describe('useAuth Hook', () => {
  const mockAuthService = createMockAuthService();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockAuthService.getCurrentUser.mockReturnValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.isInitialized.mockReturnValue(true);
    mockAuthService.subscribeToAuthChanges.mockReturnValue(() => {});
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns authenticated user when logged in', () => {
    const mockUser = createMockUser();
    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles sign in successfully', async () => {
    const mockUser = createMockUser();
    mockAuthService.signIn.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.error).toBeNull();
  });

  it('handles sign in error', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.signIn.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('test@example.com', 'wrongpassword');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('handles sign out successfully', async () => {
    mockAuthService.signOut.mockResolvedValue();

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthService.signOut).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('handles sign out error', async () => {
    const errorMessage = 'Sign out failed';
    mockAuthService.signOut.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('shows loading state during sign in', async () => {
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    mockAuthService.signIn.mockReturnValue(signInPromise);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn('test@example.com', 'password123');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSignIn!(createMockUser());
      await signInPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('shows loading state during sign out', async () => {
    let resolveSignOut: () => void;
    const signOutPromise = new Promise<void>((resolve) => {
      resolveSignOut = resolve;
    });
    mockAuthService.signOut.mockReturnValue(signOutPromise);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signOut();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveSignOut!();
      await signOutPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('subscribes to auth changes on mount', () => {
    renderHook(() => useAuth());

    expect(mockAuthService.subscribeToAuthChanges).toHaveBeenCalled();
  });

  it('unsubscribes from auth changes on unmount', () => {
    const unsubscribe = vi.fn();
    mockAuthService.subscribeToAuthChanges.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('updates state when auth changes', () => {
    let authChangeCallback: (user: any) => void;
    mockAuthService.subscribeToAuthChanges.mockImplementation((callback) => {
      authChangeCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useAuth());

    const mockUser = createMockUser();
    
    act(() => {
      authChangeCallback(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears error on successful operations', async () => {
    const { result } = renderHook(() => useAuth());

    // First, set an error
    mockAuthService.signIn.mockRejectedValue(new Error('First error'));
    await act(async () => {
      await result.current.signIn('test@example.com', 'wrongpassword');
    });
    expect(result.current.error).toBe('First error');

    // Then, perform successful operation
    mockAuthService.signIn.mockResolvedValue(createMockUser());
    await act(async () => {
      await result.current.signIn('test@example.com', 'correctpassword');
    });
    expect(result.current.error).toBeNull();
  });

  it('handles auth service initialization', () => {
    mockAuthService.isInitialized.mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
  });

  it('provides correct authentication status', () => {
    // Test unauthenticated state
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockReturnValue(null);

    const { result, rerender } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);

    // Test authenticated state
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getCurrentUser.mockReturnValue(createMockUser());

    rerender();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
