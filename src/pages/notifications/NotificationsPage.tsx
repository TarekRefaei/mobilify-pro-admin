import React, { useState } from 'react';
import { Send, Bell, Users, MessageSquare, History, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { NotificationComposer } from '../../components/notifications/NotificationComposer';
import { NotificationHistory } from '../../components/notifications/NotificationHistory';
import { NotificationStats } from '../../components/notifications/NotificationStats';

const NotificationsPage: React.FC = () => {
  const { notifications, stats, loading, error, sendNotification } =
    usePushNotifications();

  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'stats'>(
    'compose'
  );
  const [showComposer, setShowComposer] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Error loading notifications: {error}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'compose', label: 'Compose', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
    { id: 'stats', label: 'Statistics', icon: Users },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Push Notifications
          </h1>
          <p className="text-gray-600">Send notifications to your customers</p>
        </div>
        <Button
          onClick={() => setShowComposer(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Notification
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalSent}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.thisWeek}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recipients</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalRecipients}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.openRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'compose' && (
          <NotificationComposer onSend={sendNotification} />
        )}

        {activeTab === 'history' && (
          <NotificationHistory notifications={notifications} />
        )}

        {activeTab === 'stats' && (
          <NotificationStats stats={stats} notifications={notifications} />
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <NotificationComposer
              onSend={sendNotification}
              onClose={() => setShowComposer(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
