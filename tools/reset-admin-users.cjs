const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: process.env.VITE_POSTGRES_USER || 'postgres',
  password: process.env.VITE_POSTGRES_PASSWORD || '',
});

// Simple hash function using crypto (built-in Node.js module)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function resetAdminUsers() {
  try {
    console.log('Starting admin users reset...\n');
    
    // Step 1: Delete all existing admin users
    console.log('Step 1: Deleting all existing admin users...');
    const deleteResult = await pool.query('DELETE FROM admin_users');
    console.log(`Deleted ${deleteResult.rowCount} admin users.\n`);
    
    // Step 2: Create new superadmin account
    console.log('Step 2: Creating superadmin account...');
    const hashedPassword = hashPassword('super123');
    const newId = crypto.randomUUID();
    
    const insertResult = await pool.query(
      `INSERT INTO admin_users (id, username, password, role, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, username, role, created_at`,
      [newId, 'superadmin', hashedPassword, 'super_admin']
    );
    
    console.log('✅ Superadmin account created successfully!');
    console.log('\nAccount Details:');
    console.log('  Username: superadmin');
    console.log('  Password: super123');
    console.log('  Role: super_admin');
    console.log('  ID:', insertResult.rows[0].id);
    console.log('  Created:', insertResult.rows[0].created_at);
    
    console.log('\n✅ Admin users reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error resetting admin users:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

resetAdminUsers();
