// Export data from Supabase to JSON file
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://hfwqjwrsapadvufhgffu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3Fqd3JzYXBhZHZ1ZmhnZmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODM1ODIsImV4cCI6MjA2NjE1OTU4Mn0.U72g2gmSb9bdLFV_hwnrpjnpdClixQM038oyxeFkdfA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  console.log('Connecting to Supabase...');
  
  const data = {
    teamMembers: [],
    projects: [],
    roles: [],
    allocations: [],
    adminUsers: []
  };

  // Export team members
  console.log('Exporting team members...');
  const { data: teamMembers, error: tmError } = await supabase
    .from('team_members')
    .select('*');
  if (tmError) throw tmError;
  data.teamMembers = teamMembers;
  console.log(`✓ Exported ${teamMembers.length} team members`);

  // Export projects
  console.log('Exporting projects...');
  const { data: projects, error: pError } = await supabase
    .from('projects')
    .select('*');
  if (pError) throw pError;
  data.projects = projects;
  console.log(`✓ Exported ${projects.length} projects`);

  // Export roles
  console.log('Exporting roles...');
  const { data: roles, error: rError } = await supabase
    .from('roles')
    .select('*');
  if (rError) throw rError;
  data.roles = roles;
  console.log(`✓ Exported ${roles.length} roles`);

  // Export allocations
  console.log('Exporting allocations...');
  const { data: allocations, error: aError } = await supabase
    .from('allocations')
    .select('*');
  if (aError) throw aError;
  data.allocations = allocations;
  console.log(`✓ Exported ${allocations.length} allocations`);

  // Export admin users
  console.log('Exporting admin users...');
  const { data: adminUsers, error: auError } = await supabase
    .from('admin_users')
    .select('*');
  if (auError) throw auError;
  data.adminUsers = adminUsers;
  console.log(`✓ Exported ${adminUsers.length} admin users`);

  // Write to file
  fs.writeFileSync('supabase_data.json', JSON.stringify(data, null, 2));
  console.log('\n✓ Data exported to supabase_data.json');
}

exportData().catch(console.error);
