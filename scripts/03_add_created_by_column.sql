-- Add created_by column to questions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'questions' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE questions ADD COLUMN created_by VARCHAR(100);
    END IF;
END $$;
