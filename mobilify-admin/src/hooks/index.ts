// Custom hooks for Mobilify Pro Admin Panel

// Authentication hook
export { useAuth } from './useAuth';

// Orders hook
export { useOrders, type UseOrdersReturn } from './useOrders';

// Notifications hook
export { useNotifications, useOrderNotifications, type UseNotificationsReturn } from './useNotifications';

// Import hooks for the hooks object
import { useOrders } from './useOrders';
import { useNotifications } from './useNotifications';

// Other hooks (to be implemented)
export const hooks = {
  useOrders: useOrders,
  useNotifications: useNotifications,
  useMenu: null,
  useReservations: null,
  useAnalytics: null,
};
