CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('yonetici'), ('depocu'), ('kullanici')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT NOT NULL,
  include_in_global BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  assigned_warehouse_id INTEGER REFERENCES warehouses(id)
);

-- email verification
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  barcode TEXT,
  sku TEXT,
  critical_global INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_codes (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  PRIMARY KEY (product_id, code)
);

-- stock by warehouse
CREATE TABLE IF NOT EXISTS warehouse_stocks (
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (warehouse_id, product_id)
);

-- per-warehouse critical
CREATE TABLE IF NOT EXISTS per_warehouse_critical (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  critical INTEGER,
  PRIMARY KEY (product_id, warehouse_id)
);

-- receipts (gelen/giden)
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound')),
  warehouse_id INTEGER REFERENCES warehouses(id),
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- transfers
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  from_warehouse_id INTEGER REFERENCES warehouses(id),
  to_warehouse_id INTEGER REFERENCES warehouses(id),
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id SERIAL PRIMARY KEY,
  transfer_id INTEGER REFERENCES transfers(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- inventory adjustments
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id),
  product_id INTEGER REFERENCES products(id),
  delta INTEGER NOT NULL,
  reason TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  column_order JSONB DEFAULT '[]'::jsonb
);

-- audit log (basic)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity TEXT NOT NULL, -- 'product','warehouse','receipt','transfer','adjustment'
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'create','update','delete'
  detail JSONB,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
