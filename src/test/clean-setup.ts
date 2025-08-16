import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

import type { User } from 'firebase/auth';
import type { Order, MenuItem, Restaurant } from '../types';
import * as React from 'react';

// =================================
// 1. Mock Firebase Core
// =================================
vi.mock('../config/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
  analytics: {},
}));

// =================================
// 2. Mock Firebase Services
// =================================
// Import types for better type safety
import type { DocumentData, DocumentReference, QuerySnapshot, QueryDocumentSnapshot, Query, SnapshotMetadata } from 'firebase/firestore';

// Create a mock document snapshot with proper typing
const createMockDoc = <T = DocumentData>(id: string, data: T): QueryDocumentSnapshot<T> => {
  const doc: Partial<QueryDocumentSnapshot<T>> = {
    id,
    data: () => data,
    exists: (): this is QueryDocumentSnapshot<T> => true,
    get: (field: string) => (data as any)[field],
    ref: {
      id,
      path: `mock/path/${id}`,
      type: 'document',
      // Add other required DocumentReference properties
    } as unknown as DocumentReference<T>,
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: (_other: SnapshotMetadata) => false
    } as SnapshotMetadata,
  };
  return doc as QueryDocumentSnapshot<T>;
};

// Create a mock query snapshot with proper typing
const createMockQuerySnapshot = <T = DocumentData>(docs: QueryDocumentSnapshot<T>[]): QuerySnapshot<T> => {
  const snapshot: Partial<QuerySnapshot<T>> = {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: QueryDocumentSnapshot<T>) => void) => docs.forEach(callback),
    docChanges: () => [],
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: (_other: SnapshotMetadata) => false
    } as SnapshotMetadata,
    query: {
      // Add required Query properties
    } as unknown as Query<T>,
  };
  return snapshot as QuerySnapshot<T>;
};

// Create a deep mock of Firestore with proper types
const mockFirestore = {
  collection: vi.fn().mockReturnThis(),
  doc: vi.fn().mockImplementation((path) => ({
    id: path?.split('/').pop() || 'mock-doc',
    path: path || 'mock/path/mock-doc',
    // Add other DocumentReference methods as needed
  })),
  getDoc: vi.fn().mockResolvedValue(createMockDoc('test-doc', {})),
  getDocs: vi.fn().mockResolvedValue(createMockQuerySnapshot([])),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  addDoc: vi.fn().mockResolvedValue({
    id: 'test-doc',
    // Add other DocumentReference properties
  } as DocumentReference),
  query: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  startAfter: vi.fn().mockReturnThis(),
  endBefore: vi.fn().mockReturnThis(),
  onSnapshot: vi.fn((_ref: unknown, callback: (snapshot: QuerySnapshot) => void) => {
    if (typeof callback === 'function') {
      callback(createMockQuerySnapshot([]));
    }
    return () => {}; // Return unsubscribe function
  }),
  serverTimestamp: vi.fn().mockReturnValue(new Date()),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
      isEqual: () => true,
      valueOf: () => date.getTime(),
    })),
    now: vi.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now(),
      isEqual: () => true,
      valueOf: () => Date.now(),
    })),
  },
  // Add mock for the 'then' method to make the mock thenable
  then: vi.fn(),
};

mockFirestore.serverTimestamp.mockImplementation(() => new Date());

// Auth
// Create a proper mock user that extends the base User type
const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  metadata: {},
  phoneNumber: null,
  photoURL: null,
  providerId: 'password',
  tenantId: null,
  refreshToken: 'test-refresh-token',
  
  // Mock required User methods
  delete: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn().mockResolvedValue('test-token'),
  reload: vi.fn().mockResolvedValue(undefined),
  getIdTokenResult: vi.fn().mockResolvedValue({}),
  toJSON: vi.fn(),
  
  // Add displayName as it's commonly used but not in base User type
  displayName: 'Test User',
  
  // Add custom properties with type assertions
  ...overrides,
} as User);

let currentAuthUser: User | null = createMockUser();

let authStateSubscribers: ((user: User | null) => void)[] = [];

const mockAuth = {
  get currentUser() {
    return currentAuthUser;
  },
  onAuthStateChanged: vi.fn((callback: (user: User | null) => void) => {
    // Call immediately with current user
    callback(currentAuthUser);
    // Store the callback for later state changes
    authStateSubscribers.push(callback);
    // Return unsubscribe function
    return () => {
      authStateSubscribers = authStateSubscribers.filter(cb => cb !== callback);
    };
  }),
  signInWithEmailAndPassword: vi.fn().mockImplementation((email: string, password: string) => {
    currentAuthUser = { ...currentAuthUser, email };
    authStateSubscribers.forEach(cb => cb(currentAuthUser));
    return Promise.resolve({ user: currentAuthUser });
  }),
  signOut: vi.fn().mockImplementation(() => {
    currentAuthUser = null;
    authStateSubscribers.forEach(cb => cb(null));
    return Promise.resolve();
  }),
  createUserWithEmailAndPassword: vi.fn().mockImplementation((email: string, password: string) => {
    const newUser = { ...currentAuthUser, email, uid: `user-${Date.now()}` };
    currentAuthUser = newUser;
    authStateSubscribers.forEach(cb => cb(currentAuthUser));
    return Promise.resolve({ user: newUser });
  }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  confirmPasswordReset: vi.fn().mockResolvedValue(undefined),
  signInWithPopup: vi.fn().mockImplementation(() => {
    currentAuthUser = currentAuthUser;
    authStateSubscribers.forEach(cb => cb(currentAuthUser));
    return Promise.resolve({ user: currentAuthUser });
  }),
  signInWithRedirect: vi.fn().mockResolvedValue(undefined),
  getRedirectResult: vi.fn().mockResolvedValue({ user: currentAuthUser }),
  applyActionCode: vi.fn().mockResolvedValue(undefined),
  checkActionCode: vi.fn().mockResolvedValue({ data: { email: 'test@example.com' } }),
  verifyPasswordResetCode: vi.fn().mockResolvedValue('test@example.com'),
  // Test helper to simulate auth state changes
  _simulateAuthState(user: User | null) {
    // Use Object.defineProperty to bypass the read-only check
    Object.defineProperty(mockAuth, 'currentUser', {
      value: user,
      writable: true,
    });
    currentAuthUser = user;
    // Create a copy of subscribers to avoid issues with unsubscribing during iteration
    const subscribers = [...authStateSubscribers];
    subscribers.forEach(cb => cb(user));
  },
};

// Storage
const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
};

// =================================
// 3. Mock React Router
// =================================
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null };
const mockParams = {};

// Mock React Router components
const MockLink = ({ to, children }: { to: string; children?: React.ReactNode }) => (
  React.createElement('a', { href: to }, children)
);

const MockOutlet = () => React.createElement('div', null, 'Outlet');
const MockRoutes = ({ children }: { children?: React.ReactNode }) => 
  React.createElement('div', null, children);
const MockRoute = ({ element }: { element?: React.ReactNode }) => 
  React.createElement(React.Fragment, null, element);

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => mockParams,
  Link: MockLink,
  Navigate: () => null,
  Outlet: MockOutlet,
  Routes: MockRoutes,
  Route: MockRoute,
}));

// =================================
// 4. Mock Application Hooks
// =================================



// Extend the Window interface to include our test helpers
declare global {
  interface Window {
    testHelpers: {
      simulateAuthState: (user: User | null) => void;
      simulateFirestoreSnapshot: (collectionPath: string, data: any[]) => void;
    };
  }
}

const mockUser = createMockUser({
  email: 'test@example.com',
});

const mockRestaurant: Restaurant = {
  id: 'rest-123',
  name: 'Test Restaurant',
  description: 'A test restaurant',
  address: '123 Test St',
  phone: '123-456-7890',
  email: 'restaurant@test.com',
  isActive: true,
  ownerId: 'test-owner-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMenuItem: MenuItem = {
  id: 'item-1',
  name: 'Test Item',
  description: 'A test menu item',
  price: 9.99,
  category: 'Test Category',
  categoryId: 'cat-1',
  imageUrl: 'http://example.com/item.jpg',
  isAvailable: true,
  restaurantId: 'rest-123',
  displayOrder: 1,
  allergens: [],
  preparationTime: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrder: Order = {
  id: 'order-123',
  restaurantId: 'rest-123',
  customerName: 'Test Customer',
  customerPhone: '123-456-7890',
  items: [
    {
      id: 'order-item-1',
      name: 'Test Item',
      price: 9.99,
      quantity: 2,
      notes: '',
      specialInstructions: '',
    },
  ],
  totalPrice: 19.98,
  status: 'pending',
  orderType: 'delivery',
  deliveryAddress: '123 Test St',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// =================================
// 5. Mock Browser APIs
// =================================
// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock ResizeObserver
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  
  // Required by TypeScript
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
}

// Mock IntersectionObserver
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  
  // Required by TypeScript
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
}

// =================================
// 6. Global Test Setup
// =================================
// Add global mocks
if (typeof global !== 'undefined') {
  global.localStorage = localStorageMock as unknown as Storage;
  global.sessionStorage = sessionStorageMock as unknown as Storage;
  global.ResizeObserver = ResizeObserverStub as any;
  global.IntersectionObserver = IntersectionObserverStub as any;
}

// Setup before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Reset storage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset navigation
  mockNavigate.mockClear();
  
  // Reset auth state
  currentAuthUser = null;
  
  // Reset mock implementations
  mockFirestore.onSnapshot.mockImplementation((_ref, callback) => {
    const mockSnapshot = createMockQuerySnapshot([]);
    callback(mockSnapshot);
    return vi.fn();
  });
});

// Export test utilities
export const testUtils: {
  mockUser: User;
  mockRestaurant: Restaurant;
  mockMenuItem: MenuItem;
  mockOrder: Order;
  mockNavigate: any;
  mockLocation: any;
  mockParams: any;
  mockFirestore: any;
  mockAuth: any;
  mockStorage: any;
  simulateAuthState: (user: User | null) => void;
  simulateFirestoreSnapshot: (collectionPath: string, data: any[]) => void;
} = {
  mockUser,
  mockRestaurant,
  mockMenuItem,
  mockOrder,
  mockNavigate,
  mockLocation,
  mockParams,
  mockFirestore,
  mockAuth,
  mockStorage,
  simulateAuthState: (user: User | null) => {
    currentAuthUser = user;
    authStateSubscribers.forEach(callback => {
      callback(user);
    });
  },
  simulateFirestoreSnapshot: (_collectionPath: string, data: any[]) => {
    const docs = data.map(item => createMockDoc(item.id, item));
    const mockSnapshot = createMockQuerySnapshot(docs);
    
    mockFirestore.onSnapshot.mock.calls.forEach(([_, callback]) => {
      callback(mockSnapshot);
    });
  },
};

// Extend global type declarations
declare global {
  // eslint-disable-next-line no-var
  var testUtils: {
    mockUser: User;
    mockRestaurant: Restaurant;
    mockMenuItem: MenuItem;
    mockOrder: Order;
    mockNavigate: any;
    mockLocation: any;
    mockParams: any;
    mockFirestore: any;
    mockAuth: any;
    mockStorage: any;
    simulateAuthState: (user: User | null) => void;
    simulateFirestoreSnapshot: (collectionPath: string, data: any[]) => void;
  };
}

global.testUtils = testUtils;
