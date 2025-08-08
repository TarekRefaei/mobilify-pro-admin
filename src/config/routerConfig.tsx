import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { MainLayout, ProtectedRoute } from '../components';
import { LazyPageWrapper } from '../components/layout/PageLoader';

// Lazy load page components for better code splitting
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const MenuPage = lazy(() => import('../pages/menu/MenuPage'));
const ReservationsPage = lazy(
  () => import('../pages/reservations/ReservationsPage')
);
const LoyaltyPage = lazy(() => import('../pages/loyalty/LoyaltyPage'));
const NotificationsPage = lazy(
  () => import('../pages/notifications/NotificationsPage')
);
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage'));
const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const HealthCheck = lazy(() => import('../pages/HealthCheck'));

export const router = createBrowserRouter([
  {
    path: '/health',
    element: (
      <LazyPageWrapper>
        <HealthCheck />
      </LazyPageWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <LazyPageWrapper>
        <LoginPage />
      </LazyPageWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyPageWrapper>
            <DashboardPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'orders',
        element: (
          <LazyPageWrapper>
            <OrdersPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'menu',
        element: (
          <LazyPageWrapper>
            <MenuPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'admin',
        element: (
          <LazyPageWrapper>
            <AdminPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'reservations',
        element: (
          <LazyPageWrapper>
            <ReservationsPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'customers',
        element: (
          <LazyPageWrapper>
            <CustomersPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'loyalty',
        element: (
          <LazyPageWrapper>
            <LoyaltyPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'notifications',
        element: (
          <LazyPageWrapper>
            <NotificationsPage />
          </LazyPageWrapper>
        ),
      },
      {
        path: 'settings',
        element: (
          <LazyPageWrapper>
            <SettingsPage />
          </LazyPageWrapper>
        ),
      },
    ],
  },
]);
