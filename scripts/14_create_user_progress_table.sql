-- Create user_progress table for NextAuth/PostgreSQL users
-- This stores per-user stars and completion state for each subject and level.
CREATE TABLE IF NOT EXISTS public.user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_name VARCHAR(100) NOT NULL,
  level_number INT NOT NULL CHECK (level_number BETWEEN 1 AND 3),
  stars_earned INT NOT NULL DEFAULT 0 CHECK (stars_earned >= 0),
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  best_score INT NOT NULL DEFAULT 0 CHECK (best_score >= 0),
  first_completed_at TIMESTAMP WITH TIME ZONE,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subject_level UNIQUE(user_id, subject_name, level_number)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_subject_level ON public.user_progress(subject_name, level_number);
