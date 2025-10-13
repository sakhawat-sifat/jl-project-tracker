// Simple script to export data from Supabase to JSON files
// Run with: node tools/export-supabase-data.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://hfwqjwrsapadvufhgffu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3Fqd3JzYXBhZHZ1ZmhnZmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODM1ODIsImV4cCI6MjA2NjE1OTU4Mn0.U72g2gmSb9bdLFV_hwnrpjnpdClixQM038oyxeFkdfA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  console.log('🚀 Starting Supabase data export...\n');

  const dataDir = path.join(process.cwd(), 'data-export');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    // Export team_members
    console.log('📦 Exporting team_members...');
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .order('id');
    
    if (teamError) throw teamError;
    fs.writeFileSync(
      path.join(dataDir, 'team_members.json'),
      JSON.stringify(teamMembers, null, 2)
    );
    console.log(`✅ Exported ${teamMembers.length} team members`);

    // Export projects
    console.log('📦 Exporting projects...');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .order('id');
    
    if (projectError) throw projectError;
    fs.writeFileSync(
      path.join(dataDir, 'projects.json'),
      JSON.stringify(projects, null, 2)
    );
    console.log(`✅ Exported ${projects.length} projects`);

    // Export roles
    console.log('📦 Exporting roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('id');
    
    if (rolesError) throw rolesError;
    fs.writeFileSync(
      path.join(dataDir, 'roles.json'),
      JSON.stringify(roles, null, 2)
    );
    console.log(`✅ Exported ${roles.length} roles`);

    // Export allocations
    console.log('📦 Exporting allocations...');
    const { data: allocations, error: allocError } = await supabase
      .from('allocations')
      .select('*')
      .order('id');
    
    if (allocError) throw allocError;
    fs.writeFileSync(
      path.join(dataDir, 'allocations.json'),
      JSON.stringify(allocations, null, 2)
    );
    console.log(`✅ Exported ${allocations.length} allocations`);

    // Export admin_users
    console.log('📦 Exporting admin_users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .order('id');
    
    if (adminError) throw adminError;
    fs.writeFileSync(
      path.join(dataDir, 'admin_users.json'),
      JSON.stringify(adminUsers, null, 2)
    );
    console.log(`✅ Exported ${adminUsers.length} admin users`);

    console.log('\n✨ Export completed successfully!');
    console.log(`📁 Data saved to: ${dataDir}`);
    
    // Create summary
    const summary = {
      export_date: new Date().toISOString(),
      tables: {
        team_members: teamMembers.length,
        projects: projects.length,
        roles: roles.length,
        allocations: allocations.length,
        admin_users: adminUsers.length
      }
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n📊 Summary:');
    console.log(JSON.stringify(summary.tables, null, 2));

  } catch (error) {
    console.error('❌ Error during export:', error.message);
    process.exit(1);
  }
}

exportData();
