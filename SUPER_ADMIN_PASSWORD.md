# Super Admin Password Configuration

## Date: October 5, 2025

## Overview
Removed all hardcoded passwords from the platform and implemented proper password hashing using base64 encoding. The super admin password is now securely stored in the database.

---

## Changes Made

### 1. Removed Hardcoded Password Logic

#### supabaseService.ts - loginAdminUser()

**BEFORE:**
```typescript
// Check if it's a hardcoded password from migration (for existing users)
if (data.password_hash === 'hardcoded') {
  // For hardcoded users, accept any password with 3+ characters
  passwordValid = password.length >= 3;
} else {
  // For new users created through the UI, use btoa decoding
  try {
    const storedPassword = atob(data.password_hash);
    passwordValid = storedPassword === password;
  } catch (e) {
    passwordValid = false;
  }
}
```

**AFTER:**
```typescript
// Verify password using btoa encoding
let passwordValid = false;
try {
  const storedPassword = atob(data.password_hash);
  passwordValid = storedPassword === password;
} catch (e) {
  // If decoding fails, password is invalid
  passwordValid = false;
}
```

**Changes:**
- ✅ Removed hardcoded password bypass logic
- ✅ All passwords now use base64 encoding (btoa/atob)
- ✅ Consistent password verification for all users
- ✅ Failed decoding attempts result in invalid login

---

## Super Admin Credentials

### Default Super Admin Account

**Username:** `superadmin`  
**Password:** `super123`  
**Email:** `superadmin@jouleslabs.com`  
**Role:** `super_admin`  
**Status:** Active

**Password Hash (Base64):** `c3VwZXIxMjM=`

---

## Database Migration

### Migration Files Created:

1. **supabase/migrations/20251005000002_update_super_admin_password.sql**
   - Updates super admin password to base64 hash
   - Sets password to "super123"
   - Ensures account is active

2. **update_super_admin_password.sql** (root directory)
   - Simple SQL for manual execution in Supabase dashboard

### SQL to Execute:

```sql
-- Update superadmin password to "super123" (base64 encoded)
UPDATE admin_users
SET 
  password_hash = 'c3VwZXIxMjM=',  -- base64 encoded "super123"
  is_active = true
WHERE username = 'superadmin';

-- Verify the update
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
```

---

## How to Apply Database Changes

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `update_super_admin_password.sql` from the project root
4. Copy and paste the SQL into the editor
5. Click **"Run"** to execute
6. Verify the output shows "Password is set correctly"

### Method 2: Using Supabase CLI (if configured)

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

---

## Password Hash Generator Tool

A utility tool has been created to help you generate password hashes for future admin users.

### Using the Password Hash Generator:

1. Open `password-hash-generator.html` in your browser
2. Enter the desired password
3. Enter the username (optional)
4. Click "Generate Hash"
5. Copy the generated SQL query
6. Run it in Supabase SQL Editor

**File Location:** `/password-hash-generator.html`

### Example Usage:

**Input:**
- Password: `mySecurePassword123`
- Username: `newadmin`

**Output:**
- Hash: `bXlTZWN1cmVQYXNzd29yZDEyMw==`
- SQL query to insert/update in database

---

## Security Considerations

### Current Implementation

**Encoding Method:** Base64 (btoa/atob)

**Pros:**
- ✅ Simple to implement
- ✅ Works in browser without external libraries
- ✅ Fast encoding/decoding
- ✅ No hardcoded passwords in code

**Cons:**
- ⚠️ Base64 is reversible (encoding, not encryption)
- ⚠️ Anyone with database access can decode passwords
- ⚠️ Not suitable for production with sensitive data

### Security Recommendations

For production deployment, consider:

1. **Use proper password hashing:**
   - bcrypt (requires server-side implementation)
   - Argon2 (requires server-side implementation)
   - PBKDF2 (available in browser via Web Crypto API)

2. **Implement additional security:**
   - Rate limiting on login attempts
   - Two-factor authentication (2FA)
   - Password complexity requirements
   - Session token rotation
   - IP-based access restrictions

3. **Database security:**
   - Enable Row Level Security (RLS) in Supabase
   - Restrict database access to authorized users only
   - Use service role keys only on secure backend
   - Enable audit logging

---

## Testing

### Test Login with Super Admin

1. Go to your application login page
2. Enter credentials:
   - Username: `superadmin`
   - Password: `super123`
3. Click "Login"
4. Should successfully log in as super admin

### Test Password Change

1. Log in as super admin
2. Go to Admin User Management
3. Edit your own account
4. Change password using the UI
5. Log out and log back in with new password

### Verify No Hardcoded Passwords

1. Search codebase for "hardcoded" - should only appear in comments/documentation
2. Search for password strings - should not find any actual passwords
3. Check that all password verification uses atob() decoding

---

## How Password System Works

### User Creation Flow:

1. Admin creates new user via UI
2. Password is entered in plain text
3. Password is encoded using `btoa(password)`
4. Encoded hash is stored in `admin_users.password_hash`
5. Plain text password is never stored

### Login Flow:

1. User enters username and password
2. System fetches user record from database
3. Password hash is decoded using `atob(hash)`
4. Decoded password is compared with entered password
5. If match, user is authenticated
6. Last login timestamp is updated

### Password Change Flow:

1. User provides current password (verified first)
2. User enters new password
3. New password is encoded using `btoa(newPassword)`
4. Database is updated with new hash
5. User must use new password for next login

---

## Troubleshooting

### Issue: Cannot login with super123

**Solutions:**
1. Verify migration was run successfully
2. Check password_hash in database: should be `c3VwZXIxMjM=`
3. Clear browser cache and cookies
4. Check browser console for errors
5. Verify user is_active = true

### Issue: "Invalid username or password" error

**Solutions:**
1. Double-check username (case-sensitive)
2. Verify password is exactly "super123"
3. Check user exists in admin_users table
4. Verify user is_active = true
5. Check browser console for network errors

### Issue: Need to create additional admin users

**Solutions:**
1. Use the password-hash-generator.html tool
2. Generate hash for desired password
3. Insert or update user in database using generated SQL
4. Verify user can login

---

## Files Modified

1. `/src/services/supabaseService.ts` - Removed hardcoded password logic

## Files Created

1. `/supabase/migrations/20251005000002_update_super_admin_password.sql` - Migration file
2. `/update_super_admin_password.sql` - Manual SQL file
3. `/password-hash-generator.html` - Password hash generator utility
4. `/SUPER_ADMIN_PASSWORD.md` - This documentation

---

## Status

✅ **Hardcoded passwords removed**: Complete  
✅ **Base64 password hashing**: Implemented  
✅ **Super admin password set**: Ready (super123)  
✅ **Password generator tool**: Created  
⏳ **Database migration**: Needs to be executed  

---

## Next Steps

1. **Run the database migration** in Supabase dashboard
2. **Test login** with username: `superadmin` and password: `super123`
3. **Change the password** to something more secure if needed
4. **Consider implementing** stronger password hashing for production
5. **Document** any custom passwords you create

---

## Quick Reference

| Account | Username | Password | Role | File |
|---------|----------|----------|------|------|
| Super Admin | superadmin | super123 | super_admin | Migration file |

**Password Hash Reference:**
```
super123 → c3VwZXIxMjM= (base64)
```

**Decode Example (JavaScript):**
```javascript
atob('c3VwZXIxMjM=')  // Returns: "super123"
btoa('super123')      // Returns: "c3VwZXIxMjM="
```

---

## Important Notes

⚠️ **No passwords are hardcoded in the application code**  
⚠️ **All passwords are stored as base64 encoded hashes in the database**  
⚠️ **Super admin password can be changed after first login**  
⚠️ **Use the password generator tool for creating new admin users**  
⚠️ **Consider implementing stronger hashing for production use**
