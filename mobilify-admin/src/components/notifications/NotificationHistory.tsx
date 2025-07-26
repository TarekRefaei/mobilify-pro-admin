import React, { useState } from 'react';
import { Search, Bell, Users, Calendar, Clock, Eye, MoreVertical } from 'lucide-react';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { PushNotification } from '../../types';
import { format } from 'date-fns';

interface NotificationHistoryProps {
  notifications: PushNotification[];
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  notifications,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);

  // Filter notifications
  const filteredNotifications = notifications
    .filter((notification) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusColor = (status: PushNotification['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTargetAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'All Customers';
      case 'loyal': return 'Loyal Customers';
      case 'recent': return 'Recent Customers';
      case 'inactive': return 'Inactive Customers';
      default: return audience;
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications Sent</h3>
        <p className="text-gray-600">
          Your notification history will appear here once you start sending notifications.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search notifications by title or message..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(notification.status)}`}>
                      {notification.status.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNotification(notification)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Button>
                </div>

                {/* Message */}
                <p className="text-gray-700">{notification.message}</p>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {getTargetAudienceLabel(notification.targetAudience)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    {notification.recipientCount} recipients
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(notification.createdAt), 'HH:mm')}
                  </div>
                </div>

                {/* Scheduled Info */}
                {notification.scheduledFor && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <Clock className="w-4 h-4" />
                    Scheduled for: {format(new Date(notification.scheduledFor), 'MMM dd, yyyy HH:mm')}
                  </div>
                )}

                {/* Delivery Stats */}
                {notification.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-800">{notification.deliveredCount || 0}</div>
                      <div className="text-green-600">Delivered</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-800">{notification.openedCount || 0}</div>
                      <div className="text-blue-600">Opened</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium text-purple-800">{notification.clickedCount || 0}</div>
                      <div className="text-purple-600">Clicked</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && searchTerm && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters.
          </p>
        </Card>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNotification(null)}
                  className="p-2"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div><strong>Title:</strong> {selectedNotification.title}</div>
                    <div><strong>Message:</strong> {selectedNotification.message}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedNotification.status)}`}>
                        {selectedNotification.status.toUpperCase()}
                      </span>
                    </div>
                    <div><strong>Target Audience:</strong> {getTargetAudienceLabel(selectedNotification.targetAudience)}</div>
                    <div><strong>Recipients:</strong> {selectedNotification.recipientCount}</div>
                  </div>
                </div>

                {/* Timing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Timing</h3>
                  <div className="space-y-2">
                    <div><strong>Created:</strong> {format(new Date(selectedNotification.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                    {selectedNotification.scheduledFor && (
                      <div><strong>Scheduled For:</strong> {format(new Date(selectedNotification.scheduledFor), 'MMM dd, yyyy HH:mm')}</div>
                    )}
                    {selectedNotification.sentAt && (
                      <div><strong>Sent At:</strong> {format(new Date(selectedNotification.sentAt), 'MMM dd, yyyy HH:mm')}</div>
                    )}
                  </div>
                </div>

                {/* Performance */}
                {selectedNotification.status === 'sent' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedNotification.deliveredCount || 0}</div>
                        <div className="text-sm text-gray-600">Delivered</div>
                        <div className="text-xs text-gray-500">
                          {selectedNotification.recipientCount > 0
                            ? ((selectedNotification.deliveredCount || 0) / selectedNotification.recipientCount * 100).toFixed(1)
                            : 0
                          }% delivery rate
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{selectedNotification.openedCount || 0}</div>
                        <div className="text-sm text-gray-600">Opened</div>
                        <div className="text-xs text-gray-500">
                          {selectedNotification.deliveredCount && selectedNotification.deliveredCount > 0
                            ? ((selectedNotification.openedCount || 0) / selectedNotification.deliveredCount * 100).toFixed(1)
                            : 0
                          }% open rate
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button onClick={() => setSelectedNotification(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
