# **Error Digest & Pre-emptive Handling Guide**

* **Document Version:** 1.0  
* **Date:** July 25, 2025  
* **Core Purpose:** To define known failure patterns and provide clear, actionable resolutions to guide AI-assisted development and ensure robust error handling.

### **1\. Philosophy**

This is a living document. It begins as a "pre-emptive guide" based on anticipated errors. As development and testing proceed, it will be updated with real, recurring errors and their proven solutions. The goal is to build a resilient application that fails gracefully and provides clear feedback to both the user and the developer.

### **2\. Anticipated Error Patterns & Resolutions**

This section outlines common errors we expect to encounter with our tech stack and provides a standard "playbook" for the AI to follow when implementing features.

#### **Category: Firebase Authentication**

* **Error Code:** `auth/invalid-credential` (or `auth/wrong-password`, `auth/user-not-found`)  
  * **Trigger:** User attempts to log in with an incorrect email or password.  
  * **Impact:** Low. Prevents user access.  
  * **Actionable Fix:**  
    1. Catch the error in the `signInWithEmailAndPassword` function's `.catch()` block.  
    2. Do NOT log the raw error object to the console for security reasons.  
    3. Set a state variable (e.g., `setAuthError('Invalid email or password. Please try again.')`).  
    4. Render this state variable in a clearly visible, red-colored alert box above the login form.  
    5. Ensure the "Sign In" button is re-enabled after the error is caught.  
* **Error Code:** `auth/network-request-failed`  
  * **Trigger:** The user's device loses internet connectivity while attempting to log in.  
  * **Impact:** Medium. Prevents use of the application.  
  * **Actionable Fix:**  
    1. Catch the error.  
    2. Display a specific error message: `setAuthError('Network connection failed. Please check your internet and try again.')`.

#### 

#### 

#### **Category: Cloud Firestore (Database)**

* **Error Code:** `permission-denied`  
  * **Trigger:** The application logic attempts a read or write operation that violates Firestore Security Rules. (e.g., User A tries to read User B's data).  
  * **Impact:** Critical. This indicates a flaw in security logic.  
  * **Actionable Fix:**  
    1. This error should **not** be handled gracefully in the UI. It is a developer error.  
    2. Log a detailed message to the developer console: `console.error('Firestore Permission Denied: Check security rules and query logic for [DESCRIBE_QUERY].')`.  
    3. The UI should show a generic "An unexpected error occurred" message to the user.  
    4. **In Testing:** This error must be treated as a high-priority bug to be fixed immediately.  
* **Error Pattern:** Querying a field that requires a composite index not yet created.  
  * **Trigger:** A Firestore query uses `where()` on multiple fields or combines `where()` with `orderBy()`.  
  * **Impact:** High. The feature will be completely broken.  
  * **Actionable Fix:**  
    1. Firestore provides a specific error message in the console that includes a **direct link** to create the required index in the Firebase Console.  
    2. The developer must follow this link and create the index.  
    3. The UI should handle the failed query by displaying an error message like "Could not load data."

#### **Category: Frontend Application (React)**

* **Error Pattern:** Infinite loop in a `useEffect` hook.  
  * **Trigger:** A `useEffect` hook updates a state variable that is also in its own dependency array, without a proper condition to stop the loop.  
  * **Impact:** Critical. The browser will freeze and crash.  
  * **Actionable Fix:**  
    1. **Prevention:** When writing a `useEffect` prompt, always specify the dependency array explicitly.  
    2. **Rule:** If a state-setting function (e.g., `setOrders`) is used inside a `useEffect`, and the state itself (`orders`) is in the dependency array, there MUST be a conditional check to prevent re-running on every render.  
    3. **Example Instruction:** "In a `useEffect` hook that listens for changes to `orders`, only play the notification sound if the `newOrderCount` is greater than the `prevOrderCount`."  
* **Error Pattern:** Cannot read properties of `undefined`.  
  * **Trigger:** Attempting to access a property on an object that has not yet been loaded from an asynchronous call (e.g., `order.customerName` when `order` is still `null`).  
  * **Impact:** Medium. Crashes the component.  
  * **Actionable Fix:**  
    1. **Prevention:** Always define initial states correctly (e.g., `useState(null)` or `useState([])`).  
    2. **Rule:** Before rendering data from an asynchronous source, always include a conditional rendering check.  
    3. **Example Instruction:** "First, check if the `isLoading` state is true and render a spinner. Then, check if `order` exists. Only if `order` is not null, render the `order.customerName`."

