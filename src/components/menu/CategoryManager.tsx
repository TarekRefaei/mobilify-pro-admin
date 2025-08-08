import { useState } from 'react';
import type { MenuCategory } from '../../types/index';
import { Button } from '../ui';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (category: MenuCategory) => void;
  onMoveCategory: (categoryId: string, direction: 'up' | 'down') => void;
  onAddCategory: () => void;
}

const CategoryManager = ({
  isOpen,
  onClose,
  categories,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
  onAddCategory,
}: CategoryManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort categories by display order
  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  // Filter categories based on search term
  const filteredCategories = sortedCategories.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Categories
          </h2>
          <div className="flex items-center gap-3">
            <Button onClick={onAddCategory} variant="primary" size="sm">
              Add Category
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first category to organize your menu items'}
              </p>
              {!searchTerm && (
                <Button onClick={onAddCategory} variant="primary">
                  Add Your First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => onMoveCategory(category.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => onMoveCategory(category.id, 'down')}
                            disabled={index === filteredCategories.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                              {category.name}
                            </h3>
                            <span className="text-sm text-gray-500">
                              #{category.displayOrder}
                            </span>
                            {!category.isActive && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              Created: {category.createdAt.toLocaleDateString()}
                            </span>
                            <span>
                              Updated: {category.updatedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onEditCategory(category)}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => onDeleteCategory(category)}
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{categories.length} total categories</span>
            <span>
              {categories.filter(cat => cat.isActive).length} active categories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
