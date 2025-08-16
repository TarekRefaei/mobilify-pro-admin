import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

import type { User } from 'firebase/auth';
import * as React from 'react';
import type { MenuItem, Order, Restaurant } from '../types';

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
import type {
  DocumentData,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotMetadata,
} from 'firebase/firestore';

// Create a mock document snapshot with proper typing
const createMockDoc = <T = DocumentData>(
  id: string,
  data: T
): QueryDocumentSnapshot<T> => {
  const doc: Partial<QueryDocumentSnapshot<T>> = {
    id,
    data: () => data,
    exists: (): this is QueryDocumentSnapshot<T> => true,
    get: (field: string) => (data as Record<string, unknown>)[field],
    ref: {
      id,
      path: `mock/path/${id}`,
      type: 'document',
      // Add other required DocumentReference properties
    } as unknown as DocumentReference<T>,
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: (_other: SnapshotMetadata) => false,
    } as SnapshotMetadata,
  };
  return doc as QueryDocumentSnapshot<T>;
};

// Create a mock query snapshot with proper typing
const createMockQuerySnapshot = <T = DocumentData>(
  docs: QueryDocumentSnapshot<T>[]
): QuerySnapshot<T> => {
  const snapshot: Partial<QuerySnapshot<T>> = {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (callback: (doc: QueryDocumentSnapshot<T>) => void) =>
      docs.forEach(callback),
    docChanges: () => [],
    metadata: {
      hasPendingWrites: false,
      fromCache: false,
      isEqual: (_other: SnapshotMetadata) => false,
    } as SnapshotMetadata,
    query: {
      // Add required Query properties
    } as unknown as Query<T>,
  };
  return snapshot as QuerySnapshot<T>;
};

// Create a deep mock of Firestore with proper types
const mockFirestore: Record<string, unknown> = {
  collection: vi.fn().mockReturnThis(),
  doc: vi.fn().mockImplementation(path => ({
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
  onSnapshot: vi.fn(
    (_ref: unknown, callback: (snapshot: QuerySnapshot) => void) => {
      if (typeof callback === 'function') {
        callback(createMockQuerySnapshot([]));
      }
      return () => {}; // Return unsubscribe function
    }
  ),
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

(
  mockFirestore.serverTimestamp as {
    mockImplementation: (fn: () => Date) => void;
  }
).mockImplementation(() => new Date());

// Auth
// Create a proper mock user that extends the base User type
const createMockUser = (email: string, _password: string) =>
  ({
    uid: 'test-user-123',
    email,
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
  }) as User;

let currentAuthUser: User | null = createMockUser('test@example.com', '');

// let currentAuthUser: User | null = createMockUser();

let authStateSubscribers: ((user: User | null) => void)[] = [];

const mockAuth: Record<string, unknown> = {
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
  signInWithEmailAndPassword: vi
    .fn()
    .mockImplementation((email: string, _password: string) => {
      if (currentAuthUser) {
        currentAuthUser = {
          ...currentAuthUser,
          email,
          emailVerified: currentAuthUser.emailVerified ?? true,
          isAnonymous: currentAuthUser.isAnonymous ?? false,
          providerData: currentAuthUser.providerData ?? [],
          metadata: currentAuthUser.metadata ?? {},
          phoneNumber: currentAuthUser.phoneNumber ?? null,
          photoURL: currentAuthUser.photoURL ?? null,
          providerId: currentAuthUser.providerId ?? 'password',
          tenantId: currentAuthUser.tenantId ?? null,
          refreshToken: currentAuthUser.refreshToken ?? 'test-refresh-token',
          delete: currentAuthUser.delete,
          getIdToken: currentAuthUser.getIdToken,
          reload: currentAuthUser.reload,
          getIdTokenResult: currentAuthUser.getIdTokenResult,
          toJSON: currentAuthUser.toJSON,
          displayName: currentAuthUser.displayName ?? 'Test User',
          uid: currentAuthUser.uid ?? 'test-user-123',
        };
      }
      authStateSubscribers.forEach(cb => cb(currentAuthUser));
      return Promise.resolve({ user: currentAuthUser });
    }),
  signOut: vi.fn().mockImplementation(() => {
    currentAuthUser = null;
    authStateSubscribers.forEach(cb => cb(null));
    return Promise.resolve();
  }),
  createUserWithEmailAndPassword: vi
    .fn()
    .mockImplementation((email: string, _password: string) => {
      const newUser: User = {
        ...currentAuthUser!,
        email,
        uid: `user-${Date.now()}`,
        emailVerified: true,
        isAnonymous: false,
        providerData: [],
        metadata: {},
        phoneNumber: null,
        photoURL: null,
        providerId: 'password',
        tenantId: null,
        refreshToken: 'test-refresh-token',
        delete: vi.fn().mockResolvedValue(undefined),
        getIdToken: vi.fn().mockResolvedValue('test-token'),
        reload: vi.fn().mockResolvedValue(undefined),
        getIdTokenResult: vi.fn().mockResolvedValue({}),
        toJSON: vi.fn(),
        displayName: 'Test User',
      };
      currentAuthUser = newUser;
      authStateSubscribers.forEach(cb => cb(currentAuthUser));
      return Promise.resolve({ user: newUser });
    }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  confirmPasswordReset: vi.fn().mockResolvedValue(undefined),
  signInWithPopup: vi.fn().mockImplementation(() => {
    authStateSubscribers.forEach(cb => cb(currentAuthUser));
    return Promise.resolve({ user: currentAuthUser });
  }),
  signInWithRedirect: vi.fn().mockResolvedValue(undefined),
  getRedirectResult: vi.fn().mockResolvedValue({ user: currentAuthUser }),
  applyActionCode: vi.fn().mockResolvedValue(undefined),
  checkActionCode: vi
    .fn()
    .mockResolvedValue({ data: { email: 'test@example.com' } }),
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
const mockStorage: Record<string, unknown> = {
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
const mockParams: Record<string, unknown> = {};

// Mock React Router components
const MockLink = ({
  to,
  children,
}: {
  to: string;
  children?: React.ReactNode;
}) => React.createElement('a', { href: to }, children);

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

// Storage
const mockStorage: Record<string, unknown> = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
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
const ResizeObserverStub = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
const IntersectionObserverStub = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// =================================
// 6. Global Test Setup
// =================================
// Add global mocks
if (typeof global !== 'undefined') {
  global.localStorage = localStorageMock as unknown as Storage;
  global.sessionStorage = sessionStorageMock as unknown as Storage;
  global.ResizeObserver = ResizeObserverStub;
  global.IntersectionObserver = IntersectionObserverStub;
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
  (
    mockFirestore.onSnapshot as {
      mockImplementation: (
        fn: (_ref: unknown, callback: unknown) => unknown
      ) => void;
    }
  ).mockImplementation((_ref: unknown, callback: unknown) => {
    const mockSnapshot = createMockQuerySnapshot([]);
    if (typeof callback === 'function') {
      (callback as (snapshot: QuerySnapshot) => void)(mockSnapshot);
    }
    return vi.fn();
  });
});

// Export test utilities
export const testUtils: {
  mockUser: User;
  mockRestaurant: Restaurant;
  mockMenuItem: MenuItem;
  mockOrder: Order;
  mockNavigate: unknown;
  mockLocation: unknown;
  mockParams: Record<string, unknown>;
  mockFirestore: Record<string, unknown>;
  mockAuth: Record<string, unknown>;
  mockStorage: Record<string, unknown>;
  simulateAuthState: (user: User | null) => void;
  simulateFirestoreSnapshot: (collectionPath: string, data: unknown[]) => void;
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
  simulateFirestoreSnapshot: (_collectionPath: string, data: unknown[]) => {
    const docs = (data as Array<{ id: string }>).map(item =>
      createMockDoc(item.id, item)
    );
    const mockSnapshot = createMockQuerySnapshot(docs);
    (
      mockFirestore.onSnapshot as { mock: { calls: Array<[unknown, unknown]> } }
    ).mock.calls.forEach(([_unused, callback]) => {
      if (typeof callback === 'function') {
        (callback as (snapshot: QuerySnapshot) => void)(mockSnapshot);
      }
    });
  },
};

// Extend global type declarations
declare global {
  var testUtils: {
    mockUser: User;
    mockRestaurant: Restaurant;
    mockMenuItem: MenuItem;
    mockOrder: Order;
    mockNavigate: unknown;
    mockLocation: unknown;
    mockParams: Record<string, unknown>;
    mockFirestore: Record<string, unknown>;
    mockAuth: Record<string, unknown>;
    mockStorage: Record<string, unknown>;
    simulateAuthState: (user: User | null) => void;
    simulateFirestoreSnapshot: (
      collectionPath: string,
      data: unknown[]
    ) => void;
  };
}

global.testUtils = testUtils;
