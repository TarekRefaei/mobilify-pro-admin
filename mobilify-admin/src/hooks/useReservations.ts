import { useState, useEffect } from 'react';
import type { Reservation, ReservationFormData } from '../types';
import { reservationService } from '../services/reservationService';

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Subscribe to real-time updates
        unsubscribe = reservationService.subscribeToReservations((updatedReservations) => {
          setReservations(updatedReservations);
          setLoading(false);
        });
      } catch (err) {
        console.error('Failed to initialize reservations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
        setLoading(false);
      }
    };

    initializeReservations();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const createReservation = async (reservationData: ReservationFormData): Promise<void> => {
    try {
      await reservationService.createReservation(reservationData);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to create reservation:', err);
      throw err;
    }
  };

  const updateReservation = async (
    reservationId: string, 
    updates: Partial<ReservationFormData>
  ): Promise<void> => {
    try {
      await reservationService.updateReservation(reservationId, updates);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to update reservation:', err);
      throw err;
    }
  };

  const updateReservationStatus = async (
    reservationId: string, 
    status: Reservation['status']
  ): Promise<void> => {
    try {
      await reservationService.updateReservationStatus(reservationId, status);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to update reservation status:', err);
      throw err;
    }
  };

  const deleteReservation = async (reservationId: string): Promise<void> => {
    try {
      await reservationService.deleteReservation(reservationId);
      // Real-time updates will handle UI refresh
    } catch (err) {
      console.error('Failed to delete reservation:', err);
      throw err;
    }
  };

  // Helper functions for filtering and analytics
  const getReservationsByStatus = (status: Reservation['status']) => {
    return reservations.filter(reservation => reservation.status === status);
  };

  const getReservationsByDate = (date: Date) => {
    const targetDate = date.toDateString();
    return reservations.filter(reservation => 
      new Date(reservation.date).toDateString() === targetDate
    );
  };

  const getTodayReservations = () => {
    return getReservationsByDate(new Date());
  };

  const getUpcomingReservations = () => {
    const now = new Date();
    return reservations.filter(reservation => new Date(reservation.date) >= now);
  };

  const getReservationStats = () => {
    const today = new Date();
    const todayReservations = getTodayReservations();
    
    return {
      total: reservations.length,
      today: todayReservations.length,
      pending: getReservationsByStatus('pending').length,
      confirmed: getReservationsByStatus('confirmed').length,
      seated: getReservationsByStatus('seated').length,
      completed: getReservationsByStatus('completed').length,
      cancelled: getReservationsByStatus('cancelled').length,
      noShow: getReservationsByStatus('no_show').length,
      upcoming: getUpcomingReservations().length,
    };
  };

  return {
    reservations,
    loading,
    error,
    createReservation,
    updateReservation,
    updateReservationStatus,
    deleteReservation,
    getReservationsByStatus,
    getReservationsByDate,
    getTodayReservations,
    getUpcomingReservations,
    getReservationStats,
  };
};
