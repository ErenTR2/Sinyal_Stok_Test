const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'kullanici',
      verified BOOLEAN NOT NULL DEFAULT false,
      verification_token TEXT
    );
  `);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  init,
};
