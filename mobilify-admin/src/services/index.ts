// Services for Mobilify Pro Admin Panel

// Authentication service
export { authService, type LoginCredentials, type AuthUser } from './authService';

// Order service
export { orderService, type OrderServiceError } from './orderService';

// Notification service
export { notificationService, type NotificationOptions } from './notificationService';

// Import services for the services object
import { orderService } from './orderService';
import { notificationService } from './notificationService';

// Other services (to be implemented)
export const services = {
  orders: orderService,
  notifications: notificationService,
  menu: null,
  reservations: null,
  analytics: null,
};
