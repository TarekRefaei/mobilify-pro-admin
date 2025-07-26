# Firebase Setup Instructions

## Problem: "Missing or insufficient permissions" Error

The dashboard is showing demo data because Firebase Firestore security rules are blocking access to the database.

## Solution: Update Firestore Security Rules

### Option 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `mobilify-pro-admin`
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Replace the existing rules with:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write all documents
    // This is for development - use more restrictive rules in production
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. **Click "Publish"**
7. **Refresh your admin panel** and try the "Test Firebase Connection" button

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## Expected Result

After updating the security rules:

1. ✅ **"Test Firebase Connection" will succeed**
2. ✅ **"Seed Database" will work**
3. ✅ **Dashboard will show real Firebase data**
4. ✅ **Real-time updates will work**

## Security Note

The rules above allow any authenticated user to read/write all data. This is fine for development but should be restricted in production to ensure proper multi-tenant isolation.

## Troubleshooting

If you still see permission errors after updating rules:

1. **Wait 1-2 minutes** for rules to propagate
2. **Refresh the browser page**
3. **Check Firebase Console** to ensure rules were saved correctly
4. **Try logging out and back in** to refresh authentication tokens

## Next Steps

Once the rules are updated:

1. Go to `/admin` page
2. Click "Test Firebase Connection" - should show ✅ success
3. Click "Seed Database" - should add sample data
4. Go to Dashboard - should show real metrics instead of demo data
