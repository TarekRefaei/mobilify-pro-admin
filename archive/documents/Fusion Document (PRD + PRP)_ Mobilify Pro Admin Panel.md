# **Fusion Document (PRD \+ PRP): Mobilify Pro Admin Panel**

- **Document Version:** 1.0
- **Date:** July 25, 2025
- **Core Purpose:** A hybrid strategy-execution bridge. This document merges the project's strategic goals (PRD) with tactical, AI-taskable coding instructions (PRP) for a seamless development workflow.

### **1\. Vision & Goal-to-Prompt Mapping**

This table provides a high-level overview, linking each core business objective directly to the series of prompts that will be used to implement it.

| Business Goal (from PRD)              | Implementing Prompts (from PRP)                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **A. Increase Direct Orders**         | **3.1** (Data Structure), **3.2** (UI), **3.3** (Fetch Data), **3.4** (Status Updates), **3.5** (Notifications) |
| **B. Reduce Commission Costs**        | The entire **Order Management** feature set directly supports this goal by enabling a commission-free channel.  |
| **C. Improve Operational Efficiency** | **3.3** (Real-time Fetch), **3.4** (One-click Updates), **3.5** (Audible Alerts)                                |
| **D. Increase Customer Loyalty**      | **4.1** (Define Loyalty Feature \- _Future Prompt_)                                                             |

### **2\. Foundational Setup & Authentication**

#### **2.1. Requirement: Secure & Protected Access**

- **From PRD:** Access to the admin panel must be protected by secure authentication. Only authorized restaurant staff can view and manage data.

#### **2.2. Implementation Prompts**

- **Prompt 1.1: Initialize the Frontend Project**
  - **AI Task:** "Let's start by setting up our project. Your task is to initialize a new web application using Vite."
  - **Tech Stack Tags:** `React 18.2+`, `Vite`, `TypeScript`, `Tailwind CSS`.
  - **Instructions:** Create a new React project with the TypeScript template and integrate Tailwind CSS.
- **Prompt 1.2: Create the Main Application Layout**
  - **AI Task:** "Now, create the main layout component that will be used across the entire admin panel."
  - **Tech Stack Tags:** `React`, `Tailwind CSS`, `react-router-dom`.
  - **Instructions:** Create a `MainLayout.tsx` component with a persistent sidebar and a main content area that uses `<Outlet />` for page rendering.
- **Prompt 2.1: Set Up Firebase and Authentication**
  - **AI Task:** "We need to handle user authentication. Let's set up the Firebase connection and create the login page."
  - **Tech Stack Tags:** `React`, `Firebase SDK v10+`, `Tailwind CSS`.
  - **Instructions:** Create a `firebase.ts` config file and a `LoginPage.tsx` component with a form that calls Firebase's `signInWithEmailAndPassword` function. Cover error handling and loading states.
- **Prompt 2.2: Implement Protected Routes**
  - **AI Task:** "Now, protect the admin panel so that only authenticated users can access it."
  - **Tech Stack Tags:** `React`, `Firebase Auth`, `react-router-dom`.
  - **Instructions:** Create a `ProtectedRoute.tsx` component that uses `onAuthStateChanged` to check for a logged-in user. If the user is not authenticated, redirect to `/login`.

### **3\. Core Feature: Order Management System**

#### **3.1. Requirement: Real-time Order Management**

- **From PRD:** The system must provide a dedicated, real-time "Live Orders" screen. Staff must be able to see new orders instantly and update their status with a single click. The process must be fast and intuitive to support a high-pressure restaurant environment.

#### **3.2. Implementation Prompts**

- **Prompt 3.1: Define the Order Data Structure**
  - **AI Task:** "Before we build the UI, let's define the data structure for an 'order' in our database."
  - **Tech Stack Tags:** `TypeScript`.
  - **Output Spec:** A `types.ts` file with an `Order` interface, including fields like `id`, `customerName`, `items`, `totalPrice`, `status`, and `createdAt`.
- **Prompt 3.2: Build the Live Orders Page UI**
  - **AI Task:** "Create the UI for the 'Live Orders' page. This is the most important screen for the restaurant staff."
  - **Tech Stack Tags:** `React`, `Tailwind CSS`.
  - **Instructions:** Create an `OrdersPage.tsx` with a multi-column Kanban-style layout for "New," "In Progress," and "Ready" orders. Create a reusable `OrderCard.tsx` component. Populate with mock data initially.
- **Prompt 3.3: Fetch and Display Live Orders**
  - **AI Task:** "Let's bring the page to life by fetching real-time data from Firestore."
  - **Tech Stack Tags:** `React`, `Firebase Firestore`.
  - **Instructions:** In `OrdersPage.tsx`, use Firestore's `onSnapshot` listener to subscribe to the `orders` collection. The UI should update instantly when data changes in the database.
- **Prompt 3.4: Implement Order Status Updates**
  - **AI Task:** "The staff needs to be able to update the status of an order."
  - **Tech Stack Tags:** `React`, `Firebase Firestore`.
  - **Instructions:** In `OrderCard.tsx`, add buttons that call a function to update the `status` field of the order document in Firestore. The UI should automatically move the card to the correct column due to the real-time listener.
- **Prompt 3.5: Add Audible Notification for New Orders**
  - **AI Task:** "To ensure new orders are never missed, add an audible alert."
  - **Tech Stack Tags:** `React`, `Web Audio API`.
  - **Instructions:** In `OrdersPage.tsx`, use a `useEffect` hook to monitor for new `pending` orders and trigger a sound file to play.

### **4\. Core Feature: Menu Management System**

#### **4.1. Requirement: Simple Menu Control**

- **From PRD:** The restaurant owner needs a simple, non-technical way to add, edit, and delete menu items and categories. They must also be able to quickly mark an item as "Sold Out."

#### **4.2. Implementation Prompts**

- **(Future Prompt) 4.1: Define Menu/Item Data Structures**
- **(Future Prompt) 4.2: Build the Menu Management Page UI**
- **(Future Prompt) 4.3: Implement CRUD for Menu Items**

### **5\. Non-Functional Requirements & Prompts**

- **Requirement:** The admin panel must be fast, reliable, and easy to use.
- **Supporting Prompts:** The choice of `Vite` (**Prompt 1.1**) supports performance. The focus on atomic components (**Prompt 3.2**) and clear states (**Prompt 3.4**) supports usability. Future prompts will focus on testing and optimization.
