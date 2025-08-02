import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Reservation, ReservationFormData } from '../types';
import { authService } from './authService';

class ReservationService {
  private collectionName = 'reservations';

  // Get current restaurant ID from auth service
  private getCurrentRestaurantId(): string {
    const user = authService.getCurrentUser();
    if (!user?.restaurantId) {
      throw new Error('No restaurant ID found. Please log in again.');
    }
    return user.restaurantId;
  }

  // Convert Firestore document to Reservation object
  private convertFirestoreDoc(doc: any): Reservation {
    const data = doc.data();
    return {
      id: doc.id,
      restaurantId: data.restaurantId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      date: data.date.toDate(),
      time: data.time,
      partySize: data.partySize,
      tableNumber: data.tableNumber,
      status: data.status,
      specialRequests: data.specialRequests,
      notes: data.notes,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  }

  // Subscribe to real-time reservation updates
  subscribeToReservations(callback: (reservations: Reservation[]) => void): () => void {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        orderBy('date', 'desc'),
        orderBy('time', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reservations = snapshot.docs.map(doc => this.convertFirestoreDoc(doc));
        callback(reservations);
      }, (error) => {
        console.error('Error in reservations subscription:', error);
        // Fallback to demo data if Firebase fails
        callback(this.getDemoReservations());
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to reservations:', error);
      // Return demo data immediately and empty unsubscribe function
      callback(this.getDemoReservations());
      return () => {};
    }
  }

  // Create a new reservation
  async createReservation(reservationData: ReservationFormData): Promise<string> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      const now = new Date();

      const reservation = {
        restaurantId,
        customerName: reservationData.customerName,
        customerPhone: reservationData.customerPhone,
        customerEmail: reservationData.customerEmail || null,
        date: Timestamp.fromDate(new Date(reservationData.date)),
        time: reservationData.time,
        partySize: reservationData.partySize,
        tableNumber: reservationData.tableNumber || null,
        status: 'pending' as const,
        specialRequests: reservationData.specialRequests || null,
        notes: null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(collection(db, this.collectionName), reservation);
      console.log('✅ Reservation created successfully:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to create reservation:', error);
      throw new Error('Failed to create reservation. Please try again.');
    }
  }

  // Update an existing reservation
  async updateReservation(
    reservationId: string, 
    updates: Partial<ReservationFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, reservationId);
      
      const updateData: any = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Only include fields that are being updated
      if (updates.customerName !== undefined) updateData.customerName = updates.customerName;
      if (updates.customerPhone !== undefined) updateData.customerPhone = updates.customerPhone;
      if (updates.customerEmail !== undefined) updateData.customerEmail = updates.customerEmail;
      if (updates.date !== undefined) updateData.date = Timestamp.fromDate(new Date(updates.date));
      if (updates.time !== undefined) updateData.time = updates.time;
      if (updates.partySize !== undefined) updateData.partySize = updates.partySize;
      if (updates.tableNumber !== undefined) updateData.tableNumber = updates.tableNumber;
      if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;

      await updateDoc(docRef, updateData);
      console.log('✅ Reservation updated successfully:', reservationId);
    } catch (error) {
      console.error('❌ Failed to update reservation:', error);
      throw new Error('Failed to update reservation. Please try again.');
    }
  }

  // Update reservation status
  async updateReservationStatus(
    reservationId: string, 
    status: Reservation['status']
  ): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, reservationId);
      
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
      });

      console.log('✅ Reservation status updated:', reservationId, status);
    } catch (error) {
      console.error('❌ Failed to update reservation status:', error);
      throw new Error('Failed to update reservation status. Please try again.');
    }
  }

  // Delete a reservation
  async deleteReservation(reservationId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, reservationId);
      await deleteDoc(docRef);
      console.log('✅ Reservation deleted successfully:', reservationId);
    } catch (error) {
      console.error('❌ Failed to delete reservation:', error);
      throw new Error('Failed to delete reservation. Please try again.');
    }
  }

  // Get reservations for a specific date
  async getReservationsByDate(date: Date): Promise<Reservation[]> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date'),
        orderBy('time')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => this.convertFirestoreDoc(doc));
    } catch (error) {
      console.error('Failed to get reservations by date:', error);
      return this.getDemoReservations().filter(r => 
        new Date(r.date).toDateString() === date.toDateString()
      );
    }
  }

  // Check for reservation conflicts
  async checkReservationConflict(
    date: Date, 
    time: string, 
    tableNumber?: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    try {
      const dayReservations = await this.getReservationsByDate(date);
      
      return dayReservations.some(reservation => {
        // Skip the reservation being edited
        if (excludeReservationId && reservation.id === excludeReservationId) {
          return false;
        }
        
        // Check if same time slot
        if (reservation.time === time) {
          // If table number specified, check for table conflict
          if (tableNumber && reservation.tableNumber) {
            return reservation.tableNumber === tableNumber;
          }
          // If no table specified, consider it a potential conflict
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Failed to check reservation conflict:', error);
      return false; // Assume no conflict if check fails
    }
  }

  // Demo data for development/fallback
  private getDemoReservations(): Reservation[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      {
        id: 'demo-res-1',
        restaurantId: 'demo-restaurant',
        customerName: 'Ahmed Hassan',
        customerPhone: '+20 100 123 4567',
        customerEmail: 'ahmed@example.com',
        date: today,
        time: '19:00',
        partySize: 4,
        tableNumber: 'A1',
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
        notes: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: 'demo-res-2',
        restaurantId: 'demo-restaurant',
        customerName: 'Fatma Ali',
        customerPhone: '+20 101 234 5678',
        date: today,
        time: '20:30',
        partySize: 2,
        status: 'pending',
        specialRequests: 'Anniversary dinner',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: 'demo-res-3',
        restaurantId: 'demo-restaurant',
        customerName: 'Omar Mahmoud',
        customerPhone: '+20 102 345 6789',
        customerEmail: 'omar@example.com',
        date: tomorrow,
        time: '18:00',
        partySize: 6,
        tableNumber: 'B3',
        status: 'confirmed',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ];
  }
}

export const reservationService = new ReservationService();