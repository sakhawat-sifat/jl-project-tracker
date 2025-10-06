-- Run this SQL in your Supabase SQL Editor to set super admin password

-- Update superadmin password to "super123" (base64 encoded)
UPDATE admin_users
SET 
  password_hash = 'c3VwZXIxMjM=',  -- base64 encoded "super123"
  is_active = true
WHERE username = 'superadmin';

-- Verify the super admin exists and is active
SELECT 
  username, 
  email, 
  role, 
  is_active,
  CASE 
    WHEN password_hash = 'c3VwZXIxMjM=' THEN 'Password is set correctly'
    ELSE 'Password hash mismatch'
  END as password_status
FROM admin_users 
WHERE username = 'superadmin';

-- Expected result:
-- Username: superadmin
-- Email: superadmin@jouleslabs.com
-- Role: super_admin
-- Is Active: true
-- Password Status: Password is set correctly
--
-- Login credentials:
-- Username: superadmin
-- Password: super123
