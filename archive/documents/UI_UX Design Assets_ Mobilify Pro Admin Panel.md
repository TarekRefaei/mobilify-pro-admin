# **UI/UX Design Assets: Mobilify Pro Admin Panel**

- **Document Version:** 1.0
- **Date:** July 25, 2025
- **Core Purpose:** To provide visual and interactive guidance for the front-end development, ensuring a consistent and user-centric design.

### **1\. Design Philosophy & Principles**

The admin panel is a professional tool for busy restaurant owners and staff. The design must prioritize clarity, efficiency, and trust.

- **Clarity over Clutter:** Every element must have a clear purpose. Avoid unnecessary decorations. When in doubt, leave it out.
- **Efficiency is Key:** The most common user flows (especially order management) must be achievable with the minimum number of clicks and cognitive load.
- **Calm & Professional:** The UI should feel calm and organized, even during peak business hours. It should inspire confidence and reduce stress.
- **Consistency:** Components, spacing, and colors must be consistent throughout the application to create a predictable and easy-to-learn interface.

### **2\. Core Visual Language**

#### **2.1. Color Palette**

The palette is simple and professional, using a primary color for actions and neutrals for the main interface.

- **Primary (Actions & Branding):** Blue (`#2563EB` / Tailwind `blue-600`)
- **Background:** Off-White (`#F8FAFC` / Tailwind `slate-50`)
- **Borders & Dividers:** Light Gray (`#E2E8F0` / Tailwind `slate-200`)
- **Body Text:** Dark Gray (`#1E293B` / Tailwind `slate-800`)
- **Headings:** Black (`#0F172A` / Tailwind `slate-900`)
- **Success:** Green (`#22C55E` / Tailwind `green-500`)
- **Error / Destructive:** Red (`#DC2626` / Tailwind `red-600`)
- **Warning / Pending:** Amber (`#F59E0B` / Tailwind `amber-500`)

#### **2.2. Typography**

- **Font Family:** "Inter", a clean and highly legible sans-serif font.
- **Base Font Size:** 16px
- **Scale:**
  - Page Titles (h1): `24px`, Bold
  - Section Headers (h2): `20px`, Bold
  - Card Titles (h3): `18px`, Semi-Bold
  - Body Text: `16px`, Regular
  - Helper Text / Labels: `14px`, Regular

### **3\. Component Library (Low-Fidelity)**

This defines the style and behavior of our core reusable UI elements.

- **Buttons:**
  - **Primary:** Solid blue background, white text. Used for main positive actions (e.g., "Sign In", "Save Changes").
  - **Secondary:** White background, blue border, blue text. Used for secondary actions (e.g., "Cancel", "View Details").
  - **Destructive:** Solid red background, white text. Used for dangerous actions (e.g., "Delete Item").
  - _Interaction:_ All buttons have rounded corners, a subtle box-shadow, and slightly lighten on hover. They show a loading spinner when an action is in progress.
- **Cards (`OrderCard`, `MenuItemCard`):**
  - White background (`#FFFFFF`), rounded corners, and a soft box-shadow (`shadow-md`).
  - A thin border in a light gray (`border-slate-200`).
  - Internal padding to ensure content is not cramped.
- **Input Fields & Forms:**
  - Simple text inputs with a light gray border.
  - The border turns blue on focus.
  - Labels are placed above their corresponding input field.

### **4\. User Flow Diagram**

This diagram shows the primary journey a user will take through the application.

graph TD  
 A\[Start\] \--\> B{Logged In?};  
 B \--\>|No| C\[Login Page\];  
 C \--\>|Enter Credentials| D\[Authenticate\];  
 D \--\>|Success| E\[Dashboard\];  
 D \--\>|Failure| C;  
 B \--\>|Yes| E;

    E \--\> F\[View Live Orders\];
    F \--\>|Click 'Accept'| G\[Update Order Status\];
    G \--\> F;

    E \--\> H\[Navigate to Menu Page\];
    H \--\> I{Action?};
    I \--\>|Add/Edit Item| J\[Show Menu Item Form\];
    J \--\> H;
    I \--\>|Toggle Availability| H;

### **5\. Wireframes (ASCII/Markdown)**

These are low-fidelity layouts for the key screens.

#### **5.1. Login Page**

\+-----------------------------------------+  
| |  
| \[Mobilify Logo\] |  
| |  
| Sign in to your account |  
| |  
| Email Address |  
| \+-----------------------------------+ |  
| | | |  
| \+-----------------------------------+ |  
| |  
| Password |  
| \+-----------------------------------+ |  
| | | |  
| \+-----------------------------------+ |  
| |  
| \+-----------------------------------+ |  
| | Sign In | |  
| \+-----------------------------------+ |  
| |  
\+-----------------------------------------+

#### **5.2. Main Layout (Dashboard / Orders Page)**

\+----------------+------------------------------------------------------+  
| \[Logo\] | Header: Welcome, Adham\! \[Profile Icon\] |  
| \+------------------------------------------------------+  
| Dashboard | |  
| Orders | Orders \> Live Orders |  
| Menu | |  
| Reservations | \+--------------+ \+----------------+ \+-------------+ |  
| Customers | | New (3) | | In Progress (5)| | Ready (2) | |  
| | \+--------------+ \+----------------+ \+-------------+ |  
| \--- | | \[Order Card\] | | \[Order Card\] | | \[Order Card\]| |  
| Settings | | \[Order Card\] | | \[Order Card\] | | \[Order Card\]| |  
| Logout | | \[Order Card\] | | ... | | ... | |  
| | | ... | | | | | |  
\+----------------+------------------------------------------------------+

#### **5.3. Order Card Component**

\+----------------------------------------+  
| Customer: Mohamed Ali \[1 min ago\] |  
|----------------------------------------|  
| 2x Koshary |  
| 1x Pepsi |  
|----------------------------------------|  
| Total: 150 EGP |  
| \+------------------------------------+ |  
| | Accept Order | |  
| \+------------------------------------+ |  
\+----------------------------------------+
