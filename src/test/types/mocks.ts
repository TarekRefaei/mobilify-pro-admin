import type { User } from 'firebase/auth';
import type { Mock } from 'vitest';

export interface MockUser extends Partial<User> {
  uid: string;
  email: string;
  displayName: string;
  restaurantId: string;
  emailVerified: boolean;
}

export interface MockOrder {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes: string;
  }>;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'rejected';
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockUseAuthReturn {
  user: MockUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  signIn: Mock;
  signOut: Mock;
  clearError: Mock;
}

export interface MockUseOrdersReturn {
  orders: MockOrder[];
  pendingOrders: MockOrder[];
  preparingOrders: MockOrder[];
  readyOrders: MockOrder[];
  completedOrders: MockOrder[];
  rejectedOrders: MockOrder[];
  loading: boolean;
  error: Error | null;
  updateOrderStatus: Mock;
  refreshOrders: Mock;
  stats: {
    total: number;
    pending: number;
    preparing: number;
    ready: number;
    completed: number;
    rejected: number;
  };
}
