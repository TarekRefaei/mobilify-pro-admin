import React, { useState } from 'react';
import { Search, Star, Gift, Phone, Mail, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { CustomerLoyalty, LoyaltyProgram, Customer } from '../../types';
import { format } from 'date-fns';

interface CustomerLoyaltyListProps {
  customers: (CustomerLoyalty & { customer: Customer })[];
  loyaltyProgram: LoyaltyProgram;
}

export const CustomerLoyaltyList: React.FC<CustomerLoyaltyListProps> = ({
  customers,
  loyaltyProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stamps' | 'lastPurchase' | 'totalSpent'>('stamps');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customerLoyalty) => {
      const customer = customerLoyalty.customer;
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm)
      );
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.customer.name.toLowerCase();
          bValue = b.customer.name.toLowerCase();
          break;
        case 'stamps':
          aValue = a.currentStamps;
          bValue = b.currentStamps;
          break;
        case 'lastPurchase':
          aValue = new Date(a.lastPurchase).getTime();
          bValue = new Date(b.lastPurchase).getTime();
          break;
        case 'totalSpent':
          aValue = a.customer.totalSpent;
          bValue = b.customer.totalSpent;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getProgressPercentage = (stamps: number) => {
    return Math.min((stamps / loyaltyProgram.purchasesRequired) * 100, 100);
  };

  const getStampDisplay = (stamps: number) => {
    const completed = Math.floor(stamps / loyaltyProgram.purchasesRequired);
    const current = stamps % loyaltyProgram.purchasesRequired;
    return { completed, current };
  };

  if (customers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Data</h3>
        <p className="text-gray-600">
          Customer loyalty data will appear here once customers start making purchases.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stamps">Sort by Stamps</option>
              <option value="name">Sort by Name</option>
              <option value="lastPurchase">Sort by Last Purchase</option>
              <option value="totalSpent">Sort by Total Spent</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredCustomers.map((customerLoyalty) => {
          const customer = customerLoyalty.customer;
          const { completed, current } = getStampDisplay(customerLoyalty.currentStamps);
          const progressPercentage = getProgressPercentage(current);
          
          return (
            <Card key={customerLoyalty.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {customer.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{customer.totalOrders}</div>
                      <div className="text-xs text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{completed}</div>
                      <div className="text-xs text-gray-600">Rewards Earned</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {customer.lastOrderDate 
                          ? format(new Date(customer.lastOrderDate), 'MMM dd')
                          : 'Never'
                        }
                      </div>
                      <div className="text-xs text-gray-600">Last Order</div>
                    </div>
                  </div>

                  {/* Loyalty Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Current Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {current} / {loyaltyProgram.purchasesRequired} stamps
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {loyaltyProgram.purchasesRequired - current} more for next reward
                      </span>
                      {completed > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Gift className="w-3 h-3" />
                          {completed} reward{completed > 1 ? 's' : ''} earned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stamps Visual */}
                <div className="ml-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {customerLoyalty.currentStamps}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">Total Stamps</div>
                    <div className="flex flex-wrap gap-1 max-w-[100px]">
                      {Array.from({ length: Math.min(current, loyaltyProgram.purchasesRequired) }, (_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-yellow-400 fill-current"
                        />
                      ))}
                      {Array.from({ length: Math.max(0, loyaltyProgram.purchasesRequired - current) }, (_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="w-3 h-3 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && searchTerm && (
        <Card className="p-8 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms to find customers.
          </p>
        </Card>
      )}
    </div>
  );
};
