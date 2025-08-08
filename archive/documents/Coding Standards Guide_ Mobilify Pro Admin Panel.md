# **Coding Standards Guide: Mobilify Pro Admin Panel**

- **Document Version:** 1.0
- **Date:** July 25, 2025
- **Core Purpose:** To establish a single source of truth for code style, structure, and patterns, ensuring all generated code is consistent, readable, and maintainable.

### **1\. Guiding Principle: Clean Architecture**

Our entire application will follow the principles of **Clean Architecture**. The core idea is **separation of concerns**. The UI (what the user sees) should be completely decoupled from the data source (how we get data). This makes the app easier to test, maintain, and scale.

- **UI Components** should not know _how_ data is fetched. They only know they need data and how to display it.
- **Data Services** are responsible for all communication with external sources like Firebase.
- **Hooks** contain reusable business logic that connects the UI to the services.

### **2\. File & Directory Structure**

This structure enforces our clean architecture. All new files must be placed in the appropriate directory.

/src  
├── /assets/ \# Images, fonts, sound files  
├── /components/ \# Reusable, "dumb" UI components (e.g., Button.tsx, OrderCard.tsx)  
│ └── /ui/ \# Very generic UI Primitives (e.g., shadcn/ui components)  
├── /config/ \# Firebase configuration (firebase.ts)  
├── /hooks/ \# Custom React hooks for business logic (e.g., useAuth.ts)  
├── /pages/ \# Top-level page components (e.g., LoginPage.tsx, OrdersPage.tsx)  
├── /services/ \# All external communication (e.g., authService.ts, firestoreService.ts)  
├── /types/ \# All shared TypeScript interfaces (e.g., index.ts)  
└── /utils/ \# Helper functions (e.g., formatCurrency.ts)

### **3\. Naming Conventions**

Consistency in naming is non-negotiable.

| Element Type                    | Convention                   | Example                                              |
| ------------------------------- | ---------------------------- | ---------------------------------------------------- |
| **Components**                  | `PascalCase`                 | `OrderCard.tsx`, `PrimaryButton.tsx`                 |
| **Pages**                       | `PascalCase`                 | `OrdersPage.tsx`, `SettingsPage.tsx`                 |
| **Hooks**                       | `useCamelCase`               | `useAuth.ts`, `useOrders.ts`                         |
| **Variables & Functions**       | `camelCase`                  | `const orderCount = 10;`, `function getOrders() {}`  |
| **Booleans**                    | `is`, `has`, `should` prefix | `const isLoading = true;`, `const hasError = false;` |
| **Constants**                   | `UPPER_SNAKE_CASE`           | `const MAX_ORDERS = 100;`                            |
| **TypeScript Types/Interfaces** | `PascalCase`                 | `interface Order { ... }`                            |

### **4\. Component Design: Good vs. Bad Examples**

Components must be small and have a single responsibility.

#### **BAD CODE EXAMPLE ❌**

(A component that does everything: fetches data, manages state, and renders complex UI)

// src/pages/OrdersPage.tsx (ANTI-PATTERN)  
import React, { useState, useEffect } from 'react';  
import { collection, onSnapshot } from 'firebase/firestore';  
import { db } from '../config/firebase';

const OrdersPage \= () \=\> {  
 const \[orders, setOrders\] \= useState(\[\]);  
 const \[isLoading, setIsLoading\] \= useState(true);

useEffect(() \=\> {  
 // Direct Firebase call inside a UI component\!  
 const unsub \= onSnapshot(collection(db, 'orders'), (snapshot) \=\> {  
 const fetchedOrders \= snapshot.docs.map(doc \=\> ({ id: doc.id, ...doc.data() }));  
 setOrders(fetchedOrders);  
 setIsLoading(false);  
 });  
 return () \=\> unsub();  
 }, \[\]);

if (isLoading) return \<div\>Loading...\</div\>;

return (  
 \<div\>  
 \<h1\>Live Orders\</h1\>  
 {/\* Complex rendering logic mixed in \*/}  
 {orders.map(order \=\> \<div key={order.id}\>{order.customerName}\</div\>)}  
 \</div\>  
 );  
};

#### **GOOD CODE EXAMPLE ✅**

(Concerns are separated into services, hooks, and simple components)

**1\. The Service (Data Layer)**

// src/services/orderService.ts  
import { collection, onSnapshot } from 'firebase/firestore';  
import { db } from '../config/firebase';  
import { Order } from '../types';

export const subscribeToOrders \= (callback: (orders: Order\[\]) \=\> void) \=\> {  
 const q \= collection(db, 'orders');  
 return onSnapshot(q, (snapshot) \=\> {  
 const orders \= snapshot.docs.map(doc \=\> ({ ...doc.data() })) as Order\[\];  
 callback(orders);  
 });  
};

**2\. The Hook (Business Logic)**

// src/hooks/useOrders.ts  
import { useState, useEffect } from 'react';  
import { subscribeToOrders } from '../services/orderService';  
import { Order } from '../types';

export const useOrders \= () \=\> {  
 const \[orders, setOrders\] \= useState\<Order\[\]\>(\[\]);  
 const \[isLoading, setIsLoading\] \= useState(true);

useEffect(() \=\> {  
 const unsubscribe \= subscribeToOrders((fetchedOrders) \=\> {  
 setOrders(fetchedOrders);  
 setIsLoading(false);  
 });  
 return () \=\> unsubscribe();  
 }, \[\]);

return { orders, isLoading };  
};

**3\. The Page (UI Layer)**

// src/pages/OrdersPage.tsx  
import React from 'react';  
import { useOrders } from '../hooks/useOrders';  
import { OrderCard } from '../components/OrderCard';  
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const OrdersPage \= () \=\> {  
 const { orders, isLoading } \= useOrders(); // UI just consumes the hook

if (isLoading) return \<LoadingSpinner /\>;

return (  
 \<div\>  
 \<h1\>Live Orders\</h1\>  
 {orders.map(order \=\> \<OrderCard key={order.id} order={order} /\>)}  
 \</div\>  
 );  
};

### **5\. Security Patterns & Anti-Patterns**

| Category            | Anti-Pattern ❌                                                   | Security Pattern ✅                                                                                                |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Secrets**         | Hardcoding API keys in code: `const apiKey = "AIza...";`          | Use environment variables: `const apiKey = import.meta.env.VITE_API_KEY;`                                          |
| **Data Validation** | Trusting that data from the client is correctly formatted.        | Enforce data schemas using **Firestore Security Rules** on the backend.                                            |
| **Error Handling**  | Displaying raw error objects to the user: `alert(error.message);` | Catch errors, log them for developers, and show a generic, user-friendly message: `Error: Could not fetch orders.` |

### **6\. Linting & Formatting**

- **ESLint:** We will use ESLint with standard plugins (`eslint-plugin-react`, `eslint-plugin-react-hooks`) to automatically catch common bugs and enforce rules.
- **Prettier:** We will use Prettier to automatically format all code on save. This ensures a 100% consistent code style and ends all debates about formatting.
