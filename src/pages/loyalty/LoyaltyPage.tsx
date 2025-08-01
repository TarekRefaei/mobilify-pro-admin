import React, { useState } from 'react';
import { Gift, Users, Settings, TrendingUp, Award, Star } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useLoyalty } from '../../hooks/useLoyalty';
import { LoyaltyProgramSettings } from '../../components/loyalty/LoyaltyProgramSettings';
import { CustomerLoyaltyList } from '../../components/loyalty/CustomerLoyaltyList';
import { LoyaltyStats } from '../../components/loyalty/LoyaltyStats';

const LoyaltyPage: React.FC = () => {
  const { 
    loyaltyProgram, 
    customerLoyalty, 
    stats, 
    loading, 
    error, 
    updateLoyaltyProgram 
  } = useLoyalty();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'settings'>('overview');
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading loyalty program..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading loyalty program: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-gray-600">Manage customer loyalty and rewards</p>
        </div>
        <div className="flex items-center gap-3">
          {loyaltyProgram ? (
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${loyaltyProgram.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-gray-600">
                {loyaltyProgram.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ) : (
            <Button onClick={() => setShowSettings(true)} className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Setup Loyalty Program
            </Button>
          )}
        </div>
      </div>

      {/* Program Status Card */}
      {loyaltyProgram && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Buy {loyaltyProgram.purchasesRequired}, Get 1 Free
                </h3>
                <p className="text-gray-600">
                  Customers earn stamps with each purchase and get rewards
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
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
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {loyaltyProgram ? (
              <LoyaltyStats stats={stats} loyaltyProgram={loyaltyProgram} />
            ) : (
              <Card className="p-8 text-center">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Loyalty Program</h3>
                <p className="text-gray-600 mb-4">
                  Set up a loyalty program to reward your customers and increase retention.
                </p>
                <Button onClick={() => setShowSettings(true)}>
                  Setup Loyalty Program
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'customers' && (
          <>
            {loyaltyProgram ? (
              <CustomerLoyaltyList 
                customers={customerLoyalty} 
                loyaltyProgram={loyaltyProgram}
              />
            ) : (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Data</h3>
                <p className="text-gray-600 mb-4">
                  Set up your loyalty program first to start tracking customer loyalty.
                </p>
                <Button onClick={() => setShowSettings(true)}>
                  Setup Loyalty Program
                </Button>
              </Card>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <LoyaltyProgramSettings 
            loyaltyProgram={loyaltyProgram}
            onUpdate={updateLoyaltyProgram}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <LoyaltyProgramSettings 
              loyaltyProgram={loyaltyProgram}
              onUpdate={updateLoyaltyProgram}
              onClose={() => setShowSettings(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPage;
