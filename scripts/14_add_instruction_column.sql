-- Add instruction column to questions table
-- This stores custom instructions from the Excel source file
-- instead of relying on hardcoded generic instructions in the UI
ALTER TABLE questions ADD COLUMN IF NOT EXISTS instruction TEXT;

-- Comment for documentation
COMMENT ON COLUMN questions.instruction IS 'Custom instruction text from Excel source, displayed to students instead of generic prompts';
