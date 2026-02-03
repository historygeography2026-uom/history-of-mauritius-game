-- ===========================
-- Create all base tables
-- ===========================

CREATE TABLE IF NOT EXISTS subjects (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS levels (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  level_number INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_types (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  level_id BIGINT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  question_type_id BIGINT NOT NULL REFERENCES question_types(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  timer_seconds INT DEFAULT 30,
  display_title VARCHAR(100),
  created_by VARCHAR(100),
  -- Added created_by field to track question author
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcq_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_order INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matching_pairs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  pair_order INT NOT NULL,
  left_item TEXT NOT NULL,
  right_item TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fill_answers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  case_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reorder_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  item_order INT NOT NULL,
  item_text TEXT NOT NULL,
  correct_position INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS truefalse_answers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  correct_answer BOOLEAN NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  player_name VARCHAR(100) NOT NULL,
  subject_id BIGINT REFERENCES subjects(id) ON DELETE SET NULL,
  level_id BIGINT REFERENCES levels(id) ON DELETE SET NULL,
  total_points INT DEFAULT 0,
  stars_earned INT DEFAULT 0,
  game_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================
-- Create indexes for performance
-- ===========================

CREATE INDEX idx_questions_subject_level ON questions(subject_id, level_id);
CREATE INDEX idx_questions_type ON questions(question_type_id);
CREATE INDEX idx_mcq_question ON mcq_options(question_id);
CREATE INDEX idx_matching_question ON matching_pairs(question_id);
CREATE INDEX idx_fill_question ON fill_answers(question_id);
CREATE INDEX idx_reorder_question ON reorder_items(question_id);
CREATE INDEX idx_truefalse_question ON truefalse_answers(question_id);
CREATE INDEX idx_leaderboard_subject_level ON leaderboard(subject_id, level_id);

-- ===========================
-- Insert base data
-- ===========================

INSERT INTO subjects (name, description) VALUES
('history', 'History of Mauritius'),
('geography', 'Geography of Mauritius'),
('combined', 'Combined History and Geography');

INSERT INTO levels (level_number, name, difficulty) VALUES
(1, 'Level 1', 'Beginner'),
(2, 'Level 2', 'Intermediate'),
(3, 'Level 3', 'Advanced');

INSERT INTO question_types (name, description) VALUES
('mcq', 'Multiple Choice Question'),
('matching', 'Matching Pairs'),
('fill', 'Fill in the Blanks'),
('reorder', 'Put in Order'),
('truefalse', 'True or False');

-- ===========================
-- Row Level Security Policies
-- ===========================

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fill_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE truefalse_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (required for game to work)
CREATE POLICY "Allow public read" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON levels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON question_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON mcq_options FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON matching_pairs FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON fill_answers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON reorder_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON truefalse_answers FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON leaderboard FOR SELECT USING (true);

-- Allow insert and update for questions (for admin panel)
CREATE POLICY "Allow public insert" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON questions FOR DELETE USING (true);

-- Allow leaderboard entries
CREATE POLICY "Allow insert scores" ON leaderboard FOR INSERT WITH CHECK (true);
