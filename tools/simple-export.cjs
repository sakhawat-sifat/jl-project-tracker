// Simple data export from Supabase to SQL format// Simple data export from Supabase to SQL format

const { createClient } = require('@supabase/supabase-js');const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');const fs = require('fs');



const supabase = createClient(const supabase = createClient(

  'https://hfwqjwrsapadvufhgffu.supabase.co',  'https://hfwqjwrsapadvufhgffu.supabase.co',

  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3Fqd3JzYXBhZHZ1ZmhnZmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODM1ODIsImV4cCI6MjA2NjE1OTU4Mn0.U72g2gmSb9bdLFV_hwnrpjnpdClixQM038oyxeFkdfA'  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3Fqd3JzYXBhZHZ1ZmhnZmZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODM1ODIsImV4cCI6MjA2NjE1OTU4Mn0.U72g2gmSb9bdLFV_hwnrpjnpdClixQM038oyxeFkdfA'

););



async function exportData() {async function exportData() {

  let sql = '-- Supabase to PostgreSQL Migration\n\n';  let sql = '-- Supabase to PostgreSQL Migration\n\n';

    

  try {  try {

    console.log('Exporting team members...');    console.log('Exporting team members...');

    const { data: members } = await supabase.from('team_members').select('*');    const { data: members } = await supabase.from('team_members').select('*');

        

    if (members && members.length > 0) {    if (members && members.length > 0) {

      members.forEach(m => {      members.forEach(m => {

        const name = m.name?.replace(/'/g, "''") || '';        const name = m.name?.replace(/'/g, "''") || '';

        const email = m.email?.replace(/'/g, "''") || '';        const email = m.email?.replace(/'/g, "''") || '';

        const role = m.role?.replace(/'/g, "''") || '';        const role = m.role?.replace(/'/g, "''") || '';

        const department = m.department?.replace(/'/g, "''") || '';        const department = m.department?.replace(/'/g, "''") || '';

        const status = m.status?.replace(/'/g, "''") || 'active';        const status = m.status?.replace(/'/g, "''") || 'active';

        sql += `INSERT INTO team_members (id, name, email, role, department, status, created_at) VALUES ('${m.id}', '${name}', '${email}', '${role}', '${department}', '${status}', '${m.created_at}');\n`;        sql += `INSERT INTO team_members (id, name, email, role, department, status, created_at) VALUES ('${m.id}', '${name}', '${email}', '${role}', '${department}', '${status}', '${m.created_at}');\n`;

      });      });

    }    }

        

    console.log('Exporting projects...');    console.log('Exporting projects...');

    const { data: projects } = await supabase.from('projects').select('*');    const { data: projects } = await supabase.from('projects').select('*');

        

    if (projects && projects.length > 0) {    if (projects && projects.length > 0) {

      projects.forEach(p => {      projects.forEach(p => {

        const name = p.name?.replace(/'/g, "''") || '';        const name = p.name?.replace(/'/g, "''") || '';

        const client = p.client?.replace(/'/g, "''") || '';        const client = p.client?.replace(/'/g, "''") || '';

        const status = p.status?.replace(/'/g, "''") || 'active';        const status = p.status?.replace(/'/g, "''") || 'active';

        const priority = p.priority?.replace(/'/g, "''") || 'medium';        const priority = p.priority?.replace(/'/g, "''") || 'medium';

        sql += `INSERT INTO projects (id, name, client, start_date, end_date, status, priority, created_at) VALUES ('${p.id}', '${name}', '${client}', '${p.start_date}', '${p.end_date}', '${status}', '${priority}', '${p.created_at}');\n`;        sql += `INSERT INTO projects (id, name, client, start_date, end_date, status, priority, created_at) VALUES ('${p.id}', '${name}', '${client}', '${p.start_date}', '${p.end_date}', '${status}', '${priority}', '${p.created_at}');\n`;

      });      });

    }    }

        

    console.log('Exporting roles...');    console.log('Exporting roles...');

    const { data: roles } = await supabase.from('roles').select('*');    const { data: roles } = await supabase.from('roles').select('*');

        

    if (roles && roles.length > 0) {    if (roles && roles.length > 0) {

      roles.forEach(r => {      roles.forEach(r => {

        const name = r.name?.replace(/'/g, "''") || '';        const name = r.name?.replace(/'/g, "''") || '';

        const department = r.department?.replace(/'/g, "''") || '';        const department = r.department?.replace(/'/g, "''") || '';

        sql += `INSERT INTO roles (id, name, department, created_at) VALUES ('${r.id}', '${name}', '${department}', '${r.created_at}');\n`;        sql += `INSERT INTO roles (id, name, department, created_at) VALUES ('${r.id}', '${name}', '${department}', '${r.created_at}');\n`;

      });      });

    }    }

        

    console.log('Exporting allocations...');    console.log('Exporting allocations...');

    const { data: allocations } = await supabase.from('allocations').select('*');    const { data: allocations } = await supabase.from('allocations').select('*');

        

    if (allocations && allocations.length > 0) {    if (allocations && allocations.length > 0) {

      allocations.forEach(a => {      allocations.forEach(a => {

        const month = a.month?.replace(/'/g, "''") || '';        const month = a.month?.replace(/'/g, "''") || '';

        sql += `INSERT INTO allocations (id, team_member_id, project_id, month, percentage, created_at) VALUES ('${a.id}', '${a.user_id}', '${a.project_id}', '${month}', ${a.percentage}, '${a.created_at}');\n`;        sql += `INSERT INTO allocations (id, team_member_id, project_id, month, percentage, created_at) VALUES ('${a.id}', '${a.user_id}', '${a.project_id}', '${month}', ${a.percentage}, '${a.created_at}');\n`;

      });      });

    }    }

        

    console.log('Exporting admin users...');    console.log('Exporting admin users...');

    const { data: admins } = await supabase.from('admin_users').select('*');    const { data: admins } = await supabase.from('admin_users').select('*');

        

    if (admins && admins.length > 0) {    if (admins && admins.length > 0) {

      admins.forEach(a => {      admins.forEach(a => {

        const username = a.username?.replace(/'/g, "''") || '';        const username = a.username?.replace(/'/g, "''") || '';

        const password = a.password?.replace(/'/g, "''") || '';        const password = a.password?.replace(/'/g, "''") || '';

        const role = a.role?.replace(/'/g, "''") || 'member';        const role = a.role?.replace(/'/g, "''") || 'member';

        sql += `INSERT INTO admin_users (id, username, password, role, created_at) VALUES ('${a.id}', '${username}', '${password}', '${role}', '${a.created_at}');\n`;        sql += `INSERT INTO admin_users (id, username, password, role, created_at) VALUES ('${a.id}', '${username}', '${password}', '${role}', '${a.created_at}');\n`;

      });      });

    }    }

        

    // Write to file    console.log('Exporting roles...');

    fs.writeFileSync('data_export.sql', sql);    const { data: roles } = await supabase.from('roles').select('*');

    console.log('Export complete! File: data_export.sql');    

        if (roles && roles.length > 0) {

  } catch (error) {      roles.forEach(r => {

    console.error('Export failed:', error);        const name = r.name?.replace(/'/g, "''") || '';

    process.exit(1);        const department = r.department?.replace(/'/g, "''") || '';

  }        sql += `INSERT INTO roles (id, name, department, created_at) VALUES (${r.id}, '${name}', '${department}', '${r.created_at}');\n`;

}      });

    }

exportData();    

    console.log('Exporting allocations...');
    const { data: allocations } = await supabase.from('allocations').select('*');
    
    if (allocations && allocations.length > 0) {
      allocations.forEach(a => {
        const month = a.month?.replace(/'/g, "''") || '';
        sql += `INSERT INTO allocations (id, team_member_id, project_id, month, percentage, created_at) VALUES (${a.id}, ${a.user_id}, ${a.project_id}, '${month}', ${a.percentage}, '${a.created_at}');\n`;
      });
    }
    
    console.log('Exporting admin users...');
    const { data: admins } = await supabase.from('admin_users').select('*');
    
    if (admins && admins.length > 0) {
      admins.forEach(a => {
        const username = a.username?.replace(/'/g, "''") || '';
        const password = a.password?.replace(/'/g, "''") || '';
        const role = a.role?.replace(/'/g, "''") || 'member';
        sql += `INSERT INTO admin_users (id, username, password, role, created_at) VALUES (${a.id}, '${username}', '${password}', '${role}', '${a.created_at}');\n`;
      });
    }
    
    // Write to file
    fs.writeFileSync('data_export.sql', sql);
    console.log('Export complete! File: data_export.sql');
    
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportData();
