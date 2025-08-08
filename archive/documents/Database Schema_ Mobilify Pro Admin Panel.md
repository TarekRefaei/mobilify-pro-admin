# **Database Schema: Mobilify Pro Admin Panel**

- **Document Version:** 1.0
- **Date:** July 25, 2025
- **Core Purpose:** To provide a definitive guide to the Cloud Firestore data structures, relationships, validation rules, and indexing strategies.

### **1\. Data Model & Collection Relationships**

While Firestore is a NoSQL database, our data has logical relationships. This diagram illustrates the connections between our primary collections.

#### **1.1. Relationship Diagram**

erDiagram  
 RESTAURANTS {  
 string id PK "Restaurant ID"  
 string name  
 string ownerId "Links to Firebase Auth UID"  
 }

    ORDERS {
        string id PK "Order ID"
        string restaurantId FK "Links to RESTAURANTS"
        string customerName
        number totalPrice
        string status
    }

    MENU\_ITEMS {
        string id PK "Menu Item ID"
        string restaurantId FK "Links to RESTAURANTS"
        string name
        number price
        boolean isAvailable
    }

    RESTAURANTS ||--o{ ORDERS : "has"
    RESTAURANTS ||--o{ MENU\_ITEMS : "has"

- **Explanation:** A `RESTAURANT` can have many `ORDERS` and many `MENU_ITEMS`. The `restaurantId` field in the `ORDERS` and `MENU_ITEMS` collections creates this logical link.

#### **1.2. Core Data Structures (Schemas)**

These TypeScript interfaces represent the required structure for documents within each collection.

// From types.ts  
import { Timestamp } from 'firebase/firestore';

export interface Restaurant {  
 id: string;  
 name: string;  
 ownerId: string; // The UID of the user who owns this restaurant  
 address: string;  
}

export interface Order {  
 id: string;  
 restaurantId: string;  
 customerName: string;  
 totalPrice: number;  
 status: 'pending' | 'preparing' | 'ready' | 'completed' | 'rejected';  
 createdAt: Timestamp;  
 items: Array\<{ id: string; name: string; quantity: number; price: number; }\>;  
}

export interface MenuItem {  
 id: string;  
 restaurantId: string;  
 name: string;  
 description: string;  
 price: number;  
 category: string;  
 isAvailable: boolean;  
}

### **2\. Indexing Strategy**

Firestore's performance depends heavily on correct indexing.

- **Automatic Indexes:** Firestore automatically creates single-field indexes for all fields in a document. This supports most simple queries (e.g., `where("status", "==", "pending")`).
- **Composite Indexes (Our Strategy):** For queries that involve multiple fields (e.g., `where("restaurantId", "==", "X").where("status", "!=", "completed")`), a composite index is required.
  - **Rule:** We will not create composite indexes pre-emptively.
  - **Process:** During development, when a query fails, Firestore will provide an error message in the console containing a **direct link** to create the necessary index. The developer (or AI operator) must follow this link to resolve the issue. This is an on-demand, as-needed strategy.

### **3\. Data Validation Rules (Firestore Security Rules)**

These rules are our primary mechanism for ensuring data integrity and security. They are enforced on the backend and cannot be bypassed by the client.

rules_version \= '2';  
service cloud.firestore {  
 match /databases/{database}/documents {

    // Helper function to check if a user owns a specific restaurant
    function isRestaurantOwner(restaurantId) {
      return get(/databases/$(database)/documents/restaurants/$(restaurantId)).data.ownerId \== request.auth.uid;
    }

    // Restaurants can be read by anyone, but only created/updated by the owner
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create: if request.auth.uid \== request.resource.data.ownerId;
      allow update: if isRestaurantOwner(restaurantId);
    }

    // Orders can only be accessed or modified by the owner of the restaurant they belong to
    match /orders/{orderId} {
      allow read, update: if isRestaurantOwner(request.resource.data.restaurantId);
      allow create: if isRestaurantOwner(request.resource.data.restaurantId)
                    // Data Validation Rules
                    && request.resource.data.totalPrice is number
                    && request.resource.data.totalPrice \> 0
                    && request.resource.data.status in \['pending', 'preparing', 'ready', 'completed', 'rejected'\]
                    && request.resource.data.customerName is string;
    }

    // Menu items follow the same ownership rules as orders
    match /menuItems/{menuItemId} {
       allow read: if true; // Menus are public
       allow create, update, delete: if isRestaurantOwner(request.resource.data.restaurantId)
                                 // Data Validation Rules
                                 && request.resource.data.name is string
                                 && request.resource.data.price is number
                                 && request.resource.data.price \>= 0
                                 && request.resource.data.isAvailable is bool;
    }

}  
}

### **4\. Migration History**

- **Version 1.0 (Initial Schema):** As a new (greenfield) project, there is no migration history. The schema defined in this document is the initial version for the first deployment. This section will be populated with details of any changes made to the schema after the application is live.
