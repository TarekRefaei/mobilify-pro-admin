// Core data types for Mobilify Pro Admin Panel

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

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
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
  createdAt: Date;
  updatedAt: Date;
  estimatedReadyTime?: Date;
  notes?: string;
}

export interface Reservation {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'declined';
  specialRequests?: string;
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
  imageFile?: File;
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
