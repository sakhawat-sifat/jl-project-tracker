const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Password hashing utility
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.VITE_POSTGRES_PORT || '5432'),
  database: process.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: process.env.VITE_POSTGRES_USER || 'postgres',
  password: process.env.VITE_POSTGRES_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    release();
  }
});

// ============================================
// TEAM MEMBERS ROUTES
// ============================================

// Helper function to transform snake_case to camelCase
const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const newObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    let value = obj[key];
    
    // Convert percentage from string to number if needed
    if (key === 'percentage' && typeof value === 'string') {
      value = parseFloat(value);
    }
    
    newObj[camelKey] = value;
  }
  return newObj;
};

// Helper function to transform camelCase to snake_case
const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  const newObj = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

// Get all team members
app.get('/api/team-members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM team_members ORDER BY name ASC');
    res.json(result.rows.map(toCamelCase));
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Create team member
app.post('/api/team-members', async (req, res) => {
  const { name, role, email, department, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO team_members (name, role, email, department, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, role, email, department, status || 'active']
    );
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Update team member
app.put('/api/team-members/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, email, department, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE team_members SET name = $1, role = $2, email = $3, department = $4, status = $5 WHERE id = $6 RETURNING *',
      [name, role, email, department, status, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Team member not found' });
    } else {
      res.json(toCamelCase(result.rows[0]));
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Delete team member
app.delete('/api/team-members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Team member not found' });
    } else {
      res.json({ message: 'Team member deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY name ASC');
    res.json(result.rows.map(toCamelCase));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
app.post('/api/projects', async (req, res) => {
  // Convert camelCase to snake_case
  const data = toSnakeCase(req.body);
  const { name, client, start_date, end_date, status, priority } = data;
  
  try {
    const result = await pool.query(
      'INSERT INTO projects (name, client, start_date, end_date, status, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, client, start_date, end_date || null, status || 'Planning', priority || 'Medium']
    );
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  // Convert camelCase to snake_case
  const data = toSnakeCase(req.body);
  const { name, client, start_date, end_date, status, priority } = data;
  
  try {
    const result = await pool.query(
      'UPDATE projects SET name = $1, client = $2, start_date = $3, end_date = $4, status = $5, priority = $6 WHERE id = $7 RETURNING *',
      [name, client, start_date, end_date, status, priority, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json(toCamelCase(result.rows[0]));
    }
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json({ message: 'Project deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ============================================
// ROLES ROUTES
// ============================================

// Get all roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles ORDER BY name ASC');
    res.json(result.rows.map(toCamelCase));
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Create role
app.post('/api/roles', async (req, res) => {
  const { name, department } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO roles (name, department) VALUES ($1, $2) RETURNING *',
      [name, department]
    );
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
app.put('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { name, department } = req.body;
  try {
    const result = await pool.query(
      'UPDATE roles SET name = $1, department = $2 WHERE id = $3 RETURNING *',
      [name, department, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Role not found' });
    } else {
      res.json(toCamelCase(result.rows[0]));
    }
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
app.delete('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Role not found' });
    } else {
      res.json({ message: 'Role deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// ============================================
// ALLOCATIONS ROUTES
// ============================================

// Get all allocations
app.get('/api/allocations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM allocations ORDER BY updated_at ASC, created_at ASC');
    res.json(result.rows.map(toCamelCase));
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

// Create allocation
app.post('/api/allocations', async (req, res) => {
  // Convert camelCase to snake_case
  const data = toSnakeCase(req.body);
  let { user_id, project_id, employee_name, project_name, month, year, percentage } = data;
  
  // Round percentage to 2 decimal places
  if (percentage !== undefined && percentage !== null) {
    percentage = Math.round(parseFloat(percentage) * 100) / 100;
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO allocations (user_id, project_id, employee_name, project_name, month, year, percentage) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, project_id, employee_name, project_name, month, year, percentage]
    );
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating allocation:', error);
    res.status(500).json({ error: 'Failed to create allocation' });
  }
});

// Update allocation
app.put('/api/allocations/:id', async (req, res) => {
  const { id } = req.params;
  // Convert camelCase to snake_case
  const data = toSnakeCase(req.body);
  let { user_id, project_id, employee_name, project_name, month, year, percentage } = data;
  
  // Round percentage to 2 decimal places
  if (percentage !== undefined && percentage !== null) {
    percentage = Math.round(parseFloat(percentage) * 100) / 100;
  }
  
  try {
    const result = await pool.query(
      'UPDATE allocations SET user_id = $1, project_id = $2, employee_name = $3, project_name = $4, month = $5, year = $6, percentage = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [user_id, project_id, employee_name, project_name, month, year, percentage, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Allocation not found' });
    } else {
      res.json(toCamelCase(result.rows[0]));
    }
  } catch (error) {
    console.error('Error updating allocation:', error);
    res.status(500).json({ error: 'Failed to update allocation' });
  }
});

// Delete allocation
app.delete('/api/allocations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM allocations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Allocation not found' });
    } else {
      res.json({ message: 'Allocation deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting allocation:', error);
    res.status(500).json({ error: 'Failed to delete allocation' });
  }
});

// ============================================
// ADMIN USERS ROUTES
// ============================================

// Get all admin users
app.get('/api/admin-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM admin_users ORDER BY created_at DESC');
    res.json(result.rows.map(toCamelCase));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Username:', username);
  console.log('Password:', password ? '***' : 'undefined');
  
  try {
    console.log('Hashing password...');
    const hashedPassword = hashPassword(password);
    
    console.log('Executing query...');
    const result = await pool.query(
      'SELECT id, username, role FROM admin_users WHERE username = $1 AND password = $2',
      [username, hashedPassword]
    );
    console.log('Query executed, rows:', result.rows.length);
    console.log('Result:', JSON.stringify(result.rows));
    
    if (result.rows.length === 0) {
      console.log('No matching user found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found, transforming to camelCase...');
    const user = toCamelCase(result.rows[0]);
    console.log('Transformed user:', JSON.stringify(user));
    res.json(user);
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Create admin user
app.post('/api/admin-users', async (req, res) => {
  const { username, email, password, role } = req.body;
  console.log('=== CREATE ADMIN USER ===');
  console.log('Username:', username);
  console.log('Email:', email);
  console.log('Password received:', password ? `***${password.length} chars***` : 'undefined');
  console.log('Role:', role);
  
  try {
    // Hash the password before storing
    const hashedPassword = hashPassword(password);
    console.log('Password hashed successfully');
    
    const result = await pool.query(
      'INSERT INTO admin_users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email || null, hashedPassword, role || 'member']
    );
    console.log('User created successfully');
    res.status(201).json(toCamelCase(result.rows[0]));
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Update admin user
app.put('/api/admin-users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  try {
    let result;
    
    // If password is provided, update it; otherwise keep the old password
    if (password && password !== 'unchanged') {
      const hashedPassword = hashPassword(password);
      result = await pool.query(
        'UPDATE admin_users SET username = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, username, email, role, created_at',
        [username, email || null, hashedPassword, role, id]
      );
    } else {
      // Update without changing password
      result = await pool.query(
        'UPDATE admin_users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at',
        [username, email || null, role, id]
      );
    }
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin user not found' });
    } else {
      res.json(toCamelCase(result.rows[0]));
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ error: 'Failed to update admin user' });
  }
});

// Delete admin user
app.delete('/api/admin-users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM admin_users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Admin user not found' });
    } else {
      res.json({ message: 'Admin user deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ error: 'Failed to delete admin user' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Test endpoint
app.post('/api/test', async (req, res) => {
  console.log('Test endpoint hit!', req.body);
  res.json({ message: 'Test successful', body: req.body });
});

// Debug endpoint to check allocation data
app.get('/api/debug/allocations', async (req, res) => {
  try {
    // Check Md. Sagor's September 2025 allocations
    const mdSagor = await pool.query(`
      SELECT employee_name, project_name, month, year, percentage 
      FROM allocations 
      WHERE employee_name LIKE 'Md. Sagor%' 
        AND month = 'September' 
        AND year = 2025 
      ORDER BY percentage DESC
    `);
    
    const mdSagorTotal = mdSagor.rows.reduce((sum, row) => sum + parseFloat(row.percentage), 0);
    
    // Get sample allocations
    const sample = await pool.query(`
      SELECT employee_name, project_name, month, year, percentage 
      FROM allocations 
      ORDER BY id 
      LIMIT 10
    `);
    
    // Get percentage distribution
    const distribution = await pool.query(`
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
    
    res.json({
      mdSagor: {
        count: mdSagor.rows.length,
        total: mdSagorTotal,
        allocations: mdSagor.rows
      },
      sample: sample.rows,
      distribution: distribution.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.VITE_POSTGRES_DATABASE}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('PostgreSQL pool closed');
  });
});
