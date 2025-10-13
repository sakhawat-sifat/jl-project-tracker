const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL configuration
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jl_project_tracker',
  user: 'jl_user',
  password: 'jl_password_2025'
});

async function migrateData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting data migration from Supabase to PostgreSQL...\n');
    
    // 1. Migrate team_members
    console.log('1️⃣  Migrating team_members...');
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*');
    
    if (membersError) throw membersError;
    
    for (const member of members) {
      await client.query(
        `INSERT INTO team_members (id, name, role, email, department, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          member.id,
          member.name,
          member.role || 'Unknown',
          member.email || null,
          member.department || null,
          member.status || 'active',
          member.created_at
        ]
      );
    }
    console.log(`   ✅ Migrated ${members.length} team members\n`);
    
    // 2. Migrate roles
    console.log('2️⃣  Migrating roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    
    if (rolesError) throw rolesError;
    
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (id, name, department, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO NOTHING`,
        [
          role.id,
          role.name,
          role.department || null,
          role.created_at
        ]
      );
    }
    console.log(`   ✅ Migrated ${roles.length} roles\n`);
    
    // 3. Migrate projects
    console.log('3️⃣  Migrating projects...');
    const { data: projects, error: projectsError} = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) throw projectsError;
    
    for (const project of projects) {
      // Handle end_date - if it's a status string or null, set to null
      let endDate = project.end_date;
      if (!endDate || endDate === 'null' || 
          ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'].includes(endDate)) {
        endDate = null;
      }
      
      await client.query(
        `INSERT INTO projects (id, name, client, start_date, end_date, status, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (name) DO NOTHING`,
        [
          project.id,
          project.name,
          project.client,
          project.start_date,
          endDate,
          project.status || 'Planning',
          project.priority || 'Medium',
          project.created_at
        ]
      );
    }
    console.log(`   ✅ Migrated ${projects.length} projects\n`);
    
    // 4. Migrate allocations
    console.log('4️⃣  Migrating allocations...');
    const { data: allocations, error: allocationsError } = await supabase
      .from('allocations')
      .select('*');
    
    if (allocationsError) throw allocationsError;
    
    for (const allocation of allocations) {
      // Skip if missing required fields
      if (!allocation.year || !allocation.month) {
        console.log(`   ⚠️  Skipping allocation ${allocation.id} - missing year/month`);
        continue;
      }
      
      await client.query(
        `INSERT INTO allocations (id, user_id, project_id, employee_name, project_name, month, year, percentage, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          allocation.id,
          allocation.user_id,
          allocation.project_id,
          allocation.employee_name || '',
          allocation.project_name || '',
          allocation.month,
          allocation.year,
          allocation.percentage || 0,
          allocation.created_at,
          allocation.updated_at || allocation.created_at
        ]
      );
    }
    console.log(`   ✅ Migrated ${allocations.length} allocations\n`);
    
    // 5. Migrate admin_users
    console.log('5️⃣  Migrating admin_users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (adminError) throw adminError;
    
    for (const admin of adminUsers) {
      await client.query(
        `INSERT INTO admin_users (id, username, password, role, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          role = EXCLUDED.role`,
        [
          admin.id,
          admin.username,
          admin.password || admin.password_hash || '',
          admin.role || 'member',
          admin.created_at
        ]
      );
    }
    console.log(`   ✅ Migrated ${adminUsers.length} admin users\n`);
    
    // Verify migration
    console.log('📊 Verifying migration...');
    const results = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM team_members) as team_members,
        (SELECT COUNT(*) FROM projects) as projects,
        (SELECT COUNT(*) FROM roles) as roles,
        (SELECT COUNT(*) FROM allocations) as allocations,
        (SELECT COUNT(*) FROM admin_users) as admin_users
    `);
    
    console.log('\n✅ Migration Summary:');
    console.log('   Team Members:', results.rows[0].team_members);
    console.log('   Projects:', results.rows[0].projects);
    console.log('   Roles:', results.rows[0].roles);
    console.log('   Allocations:', results.rows[0].allocations);
    console.log('   Admin Users:', results.rows[0].admin_users);
    console.log('\n🎉 Migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateData().catch(console.error);
