import { AdminUser, LoginCredentials } from '../types';
import { appConfig } from '../config/app.config';
import * as apiService from './apiService';

// Session management constants from environment variables
const SESSION_DURATION = appConfig.session.durationMs;
const LAST_ACTIVITY_KEY = 'lastActivity';
const USER_KEY = 'currentUser';

// Mock admin users for development - replace with real authentication
const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    username: appConfig.mockUsers.admin.username,
    email: appConfig.mockUsers.admin.email,
    role: 'super_admin',
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    createdBy: 'system'
  },
  {
    id: '2',
    username: appConfig.mockUsers.user.username,
    email: appConfig.mockUsers.user.email,
    role: 'admin',
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    createdBy: 'admin'
  }
];

export const authService = {
  // Login functionality
  login: async (credentials: LoginCredentials): Promise<AdminUser> => {
    try {
      // Call backend API to login
      const user = await apiService.login(credentials.username, credentials.password);
      
      // Store session
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  // Logout functionality
  logout: async (): Promise<void> => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const user = localStorage.getItem(USER_KEY);
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!user || !lastActivity) {
      return false;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity < SESSION_DURATION;
  },

  // Get current user
  getCurrentUser: async (): Promise<AdminUser | null> => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Extend session on activity
  extendSession: (): void => {
    if (authService.isAuthenticated()) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  },

  // Get remaining session time in milliseconds
  getSessionTimeRemaining: (): number => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return 0;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    const remaining = SESSION_DURATION - timeSinceLastActivity;
    
    return Math.max(0, remaining);
  },

  // Admin user management functions
  getAllAdminUsers: async (): Promise<AdminUser[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...mockAdminUsers];
  },

  addAdminUser: async (userData: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<AdminUser> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if username already exists
    if (mockAdminUsers.some(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const newUser: AdminUser = {
      ...userData,
      id: (mockAdminUsers.length + 1).toString(),
      createdAt: new Date(),
      lastLogin: undefined
    };

    mockAdminUsers.push(newUser);
    return newUser;
  },

  updateAdminUser: async (userId: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if username is being updated and already exists
    if (updates.username && updates.username !== mockAdminUsers[userIndex].username) {
      if (mockAdminUsers.some(u => u.username === updates.username && u.id !== userId)) {
        throw new Error('Username already exists');
      }
    }

    mockAdminUsers[userIndex] = { ...mockAdminUsers[userIndex], ...updates };
    return mockAdminUsers[userIndex];
  },

  deleteAdminUser: async (userId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockAdminUsers.splice(userIndex, 1);
  },

  changePassword: async (userId: string, newPassword: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockAdminUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In production, hash and store the password
    // For now, just simulate the operation
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Password updated successfully (mock)
  }
};