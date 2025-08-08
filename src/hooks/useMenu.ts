import { useState, useEffect, useCallback } from 'react';
import type { MenuItem, MenuCategory } from '../types/index';
import { menuService, type MenuServiceError } from '../services';
import { useAuth } from './useAuth';

interface UseMenuReturn {
  // Data
  menuItems: MenuItem[];
  categories: MenuCategory[];

  // Loading states
  loading: boolean;
  itemsLoading: boolean;
  categoriesLoading: boolean;

  // Error states
  error: string | null;
  itemsError: string | null;
  categoriesError: string | null;

  // Menu item operations
  createMenuItem: (itemData: Omit<MenuItem, 'id'>) => Promise<string>;
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;

  // Category operations
  createCategory: (categoryData: Omit<MenuCategory, 'id'>) => Promise<string>;
  updateCategory: (
    categoryId: string,
    updates: Partial<MenuCategory>
  ) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Utility functions
  refreshMenu: () => Promise<void>;
  getItemsByCategory: (categoryName: string) => MenuItem[];
  getAvailableItems: () => MenuItem[];
  getUnavailableItems: () => MenuItem[];
}

export const useMenu = (): UseMenuReturn => {
  const { user } = useAuth();
  const restaurantId = user?.restaurantId || 'demo-restaurant-123';

  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // Loading states
  const [itemsLoading, setItemsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Error states
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Computed states
  const loading = itemsLoading || categoriesLoading;
  const error = itemsError || categoriesError;

  // Error handler
  const handleError = useCallback(
    (error: MenuServiceError, type: 'items' | 'categories') => {
      const errorMessage = error.message || `Failed to load ${type}`;
      console.error(`Menu ${type} error:`, error);

      if (type === 'items') {
        setItemsError(errorMessage);
        setItemsLoading(false);
      } else {
        setCategoriesError(errorMessage);
        setCategoriesLoading(false);
      }
    },
    []
  );

  // Subscribe to menu items
  useEffect(() => {
    if (!restaurantId) return;

    setItemsLoading(true);
    setItemsError(null);

    const unsubscribe = menuService.subscribeToMenuItems(
      restaurantId,
      items => {
        setMenuItems(items);
        setItemsLoading(false);
        setItemsError(null);
      },
      error => handleError(error, 'items')
    );

    return unsubscribe;
  }, [restaurantId, handleError]);

  // Subscribe to categories
  useEffect(() => {
    if (!restaurantId) return;

    setCategoriesLoading(true);
    setCategoriesError(null);

    const unsubscribe = menuService.subscribeToCategories(
      restaurantId,
      categories => {
        setCategories(categories);
        setCategoriesLoading(false);
        setCategoriesError(null);
      },
      error => handleError(error, 'categories')
    );

    return unsubscribe;
  }, [restaurantId, handleError]);

  // Menu item operations
  const createMenuItem = useCallback(
    async (itemData: Omit<MenuItem, 'id'>): Promise<string> => {
      try {
        const itemWithRestaurant = {
          ...itemData,
          restaurantId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return await menuService.createMenuItem(itemWithRestaurant);
      } catch (error) {
        console.error('Error creating menu item:', error);
        throw new Error(
          (error as Error).message || 'Failed to create menu item'
        );
      }
    },
    [restaurantId]
  );

  const updateMenuItem = useCallback(
    async (itemId: string, updates: Partial<MenuItem>): Promise<void> => {
      try {
        const updateData = {
          ...updates,
          updatedAt: new Date(),
        };

        await menuService.updateMenuItem(itemId, updateData);
      } catch (error) {
        console.error('Error updating menu item:', error);
        throw new Error(
          (error as Error).message || 'Failed to update menu item'
        );
      }
    },
    []
  );

  const deleteMenuItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      await menuService.deleteMenuItem(itemId);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new Error((error as Error).message || 'Failed to delete menu item');
    }
  }, []);

  // Category operations
  const createCategory = useCallback(
    async (categoryData: Omit<MenuCategory, 'id'>): Promise<string> => {
      try {
        const categoryWithRestaurant = {
          ...categoryData,
          restaurantId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return await menuService.createCategory(categoryWithRestaurant);
      } catch (error) {
        console.error('Error creating category:', error);
        throw new Error(
          (error as Error).message || 'Failed to create category'
        );
      }
    },
    [restaurantId]
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      updates: Partial<MenuCategory>
    ): Promise<void> => {
      try {
        const updateData = {
          ...updates,
          updatedAt: new Date(),
        };

        await menuService.updateCategory(categoryId, updateData);
      } catch (error) {
        console.error('Error updating category:', error);
        throw new Error(
          (error as Error).message || 'Failed to update category'
        );
      }
    },
    []
  );

  const deleteCategory = useCallback(
    async (categoryId: string): Promise<void> => {
      try {
        await menuService.deleteCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw new Error(
          (error as Error).message || 'Failed to delete category'
        );
      }
    },
    []
  );

  // Utility functions
  const refreshMenu = useCallback(async (): Promise<void> => {
    try {
      setItemsLoading(true);
      setCategoriesLoading(true);
      setItemsError(null);
      setCategoriesError(null);

      const [items, cats] = await Promise.all([
        menuService.getMenuItems(restaurantId),
        menuService.getCategories(restaurantId),
      ]);

      setMenuItems(items);
      setCategories(cats);
    } catch (error) {
      console.error('Error refreshing menu:', error);
      const errorMessage = (error as Error).message || 'Failed to refresh menu';
      setItemsError(errorMessage);
      setCategoriesError(errorMessage);
    } finally {
      setItemsLoading(false);
      setCategoriesLoading(false);
    }
  }, [restaurantId]);

  const getItemsByCategory = useCallback(
    (categoryName: string): MenuItem[] => {
      return menuItems.filter(item => item.category === categoryName);
    },
    [menuItems]
  );

  const getAvailableItems = useCallback((): MenuItem[] => {
    return menuItems.filter(item => item.isAvailable);
  }, [menuItems]);

  const getUnavailableItems = useCallback((): MenuItem[] => {
    return menuItems.filter(item => !item.isAvailable);
  }, [menuItems]);

  return {
    // Data
    menuItems,
    categories,

    // Loading states
    loading,
    itemsLoading,
    categoriesLoading,

    // Error states
    error,
    itemsError,
    categoriesError,

    // Menu item operations
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,

    // Category operations
    createCategory,
    updateCategory,
    deleteCategory,

    // Utility functions
    refreshMenu,
    getItemsByCategory,
    getAvailableItems,
    getUnavailableItems,
  };
};
