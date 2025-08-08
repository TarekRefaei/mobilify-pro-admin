import { formatDistanceToNow } from 'date-fns';
import type { DashboardMetrics } from '../../services/analyticsService';

interface ActivityFeedProps {
  activities: DashboardMetrics['recentActivity'];
  loading?: boolean;
}

const ActivityFeed = ({ activities, loading = false }: ActivityFeedProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 animate-pulse"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">📊</div>
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400">
          Activity will appear here as orders and updates happen
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0">
            <span className="text-lg">{activity.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.message}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                activity.type === 'order'
                  ? 'bg-blue-100 text-blue-800'
                  : activity.type === 'menu'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
              }`}
            >
              {activity.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
