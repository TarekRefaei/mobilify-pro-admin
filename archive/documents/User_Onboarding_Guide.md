# **User Onboarding Guide: Mobilify Pro Admin Panel**

**Document Version:** 1.0  
**Date:** January 27, 2025  
**Purpose:** Complete guide for onboarding new restaurant clients

---

## **🎯 Onboarding Overview**

### **Target Audience:** Egyptian Restaurant Owners and Managers

### **Onboarding Method:** Invitation-Only (Manual Account Creation)

### **Admin Tool:** Firebase Console

### **Support Email:** alerts@mobilify.app

---

## **📋 Pre-Onboarding Checklist**

### **Client Qualification:**

- [ ] Restaurant has active business license
- [ ] Owner/manager has basic computer/smartphone skills
- [ ] Restaurant serves customers who would benefit from digital ordering
- [ ] Client agrees to Mobilify service terms and privacy policy

### **Required Information:**

- [ ] Restaurant name (English and Arabic if applicable)
- [ ] Owner/manager full name
- [ ] Business email address
- [ ] Phone number
- [ ] Restaurant address
- [ ] Business license number
- [ ] Preferred login email for admin panel

---

## **🔧 Technical Setup Process**

### **Step 1: Create Restaurant Account (Firebase Console)**

**Time Required:** 10 minutes

1. **Access Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select `mobilify-pro-admin` project

2. **Create Restaurant Document:**

   ```javascript
   // Navigate to Firestore Database
   // Create new document in 'restaurants' collection
   {
     id: "auto-generated-id",
     name: "Restaurant Name",
     nameArabic: "اسم المطعم", // if applicable
     address: "Full restaurant address",
     phone: "+20XXXXXXXXX",
     email: "restaurant@email.com",
     businessLicense: "License number",
     owners: ["user-uid-will-be-added-after-user-creation"],
     createdAt: "2025-01-27T10:00:00Z",
     status: "active",
     settings: {
       currency: "EGP",
       timezone: "Africa/Cairo",
       language: "en", // or "ar" for Arabic
       notifications: {
         email: true,
         push: true,
         sound: true
       }
     }
   }
   ```

3. **Create User Account:**

   ```javascript
   // Navigate to Authentication > Users
   // Click "Add user"
   {
     email: "owner@restaurant.com",
     password: "SecureTemporaryPassword123!",
     emailVerified: true,
     displayName: "Restaurant Owner Name"
   }
   ```

4. **Link User to Restaurant:**
   ```javascript
   // Update restaurant document
   // Add user UID to 'owners' array
   owners: ['newly-created-user-uid'];
   ```

### **Step 2: Send Welcome Email**

**Template:**

```
Subject: Welcome to Mobilify! Your Admin Panel Access

Hi [Restaurant Owner Name],

Welcome to the Mobilify family! We are thrilled to have [Restaurant Name] on board.

You can now access your restaurant's admin panel to manage your menu, orders, and more.

🔗 Admin Panel URL: https://mobilify-admin.vercel.app
📧 Your Email: [owner's email]
🔑 Your Temporary Password: [securely generated password]

⚠️ IMPORTANT: Please log in and change your password at your earliest convenience.

📞 Need Help?
- Reply to this email for technical support
- Call us at [support phone number]
- Check our help guide: [link to documentation]

Best regards,
Taeek Refaei
Founder, Mobilify

---
This email contains sensitive login information. Please keep it secure and delete after changing your password.
```

### **Step 3: Initial Setup Guidance**

**Phone Call/Video Session (15-20 minutes):**

1. **Login Verification:**
   - Guide client through first login
   - Help with password change
   - Verify dashboard loads correctly

2. **Basic Navigation Tour:**
   - Dashboard overview
   - Orders section (explain Kanban workflow)
   - Menu management
   - Customer database
   - Settings panel

3. **Essential First Steps:**
   - Upload restaurant logo
   - Add initial menu items (3-5 items to start)
   - Configure notification preferences
   - Test order creation (demo)

---

## **📚 Training Materials**

### **Quick Start Guide (PDF/Video)**

**Module 1: Getting Started (5 minutes)**

- Login and password change
- Dashboard overview
- Navigation basics

**Module 2: Order Management (10 minutes)**

- Understanding order statuses
- Moving orders through workflow
- Order details and customer information
- Printing receipts

**Module 3: Menu Management (10 minutes)**

- Adding new menu items
- Setting prices and descriptions
- Managing categories
- Uploading item images

**Module 4: Customer Management (5 minutes)**

- Viewing customer profiles
- Customer order history
- Loyalty program basics

**Module 5: Reports and Analytics (5 minutes)**

- Daily sales overview
- Popular items report
- Customer insights
- Performance metrics

### **Video Tutorial Scripts**

**Script 1: First Login**

```
"Welcome to Mobilify! Let me show you how to log in for the first time.

1. Go to mobilify-admin.vercel.app
2. Enter your email address
3. Enter the temporary password from our email
4. Click 'Sign In'
5. You'll be prompted to change your password - choose something secure
6. Welcome to your restaurant's admin panel!"
```

**Script 2: Managing Your First Order**

```
"Let's walk through handling your first order in Mobilify.

1. When a new order comes in, you'll see it in the 'New Orders' column
2. Click on the order to see details - customer info, items, total
3. Click 'Accept' to move it to 'Preparing'
4. When the food is ready, click 'Ready' to move it to 'Ready for Pickup'
5. When the customer collects it, click 'Complete'
6. That's it! The order is now in your completed orders."
```

---

## **🎯 Success Metrics & Follow-up**

### **Week 1 Goals:**

- [ ] Client successfully logs in and changes password
- [ ] Restaurant profile completed (logo, basic info)
- [ ] At least 5 menu items added
- [ ] First test order processed successfully
- [ ] Notification preferences configured

### **Week 2 Goals:**

- [ ] Complete menu uploaded (all categories)
- [ ] Staff trained on order management workflow
- [ ] Customer database has first entries
- [ ] Reports section explored and understood

### **Month 1 Goals:**

- [ ] 50+ orders processed through the system
- [ ] Customer loyalty program activated
- [ ] Analytics dashboard regularly reviewed
- [ ] Staff comfortable with all features

### **Follow-up Schedule:**

- **Day 1:** Welcome call and initial setup (20 minutes)
- **Day 3:** Check-in call - address any issues (10 minutes)
- **Week 1:** Training session - advanced features (30 minutes)
- **Week 2:** Performance review and optimization tips (15 minutes)
- **Month 1:** Success review and feedback collection (20 minutes)

---

## **🆘 Common Issues & Solutions**

### **Login Problems:**

**Issue:** "I can't log in"
**Solution:**

1. Verify email address is correct
2. Check if password was changed from temporary password
3. Try password reset if needed
4. Clear browser cache and cookies

### **Menu Upload Issues:**

**Issue:** "Images won't upload"
**Solution:**

1. Check image file size (max 5MB)
2. Ensure image format is JPG, PNG, or WebP
3. Try different browser
4. Check internet connection

### **Order Notifications:**

**Issue:** "I'm not getting order notifications"
**Solution:**

1. Check notification settings in profile
2. Verify browser allows notifications
3. Check email spam folder
4. Test with demo order

### **Performance Issues:**

**Issue:** "The app is slow"
**Solution:**

1. Check internet connection speed
2. Clear browser cache
3. Close unnecessary browser tabs
4. Try different browser

---

## **📞 Support Resources**

### **Contact Information:**

- **Email Support:** alerts@mobilify.app
- **Response Time:** Within 4 hours during business hours
- **Business Hours:** 9 AM - 6 PM Cairo Time, Sunday-Thursday

### **Self-Help Resources:**

- **Help Documentation:** [Link to be added]
- **Video Tutorials:** [YouTube channel to be created]
- **FAQ Section:** [Link to be added]
- **Community Forum:** [Future enhancement]

### **Emergency Support:**

- **Critical Issues:** Call [emergency number]
- **System Outages:** Automatic email notifications
- **Data Recovery:** Contact support immediately

---

## **📊 Onboarding Success Tracking**

### **Metrics to Track:**

- Time from account creation to first login
- Number of menu items added in first week
- First order processing time
- User engagement with different features
- Support ticket volume per new client

### **Success Indicators:**

- **Excellent:** Client processes 10+ orders in first week
- **Good:** Client completes profile and adds full menu
- **Needs Improvement:** Client requires multiple support calls
- **At Risk:** Client doesn't log in within 48 hours

---

**Document Status:** Ready for implementation  
**Next Steps:** Begin Phase 8 Task 1 - Firebase Project Setup
