import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { MenuItem, MenuCategory } from '../types/index';

// Collection names
const MENU_ITEMS_COLLECTION = 'menuItems';
const MENU_CATEGORIES_COLLECTION = 'menuCategories';

// Error types
export interface MenuServiceError {
  code: string;
  message: string;
}

// Firestore data conversion helpers
const menuItemToFirestore = (item: Omit<MenuItem, 'id'>) => ({
  ...item,
  createdAt: Timestamp.fromDate(item.createdAt),
  updatedAt: Timestamp.fromDate(item.updatedAt),
});

const firestoreToMenuItem = (doc: any): MenuItem => ({
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data().createdAt?.toDate() || new Date(),
  updatedAt: doc.data().updatedAt?.toDate() || new Date(),
});

const categoryToFirestore = (category: Omit<MenuCategory, 'id'>) => ({
  ...category,
  createdAt: Timestamp.fromDate(category.createdAt),
  updatedAt: Timestamp.fromDate(category.updatedAt),
});

const firestoreToCategory = (doc: any): MenuCategory => ({
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data().createdAt?.toDate() || new Date(),
  updatedAt: doc.data().updatedAt?.toDate() || new Date(),
});

class MenuService {
  // Subscribe to real-time menu items updates for a restaurant
  subscribeToMenuItems(
    restaurantId: string,
    callback: (items: MenuItem[]) => void,
    onError?: (error: MenuServiceError) => void
  ): () => void {
    try {
      const itemsQuery = query(
        collection(db, MENU_ITEMS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('category'),
        orderBy('displayOrder'),
        orderBy('name')
      );

      const unsubscribe = onSnapshot(
        itemsQuery,
        (snapshot) => {
          const items: MenuItem[] = [];
          snapshot.forEach((doc) => {
            items.push(firestoreToMenuItem(doc));
          });
          callback(items);
        },
        (error: any) => {
          console.error('Error subscribing to menu items:', error);
          
          // If it's a permissions error and we're using demo restaurant, return demo data
          if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
            console.log('Returning demo menu items due to subscription permissions error');
            callback(this.getDemoMenuItems());
            return;
          }
          
          if (onError) {
            onError({
              code: error.code || 'subscription-error',
              message: error.message || 'Failed to subscribe to menu items',
            });
          }
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up menu items subscription:', error);
      if (onError) {
        onError({
          code: error.code || 'setup-error',
          message: error.message || 'Failed to setup menu items subscription',
        });
      }
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Subscribe to real-time categories updates for a restaurant
  subscribeToCategories(
    restaurantId: string,
    callback: (categories: MenuCategory[]) => void,
    onError?: (error: MenuServiceError) => void
  ): () => void {
    try {
      const categoriesQuery = query(
        collection(db, MENU_CATEGORIES_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('displayOrder'),
        orderBy('name')
      );

      const unsubscribe = onSnapshot(
        categoriesQuery,
        (snapshot) => {
          const categories: MenuCategory[] = [];
          snapshot.forEach((doc) => {
            categories.push(firestoreToCategory(doc));
          });
          callback(categories);
        },
        (error: any) => {
          console.error('Error subscribing to categories:', error);
          
          // If it's a permissions error and we're using demo restaurant, return demo data
          if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
            console.log('Returning demo categories due to subscription permissions error');
            callback(this.getDemoCategories());
            return;
          }
          
          if (onError) {
            onError({
              code: error.code || 'subscription-error',
              message: error.message || 'Failed to subscribe to categories',
            });
          }
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up categories subscription:', error);
      if (onError) {
        onError({
          code: error.code || 'setup-error',
          message: error.message || 'Failed to setup categories subscription',
        });
      }
      return () => {}; // Return empty unsubscribe function
    }
  }

  // Get all menu items for a restaurant
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const itemsQuery = query(
        collection(db, MENU_ITEMS_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('category'),
        orderBy('displayOrder'),
        orderBy('name')
      );

      const snapshot = await getDocs(itemsQuery);
      const items: MenuItem[] = [];
      
      snapshot.forEach((doc) => {
        items.push(firestoreToMenuItem(doc));
      });

      return items;
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      
      // If it's a permissions error and we're using demo restaurant, return demo data
      if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
        console.log('Returning demo menu items due to permissions error');
        return this.getDemoMenuItems();
      }
      
      throw new Error(error.message || 'Failed to fetch menu items');
    }
  }

  // Get all categories for a restaurant
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    try {
      const categoriesQuery = query(
        collection(db, MENU_CATEGORIES_COLLECTION),
        where('restaurantId', '==', restaurantId),
        orderBy('displayOrder'),
        orderBy('name')
      );

      const snapshot = await getDocs(categoriesQuery);
      const categories: MenuCategory[] = [];
      
      snapshot.forEach((doc) => {
        categories.push(firestoreToCategory(doc));
      });

      return categories;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      
      // If it's a permissions error and we're using demo restaurant, return demo data
      if (error.code === 'permission-denied' && restaurantId === 'demo-restaurant-123') {
        console.log('Returning demo categories due to permissions error');
        return this.getDemoCategories();
      }
      
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  // Create a new menu item
  async createMenuItem(itemData: Omit<MenuItem, 'id'>): Promise<string> {
    try {
      const firestoreData = menuItemToFirestore(itemData);
      const docRef = await addDoc(collection(db, MENU_ITEMS_COLLECTION), firestoreData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      
      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && itemData.restaurantId === 'demo-restaurant-123') {
        console.log('Simulating menu item creation for demo restaurant');
        return `demo-item-${Date.now()}`;
      }
      
      throw new Error(error.message || 'Failed to create menu item');
    }
  }

  // Update a menu item
  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<void> {
    try {
      const itemRef = doc(db, MENU_ITEMS_COLLECTION, itemId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };
      
      // Remove id from updates if present
      delete (updateData as any).id;
      
      await updateDoc(itemRef, updateData);
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      
      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && itemId.startsWith('demo-')) {
        console.log('Simulating menu item update for demo restaurant');
        return;
      }
      
      throw new Error(error.message || 'Failed to update menu item');
    }
  }

  // Delete a menu item
  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      const itemRef = doc(db, MENU_ITEMS_COLLECTION, itemId);
      await deleteDoc(itemRef);
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      
      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && itemId.startsWith('demo-')) {
        console.log('Simulating menu item deletion for demo restaurant');
        return;
      }
      
      throw new Error(error.message || 'Failed to delete menu item');
    }
  }

  // Create a new category
  async createCategory(categoryData: Omit<MenuCategory, 'id'>): Promise<string> {
    try {
      const firestoreData = categoryToFirestore(categoryData);
      const docRef = await addDoc(collection(db, MENU_CATEGORIES_COLLECTION), firestoreData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating category:', error);

      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && categoryData.restaurantId === 'demo-restaurant-123') {
        console.log('Simulating category creation for demo restaurant');
        return `demo-category-${Date.now()}`;
      }

      throw new Error(error.message || 'Failed to create category');
    }
  }

  // Update a category
  async updateCategory(categoryId: string, updates: Partial<MenuCategory>): Promise<void> {
    try {
      const categoryRef = doc(db, MENU_CATEGORIES_COLLECTION, categoryId);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Remove id from updates if present
      delete (updateData as any).id;

      await updateDoc(categoryRef, updateData);
    } catch (error: any) {
      console.error('Error updating category:', error);

      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && categoryId.startsWith('demo-')) {
        console.log('Simulating category update for demo restaurant');
        return;
      }

      throw new Error(error.message || 'Failed to update category');
    }
  }

  // Delete a category
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categoryRef = doc(db, MENU_CATEGORIES_COLLECTION, categoryId);
      await deleteDoc(categoryRef);
    } catch (error: any) {
      console.error('Error deleting category:', error);

      // If it's a permissions error and we're using demo restaurant, simulate success
      if (error.code === 'permission-denied' && categoryId.startsWith('demo-')) {
        console.log('Simulating category deletion for demo restaurant');
        return;
      }

      throw new Error(error.message || 'Failed to delete category');
    }
  }

  // Get demo categories (for when Firebase is not accessible)
  getDemoCategories(): MenuCategory[] {
    return [
      {
        id: 'demo-category-1',
        restaurantId: 'demo-restaurant-123',
        name: 'Appetizers',
        description: 'Start your meal with our delicious appetizers',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-category-2',
        restaurantId: 'demo-restaurant-123',
        name: 'Main Courses',
        description: 'Our signature main dishes',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-category-3',
        restaurantId: 'demo-restaurant-123',
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-category-4',
        restaurantId: 'demo-restaurant-123',
        name: 'Beverages',
        description: 'Refreshing drinks and hot beverages',
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
  }

  // Get demo menu items (for when Firebase is not accessible)
  getDemoMenuItems(): MenuItem[] {
    return [
      {
        id: 'demo-item-1',
        restaurantId: 'demo-restaurant-123',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing',
        price: 12.99,
        category: 'Appetizers',
        categoryId: 'demo-category-1',
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
        isAvailable: true,
        displayOrder: 1,
        allergens: ['Dairy', 'Gluten'],
        preparationTime: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-item-2',
        restaurantId: 'demo-restaurant-123',
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil leaves',
        price: 18.99,
        category: 'Main Courses',
        categoryId: 'demo-category-2',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
        isAvailable: true,
        displayOrder: 1,
        allergens: ['Dairy', 'Gluten'],
        preparationTime: 15,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-item-3',
        restaurantId: 'demo-restaurant-123',
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection, served with seasonal vegetables',
        price: 24.99,
        category: 'Main Courses',
        categoryId: 'demo-category-2',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        isAvailable: true,
        displayOrder: 2,
        allergens: ['Fish'],
        preparationTime: 20,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-item-4',
        restaurantId: 'demo-restaurant-123',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
        price: 8.99,
        category: 'Desserts',
        categoryId: 'demo-category-3',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
        isAvailable: false,
        displayOrder: 1,
        allergens: ['Dairy', 'Eggs', 'Gluten'],
        preparationTime: 12,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-item-5',
        restaurantId: 'demo-restaurant-123',
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice, served chilled',
        price: 4.99,
        category: 'Beverages',
        categoryId: 'demo-category-4',
        imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
        isAvailable: true,
        displayOrder: 1,
        allergens: [],
        preparationTime: 2,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'demo-item-6',
        restaurantId: 'demo-restaurant-123',
        name: 'Chicken Wings',
        description: 'Crispy chicken wings with your choice of buffalo, BBQ, or honey mustard sauce',
        price: 14.99,
        category: 'Appetizers',
        categoryId: 'demo-category-1',
        imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
        isAvailable: true,
        displayOrder: 2,
        allergens: ['Dairy'],
        preparationTime: 18,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
  }

  // Demo function for development
  async createDemoMenuItems(_restaurantId: string): Promise<void> {
    try {
      const categories = this.getDemoCategories();
      const items = this.getDemoMenuItems();

      // Create categories first
      for (const category of categories) {
        const categoryData = { ...category };
        delete (categoryData as any).id;
        await this.createCategory(categoryData);
      }

      // Then create menu items
      for (const item of items) {
        const itemData = { ...item };
        delete (itemData as any).id;
        await this.createMenuItem(itemData);
      }

      console.log('Demo menu items created successfully');
    } catch (error) {
      console.error('Error creating demo menu items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const menuService = new MenuService();
export default menuService;