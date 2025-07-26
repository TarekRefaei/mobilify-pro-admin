import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

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
});

// Authentication service class
class AuthService {
  private currentUser: AuthUser | null = null;
  private authStateListeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user ? mapFirebaseUser(user) : null;
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

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUser(userCredential.user);
      
      console.log('User signed in successfully:', user.email);
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
    } catch (error: any) {
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
  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';

    switch (error.code) {
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
        message = error.message || message;
    }

    return new Error(message);
  }

  // Demo login for development
  async demoLogin(): Promise<AuthUser> {
    // For demo purposes, we'll simulate a successful login
    const demoUser: AuthUser = {
      uid: 'demo-user-123',
      email: 'admin@restaurant.com',
      displayName: 'Restaurant Admin',
      photoURL: null,
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the current user state and notify listeners
    this.currentUser = demoUser;
    this.notifyAuthStateListeners();

    console.log('Demo login successful');
    return demoUser;
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
