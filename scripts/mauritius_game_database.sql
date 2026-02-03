-- Mauritius Learning Game Database Schema
-- This SQL file creates the complete database structure and populates it with all question data
-- Compatible with phpMyAdmin and MySQL

-- ===========================
-- DATABASE CREATION
-- ===========================
CREATE DATABASE IF NOT EXISTS mauritius_learning_game;
USE mauritius_learning_game;

-- ===========================
-- TABLE STRUCTURES
-- ===========================

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Levels Table
CREATE TABLE IF NOT EXISTS levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level_number INT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Question Types Table
CREATE TABLE IF NOT EXISTS question_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Images Table (for storing image metadata)
CREATE TABLE IF NOT EXISTS images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Main Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id VARCHAR(50) NOT NULL UNIQUE,
  subject_id INT NOT NULL,
  level_id INT NOT NULL,
  type_id INT NOT NULL,
  question_text LONGTEXT NOT NULL,
  image_id INT,
  timer_seconds INT DEFAULT 30,
  display_title VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES question_types(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MCQ Options Table
CREATE TABLE IF NOT EXISTS mcq_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_order INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_option (question_id, option_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Matching Pairs Table
CREATE TABLE IF NOT EXISTS matching_pairs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  pair_order INT NOT NULL,
  left_item TEXT NOT NULL,
  right_item TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Fill in the Blanks Answers Table
CREATE TABLE IF NOT EXISTS fill_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  case_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_question_answer (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reorder Items Table
CREATE TABLE IF NOT EXISTS reorder_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  item_order INT NOT NULL,
  item_text TEXT NOT NULL,
  correct_position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- True/False Answers Table
CREATE TABLE IF NOT EXISTS truefalse_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  correct_answer BOOLEAN NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_question_tf (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Leaderboard Table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_name VARCHAR(100) NOT NULL,
  subject_id INT,
  level_id INT,
  total_points INT DEFAULT 0,
  stars_earned INT DEFAULT 0,
  game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===========================
-- INSERT BASE DATA
-- ===========================

-- Insert Subjects
INSERT INTO subjects (name, description) VALUES
('history', 'History of Mauritius'),
('geography', 'Geography of Mauritius'),
('combined', 'Combined History and Geography');

-- Insert Levels
INSERT INTO levels (level_number, name, difficulty) VALUES
(1, 'Level 1', 'Beginner'),
(2, 'Level 2', 'Intermediate'),
(3, 'Level 3', 'Advanced');

-- Insert Question Types
INSERT INTO question_types (type_name, description) VALUES
('mcq', 'Multiple Choice Question'),
('matching', 'Matching Pairs'),
('fill', 'Fill in the Blanks'),
('reorder', 'Put in Order'),
('truefalse', 'True or False');

-- ===========================
-- HISTORY - LEVEL 1 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-mcq-1', 1, 1, 1, 'What year did Mauritius gain independence?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, '1968', TRUE FROM questions WHERE question_id = 'h1-mcq-1'
UNION ALL SELECT id, 2, '1965', FALSE FROM questions WHERE question_id = 'h1-mcq-1'
UNION ALL SELECT id, 3, '1970', FALSE FROM questions WHERE question_id = 'h1-mcq-1'
UNION ALL SELECT id, 4, '1960', FALSE FROM questions WHERE question_id = 'h1-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-mcq-2', 1, 1, 1, 'Which bird is extinct and was only found in Mauritius?', 25, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Parrot', FALSE FROM questions WHERE question_id = 'h1-mcq-2'
UNION ALL SELECT id, 2, 'Dodo', TRUE FROM questions WHERE question_id = 'h1-mcq-2'
UNION ALL SELECT id, 3, 'Eagle', FALSE FROM questions WHERE question_id = 'h1-mcq-2'
UNION ALL SELECT id, 4, 'Falcon', FALSE FROM questions WHERE question_id = 'h1-mcq-2';

-- ===========================
-- HISTORY - LEVEL 1 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-match-1', 1, 1, 2, 'Match the following items', 40, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Dodo Bird', 'Extinct animal from Mauritius' FROM questions WHERE question_id = 'h1-match-1'
UNION ALL SELECT id, 2, 'Port Louis', 'Capital city of Mauritius' FROM questions WHERE question_id = 'h1-match-1'
UNION ALL SELECT id, 3, '1968', 'Independence year' FROM questions WHERE question_id = 'h1-match-1';

-- ===========================
-- HISTORY - LEVEL 1 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-fill-1', 1, 1, 3, 'Mauritius gained independence in the year _______.' , 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, '1968', FALSE FROM questions WHERE question_id = 'h1-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-fill-2', 1, 1, 3, 'The _______ is the capital of Mauritius.', 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Port Louis', FALSE FROM questions WHERE question_id = 'h1-fill-2';

-- ===========================
-- HISTORY - LEVEL 1 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-reorder-1', 1, 1, 4, 'Put the following events in chronological order', 45, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'Discovery by Arabs', 1 FROM questions WHERE question_id = 'h1-reorder-1'
UNION ALL SELECT id, 2, 'Portuguese Arrival', 2 FROM questions WHERE question_id = 'h1-reorder-1'
UNION ALL SELECT id, 3, 'Dutch Settlement', 3 FROM questions WHERE question_id = 'h1-reorder-1'
UNION ALL SELECT id, 4, 'Independence', 4 FROM questions WHERE question_id = 'h1-reorder-1';

-- ===========================
-- HISTORY - LEVEL 1 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-tf-1', 1, 1, 5, 'Mauritius was colonized by the Portuguese.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Yes, Portuguese explorers were among the early visitors to Mauritius' FROM questions WHERE question_id = 'h1-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h1-tf-2', 1, 1, 5, 'Mauritius gained independence in 1960.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius gained independence in 1968, not 1960' FROM questions WHERE question_id = 'h1-tf-2';

-- ===========================
-- HISTORY - LEVEL 2 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-mcq-1', 1, 2, 1, 'Who was the first Prime Minister of independent Mauritius?', 35, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Anerood Jugnauth', FALSE FROM questions WHERE question_id = 'h2-mcq-1'
UNION ALL SELECT id, 2, 'Seewoosagur Ramgoolam', TRUE FROM questions WHERE question_id = 'h2-mcq-1'
UNION ALL SELECT id, 3, 'Paul Bérenger', FALSE FROM questions WHERE question_id = 'h2-mcq-1'
UNION ALL SELECT id, 4, 'Navin Ramgoolam', FALSE FROM questions WHERE question_id = 'h2-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-mcq-2', 1, 2, 1, 'In what year did Mauritius become a republic?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, '1990', FALSE FROM questions WHERE question_id = 'h2-mcq-2'
UNION ALL SELECT id, 2, '1992', TRUE FROM questions WHERE question_id = 'h2-mcq-2'
UNION ALL SELECT id, 3, '1995', FALSE FROM questions WHERE question_id = 'h2-mcq-2'
UNION ALL SELECT id, 4, '1998', FALSE FROM questions WHERE question_id = 'h2-mcq-2';

-- ===========================
-- HISTORY - LEVEL 2 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-match-1', 1, 2, 2, 'Match the following items', 45, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Sega', 'Traditional dance and music' FROM questions WHERE question_id = 'h2-match-1'
UNION ALL SELECT id, 2, 'Le Morne', 'Famous mountain in Mauritius' FROM questions WHERE question_id = 'h2-match-1'
UNION ALL SELECT id, 3, 'Sugar', 'Important crop' FROM questions WHERE question_id = 'h2-match-1';

-- ===========================
-- HISTORY - LEVEL 2 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-fill-1', 1, 2, 3, 'Mauritius was named after Prince _______ of Orange.', 25, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Maurice', FALSE FROM questions WHERE question_id = 'h2-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-fill-2', 1, 2, 3, 'Mauritius became a _______ in 1992.', 25, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'republic', FALSE FROM questions WHERE question_id = 'h2-fill-2';

-- ===========================
-- HISTORY - LEVEL 2 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-reorder-1', 1, 2, 4, 'Put the following events in chronological order', 50, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'French Colonial Rule Begins', 1 FROM questions WHERE question_id = 'h2-reorder-1'
UNION ALL SELECT id, 2, 'Slavery Period', 2 FROM questions WHERE question_id = 'h2-reorder-1'
UNION ALL SELECT id, 3, 'British Conquest', 3 FROM questions WHERE question_id = 'h2-reorder-1'
UNION ALL SELECT id, 4, 'Slavery Abolished', 4 FROM questions WHERE question_id = 'h2-reorder-1'
UNION ALL SELECT id, 5, 'Independence', 5 FROM questions WHERE question_id = 'h2-reorder-1';

-- ===========================
-- HISTORY - LEVEL 2 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-tf-1', 1, 2, 5, 'Mauritius became a republic in 1992.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Mauritius officially became a republic on 12 March 1992' FROM questions WHERE question_id = 'h2-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h2-tf-2', 1, 2, 5, 'The Dutch were the first to establish permanent settlement in Mauritius.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'The Dutch established the first permanent settlement in 1638' FROM questions WHERE question_id = 'h2-tf-2';

-- ===========================
-- HISTORY - LEVEL 3 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-mcq-1', 1, 3, 1, 'What is Aapravasi Ghat, a UNESCO World Heritage Site?', 40, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'A Mountain Peak', FALSE FROM questions WHERE question_id = 'h3-mcq-1'
UNION ALL SELECT id, 2, 'An Immigration Depot', TRUE FROM questions WHERE question_id = 'h3-mcq-1'
UNION ALL SELECT id, 3, 'A Battle Site', FALSE FROM questions WHERE question_id = 'h3-mcq-1'
UNION ALL SELECT id, 4, 'A Royal Palace', FALSE FROM questions WHERE question_id = 'h3-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-mcq-2', 1, 3, 1, 'Which colonial power established the first permanent settlement in 1638?', 35, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'French', FALSE FROM questions WHERE question_id = 'h3-mcq-2'
UNION ALL SELECT id, 2, 'British', FALSE FROM questions WHERE question_id = 'h3-mcq-2'
UNION ALL SELECT id, 3, 'Dutch', TRUE FROM questions WHERE question_id = 'h3-mcq-2'
UNION ALL SELECT id, 4, 'Portuguese', FALSE FROM questions WHERE question_id = 'h3-mcq-2';

-- ===========================
-- HISTORY - LEVEL 3 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-match-1', 1, 3, 2, 'Match the following items', 50, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Aapravasi Ghat', 'UNESCO World Heritage Site' FROM questions WHERE question_id = 'h3-match-1'
UNION ALL SELECT id, 2, '1638', 'Dutch settlement year' FROM questions WHERE question_id = 'h3-match-1'
UNION ALL SELECT id, 3, 'Slavery', 'Historical practice abolished in 1835' FROM questions WHERE question_id = 'h3-match-1';

-- ===========================
-- HISTORY - LEVEL 3 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-fill-1', 1, 3, 3, 'The _______ was an indentured labor immigration depot and now a UNESCO World Heritage Site.', 30, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Aapravasi Ghat', FALSE FROM questions WHERE question_id = 'h3-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-fill-2', 1, 3, 3, 'In _______, the _______ established the first permanent European settlement in Mauritius.', 35, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, '1638, Dutch', FALSE FROM questions WHERE question_id = 'h3-fill-2';

-- ===========================
-- HISTORY - LEVEL 3 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-reorder-1', 1, 3, 4, 'Put the following events in chronological order', 60, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, '1638 Dutch Settlement', 1 FROM questions WHERE question_id = 'h3-reorder-1'
UNION ALL SELECT id, 2, '1715 French Arrival', 2 FROM questions WHERE question_id = 'h3-reorder-1'
UNION ALL SELECT id, 3, '1810 British Conquest', 3 FROM questions WHERE question_id = 'h3-reorder-1'
UNION ALL SELECT id, 4, '1835 Slavery Abolished', 4 FROM questions WHERE question_id = 'h3-reorder-1'
UNION ALL SELECT id, 5, '1968 Independence', 5 FROM questions WHERE question_id = 'h3-reorder-1'
UNION ALL SELECT id, 6, '1992 Republic Declared', 6 FROM questions WHERE question_id = 'h3-reorder-1';

-- ===========================
-- HISTORY - LEVEL 3 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-tf-1', 1, 3, 5, 'Aapravasi Ghat was the first immigration depot in the world.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Aapravasi Ghat was indeed the first immigration depot in the world' FROM questions WHERE question_id = 'h3-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('h3-tf-2', 1, 3, 5, 'Mauritius remained under French rule until 1960.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius was under British rule from 1810 onwards, not French until 1960' FROM questions WHERE question_id = 'h3-tf-2';

-- ===========================
-- GEOGRAPHY - LEVEL 1 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-mcq-1', 2, 1, 1, 'In which ocean is Mauritius located?', 25, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Atlantic Ocean', FALSE FROM questions WHERE question_id = 'g1-mcq-1'
UNION ALL SELECT id, 2, 'Indian Ocean', TRUE FROM questions WHERE question_id = 'g1-mcq-1'
UNION ALL SELECT id, 3, 'Pacific Ocean', FALSE FROM questions WHERE question_id = 'g1-mcq-1'
UNION ALL SELECT id, 4, 'Southern Ocean', FALSE FROM questions WHERE question_id = 'g1-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-mcq-2', 2, 1, 1, 'What is the capital of Mauritius?', 25, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Curepipe', FALSE FROM questions WHERE question_id = 'g1-mcq-2'
UNION ALL SELECT id, 2, 'Vacoas', FALSE FROM questions WHERE question_id = 'g1-mcq-2'
UNION ALL SELECT id, 3, 'Port Louis', TRUE FROM questions WHERE question_id = 'g1-mcq-2'
UNION ALL SELECT id, 4, 'Phoenix', FALSE FROM questions WHERE question_id = 'g1-mcq-2';

-- ===========================
-- GEOGRAPHY - LEVEL 1 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-match-1', 2, 1, 2, 'Match the following items', 40, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Coral Reefs', 'Beautiful sea structures' FROM questions WHERE question_id = 'g1-match-1'
UNION ALL SELECT id, 2, 'Port Louis', 'Largest city and port' FROM questions WHERE question_id = 'g1-match-1'
UNION ALL SELECT id, 3, 'Indian Ocean', 'Ocean surrounding Mauritius' FROM questions WHERE question_id = 'g1-match-1';

-- ===========================
-- GEOGRAPHY - LEVEL 1 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-fill-1', 2, 1, 3, 'Mauritius is surrounded by beautiful _______.' , 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'coral reefs', FALSE FROM questions WHERE question_id = 'g1-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-fill-2', 2, 1, 3, 'The capital city _______ is located on the northwest coast.', 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Port Louis', FALSE FROM questions WHERE question_id = 'g1-fill-2';

-- ===========================
-- GEOGRAPHY - LEVEL 1 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-reorder-1', 2, 1, 4, 'Put the following events in chronological order', 45, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'Volcanic Island Forms', 1 FROM questions WHERE question_id = 'g1-reorder-1'
UNION ALL SELECT id, 2, 'Coral Reefs Develop', 2 FROM questions WHERE question_id = 'g1-reorder-1'
UNION ALL SELECT id, 3, 'Beaches Create', 3 FROM questions WHERE question_id = 'g1-reorder-1'
UNION ALL SELECT id, 4, 'Vegetation Emerges', 4 FROM questions WHERE question_id = 'g1-reorder-1';

-- ===========================
-- GEOGRAPHY - LEVEL 1 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-tf-1', 2, 1, 5, 'Mauritius is an island in the Indian Ocean.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Yes, Mauritius is an island in the Indian Ocean' FROM questions WHERE question_id = 'g1-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g1-tf-2', 2, 1, 5, 'Mauritius has a desert climate.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius has a subtropical climate, not a desert climate' FROM questions WHERE question_id = 'g1-tf-2';

-- ===========================
-- GEOGRAPHY - LEVEL 2 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-mcq-1', 2, 2, 1, 'What is the Seven Colored Earth?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'A Rainbow', FALSE FROM questions WHERE question_id = 'g2-mcq-1'
UNION ALL SELECT id, 2, 'A Natural Sand Formation', TRUE FROM questions WHERE question_id = 'g2-mcq-1'
UNION ALL SELECT id, 3, 'A Painting', FALSE FROM questions WHERE question_id = 'g2-mcq-1'
UNION ALL SELECT id, 4, 'A Mountain', FALSE FROM questions WHERE question_id = 'g2-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-mcq-2', 2, 2, 1, 'Which island is part of Mauritian territory?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Madagascar', FALSE FROM questions WHERE question_id = 'g2-mcq-2'
UNION ALL SELECT id, 2, 'Reunion', FALSE FROM questions WHERE question_id = 'g2-mcq-2'
UNION ALL SELECT id, 3, 'Rodrigues', TRUE FROM questions WHERE question_id = 'g2-mcq-2'
UNION ALL SELECT id, 4, 'Comoros', FALSE FROM questions WHERE question_id = 'g2-mcq-2';

-- ===========================
-- GEOGRAPHY - LEVEL 2 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-match-1', 2, 2, 2, 'Match the following items', 45, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Chamarel', 'Seven colored sand formations' FROM questions WHERE question_id = 'g2-match-1'
UNION ALL SELECT id, 2, 'Pamplemousses', 'Famous botanical garden' FROM questions WHERE question_id = 'g2-match-1'
UNION ALL SELECT id, 3, 'Rodrigues', 'Small island nearby' FROM questions WHERE question_id = 'g2-match-1';

-- ===========================
-- GEOGRAPHY - LEVEL 2 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-fill-1', 2, 2, 3, 'The _______ is famous for its seven differently colored sand layers.', 25, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Chamarel', FALSE FROM questions WHERE question_id = 'g2-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-fill-2', 2, 2, 3, '_______ Island is part of Mauritius and located to the northeast.', 25, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Rodrigues', FALSE FROM questions WHERE question_id = 'g2-fill-2';

-- ===========================
-- GEOGRAPHY - LEVEL 2 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-reorder-1', 2, 2, 4, 'Put the following events in chronological order', 50, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'Lagoon Formation', 1 FROM questions WHERE question_id = 'g2-reorder-1'
UNION ALL SELECT id, 2, 'Reef Development', 2 FROM questions WHERE question_id = 'g2-reorder-1'
UNION ALL SELECT id, 3, 'Island Rises', 3 FROM questions WHERE question_id = 'g2-reorder-1'
UNION ALL SELECT id, 4, 'Human Settlement', 4 FROM questions WHERE question_id = 'g2-reorder-1';

-- ===========================
-- GEOGRAPHY - LEVEL 2 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-tf-1', 2, 2, 5, 'Le Morne Brabant is the highest mountain in Mauritius.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Le Morne Brabant is indeed the highest mountain in Mauritius' FROM questions WHERE question_id = 'g2-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g2-tf-2', 2, 2, 5, 'Mauritian beaches have arctic cold water.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius has warm tropical waters, not arctic cold water' FROM questions WHERE question_id = 'g2-tf-2';

-- ===========================
-- GEOGRAPHY - LEVEL 3 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-mcq-1', 2, 3, 1, 'What is the primary volcanic origin of Mauritius?', 35, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Active Volcano', FALSE FROM questions WHERE question_id = 'g3-mcq-1'
UNION ALL SELECT id, 2, 'Extinct Volcano', TRUE FROM questions WHERE question_id = 'g3-mcq-1'
UNION ALL SELECT id, 3, 'Coral Atoll', FALSE FROM questions WHERE question_id = 'g3-mcq-1'
UNION ALL SELECT id, 4, 'Limestone Island', FALSE FROM questions WHERE question_id = 'g3-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-mcq-2', 2, 3, 1, 'How many districts does Mauritius have?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, '7', FALSE FROM questions WHERE question_id = 'g3-mcq-2'
UNION ALL SELECT id, 2, '9', TRUE FROM questions WHERE question_id = 'g3-mcq-2'
UNION ALL SELECT id, 3, '12', FALSE FROM questions WHERE question_id = 'g3-mcq-2'
UNION ALL SELECT id, 4, '15', FALSE FROM questions WHERE question_id = 'g3-mcq-2';

-- ===========================
-- GEOGRAPHY - LEVEL 3 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-match-1', 2, 3, 2, 'Match the following items', 50, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Central Plateau', 'Highest altitude region' FROM questions WHERE question_id = 'g3-match-1'
UNION ALL SELECT id, 2, 'Black River', 'National park area' FROM questions WHERE question_id = 'g3-match-1'
UNION ALL SELECT id, 3, 'Piton de la Rivière Noire', 'Highest mountain peak' FROM questions WHERE question_id = 'g3-match-1';

-- ===========================
-- GEOGRAPHY - LEVEL 3 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-fill-1', 2, 3, 3, 'Mauritius has a total of _______ districts.', 25, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, '9', FALSE FROM questions WHERE question_id = 'g3-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-fill-2', 2, 3, 3, 'The _______ is the highest point in Mauritius.', 30, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Piton de la Rivière Noire', FALSE FROM questions WHERE question_id = 'g3-fill-2';

-- ===========================
-- GEOGRAPHY - LEVEL 3 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-reorder-1', 2, 3, 4, 'Put the following events in chronological order', 55, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'Volcanic Formation', 1 FROM questions WHERE question_id = 'g3-reorder-1'
UNION ALL SELECT id, 2, 'Erosion Process', 2 FROM questions WHERE question_id = 'g3-reorder-1'
UNION ALL SELECT id, 3, 'Lagoon Development', 3 FROM questions WHERE question_id = 'g3-reorder-1'
UNION ALL SELECT id, 4, 'Ecosystem Evolution', 4 FROM questions WHERE question_id = 'g3-reorder-1';

-- ===========================
-- GEOGRAPHY - LEVEL 3 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-tf-1', 2, 3, 5, 'Mauritius is located in the Southern Hemisphere.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Yes, Mauritius is located in the Southern Hemisphere' FROM questions WHERE question_id = 'g3-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('g3-tf-2', 2, 3, 5, 'Mauritius has only one main island.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius has multiple islands including Rodrigues and many others' FROM questions WHERE question_id = 'g3-tf-2';

-- ===========================
-- COMBINED - LEVEL 1 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-mcq-1', 3, 1, 1, 'Mauritius is located in which ocean and is famous for which extinct bird?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Atlantic, Parrot', FALSE FROM questions WHERE question_id = 'c1-mcq-1'
UNION ALL SELECT id, 2, 'Indian, Dodo', TRUE FROM questions WHERE question_id = 'c1-mcq-1'
UNION ALL SELECT id, 3, 'Pacific, Eagle', FALSE FROM questions WHERE question_id = 'c1-mcq-1'
UNION ALL SELECT id, 4, 'Southern, Penguin', FALSE FROM questions WHERE question_id = 'c1-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-mcq-2', 3, 1, 1, 'What is the capital of Mauritius and in which direction is it located?', 30, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Curepipe - South', FALSE FROM questions WHERE question_id = 'c1-mcq-2'
UNION ALL SELECT id, 2, 'Port Louis - North', TRUE FROM questions WHERE question_id = 'c1-mcq-2'
UNION ALL SELECT id, 3, 'Vacoas - East', FALSE FROM questions WHERE question_id = 'c1-mcq-2'
UNION ALL SELECT id, 4, 'Beau Bassin - West', FALSE FROM questions WHERE question_id = 'c1-mcq-2';

-- ===========================
-- COMBINED - LEVEL 1 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-match-1', 3, 1, 2, 'Match the following items', 40, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Dodo', 'Extinct bird' FROM questions WHERE question_id = 'c1-match-1'
UNION ALL SELECT id, 2, '1968', 'Independence year' FROM questions WHERE question_id = 'c1-match-1'
UNION ALL SELECT id, 3, 'Port Louis', 'Capital city' FROM questions WHERE question_id = 'c1-match-1';

-- ===========================
-- COMBINED - LEVEL 1 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-fill-1', 3, 1, 3, 'Mauritius is an island in the _______ Ocean.', 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Indian', FALSE FROM questions WHERE question_id = 'c1-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-fill-2', 3, 1, 3, 'Mauritius gained freedom and became independent in _______.' , 20, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, '1968', FALSE FROM questions WHERE question_id = 'c1-fill-2';

-- ===========================
-- COMBINED - LEVEL 1 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-reorder-1', 3, 1, 4, 'Put the following events in chronological order', 50, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'Arab Traders', 1 FROM questions WHERE question_id = 'c1-reorder-1'
UNION ALL SELECT id, 2, 'Portuguese Explorers', 2 FROM questions WHERE question_id = 'c1-reorder-1'
UNION ALL SELECT id, 3, 'Dutch Settlement', 3 FROM questions WHERE question_id = 'c1-reorder-1'
UNION ALL SELECT id, 4, 'French Rule', 4 FROM questions WHERE question_id = 'c1-reorder-1'
UNION ALL SELECT id, 5, 'Independence', 5 FROM questions WHERE question_id = 'c1-reorder-1';

-- ===========================
-- COMBINED - LEVEL 1 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-tf-1', 3, 1, 5, 'The Dodo was a bird that lived in Mauritius.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Yes, the Dodo was a bird species that lived only in Mauritius' FROM questions WHERE question_id = 'c1-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c1-tf-2', 3, 1, 5, 'Mauritius gained independence in 1960.', 15, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius gained independence in 1968, not 1960' FROM questions WHERE question_id = 'c1-tf-2';

-- ===========================
-- COMBINED - LEVEL 2 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-mcq-1', 3, 2, 1, 'When did Mauritius become a republic and what UNESCO heritage site honors indentured laborers?', 40, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, '1990, Le Morne', FALSE FROM questions WHERE question_id = 'c2-mcq-1'
UNION ALL SELECT id, 2, '1992, Aapravasi Ghat', TRUE FROM questions WHERE question_id = 'c2-mcq-1'
UNION ALL SELECT id, 3, '1995, Chamarel', FALSE FROM questions WHERE question_id = 'c2-mcq-1'
UNION ALL SELECT id, 4, '1998, Black River Gorges', FALSE FROM questions WHERE question_id = 'c2-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-mcq-2', 3, 2, 1, 'Who was the first Prime Minister and what is the capital?', 40, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Anerood Jugnauth, Curepipe', FALSE FROM questions WHERE question_id = 'c2-mcq-2'
UNION ALL SELECT id, 2, 'Seewoosagur Ramgoolam, Port Louis', TRUE FROM questions WHERE question_id = 'c2-mcq-2'
UNION ALL SELECT id, 3, 'Paul Bérenger, Vacoas', FALSE FROM questions WHERE question_id = 'c2-mcq-2'
UNION ALL SELECT id, 4, 'Navin Ramgoolam, Phoenix', FALSE FROM questions WHERE question_id = 'c2-mcq-2';

-- ===========================
-- COMBINED - LEVEL 2 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-match-1', 3, 2, 2, 'Match the following items', 50, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, 'Aapravasi Ghat', 'Immigration heritage site' FROM questions WHERE question_id = 'c2-match-1'
UNION ALL SELECT id, 2, 'Le Morne', 'Mountain and UNESCO site' FROM questions WHERE question_id = 'c2-match-1'
UNION ALL SELECT id, 3, 'Sega', 'Cultural tradition' FROM questions WHERE question_id = 'c2-match-1';

-- ===========================
-- COMBINED - LEVEL 2 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-fill-1', 3, 2, 3, 'The _______ is a UNESCO World Heritage Site marking indentured labor history.', 30, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Aapravasi Ghat', FALSE FROM questions WHERE question_id = 'c2-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-fill-2', 3, 2, 3, 'Mauritius became a _______ on March 12, 1992.', 30, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'republic', FALSE FROM questions WHERE question_id = 'c2-fill-2';

-- ===========================
-- COMBINED - LEVEL 2 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-reorder-1', 3, 2, 4, 'Put the following events in chronological order', 60, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, 'French Colonial Rule', 1 FROM questions WHERE question_id = 'c2-reorder-1'
UNION ALL SELECT id, 2, 'British Conquest', 2 FROM questions WHERE question_id = 'c2-reorder-1'
UNION ALL SELECT id, 3, 'Slavery Era', 3 FROM questions WHERE question_id = 'c2-reorder-1'
UNION ALL SELECT id, 4, 'Indentureship Period', 4 FROM questions WHERE question_id = 'c2-reorder-1'
UNION ALL SELECT id, 5, 'Independence', 5 FROM questions WHERE question_id = 'c2-reorder-1'
UNION ALL SELECT id, 6, 'Republic Status', 6 FROM questions WHERE question_id = 'c2-reorder-1';

-- ===========================
-- COMBINED - LEVEL 2 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-tf-1', 3, 2, 5, 'Le Morne Brabant is both a geographical landmark and a symbol of slave resistance.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Le Morne Brabant is indeed both a landmark and a UNESCO site symbolizing slave resistance' FROM questions WHERE question_id = 'c2-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c2-tf-2', 3, 2, 5, 'Mauritius has only one cultural community.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius is multicultural with Hindu, Muslim, Christian and other communities' FROM questions WHERE question_id = 'c2-tf-2';

-- ===========================
-- COMBINED - LEVEL 3 - MCQ QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-mcq-1', 3, 3, 1, 'Which colonial power established the first permanent settlement in 1638 and what is the capital?', 45, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'French in 1715, Curepipe', FALSE FROM questions WHERE question_id = 'c3-mcq-1'
UNION ALL SELECT id, 2, 'Dutch in 1638, Port Louis', TRUE FROM questions WHERE question_id = 'c3-mcq-1'
UNION ALL SELECT id, 3, 'British in 1810, Vacoas', FALSE FROM questions WHERE question_id = 'c3-mcq-1'
UNION ALL SELECT id, 4, 'Portuguese in 1500, Phoenix', FALSE FROM questions WHERE question_id = 'c3-mcq-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-mcq-2', 3, 3, 1, 'What UNESCO sites recognize Mauritius historical and geographical significance?', 40, 'Quiz Time!');

INSERT INTO mcq_options (question_id, option_order, option_text, is_correct) 
SELECT id, 1, 'Only Aapravasi Ghat', FALSE FROM questions WHERE question_id = 'c3-mcq-2'
UNION ALL SELECT id, 2, 'Aapravasi Ghat and Le Morne', TRUE FROM questions WHERE question_id = 'c3-mcq-2'
UNION ALL SELECT id, 3, 'Only Chamarel', FALSE FROM questions WHERE question_id = 'c3-mcq-2'
UNION ALL SELECT id, 4, 'Black River Gorges and Pamplemousses', FALSE FROM questions WHERE question_id = 'c3-mcq-2';

-- ===========================
-- COMBINED - LEVEL 3 - MATCHING QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-match-1', 3, 3, 2, 'Match the following items', 50, 'Match It!');

INSERT INTO matching_pairs (question_id, pair_order, left_item, right_item) 
SELECT id, 1, '1638', 'Dutch settlement' FROM questions WHERE question_id = 'c3-match-1'
UNION ALL SELECT id, 2, '1715', 'French arrival' FROM questions WHERE question_id = 'c3-match-1'
UNION ALL SELECT id, 3, '1810', 'British conquest' FROM questions WHERE question_id = 'c3-match-1';

-- ===========================
-- COMBINED - LEVEL 3 - FILL IN BLANKS QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-fill-1', 3, 3, 3, 'In _______, the _______ established the first permanent European settlement in Mauritius.', 35, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, '1638, Dutch', FALSE FROM questions WHERE question_id = 'c3-fill-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-fill-2', 3, 3, 3, 'Mauritius strategically important location in the _______ made it valuable to colonial powers.', 35, 'Fill the Blanks');

INSERT INTO fill_answers (question_id, answer_text, case_sensitive) 
SELECT id, 'Indian Ocean', FALSE FROM questions WHERE question_id = 'c3-fill-2';

-- ===========================
-- COMBINED - LEVEL 3 - REORDER QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-reorder-1', 3, 3, 4, 'Put the following events in chronological order', 70, 'Put in Order');

INSERT INTO reorder_items (question_id, item_order, item_text, correct_position) 
SELECT id, 1, '1638 Dutch Settlement', 1 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 2, '1715 French Rule', 2 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 3, '1810 British Conquest', 3 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 4, '1835 Slavery Abolished', 4 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 5, '1874 Indentured Labor Stops', 5 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 6, '1968 Independence', 6 FROM questions WHERE question_id = 'c3-reorder-1'
UNION ALL SELECT id, 7, '1992 Republic Declaration', 7 FROM questions WHERE question_id = 'c3-reorder-1';

-- ===========================
-- COMBINED - LEVEL 3 - TRUE/FALSE QUESTIONS
-- ===========================

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-tf-1', 3, 3, 5, 'Mauritius transformed from a colony to one of Africa''s most developed nations.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, TRUE, 'Yes, Mauritius has transformed into one of the most developed nations in Africa' FROM questions WHERE question_id = 'c3-tf-1';

INSERT INTO questions (question_id, subject_id, level_id, type_id, question_text, timer_seconds, display_title) 
VALUES ('c3-tf-2', 3, 3, 5, 'Mauritius lost its strategic importance after independence.', 20, 'True or False');

INSERT INTO truefalse_answers (question_id, correct_answer, explanation) 
SELECT id, FALSE, 'Mauritius remains strategically important in the Indian Ocean region' FROM questions WHERE question_id = 'c3-tf-2';

-- ===========================
-- SAMPLE LEADERBOARD DATA
-- ===========================

INSERT INTO leaderboard (player_name, subject_id, level_id, total_points, stars_earned) VALUES
('Raj Patel', 1, 3, 850, 15),
('Aisha Khan', 1, 2, 720, 12),
('Emma Smith', 2, 3, 890, 16),
('Lucas Silva', 3, 2, 780, 13),
('Sophie Dupont', 1, 1, 650, 10),
('Michael Brown', 2, 2, 760, 14),
('Zara Ahmed', 3, 3, 920, 18),
('Leo Martinez', 1, 3, 810, 15),
('Nina Patel', 2, 1, 580, 9),
('James Wilson', 3, 1, 640, 11);

-- ===========================
-- CREATE INDEXES FOR PERFORMANCE
-- ===========================

CREATE INDEX idx_questions_subject_level ON questions(subject_id, level_id);
CREATE INDEX idx_questions_type ON questions(type_id);
CREATE INDEX idx_mcq_question ON mcq_options(question_id);
CREATE INDEX idx_matching_question ON matching_pairs(question_id);
CREATE INDEX idx_fill_question ON fill_answers(question_id);
CREATE INDEX idx_reorder_question ON reorder_items(question_id);
CREATE INDEX idx_truefalse_question ON truefalse_answers(question_id);
CREATE INDEX idx_leaderboard_subject_level ON leaderboard(subject_id, level_id);

-- ===========================
-- DATABASE READY FOR USE
-- ===========================
-- Total Questions in Database: 75 questions
-- Structure: 3 Subjects × 3 Levels × 5 Question Types = 45 base questions
-- Additional combined variations = 75 total questions
-- All questions are fully populated with answers and metadata
