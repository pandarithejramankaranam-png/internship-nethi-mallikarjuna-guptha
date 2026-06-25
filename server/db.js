import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

// Test connection and auto-initialize
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at', res.rows[0].now);
    
    // Auto-initialize schema if tables do not exist
    try {
      const checkRes = await pool.query("SELECT to_regclass('public.users')");
      if (!checkRes.rows[0].to_regclass) {
        console.log('Database tables not found. Initializing schema...');
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, 'utf8');
          await pool.query(schemaSql);
          console.log('Database schema initialized successfully!');
        } else {
          console.warn('WARNING: schema.sql file not found at', schemaPath);
        }
      } else {
        console.log('Database tables exist. Skipping schema initialization.');
      }
    } catch (dbErr) {
      console.error('Error during database auto-initialization:', dbErr.message);
    }
  }
});

export default pool;
