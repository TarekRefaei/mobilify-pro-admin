import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
} from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import type { Reservation } from '../../types';
import { format } from 'date-fns';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusUpdate: (
    reservationId: string,
    newStatus: Reservation['status']
  ) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onStatusUpdate,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: Reservation['status']) => {
    setLoading(true);
    try {
      await onStatusUpdate(reservation.id, newStatus);
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailableActions = () => {
    switch (reservation.status) {
      case 'pending':
        return [
          {
            label: 'Confirm',
            status: 'confirmed' as const,
            variant: 'primary' as const,
          },
          {
            label: 'Cancel',
            status: 'cancelled' as const,
            variant: 'danger' as const,
          },
        ];
      case 'confirmed':
        return [
          {
            label: 'Mark Seated',
            status: 'seated' as const,
            variant: 'primary' as const,
          },
          {
            label: 'No Show',
            status: 'no_show' as const,
            variant: 'danger' as const,
          },
          {
            label: 'Cancel',
            status: 'cancelled' as const,
            variant: 'secondary' as const,
          },
        ];
      case 'seated':
        return [
          {
            label: 'Complete',
            status: 'completed' as const,
            variant: 'primary' as const,
          },
        ];
      default:
        return [];
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatTime = (time: string) => {
    // Assuming time is in HH:mm format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const availableActions = getAvailableActions();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {reservation.customerName}
              </h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reservation.status)}`}
              >
                {reservation.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            {reservation.tableNumber && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                Table {reservation.tableNumber}
              </div>
            )}
          </div>

          {/* Reservation Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {formatDate(reservation.date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {formatTime(reservation.time)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {reservation.partySize}{' '}
              {reservation.partySize === 1 ? 'guest' : 'guests'}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <a
                href={`tel:${reservation.customerPhone}`}
                className="hover:text-blue-600"
              >
                {reservation.customerPhone}
              </a>
            </div>
            {reservation.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${reservation.customerEmail}`}
                  className="hover:text-blue-600"
                >
                  {reservation.customerEmail}
                </a>
              </div>
            )}
          </div>

          {/* Special Requests */}
          {reservation.specialRequests && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mt-0.5" />
              <div>
                <span className="font-medium">Special Requests:</span>
                <p className="mt-1">{reservation.specialRequests}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {reservation.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4 mt-0.5" />
              <div>
                <span className="font-medium">Notes:</span>
                <p className="mt-1">{reservation.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative ml-4">
          {availableActions.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-2"
                disabled={loading}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  {availableActions.map(action => (
                    <button
                      key={action.status}
                      onClick={() => handleStatusUpdate(action.status)}
                      disabled={loading}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                        action.variant === 'danger'
                          ? 'text-red-600 hover:bg-red-50'
                          : action.variant === 'primary'
                            ? 'text-blue-600 hover:bg-blue-50'
                            : 'text-gray-700'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Created: {format(new Date(reservation.createdAt), 'MMM dd, yyyy HH:mm')}
        {reservation.updatedAt &&
          reservation.updatedAt !== reservation.createdAt && (
            <span className="ml-4">
              Updated:{' '}
              {format(new Date(reservation.updatedAt), 'MMM dd, yyyy HH:mm')}
            </span>
          )}
      </div>
    </Card>
  );
};
