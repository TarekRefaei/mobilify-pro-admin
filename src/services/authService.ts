import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { monitoring } from './monitoring';

// Use Firebase User type from the auth instance
type User = import('firebase/auth').User;

// Types for authentication
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  restaurantId: string;
}

export interface AuthServiceError {
  code: string;
  message: string;
}

// Convert Firebase User to our AuthUser type
const mapFirebaseUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  restaurantId: 'demo-restaurant-123', // Default restaurant ID for demo
});

// Authentication service class
class AuthService {
  private currentUser: AuthUser | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];
  private _isInitialized = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Check for persisted demo session first
    this.loadPersistedSession();

    // Mark as initialized immediately if we have a demo session
    if (this.currentUser) {
      this._isInitialized = true;
      console.log('🚀 Auth service initialized with demo session');
      // Notify listeners immediately
      this.notifyAuthStateListeners();
    }

    // Listen to auth state changes
    onAuthStateChanged(auth, user => {
      console.log(
        '🔥 Firebase auth state changed:',
        user ? user.email : 'null'
      );
      console.log(
        '👤 Current user before change:',
        this.currentUser ? this.currentUser.email : 'null'
      );

      if (user) {
        // Firebase user takes precedence over demo session
        this.currentUser = mapFirebaseUser(user);
        console.log('✅ Set Firebase user as current user');
      } else if (!this.currentUser) {
        // Only clear if we don't have a demo session
        this.currentUser = null;
        console.log(
          '❌ No Firebase user and no demo session, clearing current user'
        );
      } else {
        console.log('🎭 Keeping demo session, ignoring Firebase null state');
      }

      // Mark as initialized after first auth state change
      if (!this._isInitialized) {
        this._isInitialized = true;
        console.log('🚀 Auth service initialized');
      }

      console.log(
        '👤 Final current user:',
        this.currentUser ? this.currentUser.email : 'null'
      );
      this.notifyAuthStateListeners();
    });
  }

  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const { email, password } = credentials;

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Handle demo credentials
      if (email === 'admin@restaurant.com' && password === 'demo123') {
        console.log('🎭 Demo credentials detected, using demo login');
        return this.demoLogin();
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = mapFirebaseUser(userCredential.user);

      // Track successful login
      monitoring.setUser({
        id: user.uid,
        email: user.email || undefined,
        restaurantId: user.restaurantId,
      });
      monitoring.trackUserAction('login', user.uid);

      console.log('User signed in successfully:', user.email);
      return user;
    } catch (error) {
      console.error('Sign in error:', error);

      // Track login error
      monitoring.trackError(error as Error, {
        action: 'login',
        email: credentials.email,
      });

      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Clear persisted session
      this.clearPersistedSession();

      // Sign out from Firebase
      await signOut(auth);

      // Clear current user
      this.currentUser = null;
      this.notifyAuthStateListeners();

      // Track logout and clear user context
      monitoring.trackUserAction('logout');
      monitoring.clearUser();

      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if auth service is initialized
  isInitialized(): boolean {
    return this._isInitialized;
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback);

    // Call immediately with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of auth state changes
  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(callback => {
      callback(this.currentUser);
    });
  }

  // Handle Firebase auth errors
  private handleAuthError(error: unknown): Error {
    let message = 'An authentication error occurred';

    if (error instanceof Error && 'code' in error) {
      switch ((error as { code?: string }).code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        default:
          message = (error as Error).message || message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    return new Error(message);
  }

  // Demo login for development
  async demoLogin(): Promise<AuthUser> {
    console.log('🎭 Starting demo login process...');

    // For demo purposes, we'll simulate a successful login
    const demoUser: AuthUser = {
      uid: 'demo-user-123',
      email: 'admin@restaurant.com',
      displayName: 'Restaurant Admin',
      photoURL: null,
      restaurantId: 'demo-restaurant-123',
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Persist demo session
    console.log('💾 Persisting demo session...');
    this.persistDemoSession(demoUser);

    // Update the current user state and notify listeners
    this.currentUser = demoUser;
    this.notifyAuthStateListeners();

    console.log('✅ Demo login successful, user set:', demoUser.email);
    return demoUser;
  }

  // Load persisted session from localStorage
  private loadPersistedSession(): void {
    try {
      const persistedSession = localStorage.getItem('mobilify_demo_session');
      if (persistedSession) {
        const sessionData = JSON.parse(persistedSession);

        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge) {
          this.currentUser = sessionData.user;
          console.log('✅ Restored demo session:', sessionData.user.email);
        } else {
          // Session expired, clear it
          this.clearPersistedSession();
        }
      }
    } catch (error) {
      console.error('Error loading persisted session:', error);
      this.clearPersistedSession();
    }
  }

  // Persist demo session to localStorage
  private persistDemoSession(user: AuthUser): void {
    try {
      const sessionData = {
        user,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        'mobilify_demo_session',
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error('Error persisting demo session:', error);
    }
  }

  // Clear persisted session
  private clearPersistedSession(): void {
    try {
      localStorage.removeItem('mobilify_demo_session');
    } catch (error) {
      console.error('Error clearing persisted session:', error);
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
