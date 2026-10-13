-- ===========================
-- Grade 4 Science Practice Units
-- ===========================
-- Migration: 17_seed_grade4_science_practice_units.sql
-- Adds 8 Grade 4 Science units to the practice_units table.
-- Uses unit_no 17-24 (Grade 5 = 1-5, Grade 6 = 6-10, Grade 4 H&G = 11-16, Grade 4 Science = 17-24).

INSERT INTO practice_units (unit_no, unit_name) VALUES
  (17, 'Grade 4 Science Unit 1'),
  (18, 'Grade 4 Science Unit 2'),
  (19, 'Grade 4 Science Unit 3'),
  (20, 'Grade 4 Science Unit 4'),
  (21, 'Grade 4 Science Unit 5'),
  (22, 'Grade 4 Science Unit 6'),
  (23, 'Grade 4 Science Unit 7'),
  (24, 'Grade 4 Science Unit 8')
ON CONFLICT (unit_no) DO UPDATE SET unit_name = EXCLUDED.unit_name;
