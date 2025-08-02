import React, { useState, useEffect } from 'react';
import { Save, Clock, Phone, Mail, MapPin, Globe, Bell, Settings as SettingsIcon, DollarSign, Timer } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSettings } from '../../hooks/useSettings';
import type { SettingsFormData } from '../../types';

const SettingsPage: React.FC = () => {
  const { settings, loading, error, updateSettings } = useSettings();
  const [formData, setFormData] = useState<SettingsFormData>({
    businessHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
      sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' },
    },
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      website: '',
    },
    preferences: {
      enableNotifications: true,
      autoAcceptOrders: false,
      defaultPreparationTime: 20,
      currency: 'USD',
      timezone: 'America/New_York',
    },
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'hours' | 'contact' | 'preferences'>('hours');

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        businessHours: settings.businessHours,
        contactInfo: settings.contactInfo,
        preferences: settings.preferences,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      await updateSettings(formData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessHourChange = (day: string, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleContactInfoChange = (field: keyof typeof formData.contactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  const handlePreferenceChange = (field: keyof typeof formData.preferences, value: boolean | number | string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading settings: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const tabs = [
    { key: 'hours', label: 'Business Hours', icon: Clock },
    { key: 'contact', label: 'Contact Info', icon: Phone },
    { key: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-600">Manage your restaurant information and preferences</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
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
      {activeTab === 'hours' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h2>
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day.key} className="flex items-center gap-4">
                <div className="w-24">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.businessHours[day.key]?.isOpen || false}
                      onChange={(e) => handleBusinessHourChange(day.key, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{day.label}</span>
                  </label>
                </div>
                
                {formData.businessHours[day.key]?.isOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.businessHours[day.key]?.openTime || '09:00'}
                      onChange={(e) => handleBusinessHourChange(day.key, 'openTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.businessHours[day.key]?.closeTime || '22:00'}
                      onChange={(e) => handleBusinessHourChange(day.key, 'closeTime', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {!formData.businessHours[day.key]?.isOpen && (
                  <span className="text-gray-500 text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'contact' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <Input
                  label="Phone Number"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  placeholder="info@restaurant.com"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Input
                  label="Address"
                  value={formData.contactInfo.address}
                  onChange={(e) => handleContactInfoChange('address', e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <Input
                  label="Website (Optional)"
                  type="url"
                  value={formData.contactInfo.website || ''}
                  onChange={(e) => handleContactInfoChange('website', e.target.value)}
                  placeholder="https://restaurant.com"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Preferences</h2>
          <div className="space-y-6">
            {/* Notification Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.preferences.enableNotifications}
                    onChange={(e) => handlePreferenceChange('enableNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable push notifications for new orders</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.preferences.autoAcceptOrders}
                    onChange={(e) => handlePreferenceChange('autoAcceptOrders', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Automatically accept new orders</span>
                </label>
              </div>
            </div>

            {/* Order Settings */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Order Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.preferences.defaultPreparationTime}
                    onChange={(e) => handlePreferenceChange('defaultPreparationTime', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Currency
                  </label>
                  <select
                    value={formData.preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
