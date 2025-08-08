import React, { useState } from 'react';
import {
  Send,
  X,
  Bell,
  Users,
  AlertCircle,
  CheckCircle,
  Eye,
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import type { NotificationFormData } from '../../types';

interface NotificationComposerProps {
  onSend: (notification: NotificationFormData) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
}

export const NotificationComposer: React.FC<NotificationComposerProps> = ({
  onSend,
  onClose,
  isModal = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    targetAudience: 'all',
    scheduledFor: undefined,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 50) {
      newErrors.title = 'Title must be 50 characters or less';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 200) {
      newErrors.message = 'Message must be 200 characters or less';
    }

    if (formData.scheduledFor) {
      const scheduledDate = new Date(formData.scheduledFor);
      const now = new Date();
      if (scheduledDate <= now) {
        newErrors.scheduledFor = 'Scheduled time must be in the future';
      }
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
    setSuccess(false);

    try {
      await onSend(formData);
      setSuccess(true);

      // Reset form after successful send
      setTimeout(() => {
        setFormData({
          title: '',
          message: '',
          targetAudience: 'all',
          scheduledFor: undefined,
        });
        setSuccess(false);

        if (isModal && onClose) {
          onClose();
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to send notification:', error);
      setErrors({ submit: 'Failed to send notification. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof NotificationFormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSuccess(false);
  };

  const targetAudienceOptions = [
    {
      value: 'all',
      label: 'All Customers',
      description: 'Send to all registered customers',
    },
    {
      value: 'loyal',
      label: 'Loyal Customers',
      description: 'Customers with loyalty program participation',
    },
    {
      value: 'recent',
      label: 'Recent Customers',
      description: 'Customers who ordered in the last 30 days',
    },
    {
      value: 'inactive',
      label: 'Inactive Customers',
      description: "Customers who haven't ordered recently",
    },
  ];

  const getEstimatedRecipients = () => {
    // Demo data - in real app, this would come from customer service
    switch (formData.targetAudience) {
      case 'all':
        return 1250;
      case 'loyal_customers':
        return 340;
      case 'recent_customers':
        return 890;
      default:
        return 0;
    }
  };

  const content = (
    <div className={isModal ? 'p-6' : ''}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Compose Notification
            </h2>
            <p className="text-gray-600">
              Send a push notification to your customers
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">
              Notification sent successfully!
            </p>
            <p className="text-green-700 text-sm">
              Your message has been delivered to customers.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Content */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Content
          </h3>

          <Input
            label="Title"
            placeholder="e.g., Special Offer Today!"
            value={formData.title}
            onChange={e => handleInputChange('title', e.target.value)}
            required
            error={errors.title}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/50 characters
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={e => handleInputChange('message', e.target.value)}
              placeholder="Enter your notification message..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.message && (
              <p className="text-red-600 text-sm mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/200 characters
            </p>
          </div>
        </Card>

        {/* Target Audience */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Target Audience</h3>

          <div className="space-y-3">
            {targetAudienceOptions.map(option => (
              <label
                key={option.value}
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="targetAudience"
                  value={option.value}
                  checked={formData.targetAudience === option.value}
                  onChange={e =>
                    handleInputChange('targetAudience', e.target.value)
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Users className="w-4 h-4" />
            <span>
              Estimated recipients: <strong>{getEstimatedRecipients()}</strong>{' '}
              customers
            </span>
          </div>
        </Card>

        {/* Scheduling */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Scheduling</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="scheduling"
                checked={!formData.scheduledFor}
                onChange={() => handleInputChange('scheduledFor', null)}
              />
              <span className="font-medium text-gray-900">
                Send immediately
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="scheduling"
                checked={!!formData.scheduledFor}
                onChange={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(12, 0, 0, 0);
                  handleInputChange('scheduledFor', tomorrow);
                }}
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">
                  Schedule for later
                </span>
                {formData.scheduledFor && (
                  <div className="mt-2">
                    <input
                      type="datetime-local"
                      value={
                        formData.scheduledFor instanceof Date
                          ? formData.scheduledFor.toISOString().slice(0, 16)
                          : formData.scheduledFor || ''
                      }
                      onChange={e =>
                        handleInputChange(
                          'scheduledFor',
                          new Date(e.target.value)
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.scheduledFor && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.scheduledFor}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>
        </Card>

        {/* Preview */}
        {(formData.title || formData.message) && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={e => {
                  e.preventDefault();
                  setShowPreview(!showPreview);
                }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && (
              <div className="bg-gray-900 text-white p-4 rounded-lg max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-xs text-gray-300">Your Restaurant</span>
                </div>
                <div className="font-medium text-sm mb-1">
                  {formData.title || 'Notification Title'}
                </div>
                <div className="text-sm text-gray-300">
                  {formData.message ||
                    'Notification message will appear here...'}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {isModal && onClose && (
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {formData.scheduledFor ? 'Schedule Notification' : 'Send Now'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return content;
  }

  return <Card>{content}</Card>;
};
