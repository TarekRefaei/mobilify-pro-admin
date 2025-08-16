// Import testing library matchers
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { MenuItem, Order, Restaurant } from '../types';

// Make renderHook available globally for tests
global.renderHook = renderHook;

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
// Firestore
const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn((ref, callback) => {
    // Simulate real-time updates
    const unsubscribe = vi.fn();
    // Call immediately with empty data
    callback({ docs: [] });
    return unsubscribe;
  }),
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
    })),
    now: vi.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now(),
    })),
  },
};

// Auth
const mockAuth = {
  currentUser: {
    uid: 'test-user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdToken: vi.fn().mockResolvedValue('test-token'),
  } as unknown as User,
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((callback) => {
    // Ensure callback is a function before calling it
    if (typeof callback === 'function') {
      // Simulate authenticated user
      callback(mockAuth.currentUser);
    }
    return vi.fn();
  }),
  createUserWithEmailAndPassword: vi.fn(),
};

// Storage
const mockStorage = {
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
};

// Export mock instances
export const mockFirestoreInstance = mockDeep<typeof mockFirestore>();
export const mockAuthInstance = mockDeep<typeof mockAuth>();
export const mockStorageInstance = mockDeep<typeof mockStorage>();

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  ...mockFirestore,
  getFirestore: vi.fn(() => mockFirestoreInstance),
  collection: vi.fn((...args) => {
    console.log('Collection called with:', args);
    return `collection/${args[1] || 'default'}`;
  }),
  doc: vi.fn((...args) => `doc/${args[1] || 'default'}`),
}));

vi.mock('firebase/auth', () => ({
  ...mockAuth,
  getAuth: vi.fn(() => mockAuthInstance),
}));

vi.mock('firebase/storage', () => ({
  ...mockStorage,
  getStorage: vi.fn(() => mockStorageInstance),
}));

// =================================
// 3. Mock React Router
// =================================
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null };
const mockParams = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    useParams: () => mockParams,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => {
      const link = document.createElement('a');
      link.href = to;
      link.textContent = children?.toString() || '';
      return link;
    },
  };
});

// =================================
// 4. Mock Application Hooks
// =================================
// Sample mock data
const mockUser = {
  uid: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  restaurantId: 'test-restaurant-id',
  emailVerified: true,
};

const mockRestaurant = {
  id: 'test-restaurant-id',
  name: 'Test Restaurant',
  address: '123 Test St',
  phone: '+1234567890',
  email: 'test@example.com',
  isOpen: true,
  ownerId: 'test-owner-id',
  isActive: true,
  settings: {
    enableOnlineOrders: true,
    requireOrderConfirmation: false,
    estimatedPrepTime: 30,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Restaurant; // Force type assertion since we know this matches our needs

const mockMenuItem: MenuItem = {
  id: 'item-1',
  restaurantId: 'test-restaurant-id',
  name: 'Test Item',
  description: 'Test Description',
  price: 9.99,
  category: 'Test Category',
  isAvailable: true,
  imageUrl: 'https://example.com/test.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrder: Order = {
  id: 'order-1',
  restaurantId: 'test-restaurant-id',
  customerName: 'Test Customer',
  customerPhone: '+1234567890',
  items: [
    {
      id: 'item-1',
      name: 'Test Item',
      price: 9.99,
      quantity: 2,
      notes: 'Test notes',
    },
  ],
  totalPrice: 19.98,
  status: 'pending' as const,
  orderType: 'delivery',
  deliveryAddress: '123 Test St',
  // Removed paymentMethod as it's not in the Order type
  // Removed paymentStatus as it's not in the Order type
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    loading: false,
    error: null,
    isInitialized: true,
    isAuthenticated: true,
    signIn: vi.fn().mockResolvedValue(mockUser),
    signOut: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    getCurrentUser: vi.fn().mockReturnValue(mockUser),
    isAuthenticatedFn: vi.fn().mockReturnValue(true),
    isInitializedFn: vi.fn().mockReturnValue(true),
    subscribeToAuthChanges: vi.fn().mockReturnValue(() => {}),
  })),
  default: vi.fn(() => ({
    user: mockUser,
    loading: false,
    error: null,
    isInitialized: true,
    isAuthenticated: true,
    signIn: vi.fn().mockResolvedValue(mockUser),
    signOut: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
    getCurrentUser: vi.fn().mockReturnValue(mockUser),
    isAuthenticatedFn: vi.fn().mockReturnValue(true),
    isInitializedFn: vi.fn().mockReturnValue(true),
    subscribeToAuthChanges: vi.fn().mockReturnValue(() => {}),
  })
  ),
}));

// Mock useOrders
vi.mock('../hooks/useOrders', () => ({
  default: vi.fn(() => ({
    orders: [mockOrder],
    pendingOrders: [mockOrder],
    preparingOrders: [],
    readyOrders: [],
    completedOrders: [],
    rejectedOrders: [],
    loading: false,
    error: null,
    updateOrderStatus: vi.fn().mockResolvedValue(undefined),
    refreshOrders: vi.fn().mockResolvedValue(undefined),
    getOrderById: vi.fn((id) => id === mockOrder.id ? mockOrder : undefined),
    getOrdersByStatus: vi.fn((status) => status === 'pending' ? [mockOrder] : []),
    stats: {
      todayOrders: 1,
      totalRevenue: 20.99,
      completedOrders: 0,
      pendingOrders: 1,
    },
  })),
}));

// Mock useMenu
vi.mock('../hooks/useMenu', () => ({
  useMenu: vi.fn(() => ({
    menuItems: [mockMenuItem],
    categories: ['Test Category'],
    loading: false,
    error: null,
    addMenuItem: vi.fn().mockResolvedValue(mockMenuItem),
    updateMenuItem: vi.fn().mockResolvedValue(mockMenuItem),
    deleteMenuItem: vi.fn().mockResolvedValue(true),
    reorderMenuItems: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock useRestaurant
vi.mock('../hooks/useRestaurant', () => ({
  useRestaurant: vi.fn(() => ({
    restaurant: mockRestaurant,
    loading: false,
    error: null,
    updateRestaurant: vi.fn().mockResolvedValue(mockRestaurant),
    updateRestaurantHours: vi.fn().mockResolvedValue(undefined),
    uploadRestaurantImage: vi.fn().mockResolvedValue('https://example.com/updated.jpg'),
  })),
}));

// =================================
// 4. Mock AuthService (for useAuth tests)
// =================================
vi.mock('../services/authService', () => {
  const mockAuthService = {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    isInitialized: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  };
  return {
    __esModule: true,
    authService: mockAuthService,
    default: mockAuthService,
  };
});

// Mock useOrderNotifications
vi.mock('../hooks/useOrderNotifications', () => ({
  default: vi.fn(() => ({
    isEnabled: {
      audio: true,
      notifications: true,
    },
    enableNotifications: vi.fn(),
    testNotification: vi.fn(),
  })),
}));

// =================================
// 5. Mock Browser APIs
// =================================
// Mock AudioContext
// Mock only the parts of AudioContext that we need
class MockAudioContext {
  createOscillator(): OscillatorNode {
    return {
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    } as unknown as OscillatorNode;
  }
  
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    } as unknown as GainNode;
  }
  
  // AudioContext properties
  get state(): AudioContextState { return 'suspended'; }
  get sampleRate(): number { return 44100; }
  get baseLatency(): number { return 0.01; }
  get outputLatency(): number { return 0.01; }
  
  // Required AudioContext methods
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  
  // Other required AudioContext methods with minimal implementations
  createBuffer = vi.fn() as any;
  createBufferSource = vi.fn() as any;
  createMediaElementSource = vi.fn() as any;
  createMediaStreamDestination = vi.fn() as any;
  createMediaStreamSource = vi.fn() as any;
  createScriptProcessor = vi.fn() as any;
  createAnalyser = vi.fn() as any;
  createBiquadFilter = vi.fn() as any;
  createChannelMerger = vi.fn() as any;
  createChannelSplitter = vi.fn() as any;
  createConstantSource = vi.fn() as any;
  createConvolver = vi.fn() as any;
  createDelay = vi.fn() as any;
  createDynamicsCompressor = vi.fn() as any;
  createIIRFilter = vi.fn() as any;
  createMediaStreamTrackSource = vi.fn() as any;
  createMediaStreamTrackAudioSourceNode = vi.fn() as any;
  createPanner = vi.fn() as any;
  createPeriodicWave = vi.fn() as any;
  createStereoPanner = vi.fn() as any;
  createWaveShaper = vi.fn() as any;
  decodeAudioData = vi.fn() as any;
  getOutputTimestamp = vi.fn() as any;
}

// Mock matchMedia
Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Mock scrollTo
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}

// =================================
// 6. Global Test Setup
// =================================
// Add global mocks
if (typeof global !== 'undefined') {
  global.URL = global.URL || {};
  global.URL.createObjectURL = vi.fn();
}

if (typeof window !== 'undefined' && window.URL) {
  window.URL.createObjectURL = vi.fn();
}

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Remove the duplicate TestUtils type and use the one defined at the bottom of the file
// Extend global type declarations
declare global {
   
  var testUtils: {
    mockUser: typeof mockUser;
    mockRestaurant: typeof mockRestaurant;
    mockMenuItem: typeof mockMenuItem;
    mockOrder: typeof mockOrder;
    mockNavigate: typeof mockNavigate;
    mockLocation: typeof mockLocation;
    mockParams: typeof mockParams;
    mockFirestore: typeof mockFirestoreInstance;
    mockAuth: typeof mockAuthInstance;
    mockStorage: typeof mockStorageInstance;
    simulateAuthState: typeof simulateAuthState;
    simulateFirestoreSnapshot: typeof simulateFirestoreSnapshot;
  };
}

// Set up global mocks
const setupGlobalMocks = () => {
  // Reset all mocks
  vi.clearAllMocks();
  
    // Set up Node.js global mocks
  if (typeof global !== 'undefined') {
    // Set up storage mocks
    (global as any).localStorage = localStorageMock;
    (global as any).sessionStorage = sessionStorageMock;
    
    // Set up Web API mocks
    (global as any).AudioContext = MockAudioContext;
    (global as any).ResizeObserver = ResizeObserverStub;
    (global as any).IntersectionObserver = IntersectionObserverStub;
  }
  
  // Set up browser environment mocks
  if (typeof window !== 'undefined') {
    // Cast to any to avoid TypeScript errors with window object
    const win = window as any;
    
    // Set up Web API mocks in browser environment
    win.AudioContext = MockAudioContext;
    win.ResizeObserver = ResizeObserverStub;
    win.IntersectionObserver = IntersectionObserverStub;
    
    // Set up other browser APIs if needed
    win.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    
    win.scrollTo = vi.fn();
  }
  
  // Reset router mocks
  mockNavigate.mockClear();
  Object.assign(mockLocation, { pathname: '/', search: '', hash: '', state: null });
  Object.keys(mockParams).forEach(key => delete (mockParams as any)[key]);
  
  // Reset Firebase mocks
  mockReset(mockFirestoreInstance);
  mockReset(mockAuthInstance);
  mockReset(mockStorageInstance);
};

// Run setup immediately and export for manual calling
export const resetTestMocks = setupGlobalMocks;

// If in a test environment, set up the mocks
if (typeof beforeEach !== 'undefined') {
  beforeEach(setupGlobalMocks);
}

// Helper function to simulate authentication state changes
export const simulateAuthState = (user: User | null) => {
  // Update the current user in the mock auth instance
  mockAuthInstance.currentUser = user as User;
  
  // Call all auth state change listeners
  const authStateListeners = mockAuthInstance.onAuthStateChanged.mock.calls;
  authStateListeners.forEach(([callback]) => {
    callback(user);
  });
};

// Helper function to simulate Firestore snapshot updates
export const simulateFirestoreSnapshot = (collectionPath: string, data: any[]) => {
  const snapshot = {
    docs: data.map((doc, index) => ({
      id: `doc-${index}`,
      data: () => doc,
      exists: () => true,
    })),
  };
  
  // Call all snapshot listeners for this collection
  const snapshotListeners = mockFirestoreInstance.onSnapshot.mock.calls;
  snapshotListeners.forEach(([query, callback]) => {
    if (query.includes(collectionPath)) {
      callback(snapshot);
    }
  });
};

// Export mock data for use in tests
export const testUtils = {
  mockUser,
  mockRestaurant,
  mockMenuItem,
  mockOrder,
  mockNavigate,
  mockLocation,
  mockParams,
  mockFirestore: mockFirestoreInstance,
  mockAuth: mockAuthInstance,
  mockStorage: mockStorageInstance,
  simulateAuthState,
  simulateFirestoreSnapshot,
};

export type TestUtils = typeof testUtils;

declare global {
   
  var testUtils: TestUtils;
}

global.testUtils = testUtils;

vi.mock('../hooks/useOrderNotifications', () => ({
  default: vi.fn(() => ({
    isEnabled: {
      audio: true,
      notifications: true,
    },
    enableNotifications: vi.fn(),
    testNotification: vi.fn(),
  })),
}));

// Mock Web Audio API for NotificationService tests
globalThis.AudioContext = class {
  constructor() {
    this.state = 'running';
  }
  resume = vi.fn();
  createOscillator = vi.fn(() => ({
    type: '',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
};

// =================================
// 6. Browser Storage Mocks
// =================================
// Create proper localStorage mock with all required methods
class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  getItem = vi.fn((key: string): string | null => {
    return this.store[key] || null;
  });

  setItem = vi.fn((key: string, value: string): void => {
    this.store[key] = String(value);
  });

  removeItem = vi.fn((key: string): void => {
    delete this.store[key];
  });

  clear = vi.fn((): void => {
    this.store = {};
  });
}

const localStorageMock = new MockStorage();
const sessionStorageMock = new MockStorage();

// Set up storage mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Also set up for global scope (Node.js environment)
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});



// =================================
// 7. Global Test Setup
// =================================
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();

  // Clear mock call history
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Reset Firebase mocks
  mockReset(mockFirestoreInstance);
  mockReset(mockAuthInstance);
  mockReset(mockStorageInstance);
});

// Global test timeout
vi.setConfig({ testTimeout: 10000 });
