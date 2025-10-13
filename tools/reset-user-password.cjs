#!/usr/bin/env node

const crypto = require('crypto');
const pg = require('pg');
require('dotenv').config();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const pool = new pg.Pool({
  host: process.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.VITE_POSTGRES_PORT) || 5432,
  database: process.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: process.env.VITE_POSTGRES_USER || 'jl_user',
  password: process.env.VITE_POSTGRES_PASSWORD || '',
});

async function resetPassword(username, newPassword) {
  try {
    console.log(`\n🔐 Resetting password for user: ${username}`);
    console.log(`New password: ${newPassword}`);
    
    const hashedPassword = hashPassword(newPassword);
    
    const result = await pool.query(
      'UPDATE admin_users SET password = $1 WHERE username = $2 RETURNING id, username, email, role',
      [hashedPassword, username]
    );
    
    if (result.rows.length === 0) {
      console.log(`\n❌ User "${username}" not found!`);
    } else {
      const user = result.rows[0];
      console.log(`\n✅ Password updated successfully!`);
      console.log(`\nUser Details:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email || 'N/A'}`);
      console.log(`  Role: ${user.role}`);
      console.log(`\n🔑 You can now login with:`);
      console.log(`  Username: ${username}`);
      console.log(`  Password: ${newPassword}`);
    }
  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
  } finally {
    await pool.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('\n📖 Usage: node reset-user-password.cjs <username> <new-password>');
  console.log('\nExample:');
  console.log('  node reset-user-password.cjs guest guest123');
  console.log('  node reset-user-password.cjs admin newpassword\n');
  process.exit(1);
}

const [username, newPassword] = args;
resetPassword(username, newPassword);
