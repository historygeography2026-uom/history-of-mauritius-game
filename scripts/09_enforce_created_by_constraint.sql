-- Enforce that created_by can only be 'MES' or 'MIE'
-- First, update any existing 'admin' values to 'MES'
UPDATE questions SET created_by = 'MES' WHERE LOWER(created_by) = 'admin';

-- Update any NULL or empty values to 'MES'
UPDATE questions SET created_by = 'MES' WHERE created_by IS NULL OR created_by = '';

-- Update any other values that are not MES or MIE to MES
UPDATE questions SET created_by = 'MES' WHERE created_by NOT IN ('MES', 'MIE');

-- Add CHECK constraint to ensure only MES or MIE can be stored
-- First drop the constraint if it exists (to allow re-running)
ALTER TABLE questions DROP CONSTRAINT IF EXISTS check_created_by;

-- Add the constraint
ALTER TABLE questions 
ADD CONSTRAINT check_created_by 
CHECK (created_by IN ('MES', 'MIE'));

-- Set default value to 'MES'
ALTER TABLE questions ALTER COLUMN created_by SET DEFAULT 'MES';
