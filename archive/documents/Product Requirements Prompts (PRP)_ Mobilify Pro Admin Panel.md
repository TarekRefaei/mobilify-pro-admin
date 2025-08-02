# **Product Requirements Prompts (PRP): Mobilify Pro Admin Panel**

* **Document Version:** 1.0  
* **Date:** July 25, 2025  
* **Core Purpose:** To provide tactical, AI-taskable coding instructions for building the Mobilify Pro Admin Panel.

### **Section 1: Project Setup & Core Layout**

#### **Prompt 1.1: Initialize the Frontend Project**

* **AI Task:** "Let's start by setting up our project. Your task is to initialize a new web application using Vite."  
* **Tech Stack Tags:** `React 18.2+`, `Vite`, `TypeScript`, `Tailwind CSS`.  
* **Instructions:**  
  1. Create a new React project with the TypeScript template.  
  2. Follow the official guide to integrate Tailwind CSS for styling.  
  3. Clean up the default `App.tsx` file, leaving a simple "Hello World" message.  
* **Output Spec:** A runnable local development environment. The `App.tsx` component should render a single `<h1>` tag.

#### **Prompt 1.2: Create the Main Application Layout**

* **AI Task:** "Now, create the main layout component that will be used across the entire admin panel."  
* **Tech Stack Tags:** `React`, `Tailwind CSS`, `react-router-dom`.  
* **Instructions:**  
  1. Create a component named `MainLayout.tsx`.  
  2. This component should have a persistent vertical sidebar on the left and a main content area on the right.  
  3. The sidebar should be `240px` wide on desktop and be collapsible on mobile.  
  4. The main content area should have a light gray background (`bg-slate-50`).  
  5. Use `react-router-dom`'s `<Outlet />` component in the main content area to render the different pages.  
* **Input Spec:** A static array of navigation links: `[{ name: 'Dashboard', path: '/' }, { name: 'Orders', path: '/orders' }, { name: 'Menu', path: '/menu' }]`.  
* **Output Spec:** A `MainLayout.tsx` file that can be used as a wrapper for our page routes.

### **Section 2: Authentication**

#### **Prompt 2.1: Set Up Firebase and Authentication**

* **AI Task:** "We need to handle user authentication. Let's set up the Firebase connection and create the login page."  
* **Tech Stack Tags:** `React`, `Firebase SDK v10+`, `Tailwind CSS`.  
* **Instructions:**  
  * Create a `firebase.ts` config file. Initialize the Firebase app using placeholder environment variables (e.g., `import.meta.env.VITE_API_KEY`).  
  * Create a `LoginPage.tsx` component with a centered form containing "Email" and "Password" fields and a "Sign In" button.  
  * When the form is submitted, call Firebase's `signInWithEmailAndPassword` function.  
* **Output Spec:** A functional login page.  
* **Edge Case Coverage:**  
  * On successful login, redirect the user to the dashboard (`/`).  
  * On failure (e.g., wrong password, user not found), display a user-friendly error message above the form.  
  * Disable the "Sign In" button during the sign-in attempt to prevent multiple submissions.

#### **Prompt 2.2: Implement Protected Routes**

* **AI Task:** "Now, protect the admin panel so that only authenticated users can access it."  
* **Tech Stack Tags:** `React`, `Firebase Auth`, `react-router-dom`.  
* **Instructions:**  
  1. Create a `ProtectedRoute.tsx` component.  
  2. This component will use Firebase's `onAuthStateChanged` listener to track the user's authentication state.  
  3. If a user is logged in, it should render the child components (using `<Outlet />`).  
  4. If no user is logged in, it should redirect to the `/login` page.  
* **Output Spec:** A wrapper component that can be used in the main router setup to protect all admin pages.

### **Section 3: Order Management (Core Feature)**

#### **Prompt 3.1: Define the Order Data Structure**

* **AI Task:** "Before we build the UI, let's define the data structure for an 'order' in our database."  
* **Tech Stack Tags:** `TypeScript`.  
* **Instructions:** Create a TypeScript interface named `Order`.

**Output Spec:** A `types.ts` file containing the following interface:  
import { Timestamp } from 'firebase/firestore';

export interface Order {  
  id: string;  
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

* 

#### **Prompt 3.2: Build the Live Orders Page UI**

* **AI Task:** "Create the UI for the 'Live Orders' page. This is the most important screen for the restaurant staff."  
* **Tech Stack Tags:** `React`, `Tailwind CSS`.  
* **Instructions:**  
  1. Create an `OrdersPage.tsx` component.  
  2. The layout should be a multi-column view (like a Kanban board). Create columns for "New Orders" (`pending`), "In Progress" (`preparing`), and "Ready for Pickup" (`ready`).  
  3. Create an `OrderCard.tsx` component to display the details of a single order. It should clearly show the customer name, the list of items, and the total price.  
* **Input Spec:** Use a mock array of `Order` objects (as defined in Prompt 3.1) to populate the UI for now.  
* **Output Spec:** A non-functional but visually complete page showing order cards in their respective status columns.

#### **Prompt 3.3: Fetch and Display Live Orders**

* **AI Task:** "Let's bring the page to life by fetching real-time data from Firestore."  
* **Tech Stack Tags:** `React`, `Firebase Firestore`.  
* **Instructions:**  
  1. In `OrdersPage.tsx`, use Firestore's `onSnapshot` listener to subscribe to the `orders` collection.  
  2. The query should fetch all orders where the `status` is NOT `completed` or `rejected`.  
  3. The fetched orders should be stored in the component's state and passed to the UI, which should update automatically as data changes.  
* **Output Spec:** The Orders page now displays live data from the database. When a new order is added to Firestore, it appears on the screen instantly without a page refresh.  
* **Edge Case Coverage:** Display a loading spinner while the initial data is being fetched. If there are no active orders, display a clean "No active orders" message in the center of the page.

#### **Prompt 3.4: Implement Order Status Updates**

* **AI Task:** "The staff needs to be able to update the status of an order."  
* **Tech Stack Tags:** `React`, `Firebase Firestore`.  
* **Instructions:**  
  1. In the `OrderCard.tsx` component, add buttons to advance the order's status (e.g., a "Start Preparing" button on a `pending` order).  
  2. When a button is clicked, it should call a function that updates the `status` field of the corresponding document in Firestore.  
* **Output Spec:** Clicking a button on an order card updates its status in the database.  
* **Feedback Loop:** Because we are using a real-time listener, once the status is updated, the card should automatically move to the correct column in the UI. The button itself should show a temporary disabled/loading state while the update is in progress.

#### **Prompt 3.5: Add Audible Notification for New Orders**

* **AI Task:** "To ensure new orders are never missed, add an audible alert."  
* **Tech Stack Tags:** `React`, `Web Audio API`.  
* **Instructions:**  
  1. In the `OrdersPage.tsx` component, use a `useEffect` hook that tracks the list of `pending` orders.  
  2. If the number of pending orders increases, trigger an audio alert.  
  3. Use the browser's built-in `new Audio('path/to/sound.mp3').play();`. You can find a suitable sound file online.  
* **Output Spec:** When a new order document with `status: 'pending'` appears in Firestore, a sound plays in the browser.  
* **Edge Case Coverage:** Ensure the sound only plays for *newly added* orders, not on the initial page load.