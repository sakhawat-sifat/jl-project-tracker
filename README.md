# JL Project Tracker

A comprehensive team allocation and project management system built with React, TypeScript, Express.js, and PostgreSQL. This application helps organizations track team member allocations across projects, manage roles, and visualize project timelines.

> **Note**: This is a private repository for JoulesLabs internal use.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#️-installation)
- [Running the Application](#-running-the-application)
- [Architecture](#-architecture)
- [API Endpoints](#-api-endpoints)
- [Available Scripts](#-available-scripts)
- [Default Credentials](#-default-credentials)
- [Usage](#-usage)
- [Project Structure](#️-project-structure)
- [Features in Detail](#-features-in-detail)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [Security Features](#-security-features)
- [Migration from Supabase](#-migration-from-supabase)
- [Documentation](#-documentation)
- [Utility Tools](#️-utility-tools)
- [Troubleshooting](#-troubleshooting)
- [Development Guidelines](#-development-guidelines)
- [Recent Updates](#-recent-updates)
- [Contributing](#-contributing)

## 🌟 Features

### Core Functionality
- **Team Member Management**: Add, edit, and track team members with roles, departments, and status
- **Project Management**: Manage projects with clients, timelines, priorities, and status tracking
- **Role Management**: Define and organize roles across departments
- **Allocation Tracking**: Assign team members to projects with percentage allocations by month
- **Monthly Views**: Visualize team allocations on a month-by-month basis

### Advanced Features
- **Interactive Modals**: Click on project names to view all allocated team members
- **Role-Based Views**: Click on roles to see all team members with that role
- **Toast Notifications**: Real-time feedback for all CRUD operations (success, error, warning, info)
- **Confirmation Modals**: Safety confirmations for delete and sensitive operations
- **Summary Reports**: Monthly summaries and team allocation reports
- **Search & Filtering**: Advanced filtering across all management views
- **Responsive Design**: Fully responsive UI that works on desktop, tablet, and mobile

### Security & Authentication
- **Role-Based Access Control**: Super Admin, Admin, and Member roles
- **Secure Authentication**: SHA-256 password hashing with secure session management
- **Password Security**: All passwords hashed before storage using crypto module
- **Local Database**: Self-hosted PostgreSQL for complete data control
- **Admin User Management**: Create and manage admin users with different access levels
- **Password Reset Utility**: CLI tool for resetting user passwords

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Backend**: Express.js 5.1.0 + Node.js
- **Database**: PostgreSQL 16.4
- **Build Tool**: Vite 5.4.8
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **Database Driver**: node-postgres (pg)
- **State Management**: React Hooks
- **Authentication**: Custom SHA-256 based authentication
- **Development**: Concurrently for running multiple processes

## ⚡ Quick Start

1. **Install PostgreSQL** and create database:
   ```bash
   sudo -u postgres psql
   CREATE USER jl_user WITH PASSWORD 'jl_password_2025';
   CREATE DATABASE jl_project_tracker;
   GRANT ALL PRIVILEGES ON DATABASE jl_project_tracker TO jl_user;
   ```

2. **Clone and install**:
   ```bash
   git clone https://github.com/sakhawat-sifat/JL-Project-Tracker-New.git
   cd JL-Project-Tracker-New
   npm install
   ```

3. **Run migrations**:
   ```bash
   PGPASSWORD=jl_password_2025 psql -U jl_user -d jl_project_tracker -f supabase/migrations/*.sql
   ```

4. **Start the application**:
   ```bash
   npm run dev:full
   ```

5. **Login** at http://localhost:5173 with:
   - Username: `superadmin`
   - Password: `super123`

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL 16.4 or higher

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sakhawat-sifat/JL-Project-Tracker-New.git
   cd JL-Project-Tracker-New
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL Database**
   
   Create a PostgreSQL database and user:
   ```bash
   # Login to PostgreSQL
   sudo -u postgres psql
   
   # Create user
   CREATE USER jl_user WITH PASSWORD 'jl_password_2025';
   
   # Create database
   CREATE DATABASE jl_project_tracker;
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE jl_project_tracker TO jl_user;
   
   # Connect to the database
   \c jl_project_tracker
   
   # Grant schema privileges
   GRANT ALL ON SCHEMA public TO jl_user;
   ```

4. **Run Database Migrations**
   
   Run the migration files in the `supabase/migrations/` folder in order:
   ```bash
   # Run each migration file
   PGPASSWORD=jl_password_2025 psql -U jl_user -d jl_project_tracker -f supabase/migrations/20250622085217_steep_voice.sql
   PGPASSWORD=jl_password_2025 psql -U jl_user -d jl_project_tracker -f supabase/migrations/20250629051856_restless_tooth.sql
   # ... continue with all migration files in order
   ```

5. **Configure Database Connection**
   
   Update the database connection in `server/index.cjs`:
   ```javascript
   const pool = new Pool({
     user: 'jl_user',
     host: 'localhost',
     database: 'jl_project_tracker',
     password: 'jl_password_2025',
     port: 5432,
   });
   ```

6. **Create Default Admin User**
   
   The default super admin account is:
   - Username: `superadmin`
   - Password: `super123`
   
   Use the password reset tool if needed:
   ```bash
   node tools/reset-user-password.cjs superadmin super123
   ```

## 🎯 Running the Application

### Development Mode
Start both the backend and frontend servers:
```bash
npm run dev:full
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Individual Services

Run backend only:
```bash
npm run dev:server
```

Run frontend only:
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📦 Available Scripts

- `npm run dev` - Start frontend development server (Vite)
- `npm run dev:server` - Start backend development server (Express)
- `npm run dev:full` - Start both frontend and backend concurrently
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🔑 Default Credentials

After setting up the database, use these credentials to log in:

- **Super Admin**
  - Username: `superadmin`
  - Password: `super123`

You can create additional admin users from the Admin panel or use the CLI tools.

## 🔧 Architecture

The application uses a three-tier architecture:

```
Frontend (React/Vite:5173) → HTTP → Backend (Express:3001) → PostgreSQL (5432)
```

### Backend API (Express.js)
- **Port**: 3001
- **CORS**: Enabled for localhost:5173
- **Endpoints**: RESTful API with JSON responses
- **Database**: Direct PostgreSQL connection using pg driver
- **Security**: SHA-256 password hashing, input validation

### Frontend (React + Vite)
- **Port**: 5173
- **HMR**: Hot Module Replacement enabled
- **API Client**: Custom apiService for HTTP calls
- **State**: React hooks for local state management
- **Routing**: Tab-based navigation

### Data Flow
1. Frontend makes HTTP requests to Express backend
2. Backend validates and processes requests
3. PostgreSQL queries executed via pg client
4. Data transformed (snake_case → camelCase)
5. Response sent back to frontend

## 🔌 API Endpoints

The Express backend exposes the following RESTful endpoints:

### Authentication
- `POST /api/auth/login` - User login with username/password

### Team Members
- `GET /api/team-members` - Get all team members
- `GET /api/team-members/:id` - Get specific team member
- `POST /api/team-members` - Create new team member
- `PUT /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Delete team member

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get specific role
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Allocations
- `GET /api/allocations` - Get all allocations
- `GET /api/allocations/:id` - Get specific allocation
- `POST /api/allocations` - Create new allocation
- `PUT /api/allocations/:id` - Update allocation
- `DELETE /api/allocations/:id` - Delete allocation

### Admin Users
- `GET /api/admin-users` - Get all admin users
- `POST /api/admin-users` - Create new admin user
- `PUT /api/admin-users/:id` - Update admin user
- `DELETE /api/admin-users/:id` - Delete admin user

All endpoints return JSON responses with appropriate HTTP status codes.
npm run preview
```

## 📱 Usage

### Getting Started

1. **Login**: Use your admin credentials to log in
2. **Navigate Tabs**: Use the navigation bar to switch between different views:
   - **Allocations**: Manage team member allocations to projects
   - **Team**: Manage team members
   - **Projects**: Manage projects
   - **Roles**: Manage roles and departments
   - **Summary**: View reports and analytics
   - **Admin**: Manage users (Super Admin only)

### Key Workflows

#### Adding a Team Member
1. Go to the "Team" tab
2. Click "Add Team Member"
3. Fill in name, email, role, and department
4. Save

#### Creating a Project
1. Go to the "Projects" tab
2. Click "Add Project"
3. Enter project details (name, client, dates, status, priority)
4. Save

#### Allocating Team Members
1. Go to the "Allocations" tab
2. Click "Add Allocation"
3. Select team member, project, month, year, and percentage
4. Save

#### Viewing Project Team Members
1. Go to the "Projects" tab
2. Click on any project name
3. A modal will show all team members allocated to that project

#### Viewing Role Members
1. Go to the "Roles" tab
2. Click on any role card
3. A modal will show all team members with that role

## 🗂️ Project Structure

```
JL-Project-Tracker-New/
├── public/                    # Static assets
│   └── JL Icon.png           # Application icon
├── server/                    # Backend Express.js server
│   └── index.cjs             # Main server file with all API endpoints
├── tools/                     # Utility tools
│   ├── reset-user-password.cjs    # Password reset utility
│   ├── reset-admin-users.cjs      # Reset admin users to defaults
│   └── check-admin-users.cjs      # Check admin user status
├── src/
│   ├── components/           # React components
│   │   ├── AdminHeader.tsx
│   │   ├── AdminUserManagement.tsx
│   │   ├── AIInsights.tsx
│   │   ├── AIPopup.tsx
│   │   ├── AllocationForm.tsx
│   │   ├── AllocationTable.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── DatabaseConfig.tsx
│   │   ├── DatabaseSetup.tsx
│   │   ├── LoginForm.tsx
│   │   ├── MonthlyAllocationView.tsx
│   │   ├── MonthlySummary.tsx
│   │   ├── NotificationMessage.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectManagement.tsx
│   │   ├── RoleManagement.tsx
│   │   ├── TeamAllocationSummary.tsx
│   │   └── TeamMemberManagement.tsx
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts
│   ├── services/             # API and business logic
│   │   ├── authService.ts
│   │   ├── mockData.ts
│   │   └── postgresService.ts     # PostgreSQL API client
│   ├── lib/                  # Libraries
│   │   └── supabase.ts       # Legacy file (not used)
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── supabase/
│   └── migrations/           # Database migration files
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🎨 Features in Detail

### Toast Notification System
- **4 Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Automatically disappears after 3 seconds
- **Manual close**: Click the X button to dismiss
- **Stacking**: Multiple toasts stack vertically
- **Smooth animations**: Slide-in and fade-out effects

### Allocation Management
- **Flexible Percentages**: Support for any decimal precision (e.g., 45.33%, 33.333%)
- **Month/Year Selection**: Easy dropdown selection with months in chronological order
- **Validation**: Ensures allocations don't exceed 100% per team member
- **Sorting**: All dropdowns sorted in ascending order (except months)

### Data Management
- **Immutable Sorting**: Proper pagination support with immutable array operations
- **Auto-refresh**: Data updates reflected immediately after changes
- **Snake to Camel Case**: Automatic conversion between database and frontend formats
- **Type Safety**: Full TypeScript support with proper type definitions

## 📊 Database Schema

The application uses the following main tables in PostgreSQL:
- `team_members` - Store team member information (name, email, role, department, status)
- `projects` - Store project details (name, client, dates, status, priority)
- `roles` - Store role definitions (name, department)
- `allocations` - Store team member allocations to projects (employee, project, month, year, percentage)
- `admin_users` - Store admin user credentials (username, email, password_hash, role, created_at)

### Database Details
- **Database Name**: jl_project_tracker
- **User**: jl_user
- **Password**: jl_password_2025
- **Port**: 5432 (default PostgreSQL)
- **Tables**: 5 main tables with proper foreign key relationships
- **Password Storage**: SHA-256 hashed passwords

See the `supabase/migrations/` folder for complete schema definitions.

## 🔐 User Roles

- **Super Admin**: Full access to all features including user management
- **Admin**: Access to all features except user management
- **Member**: View-only access to certain features

## 🔒 Security Features

### Password Security
- All passwords are hashed using SHA-256 before storage
- No plain text passwords stored in database
- Password reset utility for admin recovery

### Data Security
- SQL injection prevention using parameterized queries
- Input validation on all API endpoints
- Role-based access control for sensitive operations
- CORS configured for localhost only

### Session Management
- Custom authentication system
- Secure password comparison using hashed values
- Session validation on protected routes

## 🔄 Migration from Supabase

This project was successfully migrated from Supabase to a self-hosted PostgreSQL database:

### Migration Highlights
- **Data Integrity**: All 283 records migrated successfully
- **Zero Downtime**: Smooth transition with backup procedures
- **Schema Preservation**: All table structures maintained
- **Enhanced Security**: Improved password hashing with SHA-256
- **Better Control**: Full control over database and backend logic

### Why We Migrated
- ✅ Full control over data and infrastructure
- ✅ No vendor lock-in
- ✅ Better customization options
- ✅ Cost optimization for self-hosted solutions
- ✅ Enhanced security with custom authentication

## 📝 Documentation

- `README.md` - This file - Project overview and setup guide
- `CHANGELOG.md` - Project changelog and version history (if exists)
- `supabase/migrations/` - Database schema migration files

## 🛠️ Utility Tools

### Password Reset Tool
Reset any admin user's password:
```bash
node tools/reset-user-password.cjs <username> <new-password>
```

Example:
```bash
node tools/reset-user-password.cjs superadmin super123
```

### Check Admin Users
View all admin users in the database:
```bash
node tools/check-admin-users.cjs
```

### Reset Admin Users
Reset admin users to default (superadmin only):
```bash
node tools/reset-admin-users.cjs
```

## 🐛 Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check database credentials in `server/index.cjs`
3. Ensure database `jl_project_tracker` exists
4. Verify user `jl_user` has proper permissions

### Backend Server Issues
1. Check if port 3001 is already in use: `lsof -i :3001`
2. Kill existing processes: `pkill -9 node`
3. Check backend logs for errors
4. Verify all migrations are run

### Frontend Issues
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Ensure backend is running before starting frontend
3. Check browser console for API errors
4. Verify CORS settings in backend

### Authentication Issues
1. Use password reset tool: `node tools/reset-user-password.cjs <username> <password>`
2. Check admin_users table: `node tools/check-admin-users.cjs`
3. Verify password hashing is working correctly
4. Reset to default admin: `node tools/reset-admin-users.cjs`

### Build Issues
1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Ensure Node.js version is compatible (v16+)
4. Check for TypeScript errors: `npm run type-check`

## 🚧 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices and hooks guidelines
- Use Tailwind CSS for styling
- Keep components modular and reusable

### Component Guidelines
- One component per file
- Use functional components with hooks
- Props should be typed with interfaces
- Extract complex logic into custom hooks

### Backend Guidelines
- Use CommonJS format (.cjs) for Node.js backend
- Implement proper error handling with try-catch
- Return consistent JSON responses
- Use parameterized queries to prevent SQL injection
- Hash all passwords before storage

### Database Guidelines
- Always use migrations for schema changes
- Use snake_case for database columns
- Use camelCase in frontend code
- Keep migrations in chronological order
- Backup database before major changes

### Git Workflow
1. Create feature branches from `main`
2. Use descriptive commit messages
3. Test both frontend and backend before pushing
4. Keep commits atomic and focused
5. Run migrations on development database first

## 📈 Recent Updates

### Major Migration (October 2025)
- ✅ **Migrated from Supabase to PostgreSQL**: Complete database migration with 283 records
- ✅ **Express.js Backend**: New backend API server with RESTful endpoints
- ✅ **SHA-256 Password Hashing**: Enhanced security with crypto module
- ✅ **Direct PostgreSQL Connection**: Removed all Supabase dependencies
- ✅ **Admin User Management**: Full CRUD operations for admin users with email support
- ✅ **Password Reset Utility**: CLI tools for user management

### Bug Fixes & Improvements
- ✅ **Fixed Data Mapping**: Proper snake_case to camelCase conversion
- ✅ **Fixed Authentication**: Custom auth service with hashed passwords
- ✅ **Fixed Percentage Display**: Correct number formatting (was showing "8020%" instead of "100%")
- ✅ **Fixed Sorting**: Immutable array operations for proper pagination
- ✅ **Fixed Decimal Input**: Allocation percentages now support any decimal precision (45.33%, 33.333%)
- ✅ **Dropdown Sorting**: All dropdowns in ascending order except months (chronological)
- ✅ **Toast Notifications**: Real-time feedback for all operations

### Architecture Changes
- ✅ **Three-tier Architecture**: Frontend → Express API → PostgreSQL
- ✅ **Hot Module Replacement**: Vite HMR for instant development updates
- ✅ **Concurrently**: Single command to run both servers
- ✅ **Type Safety**: Full TypeScript support across frontend and backend

## 🤝 Contributing

This is a private repository for internal use. If you're part of the team:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review
5. Merge after approval

## 📄 License

This is proprietary software for JoulesLabs internal use only.

## 👥 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for JoulesLabs**
