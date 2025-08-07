import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { RestaurantSettings, SettingsFormData } from '../types/index';
import { authService } from './authService';

class SettingsService {
  private collectionName = 'restaurant_settings';

  // Get current restaurant ID
  private getCurrentRestaurantId(): string {
    const user = authService.getCurrentUser();
    return user?.restaurantId || 'demo-restaurant';
  }

  // Convert Firestore document to RestaurantSettings
  private convertFirestoreDoc(doc: DocumentSnapshot): RestaurantSettings {
    const data = doc.data() as {
      restaurantId: string;
      businessHours: RestaurantSettings['businessHours'];
      contactInfo: RestaurantSettings['contactInfo'];
      preferences: RestaurantSettings['preferences'];
      createdAt?: { toDate: () => Date };
      updatedAt?: { toDate: () => Date };
    };
    return {
      id: doc.id,
      restaurantId: data.restaurantId,
      businessHours: data.businessHours || this.getDefaultBusinessHours(),
      contactInfo: data.contactInfo || this.getDefaultContactInfo(),
      preferences: data.preferences || this.getDefaultPreferences(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  // Get default business hours
  private getDefaultBusinessHours() {
    return {
      monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
      sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' },
    };
  }

  // Get default contact info
  private getDefaultContactInfo() {
    return {
      phone: '+1 (555) 123-4567',
      email: 'info@restaurant.com',
      address: '123 Main Street, City, State 12345',
      website: 'https://restaurant.com',
    };
  }

  // Get default preferences
  private getDefaultPreferences() {
    return {
      enableNotifications: true,
      autoAcceptOrders: false,
      defaultPreparationTime: 20,
      currency: 'USD',
      timezone: 'America/New_York',
    };
  }

  // Get demo settings data
  private getDemoSettings(): RestaurantSettings {
    return {
      id: 'demo-settings',
      restaurantId: 'demo-restaurant',
      businessHours: this.getDefaultBusinessHours(),
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'demo@mobilify.com',
        address: '123 Demo Street, Demo City, DC 12345',
        website: 'https://demo-restaurant.com',
      },
      preferences: {
        enableNotifications: true,
        autoAcceptOrders: false,
        defaultPreparationTime: 25,
        currency: 'USD',
        timezone: 'America/New_York',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get restaurant settings
  async getSettings(): Promise<RestaurantSettings> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      console.log('🔧 Fetching settings for restaurant:', restaurantId);

      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        console.log('✅ Settings found:', doc.id);
        return this.convertFirestoreDoc(doc);
      } else {
        console.log('📝 No settings found, creating default settings');
        return await this.createDefaultSettings();
      }
    } catch (error) {
      console.error('❌ Failed to fetch settings:', error);
      console.log('🔧 Using demo settings data');
      return this.getDemoSettings();
    }
  }

  // Create default settings for new restaurant
  private async createDefaultSettings(): Promise<RestaurantSettings> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      
      const defaultSettings = {
        restaurantId,
        businessHours: this.getDefaultBusinessHours(),
        contactInfo: this.getDefaultContactInfo(),
        preferences: this.getDefaultPreferences(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = doc(collection(db, this.collectionName));
      await setDoc(docRef, defaultSettings);
      
      console.log('✅ Default settings created:', docRef.id);
      
      // Return the created settings with the new ID
      return {
        id: docRef.id,
        restaurantId,
        businessHours: this.getDefaultBusinessHours(),
        contactInfo: this.getDefaultContactInfo(),
        preferences: this.getDefaultPreferences(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('❌ Failed to create default settings:', error);
      return this.getDemoSettings();
    }
  }

  // Update restaurant settings
  async updateSettings(settingsData: SettingsFormData): Promise<void> {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      console.log('🔧 Updating settings for restaurant:', restaurantId);

      // First, get the existing settings document
      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing document
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          businessHours: settingsData.businessHours,
          contactInfo: settingsData.contactInfo,
          preferences: settingsData.preferences,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Settings updated successfully');
      } else {
        // Create new document
        const docRef = doc(collection(db, this.collectionName));
        await setDoc(docRef, {
          restaurantId,
          businessHours: settingsData.businessHours,
          contactInfo: settingsData.contactInfo,
          preferences: settingsData.preferences,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Settings created successfully');
      }
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  }

  // Subscribe to settings changes
  subscribeToSettings(callback: (settings: RestaurantSettings) => void): () => void {
    try {
      const restaurantId = this.getCurrentRestaurantId();
      console.log('🔧 Subscribing to settings for restaurant:', restaurantId);

      const q = query(
        collection(db, this.collectionName),
        where('restaurantId', '==', restaurantId),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('🔧 Settings snapshot received:', snapshot.docs.length, 'documents');
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const settings = this.convertFirestoreDoc(doc);
          callback(settings);
        } else {
          // No settings found, create default and return
          this.createDefaultSettings().then(callback);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to subscribe to settings:', error);
      console.log('🔧 Using demo settings data');
      callback(this.getDemoSettings());
      return () => {}; // Return empty cleanup function
    }
  }
}

export const settingsService = new SettingsService();