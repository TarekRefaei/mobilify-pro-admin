import { NavLink } from 'react-router-dom';
import { cn } from '../../utils';

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Orders', href: '/orders', icon: '📋' },
  { name: 'Menu', href: '/menu', icon: '🍽️' },
  { name: 'Reservations', href: '/reservations', icon: '📅' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Loyalty Program', href: '/loyalty', icon: '🎁' },
  { name: 'Notifications', href: '/notifications', icon: '📢' },
  { name: 'Admin Tools', href: '/admin', icon: '🔧' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 left-0 w-60 bg-white shadow-lg border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">Mobilify Pro</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map(item => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                data-testid={`sidebar-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Mobilify Pro v1.0</p>
          <p>Restaurant Management</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
