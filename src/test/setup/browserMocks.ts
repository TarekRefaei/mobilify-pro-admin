import { vi } from 'vitest';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  destination = {};
  createOscillator() {
    return {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
}

// Mock the window.AudioContext
if (typeof window !== 'undefined') {
  window.AudioContext = MockAudioContext as any;
  (window as any).webkitAudioContext = MockAudioContext as any;
}

// Mock other browser APIs as needed
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;
