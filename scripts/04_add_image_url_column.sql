-- Add image_url column to questions table for storing image links
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN questions.image_url IS 'URL link to question image (optional)';
