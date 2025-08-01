import React from 'react';
import { Users, Gift, TrendingUp, Award, Star, Target } from 'lucide-react';
import { Card } from '../ui/Card';
import type { LoyaltyProgram } from '../../types';

interface LoyaltyStatsProps {
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalRewardsRedeemed: number;
    averageStamps: number;
    completionRate: number;
    recentRedemptions: number;
  };
  loyaltyProgram: LoyaltyProgram;
}

export const LoyaltyStats: React.FC<LoyaltyStatsProps> = ({ stats, loyaltyProgram }) => {
  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'blue',
      description: 'Enrolled in loyalty program',
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      icon: TrendingUp,
      color: 'green',
      description: 'Made purchases this month',
    },
    {
      title: 'Rewards Redeemed',
      value: stats.totalRewardsRedeemed,
      icon: Gift,
      color: 'purple',
      description: 'Total rewards claimed',
    },
    {
      title: 'Average Stamps',
      value: stats.averageStamps.toFixed(1),
      icon: Star,
      color: 'yellow',
      description: 'Per customer',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate.toFixed(1)}%`,
      icon: Target,
      color: 'indigo',
      description: 'Customers who completed program',
    },
    {
      title: 'Recent Redemptions',
      value: stats.recentRedemptions,
      icon: Award,
      color: 'pink',
      description: 'This week',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Program Overview</h3>
            <p className="text-gray-600">
              Buy {loyaltyProgram.purchasesRequired} items, get 1 free
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{loyaltyProgram.purchasesRequired}</div>
            <div className="text-sm text-gray-600">Purchases Required</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{loyaltyProgram.rewardType}</div>
            <div className="text-sm text-gray-600">Reward Type</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${loyaltyProgram.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {loyaltyProgram.isActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-600">Program Status</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Progress Visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Progress Distribution</h3>
        <div className="space-y-4">
          {Array.from({ length: loyaltyProgram.purchasesRequired }, (_, i) => {
            const stampsCount = i + 1;
            const percentage = stats.totalCustomers > 0 
              ? Math.random() * 30 + 10 // Demo data - replace with real calculation
              : 0;
            
            return (
              <div key={stampsCount} className="flex items-center gap-4">
                <div className="w-16 text-sm text-gray-600">
                  {stampsCount} stamp{stampsCount > 1 ? 's' : ''}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            );
          })}
          
          {/* Completed */}
          <div className="flex items-center gap-4 border-t pt-4">
            <div className="w-16 text-sm font-medium text-green-600">
              Completed
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-green-600 text-right">
              {stats.completionRate.toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
