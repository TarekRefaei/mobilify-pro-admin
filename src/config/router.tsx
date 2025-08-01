import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MainLayout, ProtectedRoute } from '../components';

// Lazy load page components for better code splitting
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const OrdersPage = lazy(() => import('../pages/orders/OrdersPage'));
const MenuPage = lazy(() => import('../pages/menu/MenuPage'));
const ReservationsPage = lazy(() => import('../pages/reservations/ReservationsPage'));
const LoyaltyPage = lazy(() => import('../pages/loyalty/LoyaltyPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const CustomersPage = lazy(() => import('../pages/customers/CustomersPage'));
const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const HealthCheck = lazy(() => import('../pages/HealthCheck'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Wrapper component for lazy-loaded pages
const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600">
        This page will be implemented in a future phase
      </p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <p className="text-gray-500">{title} functionality coming soon...</p>
      </div>
    </div>
  </div>
);

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

export default router;
