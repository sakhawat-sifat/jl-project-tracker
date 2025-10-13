const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: process.env.VITE_POSTGRES_USER || 'postgres',
  password: process.env.VITE_POSTGRES_PASSWORD || '',
});

async function checkAdminUsers() {
  try {
    const result = await pool.query('SELECT id, username, role, created_at FROM admin_users ORDER BY created_at DESC');
    
    console.log('\n=== ADMIN USERS IN DATABASE ===');
    console.log(`Total: ${result.rows.length}\n`);
    
    result.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdminUsers();
