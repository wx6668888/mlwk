CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted',
  expected_date TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL,
  project_type TEXT NOT NULL,
  project_location TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  quantity TEXT NOT NULL DEFAULT '',
  budget TEXT NOT NULL DEFAULT '',
  delivery TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  attachments_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
ON inquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_user
ON inquiries(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_inquiries_project_code
ON inquiries(project_code)
WHERE project_code <> '';

CREATE TABLE IF NOT EXISTS project_updates (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_note TEXT NOT NULL DEFAULT '',
  expected_date TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_project_updates_inquiry
ON project_updates(inquiry_id, created_at ASC);

CREATE TABLE IF NOT EXISTS store_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  locale TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  currency TEXT NOT NULL,
  subtotal_minor INTEGER NOT NULL,
  shipping_minor INTEGER NOT NULL,
  total_minor INTEGER NOT NULL,
  shipping_zone TEXT NOT NULL,
  shipping_address_json TEXT NOT NULL,
  status TEXT NOT NULL,
  paypal_order_id TEXT NOT NULL DEFAULT '' UNIQUE,
  paypal_capture_id TEXT NOT NULL DEFAULT '',
  claim_token_hash TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_store_orders_user
ON store_orders(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_orders_paypal
ON store_orders(paypal_order_id);

CREATE TABLE IF NOT EXISTS store_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  finish TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_minor INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES store_orders(id)
);

CREATE INDEX IF NOT EXISTS idx_store_order_items_order
ON store_order_items(order_id);

CREATE TABLE IF NOT EXISTS store_payment_events (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  event_type TEXT NOT NULL,
  paypal_order_id TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS store_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_store_addresses_user
ON store_addresses(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS store_favorites (
  user_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, sku)
);
