ALTER TABLE project_updates
ADD COLUMN customer_note TEXT NOT NULL DEFAULT '';

UPDATE project_updates
SET customer_note = note
WHERE customer_note = '' AND note <> '';
