-- ===========================
-- Practice Mode Tables
-- ===========================
-- Migration: 15_create_practice_tables.sql
-- Fully isolated from the gamified question bank.
-- Uses JSONB answer_data (same shape as buildAnswerData() in admin API)
-- instead of 5 separate child tables.

-- practice_units: configurable content units (PSAC-aligned)
CREATE TABLE IF NOT EXISTS practice_units (
  id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  unit_no    INT NOT NULL UNIQUE CHECK (unit_no >= 1),
  unit_name  VARCHAR(200) NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- practice_questions: dedicated question bank, separate from gamified `questions`
CREATE TABLE IF NOT EXISTS practice_questions (
  id             BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  unit_id        BIGINT NOT NULL REFERENCES practice_units(id) ON DELETE CASCADE,
  question_type  VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq','matching','fill','reorder','truefalse')),
  question_text  TEXT NOT NULL,
  instruction    TEXT,
  image_url      TEXT,
  answer_data    JSONB NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- practice_sessions: one row per student play session
CREATE TABLE IF NOT EXISTS practice_sessions (
  id               BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id          BIGINT NOT NULL REFERENCES practice_units(id) ON DELETE CASCADE,
  started_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at         TIMESTAMP WITH TIME ZONE,
  questions_served BIGINT[] DEFAULT '{}',
  exit_reason      VARCHAR(50) CHECK (exit_reason IN ('completed','exited','abandoned')),
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- practice_attempts: one row per student answer to a question
CREATE TABLE IF NOT EXISTS practice_attempts (
  id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  session_id      BIGINT NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id         BIGINT NOT NULL REFERENCES practice_units(id) ON DELETE CASCADE,
  question_id     BIGINT NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  student_answer  JSONB,
  is_correct      BOOLEAN NOT NULL,
  attempted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================
-- Indexes for performance
-- ===========================
CREATE INDEX IF NOT EXISTS idx_pq_unit        ON practice_questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_pq_type        ON practice_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_pq_active      ON practice_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_ps_student     ON practice_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_ps_unit        ON practice_sessions(unit_id);
CREATE INDEX IF NOT EXISTS idx_pa_session     ON practice_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_pa_student     ON practice_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_pa_question    ON practice_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_pa_unit        ON practice_attempts(unit_id);

-- ===========================
-- Seed 10 initial units (Grade 5 & Grade 6)
-- ===========================
INSERT INTO practice_units (unit_no, unit_name) VALUES
  (1, 'Grade 5 Unit 1'),
  (2, 'Grade 5 Unit 2'),
  (3, 'Grade 5 Unit 3'),
  (4, 'Grade 5 Unit 4'),
  (5, 'Grade 5 Unit 5'),
  (6, 'Grade 6 Unit 1'),
  (7, 'Grade 6 Unit 2'),
  (8, 'Grade 6 Unit 3'),
  (9, 'Grade 6 Unit 4'),
  (10, 'Grade 6 Unit 5')
ON CONFLICT (unit_no) DO UPDATE SET unit_name = EXCLUDED.unit_name;

-- ===========================
-- Row Level Security (match existing pattern from 01_create_schema.sql)
-- ===========================
ALTER TABLE practice_units     ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts  ENABLE ROW LEVEL SECURITY;

-- Public read for units and questions (required for student play)
CREATE POLICY "Allow public read" ON practice_units     FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON practice_questions FOR SELECT USING (true);

-- Admin write for units and questions
CREATE POLICY "Allow public insert" ON practice_units     FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON practice_units     FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON practice_units     FOR DELETE USING (true);
CREATE POLICY "Allow public insert" ON practice_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON practice_questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON practice_questions FOR DELETE USING (true);

-- Student write for sessions and attempts
CREATE POLICY "Allow public insert" ON practice_sessions  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON practice_sessions  FOR UPDATE USING (true);
CREATE POLICY "Allow public read"   ON practice_sessions  FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON practice_attempts  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read"   ON practice_attempts  FOR SELECT USING (true);
