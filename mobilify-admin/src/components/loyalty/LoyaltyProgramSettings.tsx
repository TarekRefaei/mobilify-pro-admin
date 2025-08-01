import React, { useState } from 'react';
import { Save, X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';
import type { LoyaltyProgram } from '../../types';

interface LoyaltyProgramSettingsProps {
  loyaltyProgram?: LoyaltyProgram;
  onUpdate: (settings: Partial<LoyaltyProgram>) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
}

export const LoyaltyProgramSettings: React.FC<LoyaltyProgramSettingsProps> = ({
  loyaltyProgram,
  onUpdate,
  onClose,
  isModal = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    isActive: loyaltyProgram?.isActive ?? true,
    purchasesRequired: loyaltyProgram?.purchasesRequired ?? 10,
    rewardType: loyaltyProgram?.rewardType ?? 'free_item',
    description: loyaltyProgram?.description ?? 'Buy 10 items, get 1 free!',
    termsAndConditions: loyaltyProgram?.termsAndConditions ?? 'Loyalty program terms and conditions will be displayed here.',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.purchasesRequired < 2 || formData.purchasesRequired > 50) {
      newErrors.purchasesRequired = 'Purchases required must be between 2 and 50';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.termsAndConditions.trim()) {
      newErrors.termsAndConditions = 'Terms and conditions are required';
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
      await onUpdate(formData);
      setSuccess(true);
      
      if (isModal && onClose) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to update loyalty program:', error);
      setErrors({ submit: 'Failed to update loyalty program. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSuccess(false);
  };

  const rewardTypeOptions = [
    { value: 'free_item', label: 'Free Item', description: 'Customer gets a free item of their choice' },
    { value: 'discount', label: 'Discount', description: 'Customer gets a percentage discount' },
    { value: 'free_drink', label: 'Free Drink', description: 'Customer gets a free drink' },
    { value: 'free_appetizer', label: 'Free Appetizer', description: 'Customer gets a free appetizer' },
  ];

  const content = (
    <div className={isModal ? 'p-6' : ''}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {loyaltyProgram ? 'Edit Loyalty Program' : 'Setup Loyalty Program'}
            </h2>
            <p className="text-gray-600">Configure your customer loyalty program settings</p>
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
            <p className="text-green-800 font-medium">Settings saved successfully!</p>
            <p className="text-green-700 text-sm">Your loyalty program has been updated.</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Program Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Program Status</h3>
              <p className="text-gray-600">Enable or disable the loyalty program</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </Card>

        {/* Program Configuration */}
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Program Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Purchases Required"
              type="number"
              min="2"
              max="50"
              placeholder="e.g., 10"
              value={formData.purchasesRequired.toString()}
              onChange={(e) => handleInputChange('purchasesRequired', parseInt(e.target.value) || 2)}
              required
              error={errors.purchasesRequired}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward Type
              </label>
              <select
                value={formData.rewardType}
                onChange={(e) => handleInputChange('rewardType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {rewardTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {rewardTypeOptions.find(opt => opt.value === formData.rewardType)?.description}
              </p>
            </div>
          </div>

          <Input
            label="Program Description"
            placeholder="e.g., Buy 10 items, get 1 free!"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            error={errors.description}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              placeholder="Enter the terms and conditions for your loyalty program..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.termsAndConditions && (
              <p className="text-red-600 text-sm mt-1">{errors.termsAndConditions}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Legal terms and conditions for the loyalty program
            </p>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">
                Buy {formData.purchasesRequired}, Get 1 Free
              </h4>
            </div>
            <p className="text-gray-700 mb-2">{formData.description}</p>
            <p className="text-sm text-gray-600">
              Reward: {rewardTypeOptions.find(opt => opt.value === formData.rewardType)?.label}
            </p>
          </div>
        </Card>

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
          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loyaltyProgram ? 'Update Program' : 'Create Program'}
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
