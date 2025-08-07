// Core data types for Mobilify Pro Admin Panel
import { Timestamp } from 'firebase/firestore';

// Type for handling both Date and Timestamp objects
export type DateOrTimestamp = Date | Timestamp;

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string; // Reference to MenuCategory
  imageUrl?: string;
  isAvailable: boolean;
  displayOrder?: number;
  allergens?: string[];
  preparationTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'rejected';
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  createdAt: DateOrTimestamp;
  updatedAt: DateOrTimestamp;
  estimatedReadyTime?: DateOrTimestamp;
  notes?: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: Date;
  time: string;
  partySize: number;
  tableNumber?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  restaurantId: string;
  purchasesRequired: number;
  rewardType: 'free_item';
  rewardValue: number;
  isActive: boolean;
  description?: string;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  restaurantId: string;
  currentStamps: number;
  totalRedeemed: number;
  lastPurchase: Date;
  lastRedemption: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushNotification {
  id: string;
  restaurantId: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'loyal_customers' | 'recent_customers';
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipientCount: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantSettings {
  id: string;
  restaurantId: string;
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  preferences: {
    enableNotifications: boolean;
    autoAcceptOrders: boolean;
    defaultPreparationTime: number;
    currency: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// UI Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  imageFile?: File;
  imageUrl?: string;
  displayOrder?: number;
  isAvailable: boolean;
  allergens?: string[];
  preparationTime?: number;
}

export interface MenuCategoryFormData {
  name: string;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: Date;
  time: string;
  partySize: number;
  tableNumber?: string;
  specialRequests?: string;
}

export interface NotificationFormData {
  title: string;
  message: string;
  targetAudience: 'all' | 'loyal_customers' | 'recent_customers';
  scheduledFor?: Date;
}

export interface SettingsFormData {
  businessHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    website?: string;
  };
  preferences: {
    enableNotifications: boolean;
    autoAcceptOrders: boolean;
    defaultPreparationTime: number;
    currency: string;
    timezone: string;
  };
}

// Analytics Types
export interface DashboardMetrics {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  newReservations: number;
  completedOrders: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'menu' | 'reservation';
  description: string;
  timestamp: Date;
}
