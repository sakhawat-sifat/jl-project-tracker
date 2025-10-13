import { Pool, PoolConfig } from 'pg';

// PostgreSQL connection configuration
const poolConfig: PoolConfig = {
  host: import.meta.env.VITE_POSTGRES_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_POSTGRES_PORT || '5432'),
  database: import.meta.env.VITE_POSTGRES_DATABASE || 'jl_project_tracker',
  user: import.meta.env.VITE_POSTGRES_USER || 'postgres',
  password: import.meta.env.VITE_POSTGRES_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  ssl: import.meta.env.VITE_POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Create a connection pool
export const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper function to test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ PostgreSQL connection test successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection test failed:', error);
    return false;
  }
};

// Close all connections (useful for cleanup)
export const closePool = async () => {
  await pool.end();
  console.log('PostgreSQL pool closed');
};

export default pool;
