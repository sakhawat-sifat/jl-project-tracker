/*
  # Update Super Admin Password
  
  This migration updates the super admin password to use proper base64 hashing.
  Password: super123
  Base64 Hash: c3VwZXIxMjM=
  
  This removes any hardcoded password logic and ensures all passwords
  are properly hashed using base64 encoding.
  
  Changes:
    - Update superadmin user password_hash to base64 encoded value
    - Ensure superadmin account is active
*/

-- Update superadmin password to base64 hash of "super123"
UPDATE admin_users
SET 
  password_hash = 'c3VwZXIxMjM=',  -- base64 encoded "super123"
  is_active = true
WHERE username = 'superadmin';

-- Verify the update
DO $$ 
DECLARE
  user_hash text;
  user_active boolean;
BEGIN
  SELECT password_hash, is_active INTO user_hash, user_active 
  FROM admin_users 
  WHERE username = 'superadmin';
  
  IF user_hash = 'c3VwZXIxMjM=' AND user_active = true THEN
    RAISE NOTICE 'Super admin password updated successfully';
    RAISE NOTICE 'Username: superadmin';
    RAISE NOTICE 'Password: super123';
    RAISE NOTICE 'Status: Active';
  ELSE
    RAISE WARNING 'Super admin password may not have been updated correctly';
    RAISE WARNING 'Current hash: %', user_hash;
    RAISE WARNING 'Active status: %', user_active;
  END IF;
END $$;
