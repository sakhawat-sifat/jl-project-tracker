const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const fs = require('fs');

// Supabase config
const supabaseUrl = 'https://hfwqjwrsapadvufhgffu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3Fqd3JzYXBhZHZ1ZmhnZmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODM1ODIsImV4cCI6MjA2NjE1OTU4Mn0.U72g2gmSb9bdLFV_hwnrpjnpdClixQM038oyxeFkdfA';

// PostgreSQL config
const pgPool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jl_project_tracker',
  user: 'jl_user',
  password: 'jl_password_2025',
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('🚀 Starting migration from Supabase to PostgreSQL...\n');

  try {
    // 1. Migrate admin_users
    console.log('📥 Fetching admin_users from Supabase...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    
    if (adminError) throw adminError;
    console.log(`✓ Found ${adminUsers.length} admin users`);

    if (adminUsers.length > 0) {
      console.log('📤 Importing admin_users to PostgreSQL...');
      for (const user of adminUsers) {
        await pgPool.query(
          `INSERT INTO admin_users (id, username, password, role, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (id) DO UPDATE SET 
           username = $2, password = $3, role = $4, updated_at = $6`,
          [user.id, user.username, user.password, user.role, user.created_at, user.updated_at]
        );
      }
      console.log('✓ Admin users migrated\n');
    }

    // 2. Migrate roles
    console.log('📥 Fetching roles from Supabase...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
    
    if (rolesError) throw rolesError;
    console.log(`✓ Found ${roles.length} roles`);

    if (roles.length > 0) {
      console.log('📤 Importing roles to PostgreSQL...');
      for (const role of roles) {
        await pgPool.query(
          `INSERT INTO roles (id, name, department, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO UPDATE SET 
           name = $2, department = $3, updated_at = $5`,
          [role.id, role.name, role.department, role.created_at, role.updated_at]
        );
      }
      console.log('✓ Roles migrated\n');
    }

    // 3. Migrate team_members
    console.log('📥 Fetching team_members from Supabase...');
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
    
    if (teamError) throw teamError;
    console.log(`✓ Found ${teamMembers.length} team members`);

    if (teamMembers.length > 0) {
      console.log('📤 Importing team_members to PostgreSQL...');
      for (const member of teamMembers) {
        await pgPool.query(
          `INSERT INTO team_members (id, name, email, role, department, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           ON CONFLICT (id) DO UPDATE SET 
           name = $2, email = $3, role = $4, department = $5, status = $6, updated_at = $8`,
          [member.id, member.name, member.email, member.role, member.department, 
           member.status || 'active', member.created_at, member.updated_at]
        );
      }
      console.log('✓ Team members migrated\n');
    }

    // 4. Migrate projects
    console.log('📥 Fetching projects from Supabase...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) throw projectsError;
    console.log(`✓ Found ${projects.length} projects`);

    if (projects.length > 0) {
      console.log('📤 Importing projects to PostgreSQL...');
      for (const project of projects) {
        await pgPool.query(
          `INSERT INTO projects (id, name, client, start_date, end_date, status, priority, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           ON CONFLICT (id) DO UPDATE SET 
           name = $2, client = $3, start_date = $4, end_date = $5, status = $6, priority = $7, updated_at = $9`,
          [project.id, project.name, project.client, project.start_date, project.end_date, 
           project.status, project.priority, project.created_at, project.updated_at]
        );
      }
      console.log('✓ Projects migrated\n');
    }

    // 5. Migrate allocations
    console.log('📥 Fetching allocations from Supabase...');
    const { data: allocations, error: allocationsError } = await supabase
      .from('allocations')
      .select('*');
    
    if (allocationsError) throw allocationsError;
    console.log(`✓ Found ${allocations.length} allocations`);

    if (allocations.length > 0) {
      console.log('📤 Importing allocations to PostgreSQL...');
      for (const allocation of allocations) {
        await pgPool.query(
          `INSERT INTO allocations (id, team_member_id, project_id, month, year, percentage, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           ON CONFLICT (id) DO UPDATE SET 
           team_member_id = $2, project_id = $3, month = $4, year = $5, percentage = $6, updated_at = $8`,
          [allocation.id, allocation.team_member_id, allocation.project_id, allocation.month, 
           allocation.year, allocation.percentage, allocation.created_at, allocation.updated_at]
        );
      }
      console.log('✓ Allocations migrated\n');
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Admin users: ${adminUsers.length}`);
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Team members: ${teamMembers.length}`);
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Allocations: ${allocations.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pgPool.end();
  }
}

migrateData();
