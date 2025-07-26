import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'view-orders',
    title: 'View Orders',
    description: 'Check pending and active orders',
    icon: '📋',
    path: '/orders',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'add-menu-item',
    title: 'Add Menu Item',
    description: 'Add new dish to your menu',
    icon: '🍽️',
    path: '/menu',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Check detailed reports',
    icon: '📊',
    path: '/analytics',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    id: 'manage-reservations',
    title: 'Reservations',
    description: 'Manage table bookings',
    icon: '📅',
    path: '/reservations',
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

const QuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleActionClick(action.path)}
          className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
              <span className="text-lg">{action.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
