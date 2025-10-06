import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config/app.config';

const supabaseUrl = appConfig.supabase.url;
const supabaseAnonKey = appConfig.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          role: 'super_admin' | 'admin' | 'member';
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          role?: 'super_admin' | 'admin' | 'member';
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          role?: 'super_admin' | 'admin' | 'member';
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          email: string | null;
          department: string | null;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          email?: string | null;
          department?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          email?: string | null;
          department?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          client: string;
          start_date: string;
          end_date: string | null;
          status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority: 'Low' | 'Medium' | 'High' | 'Critical';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          client: string;
          start_date: string;
          end_date?: string | null;
          status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority?: 'Low' | 'Medium' | 'High' | 'Critical';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          client?: string;
          start_date?: string;
          end_date?: string | null;
          status?: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
          priority?: 'Low' | 'Medium' | 'High' | 'Critical';
          created_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          department: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          department?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          department?: string | null;
          created_at?: string;
        };
      };
      allocations: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          employee_name: string;
          project_name: string;
          month: string;
          year: number;
          percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          employee_name: string;
          project_name: string;
          month: string;
          year: number;
          percentage: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          employee_name?: string;
          project_name?: string;
          month?: string;
          year?: number;
          percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}