import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, ProtectedRoute } from '../components';
import DashboardPage from '../pages/dashboard/DashboardPage';
import OrdersPage from '../pages/orders/OrdersPage';
import MenuPage from '../pages/menu/MenuPage';
import AdminPage from '../pages/admin/AdminPage';
import LoginPage from '../pages/auth/LoginPage';

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
    path: '/login',
    element: <LoginPage />,
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
        element: <DashboardPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'menu',
        element: <MenuPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'reservations',
        element: <PlaceholderPage title="Reservations" />,
      },
      {
        path: 'customers',
        element: <PlaceholderPage title="Customers" />,
      },
      {
        path: 'loyalty',
        element: <PlaceholderPage title="Loyalty Program" />,
      },
      {
        path: 'notifications',
        element: <PlaceholderPage title="Notifications" />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage title="Settings" />,
      },
    ],
  },
]);

export default router;
