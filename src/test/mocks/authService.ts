import { vi } from 'vitest';
import { createMockUser } from '../utils';

export const authService = {
  getCurrentUser: vi.fn(() => createMockUser()),
  onAuthStateChange: vi.fn((callback) => {
    callback(createMockUser());
    return vi.fn(); // unsubscribe function
  }),
  isInitialized: vi.fn(() => true),
  signIn: vi.fn(),
  signOut: vi.fn(),
  persistSession: vi.fn(),
  loadPersistedSession: vi.fn(),
  clearPersistedSession: vi.fn(),
};