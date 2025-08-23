import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error', err);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
