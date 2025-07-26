import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  MetricCard,
  ActivityFeed,
  QuickActions,
} from '../../components';
import { useAnalytics } from '../../hooks';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { metrics, loading, error, refreshMetrics } = useAnalytics();

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your restaurant management dashboard
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={refreshMetrics}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" onClick={handleViewOrders}>
            View All Orders
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={refreshMetrics}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Orders"
          value={metrics?.todayOrders ?? 0}
          icon={<span className="text-2xl">📋</span>}
          iconBgColor="bg-blue-100"
          loading={loading}
        />

        <MetricCard
          title="Today's Sales"
          value={metrics ? formatCurrency(metrics.todaySales) : formatCurrency(0)}
          icon={<span className="text-2xl">💰</span>}
          iconBgColor="bg-green-100"
          loading={loading}
        />

        <MetricCard
          title="Pending Orders"
          value={metrics?.pendingOrders ?? 0}
          icon={<span className="text-2xl">⏳</span>}
          iconBgColor="bg-yellow-100"
          loading={loading}
        />

        <MetricCard
          title="Reservations"
          value={metrics?.totalReservations ?? 0}
          icon={<span className="text-2xl">📅</span>}
          iconBgColor="bg-purple-100"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Bottom Grid - Recent Activity and Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={metrics?.recentActivity ?? []}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items This Week</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between items-center animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-8"></div>
                  </div>
                ))}
              </div>
            ) : metrics?.popularItems && metrics.popularItems.length > 0 ? (
              <div className="space-y-3">
                {metrics.popularItems.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {item.count} orders
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🍽️</div>
                <p className="text-gray-500">No popular items yet</p>
                <p className="text-sm text-gray-400">Popular items will appear here as orders come in</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
