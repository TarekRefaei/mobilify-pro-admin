import { useState } from 'react';
import type {
  MenuItem,
  MenuCategory,
  MenuItemFormData,
  MenuCategoryFormData,
} from '../../types/index';
import {
  Button,
  LoadingSpinner,
  MenuItemCard,
  MenuItemForm,
  CategoryForm,
  CategoryManager,
} from '../../components';
import { useMenu } from '../../hooks';

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null
  );
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const {
    menuItems,
    categories,
    loading,
    error,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshMenu,
  } = useMenu();

  // Filter menu items based on active category and search term
  const filteredItems = menuItems.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;

    if (!searchTerm) {
      return matchesCategory;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesName = item.name.toLowerCase().includes(searchLower);
    const matchesDescription = item.description
      .toLowerCase()
      .includes(searchLower);
    const matchesCategoryName = item.category
      .toLowerCase()
      .includes(searchLower);
    const matchesAllergens =
      item.allergens?.some(allergen =>
        allergen.toLowerCase().includes(searchLower)
      ) || false;
    const matchesPrice = item.price.toString().includes(searchTerm);

    // Special handling for availability searches
    const matchesAvailability =
      (searchLower.includes('available') && item.isAvailable) ||
      (searchLower.includes('sold out') && !item.isAvailable);

    return (
      matchesCategory &&
      (matchesName ||
        matchesDescription ||
        matchesCategoryName ||
        matchesAllergens ||
        matchesPrice ||
        matchesAvailability)
    );
  });

  // Group items by category for display
  const itemsByCategory = filteredItems.reduce(
    (acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, {
        ...item,
        isAvailable: !item.isAvailable,
      });
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  // Handle menu item form submission
  const handleMenuItemSubmit = async (formData: MenuItemFormData) => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await createMenuItem(formData);
      }
      setShowAddItemModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save menu item:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (formData: MenuCategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      setShowAddCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddItemModal(true);
  };

  // Handle edit category
  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setShowAddCategoryModal(true);
  };

  // Handle delete item
  const handleDeleteItem = async (item: MenuItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteMenuItem(item.id);
      } catch (error) {
        console.error('Failed to delete menu item:', error);
        alert('Failed to delete menu item. Please try again.');
      }
    }
  };

  // Handle modal close
  const handleCloseItemModal = () => {
    setShowAddItemModal(false);
    setEditingItem(null);
  };

  const handleCloseCategoryModal = () => {
    setShowAddCategoryModal(false);
    setEditingCategory(null);
  };

  // Handle delete category
  const handleDeleteCategory = async (category: MenuCategory) => {
    // Check if category has items
    const categoryItems = menuItems.filter(
      item => item.categoryId === category.id
    );

    if (categoryItems.length > 0) {
      alert(
        `Cannot delete category "${category.name}" because it contains ${categoryItems.length} menu items. Please move or delete the items first.`
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  // Handle category reordering
  const handleMoveCategory = async (
    categoryId: string,
    direction: 'up' | 'down'
  ) => {
    const sortedCategories = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    const currentIndex = sortedCategories.findIndex(
      cat => cat.id === categoryId
    );

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedCategories.length - 1)
    ) {
      return; // Can't move further
    }

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentCategory = sortedCategories[currentIndex];
    const targetCategory = sortedCategories[targetIndex];

    try {
      // Swap display orders
      await Promise.all([
        updateCategory(currentCategory.id, {
          ...currentCategory,
          displayOrder: targetCategory.displayOrder,
        }),
        updateCategory(targetCategory.id, {
          ...targetCategory,
          displayOrder: currentCategory.displayOrder,
        }),
      ]);
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      alert('Failed to reorder categories. Please try again.');
    }
  };

  // Handle bulk availability toggle
  const handleBulkToggleAvailability = async (
    categoryName: string,
    makeAvailable: boolean
  ) => {
    const categoryItems = filteredItems.filter(
      item => categoryName === 'all' || item.category === categoryName
    );

    if (categoryItems.length === 0) {
      return;
    }

    const confirmMessage = makeAvailable
      ? `Make all ${categoryItems.length} items in ${categoryName === 'all' ? 'all categories' : categoryName} available?`
      : `Mark all ${categoryItems.length} items in ${categoryName === 'all' ? 'all categories' : categoryName} as sold out?`;

    if (window.confirm(confirmMessage)) {
      try {
        await Promise.all(
          categoryItems.map(item =>
            updateMenuItem(item.id, { ...item, isAvailable: makeAvailable })
          )
        );
      } catch (error) {
        console.error('Failed to bulk toggle availability:', error);
        alert('Failed to update items. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error loading menu</h3>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={refreshMenu} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Menu Management
            </h1>
            <p className="text-gray-600">
              Manage your restaurant's menu items and categories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCategoryManager(true)}
            >
              Manage Categories
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddCategoryModal(true)}
            >
              Add Category
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddItemModal(true)}
            >
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name, description, category, allergens, or price..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredItems.length} item
              {filteredItems.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </div>
          )}

          {/* Quick Search Filters */}
          {!searchTerm && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Quick filters:</span>
              <button
                onClick={() => setSearchTerm('available')}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              >
                Available Items
              </button>
              <button
                onClick={() => setSearchTerm('sold out')}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              >
                Sold Out
              </button>
              <button
                onClick={() => setSearchTerm('vegetarian')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                Vegetarian
              </button>
              <button
                onClick={() => setSearchTerm('spicy')}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Spicy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeCategory === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map(category => {
              const itemCount = menuItems.filter(
                item => item.category === category.name
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.name)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeCategory === category.name
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.name} ({itemCount})
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Bulk Actions for{' '}
                {activeCategory === 'all' ? 'All Items' : activeCategory}:
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleBulkToggleAvailability(activeCategory, true)
                  }
                  variant="secondary"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Mark All Available
                </Button>
                <Button
                  onClick={() =>
                    handleBulkToggleAvailability(activeCategory, false)
                  }
                  variant="secondary"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Mark All Sold Out
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredItems.filter(item => item.isAvailable).length} available,{' '}
              {filteredItems.filter(item => !item.isAvailable).length} sold out
            </div>
          </div>
        </div>
      )}

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <h3 className="text-lg font-semibold">No menu items found</h3>
            <p className="text-sm">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by adding your first menu item'}
            </p>
          </div>
          {!searchTerm && (
            <Button onClick={() => setShowAddItemModal(true)} variant="primary">
              Add Your First Menu Item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(itemsByCategory).map(([categoryName, items]) => (
            <div key={categoryName}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {categoryName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onToggleAvailability={handleToggleAvailability}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Item Form Modal */}
      <MenuItemForm
        isOpen={showAddItemModal}
        onClose={handleCloseItemModal}
        onSubmit={handleMenuItemSubmit}
        categories={categories}
        editItem={editingItem}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      />

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showAddCategoryModal}
        onClose={handleCloseCategoryModal}
        onSubmit={handleCategorySubmit}
        editCategory={editingCategory}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      />

      {/* Category Manager Modal */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        categories={categories}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onMoveCategory={handleMoveCategory}
        onAddCategory={() => {
          setShowCategoryManager(false);
          setShowAddCategoryModal(true);
        }}
      />
    </div>
  );
};

export default MenuPage;
