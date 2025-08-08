import { useState } from 'react';
import type { Order } from '../../types/index';
import { Button, Card } from '../ui';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onViewDetails?: (order: Order) => void;
}

const OrderCard = ({
  order,
  onStatusChange,
  onViewDetails,
}: OrderCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusActions = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusChange('preparing')}
              disabled={isUpdating}
              loading={isUpdating}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange('rejected')}
              disabled={isUpdating}
            >
              Reject
            </Button>
          </div>
        );
      case 'preparing':
        return (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleStatusChange('ready')}
            disabled={isUpdating}
            loading={isUpdating}
          >
            Mark Ready
          </Button>
        );
      case 'ready':
        return (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleStatusChange('completed')}
            disabled={isUpdating}
            loading={isUpdating}
          >
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(price);
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {order.customerName}
            </h3>
            <p className="text-sm text-gray-500">
              Order #{order.id.slice(-6)} • {formatTime(order.createdAt)}
            </p>
            {order.customerPhone && (
              <p className="text-sm text-gray-500">{order.customerPhone}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Items:</h4>
          <div className="space-y-1">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                  {item.specialInstructions && (
                    <span className="text-gray-400 italic">
                      {' '}
                      - {item.specialInstructions}
                    </span>
                  )}
                </span>
                <span className="text-gray-900 font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          </div>
        )}

        {/* Total and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900">
              Total: {formatPrice(order.totalPrice)}
            </span>
            {onViewDetails && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(order)}
              >
                View Details
              </Button>
            )}
          </div>
          {getStatusActions(order.status)}
        </div>

        {/* Estimated Ready Time */}
        {order.estimatedReadyTime && order.status === 'preparing' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Estimated ready time:</span>{' '}
              {formatTime(order.estimatedReadyTime)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;
