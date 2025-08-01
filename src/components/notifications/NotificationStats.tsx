import React from 'react';
import { TrendingUp, Users, Bell, Eye, MousePointer, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import type { PushNotification } from '../../types';
import { format, subDays, isAfter } from 'date-fns';

interface NotificationStatsProps {
  stats: {
    totalSent: number;
    thisWeek: number;
    totalRecipients: number;
    openRate: number;
  };
  notifications: PushNotification[];
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  stats,
  notifications,
}) => {
  // Calculate additional stats from notifications
  const sentNotifications = notifications.filter(n => n.status === 'sent');
  const totalDelivered = sentNotifications.reduce((sum, n) => sum + (n.deliveredCount || 0), 0);
  const totalOpened = sentNotifications.reduce((sum, n) => sum + (n.openedCount || 0), 0);
  const totalClicked = sentNotifications.reduce((sum, n) => sum + (n.clickedCount || 0), 0);
  
  const deliveryRate = stats.totalSent > 0 ? (totalDelivered / stats.totalRecipients) * 100 : 0;
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  // Weekly performance data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayNotifications = sentNotifications.filter(n => 
      format(new Date(n.sentAt || n.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'MMM dd'),
      sent: dayNotifications.length,
      delivered: dayNotifications.reduce((sum, n) => sum + (n.deliveredCount || 0), 0),
      opened: dayNotifications.reduce((sum, n) => sum + (n.openedCount || 0), 0),
    };
  }).reverse();

  // Audience breakdown
  const audienceBreakdown = notifications.reduce((acc, notification) => {
    const audience = notification.targetAudience;
    if (!acc[audience]) {
      acc[audience] = { count: 0, recipients: 0 };
    }
    acc[audience].count++;
    acc[audience].recipients += notification.recipientCount;
    return acc;
  }, {} as Record<string, { count: number; recipients: number }>);

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'All Customers';
      case 'loyal': return 'Loyal Customers';
      case 'recent': return 'Recent Customers';
      case 'inactive': return 'Inactive Customers';
      default: return audience;
    }
  };

  const statCards = [
    {
      title: 'Total Sent',
      value: stats.totalSent,
      icon: Bell,
      color: 'blue',
      description: 'All time notifications',
    },
    {
      title: 'Delivery Rate',
      value: `${deliveryRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'green',
      description: 'Successfully delivered',
    },
    {
      title: 'Open Rate',
      value: `${stats.openRate.toFixed(1)}%`,
      icon: Eye,
      color: 'purple',
      description: 'Notifications opened',
    },
    {
      title: 'Click Rate',
      value: `${clickRate.toFixed(1)}%`,
      icon: MousePointer,
      color: 'yellow',
      description: 'Notifications clicked',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h3>
        <p className="text-gray-600">
          Send some notifications to see performance statistics here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weekly Performance Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Performance
        </h3>
        <div className="space-y-4">
          {last7Days.map((day, index) => {
            const maxValue = Math.max(...last7Days.map(d => Math.max(d.sent, d.delivered, d.opened)));
            const sentWidth = maxValue > 0 ? (day.sent / maxValue) * 100 : 0;
            const deliveredWidth = maxValue > 0 ? (day.delivered / maxValue) * 100 : 0;
            const openedWidth = maxValue > 0 ? (day.opened / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{day.date}</span>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Sent: {day.sent}</span>
                    <span>Delivered: {day.delivered}</span>
                    <span>Opened: {day.opened}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Sent</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sentWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Delivered</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deliveredWidth}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Opened</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${openedWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Audience Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Audience Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(audienceBreakdown).map(([audience, data]) => {
            const percentage = stats.totalSent > 0 ? (data.count / stats.totalSent) * 100 : 0;
            
            return (
              <div key={audience} className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {getAudienceLabel(audience)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600 ml-4">
                  <div className="font-medium">{data.count} notifications</div>
                  <div className="text-xs">{data.recipients} total recipients</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalDelivered}</div>
            <div className="text-sm text-blue-800">Total Delivered</div>
            <div className="text-xs text-blue-600 mt-1">
              {deliveryRate.toFixed(1)}% delivery rate
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{totalOpened}</div>
            <div className="text-sm text-purple-800">Total Opened</div>
            <div className="text-xs text-purple-600 mt-1">
              {stats.openRate.toFixed(1)}% open rate
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalClicked}</div>
            <div className="text-sm text-yellow-800">Total Clicked</div>
            <div className="text-xs text-yellow-600 mt-1">
              {clickRate.toFixed(1)}% click rate
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
