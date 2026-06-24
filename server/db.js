import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection string configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set. Database connections will fail.');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
  }
});

export default pool;
