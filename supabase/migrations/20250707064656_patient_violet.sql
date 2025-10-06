/*
  # Fix RLS Infinite Recursion

  1. Changes
    - Remove the problematic "Super admins can manage all users" policy
    - Create simpler policies that don't cause recursion
    - Allow authenticated users to read admin_users data
    - Restrict updates to own profile only

  2. Security
    - Users can read all admin_users (for role checking in application)
    - Users can only update their own profile
    - Insert operations handled by application logic
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super admins can manage all users" ON admin_users;

-- Create a simple policy that allows authenticated users to read admin_users
-- This prevents recursion while allowing the application to check roles
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
  FOR SELECT TO authenticated
  USING (true);

-- Keep the existing policies for self-management
-- These don't cause recursion because they only check auth.uid()
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON admin_users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());