import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  loading?: boolean;
}

const MetricCard = ({
  title,
  value,
  icon,
  iconBgColor,
  change,
  loading = false,
}: MetricCardProps) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 ${iconBgColor} rounded-lg`}>{icon}</div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>

        {change && (
          <div className="text-right">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                change.type === 'increase'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <span className="mr-1">
                {change.type === 'increase' ? '↗' : '↘'}
              </span>
              {Math.abs(change.value)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{change.period}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
