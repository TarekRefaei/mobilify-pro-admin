import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory, MenuItemFormData } from '../../types/index';
import { Button, Input, ImageUpload } from '../ui';
import { useAuth } from '../../hooks';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  categories: MenuCategory[];
  editItem?: MenuItem | null;
  title?: string;
}

const MenuItemForm = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editItem = null,
  title = 'Add Menu Item'
}: MenuItemFormProps) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
    displayOrder: 0,
    allergens: [],
    preparationTime: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allergenInput, setAllergenInput] = useState('');
  const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');

  const { user } = useAuth();
  const restaurantId = user?.restaurantId || 'demo-restaurant-123';

  // Reset form when modal opens/closes or edit item changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          name: editItem.name,
          description: editItem.description,
          price: editItem.price,
          category: editItem.category,
          categoryId: editItem.categoryId || '',
          imageUrl: editItem.imageUrl || '',
          isAvailable: editItem.isAvailable,
          displayOrder: editItem.displayOrder || 0,
          allergens: editItem.allergens || [],
          preparationTime: editItem.preparationTime || 0,
        });
        // Set image input method based on existing image URL
        if (editItem.imageUrl && !editItem.imageUrl.includes('firebase')) {
          setImageInputMethod('url');
        } else {
          setImageInputMethod('upload');
        }
      } else {
        setFormData({
          name: '',
          description: '',
          price: 0,
          category: '',
          categoryId: '',
          imageUrl: '',
          isAvailable: true,
          displayOrder: 0,
          allergens: [],
          preparationTime: 0,
        });
        setImageInputMethod('upload'); // Reset to upload method for new items
      }
      setErrors({});
      setAllergenInput('');
    }
  }, [isOpen, editItem]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.preparationTime && formData.preparationTime < 0) {
      newErrors.preparationTime = 'Preparation time cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save menu item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof MenuItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryName: string) => {
    const selectedCategory = categories.find(cat => cat.name === categoryName);
    setFormData(prev => ({
      ...prev,
      category: categoryName,
      categoryId: selectedCategory?.id || '',
    }));
    
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  // Handle allergen management
  const addAllergen = () => {
    const allergen = allergenInput.trim();
    if (allergen && formData.allergens && !formData.allergens.includes(allergen)) {
      setFormData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), allergen],
      }));
      setAllergenInput('');
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter(a => a !== allergen) || [],
    }));
  };

  const handleAllergenKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergen();
    }
  };

  // Handle image upload
  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  // Handle image removal
  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter item name"
                error={errors.name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                error={errors.price}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the menu item"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Category and Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menu Item Image
              </label>

              {/* Image Input Method Toggle */}
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputMethod"
                      value="upload"
                      checked={imageInputMethod === 'upload'}
                      onChange={(e) => setImageInputMethod(e.target.value as 'upload' | 'url')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Upload Image</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageInputMethod"
                      value="url"
                      checked={imageInputMethod === 'url'}
                      onChange={(e) => setImageInputMethod(e.target.value as 'upload' | 'url')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Image URL</span>
                  </label>
                </div>
              </div>

              {/* Image Upload Component */}
              {imageInputMethod === 'upload' && (
                <ImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageChange={handleImageChange}
                  onImageRemove={handleImageRemove}
                  restaurantId={restaurantId}
                  disabled={isSubmitting}
                />
              )}

              {/* Image URL Input */}
              {imageInputMethod === 'url' && (
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full"
                  />

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs">Invalid URL</div>';
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Time (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', parseInt(e.target.value) || 0)}
                placeholder="0"
                error={errors.preparationTime}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergens
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyPress={handleAllergenKeyPress}
                placeholder="Add allergen (e.g., Dairy, Nuts)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                onClick={addAllergen}
                variant="secondary"
                size="sm"
              >
                Add
              </Button>
            </div>
            {formData.allergens && formData.allergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergens.map((allergen, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Available for ordering
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;
