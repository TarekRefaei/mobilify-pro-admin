import { vi } from 'vitest';
import type { User } from '../../types';
import { createMockUser } from '../utils';

export const authService = {
  getCurrentUser: vi.fn((): User | null => null),
  onAuthStateChange: vi.fn((callback: any) => {
    // Don't call callback immediately - let tests control when auth state changes
    return vi.fn(); // unsubscribe function
  }),
  isInitialized: vi.fn(() => true),
  signIn: vi.fn().mockResolvedValue(createMockUser()),
  signOut: vi.fn().mockResolvedValue(undefined),
  persistSession: vi.fn(),
  loadPersistedSession: vi.fn(),
  clearPersistedSession: vi.fn(),
};
