# Environment Variables Configuration

This document describes all environment variables used in the JoulesLabs Project Tracker application.

## Required Variables

### Supabase Configuration

These variables are **required** for the application to function properly.

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### How to Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Settings > API
4. Copy the `Project URL` and `anon/public` key

## Optional Variables

### Application Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_APP_NAME` | Application name displayed in the UI | `JoulesLabs Project Tracker` |
| `VITE_APP_DESCRIPTION` | Application description for SEO | `Professional team project allocation tracker with resource management capabilities` |

### Session Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_SESSION_DURATION_HOURS` | Session timeout duration in hours | `4` |

### Pagination Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_ITEMS_PER_PAGE` | Number of items per page in tables | `10` |

### Mock Users (Development Only)

These variables configure the mock authentication users for development/testing.

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_MOCK_ADMIN_USERNAME` | Mock super admin username | `admin` |
| `VITE_MOCK_ADMIN_EMAIL` | Mock super admin email | `admin@jl-tracker.com` |
| `VITE_MOCK_USER_USERNAME` | Mock regular user username | `user` |
| `VITE_MOCK_USER_EMAIL` | Mock regular user email | `user@jl-tracker.com` |

### Feature Flags

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `VITE_ENABLE_MOCK_AUTH` | Enable mock authentication (development only) | `false` |

## Setup Instructions

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit the `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Optional: Customize Other Settings

You can override any of the optional variables as needed:

```env
# Session timeout (in hours)
VITE_SESSION_DURATION_HOURS=8

# Pagination
VITE_ITEMS_PER_PAGE=20

# Custom app name
VITE_APP_NAME=My Custom Tracker
```

### 4. Restart Development Server

After making changes to the `.env` file, restart your development server:

```bash
npm run dev
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` to version control** - The `.env` file is already in `.gitignore`
2. **Use different credentials for development and production**
3. **Keep your Supabase keys secure** - Never expose them in client-side code
4. **Disable mock authentication in production** - Set `VITE_ENABLE_MOCK_AUTH=false`

## Troubleshooting

### Missing Environment Variables

If you see an error about missing environment variables:

1. Check that your `.env` file exists in the project root
2. Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Restart your development server after adding variables

### Configuration Validation

The application validates required environment variables on startup. Check the browser console for validation errors if the app doesn't connect to the database.

## Centralized Configuration

All environment variables are accessed through a centralized configuration file located at:

```
src/config/app.config.ts
```

This provides:
- Type-safe access to environment variables
- Default values for optional settings
- Configuration validation
- Single source of truth for all app settings

## Example Complete Configuration

```env
# Required - Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - Application
VITE_APP_NAME=JoulesLabs Project Tracker
VITE_APP_DESCRIPTION=Professional team project allocation tracker

# Optional - Session
VITE_SESSION_DURATION_HOURS=4

# Optional - Pagination
VITE_ITEMS_PER_PAGE=10

# Optional - Mock Users (Dev only)
VITE_MOCK_ADMIN_USERNAME=admin
VITE_MOCK_ADMIN_EMAIL=admin@jl-tracker.com
VITE_MOCK_USER_USERNAME=user
VITE_MOCK_USER_EMAIL=user@jl-tracker.com

# Optional - Feature Flags
VITE_ENABLE_MOCK_AUTH=false
```
