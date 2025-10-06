/*
  # Admin Users Management System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password_hash` (text) - In production, this would be properly hashed
      - `role` (enum: super_admin, admin, member)
      - `is_active` (boolean)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `created_by` (uuid, references admin_users.id)

  2. Security
    - Enable RLS on admin_users table
    - Add policies for role-based access control

  3. Default Data
    - Create default super admin user
    - Create sample admin and member users
*/

-- Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'member');

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role admin_role DEFAULT 'member',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admin_users(id)
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Super admins can manage all users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

CREATE POLICY "Users can view their own profile" ON admin_users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON admin_users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Insert default admin users (passwords are plain text for demo - in production these would be hashed)
INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES
  ('superadmin', 'superadmin@jouleslabs.com', 'super123', 'super_admin', true),
  ('admin', 'admin@jouleslabs.com', 'admin123', 'admin', true),
  ('member', 'member@jouleslabs.com', 'member123', 'member', true)
ON CONFLICT (username) DO NOTHING;

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_login update (this would be called from application logic)
-- Note: In a real application, this would be handled differently for security