import { useState, useEffect } from 'react';
import { authService, type AuthUser, type LoginCredentials } from '../services';

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(!authService.isInitialized());
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    console.log('🎣 useAuth: Setting up auth state subscription');
    console.log('🎣 useAuth: Initial state - user:', user?.email || 'null', 'loading:', loading);

    const unsubscribe = authService.onAuthStateChange((authUser) => {
      console.log('🎣 useAuth: Auth state changed to:', authUser?.email || 'null');
      setUser(authUser);

      // Only set loading to false when auth service is initialized
      if (authService.isInitialized()) {
        console.log('🎣 useAuth: Auth service initialized, setting loading to false');
        setLoading(false);
      }
    });

    // Check if already initialized
    if (authService.isInitialized()) {
      console.log('🎣 useAuth: Auth service already initialized, setting loading to false');
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  // Sign in function
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.signIn(credentials);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    clearError,
  };
};

export default useAuth;
