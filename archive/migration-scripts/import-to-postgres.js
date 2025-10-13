// Script to import JSON data to PostgreSQL
// Run with: node tools/import-to-postgres.js

import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jl_project_tracker',
  user: 'jl_user',
  password: 'SecurePassword123!'
});

async function importData() {
  console.log('🚀 Starting PostgreSQL data import...\n');

  const dataDir = path.join(process.cwd(), 'data-export');
  
  if (!fs.existsSync(dataDir)) {
    console.error('❌ Data export directory not found!');
    console.log('Please run: node tools/export-supabase-data.js first');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Import admin_users first (no dependencies)
    console.log('📦 Importing admin_users...');
    const adminUsers = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'admin_users.json'), 'utf8')
    );
    
    for (const user of adminUsers) {
      await client.query(
        `INSERT INTO admin_users (id, username, password, role, email, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         email = EXCLUDED.email,
         updated_at = EXCLUDED.updated_at`,
        [user.id, user.username, user.password, user.role, user.email, user.created_at, user.updated_at]
      );
    }
    console.log(`✅ Imported ${adminUsers.length} admin users`);

    // Import roles
    console.log('📦 Importing roles...');
    const roles = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'roles.json'), 'utf8')
    );
    
    for (const role of roles) {
      await client.query(
        `INSERT INTO roles (id, name, department, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         department = EXCLUDED.department,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
        [role.id, role.name, role.department, role.description, role.created_at, role.updated_at]
      );
    }
    console.log(`✅ Imported ${roles.length} roles`);

    // Import team_members
    console.log('📦 Importing team_members...');
    const teamMembers = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'team_members.json'), 'utf8')
    );
    
    for (const member of teamMembers) {
      await client.query(
        `INSERT INTO team_members (id, name, email, role, department, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         department = EXCLUDED.department,
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
        [member.id, member.name, member.email, member.role, member.department, member.status || 'active', member.created_at, member.updated_at]
      );
    }
    console.log(`✅ Imported ${teamMembers.length} team members`);

    // Import projects
    console.log('📦 Importing projects...');
    const projects = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf8')
    );
    
    for (const project of projects) {
      await client.query(
        `INSERT INTO projects (id, name, client, start_date, end_date, status, priority, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         client = EXCLUDED.client,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         status = EXCLUDED.status,
         priority = EXCLUDED.priority,
         description = EXCLUDED.description,
         updated_at = EXCLUDED.updated_at`,
        [project.id, project.name, project.client, project.start_date, project.end_date, project.status, project.priority, project.description, project.created_at, project.updated_at]
      );
    }
    console.log(`✅ Imported ${projects.length} projects`);

    // Import allocations
    console.log('📦 Importing allocations...');
    const allocations = JSON.parse(
      fs.readFileSync(path.join(dataDir, 'allocations.json'), 'utf8')
    );
    
    for (const allocation of allocations) {
      await client.query(
        `INSERT INTO allocations (id, team_member_id, project_id, month, year, percentage, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
         team_member_id = EXCLUDED.team_member_id,
         project_id = EXCLUDED.project_id,
         month = EXCLUDED.month,
         year = EXCLUDED.year,
         percentage = EXCLUDED.percentage,
         updated_at = EXCLUDED.updated_at`,
        [allocation.id, allocation.team_member_id, allocation.project_id, allocation.month, allocation.year, allocation.percentage, allocation.created_at, allocation.updated_at]
      );
    }
    console.log(`✅ Imported ${allocations.length} allocations`);

    // Update sequences to prevent ID conflicts
    console.log('\n🔄 Updating sequences...');
    await client.query(`SELECT setval('admin_users_id_seq', (SELECT MAX(id) FROM admin_users))`);
    await client.query(`SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles))`);
    await client.query(`SELECT setval('team_members_id_seq', (SELECT MAX(id) FROM team_members))`);
    await client.query(`SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects))`);
    await client.query(`SELECT setval('allocations_id_seq', (SELECT MAX(id) FROM allocations))`);
    console.log('✅ Sequences updated');

    await client.query('COMMIT');
    console.log('\n✨ Import completed successfully!\n');

    // Show summary
    const summary = {
      admin_users: adminUsers.length,
      roles: roles.length,
      team_members: teamMembers.length,
      projects: projects.length,
      allocations: allocations.length
    };
    
    console.log('📊 Import Summary:');
    console.log(JSON.stringify(summary, null, 2));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during import:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

importData();
