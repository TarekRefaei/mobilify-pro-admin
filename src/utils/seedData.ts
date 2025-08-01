import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, MenuItem, MenuCategory } from '../types';

// Sample menu items for orders
const sampleMenuItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Koshari',
    description: 'Traditional Egyptian rice dish',
    price: 45,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Ful Medames',
    description: 'Egyptian fava beans',
    price: 25,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Mahshi',
    description: 'Stuffed vegetables',
    price: 55,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  }
];

// Sample menu categories
const sampleCategories: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Main Course',
    description: 'Traditional Egyptian main dishes',
    displayOrder: 1,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Breakfast',
    description: 'Egyptian breakfast specialties',
    displayOrder: 2,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Appetizers',
    description: 'Small plates and starters',
    displayOrder: 3,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  }
];

// Generate sample orders for today
const generateSampleOrders = (): Omit<Order, 'id'>[] => {
  const today = new Date();
  const orders: Omit<Order, 'id'>[] = [];
  
  // Create orders throughout the day
  for (let i = 0; i < 15; i++) {
    const orderTime = new Date(today);
    orderTime.setHours(9 + Math.floor(i / 2), (i % 2) * 30, 0, 0);
    
    const randomItems = sampleMenuItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    const totalPrice = randomItems.reduce((sum, item) => sum + item.price, 0);
    
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const orderType = Math.random() > 0.5 ? 'delivery' : 'pickup';

    const orderData: Omit<Order, 'id'> = {
      customerName: `Customer ${i + 1}`,
      customerPhone: `+201${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      items: randomItems.map((item, index) => ({
        id: `item-${i}-${index}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: ''
      })),
      totalPrice,
      status,
      orderType,
      notes: i % 3 === 0 ? 'Extra spicy please' : '',
      createdAt: Timestamp.fromDate(orderTime),
      updatedAt: Timestamp.fromDate(orderTime),
      restaurantId: 'demo-restaurant-123'
    };

    // Only add deliveryAddress if it's a delivery order
    if (orderType === 'delivery') {
      orderData.deliveryAddress = '123 Main St, Cairo';
    }

    orders.push(orderData);
  }
  
  return orders;
};

// Seed the database with sample data
// Clear existing menu items (they don't have displayOrder field)
const clearMenuItems = async () => {
  console.log('🧹 Clearing existing menu items...');
  const snapshot = await getDocs(collection(db, 'menuItems'));
  const deletePromises = snapshot.docs.map(docSnapshot =>
    deleteDoc(doc(db, 'menuItems', docSnapshot.id))
  );
  await Promise.all(deletePromises);
  console.log(`🗑️ Deleted ${snapshot.size} existing menu items`);
};

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing menu items first (they don't have displayOrder)
    await clearMenuItems();

    // Add sample categories first
    console.log('🏷️ Adding sample categories...');
    for (let i = 0; i < sampleCategories.length; i++) {
      const category = sampleCategories[i];
      try {
        const categoryData = {
          ...category,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        console.log(`🏷️ Adding category ${i + 1}:`, category.name, categoryData);
        const docRef = await addDoc(collection(db, 'menuCategories'), categoryData);
        console.log(`✅ Category added with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to add category ${category.name}:`, error);
        throw error;
      }
    }

    // Add sample menu items
    console.log('📝 Adding sample menu items...');
    for (let i = 0; i < sampleMenuItems.length; i++) {
      const item = sampleMenuItems[i];
      try {
        const itemData = {
          ...item,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        console.log(`📝 Adding menu item ${i + 1}:`, item.name, itemData);
        const docRef = await addDoc(collection(db, 'menuItems'), itemData);
        console.log(`✅ Menu item added with ID: ${docRef.id}`);
      } catch (error) {
        console.error(`❌ Failed to add menu item ${item.name}:`, error);
        throw error;
      }
    }

    // Add sample orders
    console.log('📋 Adding sample orders...');
    const orders = generateSampleOrders();
    for (const order of orders) {
      await addDoc(collection(db, 'orders'), order);
    }

    console.log('✅ Database seeding completed!');
    console.log(`📊 Added ${sampleCategories.length} categories, ${sampleMenuItems.length} menu items and ${orders.length} orders`);

    return {
      success: true,
      categories: sampleCategories.length,
      menuItems: sampleMenuItems.length,
      orders: orders.length
    };
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Clear all data (for testing)
export const clearDatabase = async () => {
  console.log('🧹 This function would clear the database');
  console.log('⚠️  Implement with caution in production');
  // Implementation would go here if needed
};
