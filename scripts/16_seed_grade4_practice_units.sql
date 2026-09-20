-- ===========================
-- Grade 4 Practice Units
-- ===========================
-- Migration: 16_seed_grade4_practice_units.sql
-- Adds 6 Grade 4 units to the practice_units table.
-- Uses unit_no 11-16 (continuing from Grade 5 = 1-5, Grade 6 = 6-10).

INSERT INTO practice_units (unit_no, unit_name) VALUES
  (11, 'Working with Maps'),
  (12, 'Our Natural Environment'),
  (13, 'Weather'),
  (14, 'Locality - Past and Present'),
  (15, 'People Living in our Locality'),
  (16, 'Voyages of Discovery')
ON CONFLICT (unit_no) DO UPDATE SET unit_name = EXCLUDED.unit_name;
