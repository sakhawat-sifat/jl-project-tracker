/*
  # Fix superadmin password hash

  1. Changes
    - Update superadmin user with correct password hash for "super123"
    - The hash should match what our application generates

  2. Security
    - Maintain existing user structure
    - Only update the password hash
*/

-- Update superadmin user with the correct password hash
-- The correct hash for "super123" using our hash function
UPDATE admin_users 
SET password_hash = '740d7a8c'
WHERE username = 'superadmin';

-- Verify the update
DO $$
DECLARE
    user_hash text;
BEGIN
    SELECT password_hash INTO user_hash FROM admin_users WHERE username = 'superadmin';
    IF user_hash = '740d7a8c' THEN
        RAISE NOTICE 'Superadmin password hash updated successfully to: %', user_hash;
    ELSE
        RAISE EXCEPTION 'Failed to update superadmin password hash. Current hash: %', user_hash;
    END IF;
END $$;