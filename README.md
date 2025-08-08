# Mobilify Pro - Restaurant Admin Panel

A comprehensive restaurant management system built with React, TypeScript, and Firebase. This admin panel provides real-time order management, menu administration, customer engagement tools, and business analytics for restaurant operations.

## 🚀 Features

### Core Restaurant Management

- **Real-time Order Management** - Kanban-style workflow with live updates
- **Menu Management** - Complete CRUD operations with image support
- **Dashboard Analytics** - Real-time metrics and business insights
- **Customer Management** - Customer database with loyalty tracking
- **Reservation System** - Booking management and calendar view

### Customer Engagement

- **Loyalty Program** - Configurable reward system
- **Push Notifications** - Customer communication tools
- **Customer Analytics** - Engagement metrics and insights

### Business Operations

- **Settings Management** - Business hours, contact info, preferences
- **Audio Notifications** - Real-time alerts for new orders
- **Multi-tenant Architecture** - Restaurant-specific data isolation
- **Responsive Design** - Mobile-first interface

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Routing:** React Router DOM
- **State Management:** Custom hooks with React Context
- **Testing:** Vitest, React Testing Library, Cypress
- **Build Tool:** Vite
- **Package Manager:** npm

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- Firebase account
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mobilify-admin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup

1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Configure security rules

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

### 6. Demo Login

- **Email:** demo@cairobites.com
- **Password:** CairoBites2025!
- **Restaurant:** Cairo Bites (كايرو بايتس)

## 📁 Project Structure

```
mobilify-admin/
├── src/                    # Application source code
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard widgets
│   │   ├── layout/        # Layout components
│   │   ├── menu/          # Menu management
│   │   ├── orders/        # Order management
│   │   └── ui/            # Base UI components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # Firebase services
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── docs/                  # Organized documentation
│   ├── user/              # User guides and training
│   ├── technical/         # Technical documentation
│   ├── setup/             # Setup and configuration guides
│   ├── testing/           # Testing documentation
│   └── project/           # Project management docs
├── scripts/               # Utility scripts (PowerShell)
├── cypress/               # E2E tests
├── public/                # Static assets
├── .github/               # GitHub Actions workflows
└── archive/               # Archived development documents
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests

```bash
npm run cypress:open
```

### Coverage Report

```bash
npm run test:coverage
```

## 🏗️ Build & Deployment

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔒 Security

- Firebase Authentication with session management
- Firestore security rules with multi-tenant isolation
- Input validation and XSS protection
- Environment variable protection
- Production-ready security configuration

## 📖 Development Phases

- ✅ **Phase 1:** Project Foundation & Setup
- ✅ **Phase 2:** Authentication System
- ✅ **Phase 3:** Order Management System
- ✅ **Phase 4:** Menu Management System
- ✅ **Phase 5:** Dashboard & Analytics
- ✅ **Phase 6:** Additional Features
- ✅ **Phase 7:** Testing & Quality Assurance
- ✅ **Phase 8:** Deployment & Production

## 🚀 Production Deployment

**Live Application:** https://mobilify-admin-hlp8pmtlc-tarekrefaeis-projects.vercel.app

### Demo Account

- **Email:** demo@cairobites.com
- **Password:** CairoBites2025!
- **Restaurant:** Cairo Bites (كايرو بايتس)

## 📚 Documentation

All documentation is organized in the `/docs` directory for easy navigation:

### 🚀 Quick Start

- **[Quick Start Guide](docs/user/QUICK_START_GUIDE.md)** - Get started in 5 minutes
- **[User Training Guide](docs/user/USER_TRAINING_GUIDE.md)** - Complete user manual (4-6 hours)
- **[Manual Testing Guide](docs/user/MANUAL_TESTING_GUIDE.md)** - Step-by-step testing

### 🔧 Technical Documentation

- **[Operations Manual](docs/technical/OPERATIONS_MANUAL.md)** - System operations and maintenance
- **[Deployment Guide](docs/technical/DEPLOYMENT_GUIDE.md)** - Deployment and maintenance procedures
- **[Firebase Setup](docs/technical/FIREBASE_SETUP.md)** - Database and authentication setup
- **[Security Guide](docs/technical/SECURITY_GUIDE.md)** - Security implementation and compliance

### ⚙️ Setup Guides

- **[Monitoring Setup](docs/setup/MONITORING_SETUP.md)** - UptimeRobot and Sentry configuration
- **[Backup Setup](docs/setup/BACKUP_SETUP.md)** - Automated backup strategy
- **[Vercel Deployment](docs/setup/VERCEL_DEPLOYMENT.md)** - Vercel deployment configuration
- **[GitHub Secrets](docs/setup/GITHUB_SECRETS_SETUP.md)** - CI/CD secrets configuration

### 🧪 Testing Documentation

- **[Production Testing](docs/testing/PRODUCTION_TESTING.md)** - Comprehensive testing procedures
- **[Test Results Template](docs/testing/TEST_RESULTS.md)** - Test results tracking

### 📋 Project Documentation

- **[Project Handover](docs/project/PROJECT_HANDOVER.md)** - Complete project documentation
- **[Changelog](docs/project/CHANGELOG.md)** - Version history and changes
- **[Contributing Guidelines](docs/project/CONTRIBUTING.md)** - How to contribute to the project

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React and Firebase
- UI components styled with Tailwind CSS
- Icons from Lucide React
- Testing with Vitest and Cypress

---

**Mobilify Pro** - Empowering restaurants with modern technology 🍽️
