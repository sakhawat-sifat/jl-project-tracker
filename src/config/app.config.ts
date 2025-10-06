/**
 * Application Configuration
 * All environment variables are centralized here for easy access and type safety
 */

export const appConfig = {
  // Application Info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'JoulesLabs Project Tracker',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Professional team project allocation tracker with resource management capabilities',
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Session Configuration
  session: {
    durationHours: parseInt(import.meta.env.VITE_SESSION_DURATION_HOURS) || 4,
    durationMs: (parseInt(import.meta.env.VITE_SESSION_DURATION_HOURS) || 4) * 60 * 60 * 1000,
  },

  // Pagination Configuration
  pagination: {
    itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 10,
  },

  // Mock Users (Development Only)
  mockUsers: {
    admin: {
      username: import.meta.env.VITE_MOCK_ADMIN_USERNAME || 'admin',
      email: import.meta.env.VITE_MOCK_ADMIN_EMAIL || 'admin@jl-tracker.com',
    },
    user: {
      username: import.meta.env.VITE_MOCK_USER_USERNAME || 'user',
      email: import.meta.env.VITE_MOCK_USER_EMAIL || 'user@jl-tracker.com',
    },
  },

  // Feature Flags
  features: {
    enableMockAuth: import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true',
  },
};

// Validation function to check if required environment variables are set
export const validateConfig = (): { isValid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!appConfig.supabase.url) {
    missing.push('VITE_SUPABASE_URL');
  }

  if (!appConfig.supabase.anonKey) {
    missing.push('VITE_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
};
