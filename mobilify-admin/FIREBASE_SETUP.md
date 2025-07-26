# Firebase Setup Guide for Mobilify Pro Admin Panel

## Overview
This guide explains how to set up Firebase Firestore security rules and authentication for the Mobilify Pro Admin Panel.

## Current Status
- ✅ Firebase project connected
- ❌ Firestore security rules need configuration
- ❌ Authentication users need to be created

## Quick Fix for Development

### Option 1: Use Demo Mode (Recommended for Testing)
The application automatically falls back to demo data when Firebase permissions are denied. Simply use the demo credentials:

**Demo Login:**
- Email: `admin@restaurant.com`
- Password: `demo123`

This will show demo orders and allow you to test all features without Firebase setup.

### Option 2: Configure Firebase (For Production)

#### Step 1: Set up Firestore Security Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `mobilify-pro-admin`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to orders for authenticated users
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to restaurants for authenticated users
    match /restaurants/{restaurantId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to menu items for authenticated users
    match /menuItems/{itemId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to reservations for authenticated users
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Step 2: Create Authentication Users
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Create a user with:
   - Email: `admin@restaurant.co`
   - Password: `password123`

#### Step 3: Enable Authentication Methods
1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider

#### Step 4: Create Restaurant Document
1. Go to **Firestore Database** → **Data**
2. Create a collection called `restaurants`
3. Add a document with ID: `demo-restaurant-123`
4. Add fields:
   ```json
   {
     "id": "demo-restaurant-123",
     "name": "Demo Restaurant",
     "ownerId": "demo-user-123",
     "address": "123 Demo Street",
     "phone": "+1234567890",
     "email": "admin@restaurant.com",
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00Z",
     "updatedAt": "2024-01-01T00:00:00Z"
   }
   ```

## Testing the Setup

### With Demo Mode:
1. Login with `admin@restaurant.com` / `demo123`
2. Navigate to Orders page
3. You should see demo orders automatically

### With Firebase Setup:
1. Login with the Firebase user you created
2. Navigate to Orders page
3. Click "Create Demo Orders" to populate with test data
4. Test real-time updates and order management

## Troubleshooting

### "Missing or insufficient permissions" Error
- **Cause**: Firestore security rules are too restrictive
- **Solution**: Follow Step 1 above to update security rules

### "User not found" Error
- **Cause**: No Firebase user exists with the provided credentials
- **Solution**: Follow Step 2 above to create the user

### Demo Data Not Showing
- **Cause**: Application is trying to connect to Firebase instead of using demo mode
- **Solution**: Ensure you're using the exact demo credentials: `admin@restaurant.com` / `demo123`

## Security Notes

⚠️ **Important**: The security rules provided above are for development only. For production:

1. Implement proper user role-based access control
2. Restrict access based on restaurant ownership
3. Add field-level validation
4. Implement rate limiting

## Next Steps

1. Test the application with demo mode
2. If needed, set up Firebase authentication and security rules
3. Create additional test users and restaurants
4. Implement proper production security rules

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Firebase project configuration
3. Ensure all environment variables are correctly set
4. Try demo mode first to isolate Firebase-related issues
