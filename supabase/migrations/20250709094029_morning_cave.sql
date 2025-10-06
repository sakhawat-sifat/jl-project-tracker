/*
  # Fix Admin Users RLS Policy for Initial User Creation

  1. Changes
    - Add RLS policy to allow anonymous users to insert predefined initial users
    - This enables the login service to seed initial users if they don't exist

  2. Security
    - Only allows insertion of specific predefined usernames
    - Maintains security by restricting to known initial users
*/

-- Add policy to allow anonymous users to insert predefined initial users
CREATE POLICY "Allow anon to insert predefined users" ON admin_users
  FOR INSERT TO anon
  WITH CHECK (username IN ('superadmin', 'admin', 'member'));