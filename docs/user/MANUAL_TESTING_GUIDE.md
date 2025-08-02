# 🧪 **Manual Testing Guide - Cairo Bites Demo Restaurant**

## **🎯 Quick Start Testing**

### **Step 1: Access Production Application**
1. **Open Browser:** Navigate to production URL
   ```
   https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app
   ```

2. **Verify Application Loads:**
   - ✅ Page loads without errors
   - ✅ Login form is displayed
   - ✅ No console errors in browser dev tools

### **Step 2: Create Demo Account**
1. **Create Test Account:**
   - **Email:** `demo@cairobites.com`
   - **Password:** `CairoBites2025!`
   - **Note:** Use Firebase Console to create this account if registration is not available

2. **Login Verification:**
   - ✅ Login successful
   - ✅ Redirected to dashboard
   - ✅ User session persists on page refresh

---

## **🏪 Phase 1: Restaurant Setup (15 minutes)**

### **Configure Restaurant Profile**
1. **Navigate to Settings Page**
2. **Enter Restaurant Information:**
   ```
   Restaurant Name: Cairo Bites
   Arabic Name: كايرو بايتس
   Address: 15 Tahrir Square, Downtown Cairo, Egypt
   Phone: +20 2 2792 1234
   Email: info@cairobites.com
   Description: Authentic Egyptian cuisine in the heart of Cairo
   ```

3. **Set Business Hours:**
   ```
   Monday-Thursday: 08:00 - 23:00
   Friday-Saturday: 08:00 - 24:00
   Sunday: 09:00 - 22:00
   ```

### **Seed Demo Data**
1. **Navigate to Admin Page**
2. **Test Firebase Connection:**
   - Click "Test Firebase Connection"
   - ✅ Should show "Connected successfully"

3. **Seed Database:**
   - Click "Seed Database" button
   - ✅ Should create:
     - 5 Categories (Main Course, Breakfast, Appetizers, Desserts, Beverages)
     - 16 Menu Items (Egyptian dishes with Arabic names)
     - 20 Sample Orders (realistic Cairo customers)

---

## **📋 Phase 2: Core Feature Testing (30 minutes)**

### **Test 1: Order Management (10 minutes)**

**Scenario:** Process orders through complete workflow

1. **View Orders Dashboard:**
   - ✅ Orders display in Kanban columns (Pending, Preparing, Ready, Completed)
   - ✅ Order cards show customer info, items, and total price
   - ✅ Order counts are accurate in each column

2. **Process Orders:**
   - **Move Pending → Preparing:** Click "Start Preparing" on pending order
   - **Move Preparing → Ready:** Click "Mark Ready" on preparing order  
   - **Move Ready → Completed:** Click "Complete Order" on ready order
   - ✅ Status changes reflect immediately
   - ✅ Orders move between columns correctly

3. **Test Real-time Updates:**
   - Open app in two browser tabs
   - Change order status in one tab
   - ✅ Other tab updates automatically (within 2-3 seconds)

### **Test 2: Menu Management (10 minutes)**

**Scenario:** Manage restaurant menu items

1. **View Menu Dashboard:**
   - ✅ Menu items display in category tabs
   - ✅ All 5 categories are visible
   - ✅ Items show name, description, price, and availability

2. **Add New Menu Item:**
   ```json
   {
     "name": "Shawarma Plate",
     "description": "Traditional chicken shawarma with rice and salad",
     "price": 60,
     "category": "Main Course",
     "isAvailable": true
   }
   ```
   - ✅ Item saves successfully
   - ✅ Appears in menu list immediately
   - ✅ Category assignment works correctly

3. **Edit Existing Item:**
   - Update Koshari price from 50 to 55 EGP
   - Toggle availability of Ful Medames to "Sold Out"
   - ✅ Changes save and persist
   - ✅ Availability toggle works correctly

### **Test 3: Dashboard Analytics (10 minutes)**

**Scenario:** Verify dashboard metrics

1. **Dashboard Overview:**
   - ✅ Today's sales total displays correctly
   - ✅ Order count matches actual orders
   - ✅ Recent activity feed shows latest actions
   - ✅ Quick action buttons work

2. **Metrics Validation:**
   - Complete an order and verify sales total increases
   - Add new menu item and verify it appears in activity feed
   - ✅ Real-time updates work correctly
   - ✅ Calculations are accurate

---

## **🔧 Phase 3: Advanced Features (20 minutes)**

### **Test 4: Reservations (7 minutes)**

1. **Create Test Reservations:**
   ```
   Customer: Ahmed Hassan
   Phone: +20 100 123 4567
   Date: Tomorrow
   Time: 19:00
   Party Size: 4
   Special Requests: Window table preferred
   ```

2. **Reservation Management:**
   - ✅ Create reservation successfully
   - ✅ View in reservations list
   - ✅ Update reservation status
   - ✅ Modify reservation details

### **Test 5: Loyalty Program (7 minutes)**

1. **Configure Loyalty Settings:**
   - Set "Buy 10, Get 1 Free" program
   - ✅ Settings save correctly
   - ✅ Program activates

2. **Test Customer Loyalty:**
   - Add loyalty points to test customer
   - ✅ Points accumulate correctly
   - ✅ Reward calculation works

### **Test 6: Push Notifications (6 minutes)**

1. **Compose Test Notification:**
   ```
   Title: Special Offer Today!
   Message: Get 20% off on all traditional Egyptian dishes. Valid until 10 PM.
   Target: All Customers
   ```

2. **Send Notification:**
   - ✅ Compose form works
   - ✅ Notification sends without errors
   - ✅ Success confirmation displayed

---

## **📊 Phase 4: Performance & Monitoring (15 minutes)**

### **Test 7: Performance Validation**

1. **Page Load Times:**
   - Dashboard: ✅ < 3 seconds
   - Orders Page: ✅ < 2 seconds  
   - Menu Page: ✅ < 2 seconds
   - Settings Page: ✅ < 2 seconds

2. **Real-time Performance:**
   - Order status updates: ✅ < 1 second
   - Menu changes: ✅ Immediate
   - Dashboard metrics: ✅ Real-time

### **Test 8: Error Handling**

1. **Test Error Scenarios:**
   - Try to save menu item without name
   - Try to create order with no items
   - Try to access invalid route
   - ✅ Appropriate error messages shown
   - ✅ App doesn't crash or break

### **Test 9: Mobile Responsiveness**

1. **Test on Mobile Device or Browser Dev Tools:**
   - ✅ Layout adapts to mobile screen
   - ✅ Navigation menu works on mobile
   - ✅ Forms are usable on touch devices
   - ✅ All features accessible on mobile

---

## **🔒 Phase 5: Security & Data Validation (10 minutes)**

### **Test 10: Authentication & Security**

1. **Authentication Flow:**
   - Logout and verify redirect to login
   - Try to access protected routes while logged out
   - ✅ Proper redirects to login page
   - ✅ Session management works correctly

2. **Data Security:**
   - Verify only restaurant's data is visible
   - Check that data persists correctly
   - ✅ No data leakage between restaurants
   - ✅ All CRUD operations work securely

---

## **✅ Testing Checklist**

### **Core Functionality**
- [ ] User authentication and session management
- [ ] Order creation, updates, and status changes  
- [ ] Menu item CRUD operations
- [ ] Dashboard metrics and real-time updates
- [ ] Navigation and routing

### **Advanced Features**
- [ ] Reservations management
- [ ] Loyalty program functionality
- [ ] Push notification system
- [ ] Settings and configuration
- [ ] Admin tools and data seeding

### **Technical Validation**
- [ ] Real-time data synchronization
- [ ] Error handling and user feedback
- [ ] Performance and load times
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### **User Experience**
- [ ] Intuitive navigation
- [ ] Clear visual feedback
- [ ] Consistent design language
- [ ] Accessible interface
- [ ] Smooth workflows

---

## **🎯 Success Criteria**

### **Minimum Requirements (Must Pass):**
- ✅ All core features functional
- ✅ Demo restaurant fully configured
- ✅ Real-time updates working
- ✅ No critical errors or bugs
- ✅ Authentication and security working

### **Optimal Results (Nice to Have):**
- ✅ All advanced features working
- ✅ Performance meets benchmarks
- ✅ Mobile experience is excellent
- ✅ User experience is smooth and intuitive
- ✅ Error handling is comprehensive

---

## **🚨 Issue Reporting**

### **Critical Issues (Stop Testing):**
- Authentication failures
- Data loss or corruption
- Complete feature breakdown
- Security vulnerabilities

### **Non-Critical Issues (Continue Testing):**
- Minor UI inconsistencies
- Performance optimizations needed
- Feature enhancements
- Documentation updates

---

## **📈 Next Steps After Testing**

1. **Document all test results**
2. **Fix any critical issues found**
3. **Optimize performance if needed**
4. **Update documentation based on findings**
5. **Prepare for Task 8: Documentation & Handover**

---

**Testing Duration:** ~90 minutes
**Environment:** Production
**Demo Account:** demo@cairobites.com / CairoBites2025!
**Restaurant:** Cairo Bites (كايرو بايتس)
