import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Order, MenuItem, MenuCategory } from '../types';

// Cairo Bites Demo Restaurant Menu Items
const cairoBitesMenuItems: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Main Courses
  {
    name: 'Koshari',
    description: 'Traditional Egyptian rice dish with lentils, pasta, and spicy tomato sauce (كشري)',
    price: 50,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Mahshi',
    description: 'Stuffed vegetables with rice and herbs - zucchini, eggplant, and peppers (محشي)',
    price: 65,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Molokhia with Chicken',
    description: 'Traditional green soup with tender chicken pieces and rice (ملوخية بالفراخ)',
    price: 75,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    isAvailable: true,
    displayOrder: 3,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Grilled Kofta',
    description: 'Seasoned ground meat grilled to perfection, served with rice and salad (كفتة مشوية)',
    price: 80,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
    isAvailable: true,
    displayOrder: 4,
    restaurantId: 'demo-restaurant-123'
  },

  // Breakfast Items
  {
    name: 'Ful Medames',
    description: 'Egyptian fava beans with tahini, olive oil, and fresh vegetables (فول مدمس)',
    price: 30,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Shakshuka Egyptian Style',
    description: 'Eggs poached in spiced tomato sauce with Egyptian herbs (شكشوكة)',
    price: 40,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Egyptian Cheese & Honey',
    description: 'Fresh white cheese with natural honey and warm baladi bread (جبنة وعسل)',
    price: 35,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
    isAvailable: true,
    displayOrder: 3,
    restaurantId: 'demo-restaurant-123'
  },

  // Appetizers
  {
    name: 'Mixed Mezze Platter',
    description: 'Hummus, baba ganoush, tahini, and fresh vegetables (مقبلات مشكلة)',
    price: 45,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Egyptian Salad',
    description: 'Fresh tomatoes, cucumbers, onions with Egyptian dressing (سلطة مصرية)',
    price: 25,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Baba Ganoush',
    description: 'Smoky grilled eggplant dip with tahini and garlic (بابا غنوج)',
    price: 30,
    category: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1571197119282-7c4e2b8b3d8e?w=400',
    isAvailable: true,
    displayOrder: 3,
    restaurantId: 'demo-restaurant-123'
  },

  // Desserts
  {
    name: 'Om Ali',
    description: 'Traditional Egyptian bread pudding with nuts and raisins (أم علي)',
    price: 35,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Basbousa',
    description: 'Sweet semolina cake soaked in syrup with coconut (بسبوسة)',
    price: 25,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  },

  // Beverages
  {
    name: 'Fresh Mango Juice',
    description: 'Freshly squeezed Egyptian mango juice (عصير مانجو طازج)',
    price: 20,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
    isAvailable: true,
    displayOrder: 1,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Egyptian Tea',
    description: 'Traditional black tea with mint, served in glass (شاي مصري)',
    price: 10,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    isAvailable: true,
    displayOrder: 2,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Turkish Coffee',
    description: 'Rich and aromatic coffee served in traditional style (قهوة تركية)',
    price: 15,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400',
    isAvailable: true,
    displayOrder: 3,
    restaurantId: 'demo-restaurant-123'
  }
];

// Cairo Bites Menu Categories
const cairoBitesCategories: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Main Course',
    description: 'Traditional Egyptian main dishes (الأطباق الرئيسية)',
    displayOrder: 1,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Breakfast',
    description: 'Egyptian breakfast specialties (الإفطار المصري)',
    displayOrder: 2,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Appetizers',
    description: 'Small plates and starters (المقبلات)',
    displayOrder: 3,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Desserts',
    description: 'Traditional Egyptian sweets (الحلويات)',
    displayOrder: 4,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  },
  {
    name: 'Beverages',
    description: 'Fresh juices, tea, and coffee (المشروبات)',
    displayOrder: 5,
    isActive: true,
    restaurantId: 'demo-restaurant-123'
  }
];

// Generate realistic Cairo Bites orders for today
const generateCairoBitesOrders = (): Omit<Order, 'id'>[] => {
  const today = new Date();
  const orders: Omit<Order, 'id'>[] = [];

  // Egyptian customer names for realistic demo
  const customerNames = [
    'Ahmed Hassan', 'Fatma Mohamed', 'Omar Khaled', 'Nour El-Din',
    'Yasmin Ali', 'Mahmoud Saeed', 'Dina Farouk', 'Karim Mostafa',
    'Salma Ibrahim', 'Tarek Refaei', 'Mona Abdel Rahman', 'Hossam Nabil',
    'Aya Mansour', 'Mohamed Gamal', 'Rania Youssef'
  ];

  // Cairo delivery addresses
  const deliveryAddresses = [
    'Zamalek, Cairo', 'Maadi, Cairo', 'Heliopolis, Cairo',
    'Downtown Cairo', 'Dokki, Giza', 'Mohandessin, Giza',
    'New Cairo', 'Nasr City, Cairo', 'Garden City, Cairo',
    'Agouza, Giza', 'Shubra, Cairo', 'Ain Shams, Cairo'
  ];

  // Order notes in Arabic and English
  const orderNotes = [
    'Extra spicy please (زيادة حار)', 'No onions (بدون بصل)',
    'Less salt (ملح أقل)', 'Extra bread (خبز إضافي)',
    'Make it mild (خفيف)', '', '', '' // Empty notes for variety
  ];

  // Create orders throughout the day (8 AM to 10 PM)
  for (let i = 0; i < 20; i++) {
    const orderTime = new Date(today);
    const hour = 8 + Math.floor(i * 14 / 20); // Spread across 14 hours
    const minute = Math.floor(Math.random() * 60);
    orderTime.setHours(hour, minute, 0, 0);

    // Select random menu items (1-4 items per order)
    const randomItems = cairoBitesMenuItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 1);

    const totalPrice = randomItems.reduce((sum, item) => sum + (item.price * (Math.random() > 0.7 ? 2 : 1)), 0);

    // More realistic status distribution
    let status: Order['status'];
    if (i < 3) status = 'pending';
    else if (i < 6) status = 'preparing';
    else if (i < 8) status = 'ready';
    else status = 'completed';

    const orderType = Math.random() > 0.6 ? 'delivery' : 'pickup';
    const customerName = customerNames[i % customerNames.length];

    const orderData: Omit<Order, 'id'> = {
      customerName,
      customerPhone: `+201${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      items: randomItems.map((item, index) => ({
        id: `item-${i}-${index}`,
        name: item.name,
        price: item.price,
        quantity: Math.random() > 0.7 ? 2 : 1,
        notes: Math.random() > 0.8 ? 'Extra sauce' : ''
      })),
      totalPrice: Math.round(totalPrice),
      status,
      orderType,
      notes: orderNotes[Math.floor(Math.random() * orderNotes.length)],
      createdAt: Timestamp.fromDate(orderTime),
      updatedAt: Timestamp.fromDate(orderTime),
      restaurantId: 'demo-restaurant-123'
    };

    // Add delivery address for delivery orders
    if (orderType === 'delivery') {
      orderData.deliveryAddress = deliveryAddresses[Math.floor(Math.random() * deliveryAddresses.length)];
    }

    orders.push(orderData);
  }

  return orders.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
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

    // Add Cairo Bites categories first
    console.log('🏷️ Adding Cairo Bites categories...');
    for (let i = 0; i < cairoBitesCategories.length; i++) {
      const category = cairoBitesCategories[i];
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

    // Add Cairo Bites menu items
    console.log('📝 Adding Cairo Bites menu items...');
    for (let i = 0; i < cairoBitesMenuItems.length; i++) {
      const item = cairoBitesMenuItems[i];
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

    // Add Cairo Bites sample orders
    console.log('📋 Adding Cairo Bites sample orders...');
    const orders = generateCairoBitesOrders();
    for (const order of orders) {
      await addDoc(collection(db, 'orders'), order);
    }

    console.log('✅ Cairo Bites demo data seeding completed!');
    console.log(`📊 Added ${cairoBitesCategories.length} categories, ${cairoBitesMenuItems.length} menu items and ${orders.length} orders`);

    return {
      success: true,
      categories: cairoBitesCategories.length,
      menuItems: cairoBitesMenuItems.length,
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
