import { useState } from 'react';
import type { MenuItem } from '../../types/index';

interface MenuItemCardProps {
  item: MenuItem;
  onToggleAvailability: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

const MenuItemCard = ({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
}: MenuItemCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatPreparationTime = (minutes?: number) => {
    if (!minutes) return null;
    return `${minutes} min`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Item Image */}
      <div className="relative">
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.isAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.isAvailable ? 'Available' : 'Sold Out'}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        {/* Header with name and price */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-green-600 ml-2">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Additional Info */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
          {item.preparationTime && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatPreparationTime(item.preparationTime)}
            </span>
          )}
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Availability Toggle */}
          <button
            onClick={() => onToggleAvailability(item)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              item.isAvailable
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
          </button>

          {/* Edit/Delete Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
