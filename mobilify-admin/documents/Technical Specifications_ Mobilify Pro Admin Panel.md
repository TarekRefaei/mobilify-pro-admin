# **Technical Specifications: Mobilify Pro Admin Panel**

* **Document Version:** 1.1  
* **Date:** July 25, 2025  
* **Core Purpose:** To define the system constraints, tools, and technical standards for the project, ensuring code alignment and system integrity.

### **1\. Technology Stack**

To ensure consistency and prevent compatibility issues, all development will adhere to the following latest stable technology stack and versions as of July 2025:

* **Frontend Framework:** React `18.3.1`  
* **Build Tool:** Vite `5.3.1`  
* **Language:** TypeScript `5.5.3`  
* **Styling:** Tailwind CSS `3.4.4`  
* **Routing:** React Router DOM `6.24.0`  
* **Backend Services:** Firebase (Platform-as-a-Service)  
  * **Authentication:** Firebase Authentication `10.12.2`  
  * **Database:** Cloud Firestore `10.12.2`  
  * **Hosting:** Firebase Hosting (for the final deployment)  
* **Node.js Environment (for development):** `v22.4.0` (LTS)

### **2\. System Architecture**

The system follows a classic client-server architecture, leveraging Firebase's backend services to minimize custom server-side infrastructure.

#### **2.1. Architectural Diagram**

This diagram illustrates the flow of data and interactions between the system components.

sequenceDiagram  
    participant User as Restaurant Staff  
    participant Panel as Admin Panel (React App)  
    participant Auth as Firebase Auth  
    participant DB as Cloud Firestore  
    participant Customer as Customer (Mobile App)

    User-\>\>Panel: Enters credentials  
    Panel-\>\>Auth: signInWithEmailAndPassword(email, pass)  
    Auth--\>\>Panel: Returns JWT / Auth State  
    Panel-\>\>User: Renders protected dashboard

    Customer-\>\>DB: Creates new 'Order' document  
    DB--\>\>Panel: Pushes real-time update (onSnapshot)  
    Panel-\>\>User: Displays new order card & plays sound

    User-\>\>Panel: Clicks "Accept Order"  
    Panel-\>\>DB: updateDoc(orderId, {status: 'preparing'})  
    DB--\>\>Panel: Pushes real-time update  
    Panel-\>\>User: Moves order card to "In Progress" column

### **3\. Performance & Security Thresholds**

The application must meet the following performance and security standards to ensure a high-quality user experience.

#### **3.1. Performance**

* **Initial Page Load (Dashboard):** First Contentful Paint (FCP) must be **\< 1.5 seconds** on a standard 4G connection.  
* **API Response Time (Firestore):** 95th percentile (p95) of database reads and writes must be **\< 200ms**.  
* **Real-time Update Latency:** Changes in the database must be reflected in the UI via `onSnapshot` in **\< 1 second**.  
* **Lighthouse Score:** The deployed application must achieve a minimum score of **90** in the "Performance" category.

#### **3.2. Security**

* **Authentication:** User sessions will be managed by Firebase Auth using secure, short-lived tokens that are automatically refreshed.  
* **Database Rules:** Cloud Firestore rules will be implemented to ensure that users can only read/write data for the restaurant they are assigned to. Cross-tenant data access is strictly forbidden.  
  * *Example Rule:* `allow read, write: if request.auth.uid != null && get(/databases/$(database)/documents/restaurants/$(resource.data.restaurantId)).data.ownerId == request.auth.uid;`  
* **Data Validation:** All data written to Firestore must be validated against a schema using Firestore Rules to prevent malformed data injection.  
* **Environment Variables:** All sensitive keys (Firebase config) must be stored as environment variables (`VITE_...`) and must not be hardcoded in the source code.

### **4\. API Contracts & Data Models**

While we are using the Firestore SDK directly (not a custom REST API), we define the "contracts" through our data models and interactions with the database.

#### **4.1. Firestore Collections**

* **`restaurants`**: Stores information about each client restaurant.  
  * `id`: (Document ID)  
  * `name`: string  
  * `ownerId`: string (links to a Firebase Auth user UID)  
  * `address`: string  
* **`orders`**: Stores all order information.  
  * `restaurantId`: string (links to a `restaurants` document)  
  * ... (other fields as defined in the `Order` interface)  
* **`menuItems`**: Stores all menu items for all restaurants.  
  * `restaurantId`: string  
  * `name`: string  
  * `price`: number  
  * `isAvailable`: boolean

#### **4.2. Key Data Models (TypeScript)**

// From types.ts

import { Timestamp } from 'firebase/firestore';

// The structure for an order document in Firestore  
export interface Order {  
  id: string; // Document ID  
  restaurantId: string;  
  customerName: string;  
  customerPhone?: string;  
  items: Array\<{  
    id: string;  
    name: string;  
    quantity: number;  
    price: number;  
  }\>;  
  totalPrice: number;  
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'rejected';  
  createdAt: Timestamp;  
}

// The structure for a menu item document in Firestore  
export interface MenuItem {  
  id: string; // Document ID  
  restaurantId: string;  
  name: string;  
  description: string;  
  price: number;  
  category: string;  
  imageUrl?: string;  
  isAvailable: boolean;  
}