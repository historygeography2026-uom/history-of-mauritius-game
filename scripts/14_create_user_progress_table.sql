-- Create user_progress table for tracking per-level progress
-- This table stores stars and completion status for each user/subject/level
CREATE TABLE IF NOT EXISTS public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_name VARCHAR(100) NOT NULL,
  level_number INT NOT NULL,
  stars_earned INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  best_score INT DEFAULT 0,
  first_completed_at TIMESTAMP WITH TIME ZONE,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subject_level UNIQUE(user_id, subject_name, level_number)
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_subject_level ON public.user_progress(subject_name, level_number);

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;

-- Policies for user_progress table
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Allow admins to view all progress (if you have admin check)
-- CREATE POLICY "Admins can view all progress"
--   ON public.user_progress FOR SELECT
--   USING (TRUE);
