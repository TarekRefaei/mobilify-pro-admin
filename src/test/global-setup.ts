// Global test setup with TypeScript support
import { vi, beforeEach } from 'vitest';

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

// Mock ResizeObserver
class ResizeObserverStub implements ResizeObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: ReadonlyArray<number>;
  
  constructor(public callback: ResizeObserverCallback) {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }
  
  observe(target: Element, options?: ResizeObserverOptions): void {
    // Implementation
  }
  
  unobserve(target: Element): void {
    // Implementation
  }
  
  disconnect(): void {
    // Implementation
  }
}

// Mock IntersectionObserver
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor(public callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  
  observe(target: Element): void {
    // Implementation
  }
  
  unobserve(target: Element): void {
    // Implementation
  }
  
  disconnect(): void {
    // Implementation
  }
  
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// Assign to global if available
if (typeof global !== 'undefined') {
  global.ResizeObserver = ResizeObserverStub;
  global.IntersectionObserver = IntersectionObserverStub;
}

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
