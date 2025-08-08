// Services for Mobilify Pro Admin Panel

// Authentication service
export {
  authService,
  type LoginCredentials,
  type AuthUser,
} from './authService';

// Order service
export { orderService, type OrderServiceError } from './orderService';

// Notification service
export {
  notificationService,
  type NotificationOptions,
} from './notificationService';

// Menu service
export { menuService, type MenuServiceError } from './menuService';

// Analytics service
export { analyticsService, type DashboardMetrics } from './analyticsService';

// Import services for the services object
import { orderService } from './orderService';
import { notificationService } from './notificationService';
import { menuService } from './menuService';
import { analyticsService } from './analyticsService';

// Other services (to be implemented)
export const services = {
  orders: orderService,
  notifications: notificationService,
  menu: menuService,
  analytics: analyticsService,
  reservations: null,
};
