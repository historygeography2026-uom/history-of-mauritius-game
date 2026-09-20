-- ===========================
-- Grade 4 Practice Units
-- ===========================
-- Migration: 16_seed_grade4_practice_units.sql
-- Adds 6 Grade 4 units to the practice_units table.
-- Uses unit_no 11-16 (continuing from Grade 5 = 1-5, Grade 6 = 6-10).

INSERT INTO practice_units (unit_no, unit_name) VALUES
  (11, 'Grade 4 Unit 1'),
  (12, 'Grade 4 Unit 2'),
  (13, 'Grade 4 Unit 3'),
  (14, 'Grade 4 Unit 4'),
  (15, 'Grade 4 Unit 5'),
  (16, 'Grade 4 Unit 6')
ON CONFLICT (unit_no) DO UPDATE SET unit_name = EXCLUDED.unit_name;
