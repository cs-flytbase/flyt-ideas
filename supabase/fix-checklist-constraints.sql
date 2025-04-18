-- First, drop the existing foreign key constraint
ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_checklist_id_fkey;

-- Re-create the constraint with ON DELETE CASCADE
ALTER TABLE activity_log
  ADD CONSTRAINT activity_log_checklist_id_fkey
  FOREIGN KEY (checklist_id)
  REFERENCES checklists(id)
  ON DELETE CASCADE;
