// Global test setup with TypeScript support
import { beforeEach, vi } from 'vitest';

// Extend the global type declarations
declare global {
  interface Window {
    localStorage: Storage;
    sessionStorage: Storage;
    ResizeObserver: typeof ResizeObserver;
    IntersectionObserver: typeof IntersectionObserver;
  }
}

// Mock browser globals
if (typeof global !== 'undefined') {
  // Complete Storage implementation
  class MockStorage implements Storage {
    private store: Record<string, string> = {};
    
    get length(): number {
      return Object.keys(this.store).length;
    }
    
    key(index: number): string | null {
      return Object.keys(this.store)[index] || null;
    }
    
    getItem(key: string): string | null {
      return this.store[key] || null;
    }
    
    setItem(key: string, value: string): void {
      this.store[key] = String(value);
    }
    
    removeItem(key: string): void {
      delete this.store[key];
    }
    
    clear(): void {
      this.store = {};
    }
  }
  
  const localStorageMock = new MockStorage();
  const sessionStorageMock = new MockStorage();

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
  global.scrollTo = vi.fn();

  // Mock URL
  global.URL.createObjectURL = vi.fn();

  // Assign mocks to global
  global.localStorage = localStorageMock;
  global.sessionStorage = sessionStorageMock;
}

// Create mock ResizeObserver
class ResizeObserverMock {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }

    observe(_target: Element, _options?: ResizeObserverOptions): void {
        // Mock implementation
    }

    unobserve(_target: Element): void {
        // Mock implementation
    }

    disconnect(): void {
        // Mock implementation
    }
}

// Create mock IntersectionObserver
class IntersectionObserverMock {
    private readonly callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
        this.callback = callback;
    }

    observe(_target: Element): void {
        // Mock implementation
    }

    unobserve(_target: Element): void {
        // Mock implementation
    }

    disconnect(): void {
        // Mock implementation
    }
}

// Assign mock implementations to global objects
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Reset mocks before each test
beforeEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  if (typeof global !== 'undefined') {
    global.localStorage.clear();
    global.sessionStorage.clear();
  }
});

// Rename unused parameters with underscore prefix
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => (_: unknown) => {},
    useLocation: () => ({}),
    useParams: () => ({}),
}));

// Add return types and handle unused parameters
vi.mock('firebase/auth', () => ({
    getAuth: () => ({
        currentUser: null,
        onAuthStateChanged: (_auth: unknown, _callback: unknown) => {},
    }),
    signInWithEmailAndPassword: (_auth: unknown, _options: unknown) => Promise.resolve(),
    createUserWithEmailAndPassword: (_auth: unknown) => Promise.resolve(),
    signOut: (_auth: unknown) => Promise.resolve(),
}));
