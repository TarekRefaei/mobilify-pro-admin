import React, { useState } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import type { ReservationFormData } from '../../types';
import { useReservations } from '../../hooks/useReservations';

interface ReservationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  reservation?: any; // For editing existing reservations
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  onClose,
  onSuccess,
  reservation,
}) => {
  const { createReservation, updateReservation } = useReservations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: reservation?.customerName || '',
    customerPhone: reservation?.customerPhone || '',
    customerEmail: reservation?.customerEmail || '',
    date: reservation?.date || new Date(),
    time: reservation?.time || '',
    partySize: reservation?.partySize || 2,
    tableNumber: reservation?.tableNumber || '',
    specialRequests: reservation?.specialRequests || '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (formData.partySize < 1 || formData.partySize > 20) {
      newErrors.partySize = 'Party size must be between 1 and 20';
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      newErrors.date = 'Reservation date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (reservation) {
        await updateReservation(reservation.id, formData);
      } else {
        await createReservation(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save reservation:', error);
      setErrors({ submit: 'Failed to save reservation. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ReservationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Generate time slots (every 30 minutes from 9 AM to 10 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      timeSlots.push({ value: timeString, label: displayTime });
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {reservation ? 'Edit Reservation' : 'New Reservation'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(value) => handleInputChange('customerName', value)}
                  required
                  error={errors.customerName}
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.customerPhone}
                  onChange={(value) => handleInputChange('customerPhone', value)}
                  required
                  error={errors.customerPhone}
                />
              </div>

              <Input
                label="Email (Optional)"
                type="email"
                placeholder="Enter email address"
                value={formData.customerEmail || ''}
                onChange={(value) => handleInputChange('customerEmail', value)}
                error={errors.customerEmail}
              />
            </div>

            {/* Reservation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reservation Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date}
                    onChange={(e) => handleInputChange('date', new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
                </div>

                <Input
                  label="Party Size"
                  type="number"
                  placeholder="Number of guests"
                  value={formData.partySize.toString()}
                  onChange={(value) => handleInputChange('partySize', parseInt(value) || 1)}
                  required
                  error={errors.partySize}
                />
              </div>

              <Input
                label="Table Number (Optional)"
                placeholder="e.g., A1, B3, Patio 5"
                value={formData.tableNumber || ''}
                onChange={(value) => handleInputChange('tableNumber', value)}
              />
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests || ''}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special requests or notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {reservation ? 'Update Reservation' : 'Create Reservation'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
