-- server/migrations/002_users.sql
ALTER TABLE users
  RENAME COLUMN password_hash TO password;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'kullanıcı',
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS warehouse_id INTEGER REFERENCES warehouses(id);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);
