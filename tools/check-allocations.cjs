const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: process.env.VITE_POSTGRES_USER || 'postgres',
  password: process.env.VITE_POSTGRES_PASSWORD || '',
});

async function checkAllocations() {
  try {
    console.log('Checking allocation data...\n');
    
    // Check Md. Sagor's September 2025 allocations
    const result1 = await pool.query(`
      SELECT employee_name, project_name, month, year, percentage 
      FROM allocations 
      WHERE employee_name LIKE 'Md. Sagor%' 
        AND month = 'September' 
        AND year = 2025 
      ORDER BY percentage DESC 
      LIMIT 10
    `);
    
    console.log('=== Md. Sagor - September 2025 ===');
    console.log('Total allocations:', result1.rows.length);
    console.log('\nIndividual allocations:');
    result1.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.project_name}: ${row.percentage}%`);
    });
    
    const total = result1.rows.reduce((sum, row) => sum + parseFloat(row.percentage), 0);
    console.log(`\nTotal percentage: ${total}%`);
    
    // Check some other employees
    console.log('\n\n=== Sample of all allocations (first 10) ===');
    const result2 = await pool.query(`
      SELECT employee_name, project_name, month, year, percentage 
      FROM allocations 
      ORDER BY id 
      LIMIT 10
    `);
    
    result2.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.employee_name} - ${row.project_name} (${row.month} ${row.year}): ${row.percentage}%`);
    });
    
    // Check percentage distribution
    console.log('\n\n=== Percentage Distribution ===');
    const result3 = await pool.query(`
      SELECT 
        CASE 
          WHEN percentage <= 10 THEN '0-10%'
          WHEN percentage <= 20 THEN '11-20%'
          WHEN percentage <= 50 THEN '21-50%'
          WHEN percentage <= 100 THEN '51-100%'
          WHEN percentage <= 1000 THEN '101-1000%'
          ELSE '>1000%'
        END as range,
        COUNT(*) as count
      FROM allocations
      GROUP BY range
      ORDER BY range
    `);
    
    console.log('Percentage ranges:');
    result3.rows.forEach(row => {
      console.log(`  ${row.range}: ${row.count} allocations`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllocations();
