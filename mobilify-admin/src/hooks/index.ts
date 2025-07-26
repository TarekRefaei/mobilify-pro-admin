// Custom hooks for Mobilify Pro Admin Panel

// Authentication hook
export { useAuth } from './useAuth';

// Orders hook
export { useOrders, type UseOrdersReturn } from './useOrders';

// Notifications hook
export { useNotifications, useOrderNotifications, type UseNotificationsReturn } from './useNotifications';

// Menu hook
export { useMenu } from './useMenu';

// Analytics hook
export { useAnalytics } from './useAnalytics';

// Import hooks for the hooks object
import { useOrders } from './useOrders';
import { useNotifications } from './useNotifications';
import { useMenu } from './useMenu';
import { useAnalytics } from './useAnalytics';

// Other hooks (to be implemented)
export const hooks = {
  useOrders: useOrders,
  useNotifications: useNotifications,
  useMenu: useMenu,
  useAnalytics: useAnalytics,
  useReservations: null,
};
