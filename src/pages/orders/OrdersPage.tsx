import { useState } from 'react';
import type { Order } from '../../types/index';
import { OrderCard, LoadingSpinner, Button } from '../../components';
import { useOrders, useOrderNotifications, useAuth } from '../../hooks';
import { orderService } from '../../services';

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [creatingDemo, setCreatingDemo] = useState(false);
  const { user } = useAuth();

  const {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    rejectedOrders,
    loading,
    error,
    updateOrderStatus,
    refreshOrders,
    stats,
  } = useOrders();

  // Set up automatic notifications for order changes
  const notifications = useOrderNotifications(orders);

  // Archive orders (completed and rejected)
  const archivedOrders = [...completedOrders, ...rejectedOrders].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleViewDetails = (order: Order) => {
    // TODO: Implement order details modal
    console.log('View order details:', order);
  };

  const handleCreateDemoOrders = async () => {
    if (!user?.restaurantId) return;

    setCreatingDemo(true);
    try {
      await orderService.createDemoOrders(user.restaurantId);
    } catch (error) {
      console.error('Failed to create demo orders:', error);
    } finally {
      setCreatingDemo(false);
    }
  };

  const getColumnCount = (orders: Order[]) => orders.length;

  // Show loading spinner while fetching orders
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-semibold">Error loading orders</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={refreshOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">
              Manage your restaurant orders in real-time
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Demo Orders Button (Development) */}
            {orders.length === 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCreateDemoOrders}
                disabled={creatingDemo}
              >
                {creatingDemo ? 'Creating...' : 'Create Demo Orders'}
              </Button>
            )}

            <div className="text-sm text-gray-500">
              Audio: {notifications.isEnabled.audio ? '🔊' : '🔇'} |
              Notifications:{' '}
              {notifications.isEnabled.notifications ? '🔔' : '🔕'}
            </div>

            {(!notifications.isEnabled.audio ||
              !notifications.isEnabled.notifications) && (
              <Button
                size="sm"
                variant="primary"
                onClick={notifications.enableNotifications}
              >
                Enable Notifications
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={notifications.testNotification}
            >
              Test Sound
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Orders ({stats.pending + stats.preparing + stats.ready})
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'archive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Archive ({stats.completed + stats.rejected})
            </button>
          </nav>
        </div>
      </div>

      {/* Active Orders View */}
      {activeTab === 'active' && (
        <>
          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* New Orders Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    New Orders
                  </h2>
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2 py-1 rounded-full">
                    {getColumnCount(pendingOrders)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Pending acceptance</p>
              </div>
              <div className="p-4 space-y-4 min-h-[400px]">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No new orders</p>
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={updateOrderStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    In Progress
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                    {getColumnCount(preparingOrders)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Being prepared</p>
              </div>
              <div className="p-4 space-y-4 min-h-[400px]">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders in progress</p>
                  </div>
                ) : (
                  preparingOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={updateOrderStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Ready Column */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Ready</h2>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                    {getColumnCount(readyOrders)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Ready for pickup</p>
              </div>
              <div className="p-4 space-y-4 min-h-[400px]">
                {readyOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders ready</p>
                  </div>
                ) : (
                  readyOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={updateOrderStatus}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-500">Total Orders Today</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-500">Pending Orders</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {stats.preparing}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.ready}
              </div>
              <div className="text-sm text-gray-500">Ready Orders</div>
            </div>
          </div>
        </>
      )}

      {/* Archive View */}
      {activeTab === 'archive' && (
        <div className="space-y-6">
          {archivedOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No archived orders
              </h3>
              <p className="text-gray-500">
                Completed and rejected orders will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Archive Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Archive
                  </h2>
                  <p className="text-sm text-gray-500">
                    {archivedOrders.length} archived orders
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Completed: {stats.completed} | Rejected: {stats.rejected}
                  </div>
                </div>
              </div>

              {/* Archive List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {archivedOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={updateOrderStatus}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Archive Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-500">Completed Orders</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </div>
                  <div className="text-sm text-gray-500">Rejected Orders</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
