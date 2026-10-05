-- ===========================
-- Migration: 17_create_game_attempts.sql
-- Silent per-question answer logging for Game Mode (admin analytics only).
-- Game mode requires login, so student_id is always known.
-- ===========================

CREATE TABLE IF NOT EXISTS game_attempts (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id     BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  student_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  guest_token     UUID,
  student_answer  JSONB,
  is_correct      BOOLEAN NOT NULL,
  attempted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure guest_token column exists if table was already created
ALTER TABLE game_attempts ADD COLUMN IF NOT EXISTS guest_token UUID;

CREATE INDEX IF NOT EXISTS idx_ga_question      ON game_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_ga_guest_token   ON game_attempts(guest_token) WHERE guest_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ga_attempted_at  ON game_attempts(attempted_at);
-- Partial index for wrong-answer aggregation queries
CREATE INDEX IF NOT EXISTS idx_ga_wrong_answers ON game_attempts(question_id, is_correct) WHERE NOT is_correct;

-- RLS on, no public policies: only the server (table owner) can read/write.
ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

