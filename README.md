# JL Project Tracker

A comprehensive team allocation and project management system built with React, TypeScript, and Supabase. This application helps organizations track team member allocations across projects, manage roles, and visualize project timelines.

> **Note**: This is a private repository for JoulesLabs internal use.

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
- **Secure Authentication**: Supabase-based authentication with session management
- **Guest Mode**: View-only access for restricted users
- **Database Configuration**: Easy database setup and connection management

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.8
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Authentication**: Supabase Auth

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account and project

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

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Run the migration files in the `supabase/migrations/` folder in your Supabase SQL editor in order:
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor
   - Run each migration file sequentially

5. **Create the first admin user**
   
   Use the `update_super_admin_password.sql` script to create your super admin account.
   See `SUPER_ADMIN_PASSWORD.md` for detailed instructions.

## 🎯 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
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
├── src/
│   ├── components/           # React components
│   │   ├── AdminHeader.tsx
│   │   ├── AdminUserManagement.tsx
│   │   ├── AllocationForm.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── DatabaseConfig.tsx
│   │   ├── LoginForm.tsx
│   │   ├── MembersListModal.tsx    # NEW: Modal for viewing team members
│   │   ├── MonthlyAllocationView.tsx
│   │   ├── MonthlySummary.tsx
│   │   ├── ProjectManagement.tsx
│   │   ├── RoleManagement.tsx
│   │   ├── TeamMemberManagement.tsx
│   │   ├── Toast.tsx               # NEW: Toast notification system
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useToast.ts            # NEW: Toast hook
│   ├── services/             # API and business logic
│   │   ├── authService.ts
│   │   └── supabaseService.ts
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   └── dateFormat.ts
│   ├── config/               # Configuration files
│   │   └── app.config.ts
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── supabase/
│   └── migrations/           # Database migration files
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🎨 Features in Detail

### Toast Notification System
- **4 Types**: Success, Error, Warning, Info
- **Auto-dismiss**: Automatically disappears after 5 seconds
- **Manual close**: Click the X button to dismiss
- **Stacking**: Multiple toasts stack vertically
- **Smooth animations**: Slide-in and fade-out effects

### Confirmation Modals
- **3 Visual Types**: 
  - Danger (red) - for deletions
  - Warning (yellow) - for important actions
  - Info (blue) - for general confirmations
- **Customizable**: Title, message, and button text
- **Safe operations**: Prevents accidental deletions

### Members List Modal
- **Beautiful UI**: Gradient header with numbered list
- **Detailed info**: Shows name, role, department, email, status
- **Empty states**: Helpful messages when no members found
- **Responsive**: Works on all screen sizes

## 📊 Database Schema

The application uses the following main tables:
- `team_members` - Store team member information
- `projects` - Store project details
- `roles` - Store role definitions
- `allocations` - Store team member allocations to projects
- `admin_users` - Store admin user credentials and roles

See the `supabase/migrations/` folder for complete schema definitions.

## 🔐 User Roles

- **Super Admin**: Full access to all features including user management
- **Admin**: Access to all features except user management
- **Member**: View-only access to certain features

## 📝 Configuration Files

- `ENV_CONFIG.md` - Environment variable documentation
- `CONFIGURATION_MIGRATION.md` - Guide for configuration migration
- `SUPER_ADMIN_PASSWORD.md` - Instructions for setting up admin accounts
- `TESTING_GUIDE.md` - Testing procedures and guidelines
- `CHANGELOG.md` - Project changelog and version history

## 🐛 Troubleshooting

### Database Connection Issues
1. Check your `.env` file has correct Supabase credentials
2. Verify your Supabase project is active
3. Check the database configuration in the app settings

### Authentication Issues
1. Ensure migrations are run in the correct order
2. Verify the `admin_users` table exists
3. Check password hashing is working correctly

### Build Issues
1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Ensure Node.js version is compatible (v16+)

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

### Git Workflow
1. Create feature branches from `main`
2. Use descriptive commit messages
3. Test before pushing
4. Keep commits atomic and focused

## 📈 Recent Updates

### Latest Features (October 2025)
- ✅ Added Members List Modal for viewing team members
- ✅ Clickable project names to view allocated members
- ✅ Clickable roles to view members by role
- ✅ Toast notification system for all CRUD operations
- ✅ Enhanced confirmation modals with visual types
- ✅ Improved date formatting (DD.MM.YY)
- ✅ Chronological month sorting in dropdowns
- ✅ Removed gradient backgrounds for cleaner UI

See `CHANGELOG.md` for complete version history.

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
