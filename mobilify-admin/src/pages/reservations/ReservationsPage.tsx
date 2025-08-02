import React, { useState } from 'react';
import { Plus, Calendar, Clock, Users, Phone, Mail, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useReservations } from '../../hooks/useReservations';
import type { Reservation } from '../../types';
import { ReservationCard } from '../../components/reservations/ReservationCard';
import { ReservationForm } from '../../components/reservations/ReservationForm';

const ReservationsPage: React.FC = () => {
  const { reservations, loading, error, updateReservationStatus } = useReservations();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Filter reservations based on search and filters
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = 
      reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    const today = new Date();
    const reservationDate = new Date(reservation.date);
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = reservationDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'upcoming') {
      matchesDate = reservationDate >= today;
    } else if (dateFilter === 'past') {
      matchesDate = reservationDate < today;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Group reservations by status
  const groupedReservations = {
    pending: filteredReservations.filter(r => r.status === 'pending'),
    confirmed: filteredReservations.filter(r => r.status === 'confirmed'),
    seated: filteredReservations.filter(r => r.status === 'seated'),
    completed: filteredReservations.filter(r => r.status === 'completed'),
    cancelled: filteredReservations.filter(r => r.status === 'cancelled'),
    no_show: filteredReservations.filter(r => r.status === 'no_show'),
  };

  const handleStatusUpdate = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading reservations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading reservations: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage table reservations and bookings</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Reservation
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              label="Search"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{groupedReservations.pending.length}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{groupedReservations.confirmed.length}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{groupedReservations.seated.length}</div>
          <div className="text-sm text-gray-600">Seated</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{groupedReservations.completed.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{groupedReservations.cancelled.length}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{groupedReservations.no_show.length}</div>
          <div className="text-sm text-gray-600">No Show</div>
        </Card>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more reservations.'
                : 'Get started by creating your first reservation.'}
            </p>
            <Button onClick={() => setShowForm(true)}>
              Create Reservation
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reservation Form Modal */}
      {showForm && (
        <ReservationForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            // Refresh will happen automatically via real-time updates
          }}
        />
      )}
    </div>
  );
};

export default ReservationsPage;
