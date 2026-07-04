ALTER TABLE inquiries ADD COLUMN project_code TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted';
ALTER TABLE inquiries ADD COLUMN expected_date TEXT NOT NULL DEFAULT '';

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
  note TEXT NOT NULL DEFAULT '',
  expected_date TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
);

CREATE INDEX IF NOT EXISTS idx_project_updates_inquiry
ON project_updates(inquiry_id, created_at ASC);
