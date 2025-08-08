# Product Requirements Document (PRD): Mobilify Pro Admin Panel ("Cairo Bites" Edition)

**\*Document Version:** 1.0  
**\*Date:** July 25, 2025  
**\*Author:** Tarek Refaei  
**\*Status:** Baseline

## Core Purpose & Strategic Foundation

This document defines the vision, goals, features, and scope for the Mobilify Pro Admin Panel. Its purpose is to serve as the single source of truth for the project, ensuring that development efforts are laser-focused on solving the right problems and delivering maximum value to our target clients: restaurant owners in Egypt.

---

### 1. Vision & Problem Statement

#### 1.1. Vision

To empower local restaurant owners with a simple, powerful, and elegant tool that gives them complete control over their digital presence, allowing them to increase profitability, streamline operations, and build direct, lasting relationships with their customers.

#### 1.2. Problem Statement

Restaurant owners in the Egyptian market face significant challenges in the digital age. They are often forced to rely on third-party aggregator apps that charge exorbitant commissions (up to 30%), severing the direct relationship with their customers and eroding their profit margins. Managing online orders from multiple platforms creates operational chaos, leading to errors and delays. Furthermore, they lack the tools to effectively market to their existing customer base and encourage repeat business.

The Mobilify Pro Admin Panel directly addresses this by providing a centralized, commission-free hub to manage their own branded mobile app.

---

### 2. Goals & Success Metrics

The success of the admin panel will be measured by its ability to achieve four key business outcomes for the client.

| Business Goal                         | Success Metric (SMART)                                                                                                                                                                     |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Increase Direct Orders**         | **Metric:** Total number and value of orders processed directly through the app. <br> **Target:** A client achieves an average of 15+ direct orders per day within 3 months of app launch. |
| **B. Reduce Commission Costs**        | **Metric:** Commission fees saved by processing orders directly versus through third-party apps. <br> **Target:** A client saves an average of 5,000 EGP per month in commission fees.     |
| **C. Improve Operational Efficiency** | **Metric:** Time from order receipt to acknowledgement (accepted/rejected). <br> **Target:** 95% of new orders are acknowledged within 3 minutes of receipt during business hours.         |
| **D. Increase Customer Loyalty**      | **Metric:** Percentage of active users who have utilized the loyalty program. <br> **Target:** 25% of monthly active users have used the loyalty feature at least once within 6 months.    |

---

### 3. User Personas & Use Cases

#### 3.1. Personas

- **Tarek (The Owner):** 45, owns a busy restaurant in Zamalek. He is business-savvy but not very technical. He is frustrated with commission fees and wants more control over his brand and customer relationships. He will use the panel on his laptop in the back office to check performance and send promotions.
- **Mariam (The Cashier):** 22, works the front counter during peak hours. She is tech-literate but needs tools that are extremely fast, simple, and reliable under pressure. She will use the panel on a tablet next to the cash register.

#### 3.2. Key Use Cases

- **Order Management:** _As Mariam, I need to see new orders instantly with a loud, unmissable notification so I don't miss them during the lunch rush, and I need to accept the order with a single tap._
- **Menu Availability:** _As Tarek, I need to be able to quickly mark the "Koshary" as 'Sold Out' from my phone when we run out of a key ingredient, so customers can't order it._
- **Driving Traffic:** _As Tarek, I want to send a push notification on a slow Tuesday afternoon about a '2-for-1' deal to drive foot traffic and online orders for dinner._
- **Reservation Planning:** _As Mariam, I need to see a clear list of tonight's reservations with names and party sizes so I can prepare the tables in advance._

---

### 4. High-Level Features & Scope (Functional Requirements)

#### 4.1. In Scope for Version 1.0

1.  **Dashboard:**
    - At-a-glance view of today's key stats: total sales, number of orders, and new reservations.
    - A feed of the 5 most recent activities.

2.  **Order Management System:**
    - A dedicated, real-time "Live Orders" screen.
    - Audible and visual notifications for new incoming orders.
    - One-click buttons to "Accept" or "Reject" an order.
    - Ability to update order status: `Pending` -> `Preparing` -> `Ready for Pickup` / `Out for Delivery` -> `Completed`.
    - An archive to view past orders.

3.  **Menu Management System:**
    - Ability to create, edit, and delete menu categories (e.g., "Appetizers").
    - Ability to add, edit, and delete individual menu items (including name, description, price, and photo).
    - A simple toggle switch to mark an item as "Available" or "Sold Out."

4.  **Reservation Management:**
    - A list view of all upcoming reservations.
    - Ability to manually confirm or cancel a reservation.

5.  **Customer Engagement:**
    - **Push Notification Composer:** A simple interface to write a message and send it to all app users immediately.
    - **Loyalty Program Management:** A view of the program's status and the ability to define the loyalty rule (e.g., "Buy 10, Get 1 Free").

6.  **Settings:**
    - Ability to update essential restaurant information: address, phone number, opening hours.
    - User account management (change password).

#### 4.2. Out of Scope for Version 1.0

- Advanced sales analytics and reporting dashboards.
- Staff rota and permission management.
- Ingredient-level inventory tracking.
- Direct integration with hardware Point-of-Sale (POS) systems.
- Scheduled or segmented push notifications.

---

### 5. High-Level Architecture Diagram

This diagram shows the conceptual relationships between the system components, not the implementation details.

GRAPH TD subgraph User's Environment A(Customer Mobile App) B(Restaurant Admin Panel - Web App) end

subgraph Mobilify Backend  
 C(API / Serverless Functions)  
 D(Database - Firestore/MongoDB)  
 E(Push Notification Service)  
end

A -->|Places Order, Makes Reservation| C  
C -->|Writes Data| D  
D -->|Real-time Update| B  
B -->|Accepts Order, Sends Promo| C  
C -->|Triggers Notification| E  
E -->|Sends Push to| A

---

### 6. Non-Functional Requirements

- **Reliability:** The system must have an uptime of > 99.9% during the client's specified business hours.
- **Performance:** The "Live Orders" screen must update with new orders within 5 seconds of customer submission. Page loads within the panel should be under 2 seconds.
- **Usability:** A new staff member must be able to learn the core functions of order and reservation management with less than 15 minutes of training.
- **Security:** Access to the admin panel must be protected by secure authentication.
- **Compatibility:** The admin panel must be fully functional on the latest versions of major web browsers (Chrome, Firefox, Safari) on both desktop and tablet devices.
