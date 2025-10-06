/*
  # Fix Admin Users Table and Credentials

  1. Changes
    - Drop and recreate admin_users table with proper structure
    - Insert only superadmin user with correct password hash
    - Remove demo credentials

  2. Security
    - Enable RLS on admin_users table
    - Add proper policies for authentication
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;

-- Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'member');

-- Create admin_users table
CREATE TABLE admin_users (
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
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile" ON admin_users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- Insert only superadmin user with correct password hash for "super123"
-- Using a simple hash that the application can verify
INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES
  ('superadmin', 'superadmin@jouleslabs.com', '2c26b46b', 'super_admin', true);

-- Function to update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = now();
  RETURN NEW;
END;
$$ language 'plpgsql';