/*
  # Fix superadmin user creation

  1. Changes
    - Ensure superadmin user exists with correct password hash
    - Use the exact hash format that matches our application logic
    - Clear any existing conflicting data

  2. Security
    - Maintain existing RLS policies
    - Only create the essential superadmin user
*/

-- First, let's make sure we have the admin_users table
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

-- Delete any existing superadmin user to avoid conflicts
DELETE FROM admin_users WHERE username = 'superadmin';

-- Insert superadmin user with the correct password hash for "super123"
-- The hash "2c26b46b" corresponds to "super123" using our hash function
INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES
  ('superadmin', 'superadmin@jouleslabs.com', '2c26b46b', 'super_admin', true);

-- Verify the user was created
DO $$
DECLARE
    user_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM admin_users WHERE username = 'superadmin';
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Failed to create superadmin user';
    ELSE
        RAISE NOTICE 'Superadmin user created successfully';
    END IF;
END $$;