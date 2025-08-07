import { collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components';
import { db } from '../../config/firebase';
import type { MenuCategory, MenuItem, Order } from '../../types';
import { seedDatabase } from '../../utils/seedData';

// Define a type for debugResult
interface DebugResult {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  orders: Order[];
}

const AdminPage = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    categories?: number;
    menuItems?: number;
    orders?: number;
    error?: string;
  } | null>(null);
  const [connectionTest, setConnectionTest] = useState<{
    success: boolean;
    error?: string;
    details?: string;
  } | null>(null);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionTest(null);

    try {
      console.log('🔍 Testing Firebase connection...');
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);

      setConnectionTest({
        success: true,
        details: `✅ Connected! Found ${snapshot.size} orders in database.`
      });
      console.log('✅ Firebase connection successful!', snapshot.size, 'orders found');
    } catch (error: unknown) {
      console.error('❌ Firebase connection failed:', error);
      setConnectionTest({
        success: false,
        error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as { message?: string }).message || 'Unknown connection error' : 'Unknown connection error',
        details: 'Check browser console for more details. This might be caused by ad blockers or browser extensions.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDebugDatabase = async () => {
    setIsDebugging(true);
    setDebugResult(null);

    try {
      console.log('🔍 Debugging database contents...');

      // Check menu items
      const menuItemsQuery = query(
        collection(db, 'menuItems'),
        where('restaurantId', '==', 'demo-restaurant-123')
      );
      const menuItemsSnapshot = await getDocs(menuItemsQuery);
      const menuItems: MenuItem[] = [];
      menuItemsSnapshot.forEach((doc) => {
        menuItems.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      // Check categories
      const categoriesQuery = query(
        collection(db, 'menuCategories'),
        where('restaurantId', '==', 'demo-restaurant-123')
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categories: MenuCategory[] = [];
      categoriesSnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
      });

      // Check orders
      const ordersQuery = query(
        collection(db, 'orders'),
        where('restaurantId', '==', 'demo-restaurant-123')
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders: Order[] = [];
      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      console.log('📊 Debug results:', { menuItems, categories, orders });
      setDebugResult({ menuItems, categories, orders });

    } catch (error: unknown) {
      console.error('❌ Debug failed:', error);
      setDebugResult({ menuItems: [], categories: [], orders: [] });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const result = await seedDatabase();
      setSeedResult(result);
    } catch (error: unknown) {
      setSeedResult({
        success: false,
        error: (typeof error === 'object' && error !== null && 'message' in error) ? (error as { message?: string }).message || 'Unknown error occurred' : 'Unknown error occurred'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Tools</h1>
        <p className="text-gray-600">
          Development tools for managing the application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Test Firebase Connection
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              First, test if Firebase is accessible. If this fails, you may need to disable ad blockers.
            </p>

            <Button
              onClick={handleTestConnection}
              disabled={isTesting}
              variant="secondary"
            >
              {isTesting ? 'Testing Connection...' : 'Test Firebase Connection'}
            </Button>
          </div>

          {connectionTest && (
            <div className={`p-4 rounded-lg ${
              connectionTest.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {connectionTest.success ? (
                <div>
                  <div className="flex items-center">
                    <span className="text-green-400 text-xl mr-2">✅</span>
                    <h4 className="text-green-800 font-medium">
                      Firebase connection successful!
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{connectionTest.details}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <span className="text-red-400 text-xl mr-2">❌</span>
                    <h4 className="text-red-800 font-medium">
                      Firebase connection failed
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    <p><strong>Error:</strong> {connectionTest.error}</p>
                    <p className="mt-1">{connectionTest.details}</p>
                    <div className="mt-3 p-3 bg-red-100 rounded">
                      <p className="font-medium">💡 Solutions to try:</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Disable ad blocker for localhost:5174</li>
                        <li>Try incognito/private browsing mode</li>
                        <li>Check browser console for detailed errors</li>
                        <li>Try a different browser</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Debug Database Contents
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Check what data is actually stored in Firebase collections.
            </p>

            <Button
              onClick={handleDebugDatabase}
              disabled={isDebugging}
              variant="secondary"
            >
              {isDebugging ? 'Checking Database...' : 'Debug Database'}
            </Button>
          </div>

          {debugResult && (
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-2">Database Contents:</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">Menu Items ({debugResult.menuItems.length})</p>
                    {debugResult.menuItems.map((item, i) => (
                      <p key={i} className="text-xs text-gray-600">{item.name}</p>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium">Categories ({debugResult.categories.length})</p>
                    {debugResult.categories.map((cat, i) => (
                      <p key={i} className="text-xs text-gray-600">{cat.name}</p>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium">Orders ({debugResult.orders.length})</p>
                    <p className="text-xs text-gray-600">
                      {debugResult.orders.length > 0 ? 'Orders found' : 'No orders'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Seed Sample Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add sample data to test the dashboard and menu management with real Firebase data.
              This will create 3 categories, 3 menu items, and 15 orders for today.
            </p>

            <Button
              onClick={handleSeedDatabase}
              disabled={isSeeding || !!(connectionTest && !connectionTest.success)}
              variant="primary"
            >
              {isSeeding ? 'Seeding Database...' : 'Seed Database'}
            </Button>

            {connectionTest && !connectionTest.success && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Fix Firebase connection first before seeding data
              </p>
            )}
          </div>

          {seedResult && (
            <div className={`p-4 rounded-lg ${
              seedResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {seedResult.success ? (
                <div>
                  <div className="flex items-center">
                    <span className="text-green-400 text-xl mr-2">✅</span>
                    <h4 className="text-green-800 font-medium">
                      Database seeded successfully!
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Added {seedResult.categories} categories</p>
                    <p>Added {seedResult.menuItems} menu items</p>
                    <p>Added {seedResult.orders} orders</p>
                    <p className="mt-2 font-medium">
                      🎉 Go to Dashboard to see real data, or Menu Management to see items!
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center">
                    <span className="text-red-400 text-xl mr-2">❌</span>
                    <h4 className="text-red-800 font-medium">
                      Seeding failed
                    </h4>
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{seedResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Current Data Status
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-orange-400 text-xl mr-2">⚠️</span>
                <div>
                  <h4 className="text-orange-800 font-medium">
                    Dashboard showing demo data
                  </h4>
                  <div className="mt-2 text-sm text-orange-700">
                    <p><strong>Reason:</strong> Firebase Firestore security rules are blocking database access</p>
                    <p><strong>Error:</strong> "Missing or insufficient permissions"</p>

                    <div className="mt-3 p-3 bg-orange-100 rounded">
                      <p className="font-medium">🔧 How to fix:</p>
                      <ol className="mt-1 list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                        <li>Select project: <code className="bg-orange-200 px-1 rounded">mobilify-pro-admin</code></li>
                        <li>Go to <strong>Firestore Database → Rules</strong></li>
                        <li>Replace rules with: <code className="bg-orange-200 px-1 rounded">allow read, write: if request.auth != null;</code></li>
                        <li>Click <strong>Publish</strong> and refresh this page</li>
                      </ol>
                    </div>

                    <p className="mt-2 text-xs">
                      📄 See <code>firebase-setup.md</code> for detailed instructions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Firebase Project:</span>
              <span className="font-medium">mobilify-pro-admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurant ID:</span>
              <span className="font-medium">demo-restaurant-123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Source:</span>
              <span className="font-medium text-orange-600">
                Demo Data (Fallback)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;