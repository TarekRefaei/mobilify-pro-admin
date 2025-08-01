# 🚀 Vercel Environment Variables Setup Guide

## 📋 Quick Setup Instructions

### **Step 1: Access Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Login with: **refa3igroup@gmail.com**
3. Select project: **mobilify-admin**
4. Navigate to: **Settings → Environment Variables**

### **Step 2: Add Production Variables**

**Required Firebase Variables (Production):**
```
Variable Name: VITE_FIREBASE_API_KEY
Value: [Get from Firebase Console → mobilify-pro-admin → Project Settings]
Environment: Production

Variable Name: VITE_FIREBASE_AUTH_DOMAIN
Value: mobilify-pro-admin.firebaseapp.com
Environment: Production

Variable Name: VITE_FIREBASE_PROJECT_ID
Value: mobilify-pro-admin
Environment: Production

Variable Name: VITE_FIREBASE_STORAGE_BUCKET
Value: mobilify-pro-admin.appspot.com
Environment: Production

Variable Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: [Get from Firebase Console → mobilify-pro-admin → Project Settings]
Environment: Production

Variable Name: VITE_FIREBASE_APP_ID
Value: [Get from Firebase Console → mobilify-pro-admin → Project Settings]
Environment: Production
```

**Application Variables (Production):**
```
Variable Name: VITE_ENVIRONMENT
Value: production
Environment: Production

Variable Name: VITE_APP_ENV
Value: production
Environment: Production

Variable Name: VITE_APP_NAME
Value: Mobilify Pro Admin Panel
Environment: Production

Variable Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production
```

### **Step 3: Add Preview/Staging Variables**

**Required Firebase Variables (Preview):**
```
Variable Name: VITE_FIREBASE_API_KEY
Value: [Get from Firebase Console → mobilify-staging → Project Settings]
Environment: Preview

Variable Name: VITE_FIREBASE_AUTH_DOMAIN
Value: mobilify-staging.firebaseapp.com
Environment: Preview

Variable Name: VITE_FIREBASE_PROJECT_ID
Value: mobilify-staging
Environment: Preview

Variable Name: VITE_FIREBASE_STORAGE_BUCKET
Value: mobilify-staging.appspot.com
Environment: Preview

Variable Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: [Get from Firebase Console → mobilify-staging → Project Settings]
Environment: Preview

Variable Name: VITE_FIREBASE_APP_ID
Value: [Get from Firebase Console → mobilify-staging → Project Settings]
Environment: Preview
```

**Application Variables (Preview):**
```
Variable Name: VITE_ENVIRONMENT
Value: staging
Environment: Preview

Variable Name: VITE_APP_ENV
Value: staging
Environment: Preview

Variable Name: VITE_APP_NAME
Value: Mobilify Pro Admin Panel (Staging)
Environment: Preview

Variable Name: VITE_APP_VERSION
Value: 1.0.0-staging
Environment: Preview
```

## 🔑 How to Get Firebase Configuration Values

### **For Production (mobilify-pro-admin):**
1. Go to: https://console.firebase.google.com/
2. Select project: **mobilify-pro-admin**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** section
5. Click **Config** radio button
6. Copy the values from the config object

### **For Staging (mobilify-staging):**
1. Go to: https://console.firebase.google.com/
2. Select project: **mobilify-staging**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** section
5. Click **Config** radio button
6. Copy the values from the config object

## ✅ Verification Steps

### **After Adding Variables:**
1. Go to Vercel project dashboard
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Wait for deployment to complete
5. Visit the deployed URL
6. Check browser console for any Firebase connection errors

### **Test Firebase Connection:**
1. Open deployed application
2. Try to login (should connect to correct Firebase project)
3. Check Network tab for Firebase API calls
4. Verify data is being read from correct Firestore database

## 🚨 Important Notes

- **Never commit** `.env` files with real values to Git
- **Production** environment variables are used for `vercel --prod` deployments
- **Preview** environment variables are used for `vercel` (preview) deployments
- **Development** uses your local `.env` file
- Changes to environment variables require a **redeploy** to take effect

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Firebase project permissions
3. Ensure all required variables are set
4. Contact: alerts@mobilify.app
