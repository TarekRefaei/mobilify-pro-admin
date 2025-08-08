import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MenuPage from '../../pages/menu/MenuPage';
import { menuService } from '../../services/menuService';
import type { MenuItem } from '../../types';

// Mock the menu service
vi.mock('../../services/menuService', () => ({
  menuService: {
    subscribeToMenuItems: vi.fn(),
    subscribeToCategories: vi.fn(),
    updateMenuItem: vi.fn(),
    deleteMenuItem: vi.fn(),
    addMenuItem: vi.fn(),
    toggleAvailability: vi.fn(),
  },
}));

const mockCategories = [
  { id: 'cat1', name: 'Appetizers', displayOrder: 1 },
  { id: 'cat2', name: 'Main Courses', displayOrder: 2 },
  { id: 'cat3', name: 'Desserts', displayOrder: 3 },
];

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    price: 12.99,
    category: 'Appetizers',
    imageUrl: 'https://example.com/caesar-salad.jpg',
    isAvailable: true,
    displayOrder: 1,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '2',
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken breast with herbs',
    price: 18.99,
    category: 'Main Courses',
    imageUrl: 'https://example.com/grilled-chicken.jpg',
    isAvailable: true,
    displayOrder: 1,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: '3',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with ganache',
    price: 8.99,
    category: 'Desserts',
    imageUrl: 'https://example.com/chocolate-cake.jpg',
    isAvailable: false,
    displayOrder: 1,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  },
];

const renderMenuPage = () => {
  return render(
    <BrowserRouter>
      <MenuPage />
    </BrowserRouter>
  );
};

describe('Menu Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the menu items subscription
    const mockSubscribeItems = vi.mocked(menuService.subscribeToMenuItems);
    mockSubscribeItems.mockImplementation(callback => {
      setTimeout(() => callback(mockMenuItems), 100);
      return vi.fn();
    });

    // Mock the categories subscription
    const mockSubscribeCategories = vi.mocked(
      menuService.subscribeToCategories
    );
    mockSubscribeCategories.mockImplementation(callback => {
      setTimeout(() => callback(mockCategories), 100);
      return vi.fn();
    });

    // Mock other service methods
    vi.mocked(menuService.updateMenuItem).mockResolvedValue(undefined);
    vi.mocked(menuService.deleteMenuItem).mockResolvedValue(undefined);
    vi.mocked(menuService.addMenuItem).mockResolvedValue('new-item-id');
    vi.mocked(menuService.toggleAvailability).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('displays menu items organized by categories', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Check that category tabs are displayed
    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.getByText('Appetizers')).toBeInTheDocument();
    expect(screen.getByText('Main Courses')).toBeInTheDocument();
    expect(screen.getByText('Desserts')).toBeInTheDocument();

    // Check that menu items are displayed
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();

    // Check prices are displayed
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$18.99')).toBeInTheDocument();
    expect(screen.getByText('$8.99')).toBeInTheDocument();
  });

  it('filters menu items by category when tab is clicked', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Click on "Appetizers" tab
    fireEvent.click(screen.getByText('Appetizers'));

    // Should show only appetizer items
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.queryByText('Grilled Chicken')).not.toBeInTheDocument();
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();

    // Click on "Main Courses" tab
    fireEvent.click(screen.getByText('Main Courses'));

    // Should show only main course items
    expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
  });

  it('toggles item availability when availability switch is clicked', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Find availability toggles (should be switches or buttons)
    const availabilityToggles = screen.getAllByRole('switch');
    expect(availabilityToggles.length).toBeGreaterThan(0);

    // Click the first toggle
    fireEvent.click(availabilityToggles[0]);

    // Verify that toggleAvailability was called
    await waitFor(() => {
      expect(menuService.toggleAvailability).toHaveBeenCalledWith('1', false);
    });
  });

  it('displays availability status correctly', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Check that available items show as available
    const caesarCard = screen
      .getByText('Caesar Salad')
      .closest('[data-testid="menu-item-card"]');
    expect(caesarCard).not.toHaveClass('opacity-50');

    // Check that unavailable items show as unavailable
    const cakeCard = screen
      .getByText('Chocolate Cake')
      .closest('[data-testid="menu-item-card"]');
    expect(cakeCard).toHaveClass('opacity-50');
  });

  it('opens add menu item form when add button is clicked', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Find and click the "Add Menu Item" button
    const addButton = screen.getByText('Add Menu Item');
    fireEvent.click(addButton);

    // Should open the form modal
    await waitFor(() => {
      expect(screen.getByText('Add New Menu Item')).toBeInTheDocument();
    });

    // Check that form fields are present
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('searches menu items when search input is used', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search menu items...');

    // Type in search term
    fireEvent.change(searchInput, { target: { value: 'chicken' } });

    // Should show only matching items
    await waitFor(() => {
      expect(screen.getByText('Grilled Chicken')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
      expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    });
  });

  it('handles real-time menu updates', async () => {
    const { rerender } = renderMenuPage();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Simulate a new menu item being added
    const newMenuItem: MenuItem = {
      id: '4',
      name: 'Fish Tacos',
      description: 'Fresh fish tacos with lime',
      price: 14.99,
      category: 'Main Courses',
      imageUrl: 'https://example.com/fish-tacos.jpg',
      isAvailable: true,
      displayOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock the subscription to return updated items
    const mockSubscribeItems = vi.mocked(menuService.subscribeToMenuItems);
    mockSubscribeItems.mockImplementation(callback => {
      setTimeout(() => callback([...mockMenuItems, newMenuItem]), 100);
      return vi.fn();
    });

    // Re-render to trigger the subscription update
    rerender(
      <BrowserRouter>
        <MenuPage />
      </BrowserRouter>
    );

    // Wait for the new item to appear
    await waitFor(() => {
      expect(screen.getByText('Fish Tacos')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    // Mock subscriptions to not call callbacks immediately
    vi.mocked(menuService.subscribeToMenuItems).mockImplementation(() =>
      vi.fn()
    );
    vi.mocked(menuService.subscribeToCategories).mockImplementation(() =>
      vi.fn()
    );

    renderMenuPage();

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows item images when available', async () => {
    renderMenuPage();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    });

    // Check that images are displayed
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    // Check specific image sources
    expect(screen.getByAltText('Caesar Salad')).toHaveAttribute(
      'src',
      'https://example.com/caesar-salad.jpg'
    );
    expect(screen.getByAltText('Grilled Chicken')).toHaveAttribute(
      'src',
      'https://example.com/grilled-chicken.jpg'
    );
  });
});
