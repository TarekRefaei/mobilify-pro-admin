import { vi } from 'vitest';

// Mock implementation
export const useOrderNotifications = vi.fn(() => ({
  isEnabled: {
    audio: true,
    notifications: true,
  },
  enableNotifications: vi.fn(),
  testNotification: vi.fn(),
}));

export default useOrderNotifications;
