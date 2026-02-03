-- Fix RLS policies to allow admin operations on lookup tables
-- Run this in Supabase SQL Editor

-- First, disable RLS on all tables (service role should bypass, but this ensures it works)
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE matching_pairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE fill_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE truefalse_answers DISABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert into subjects
CREATE POLICY "Allow authenticated insert on subjects" ON subjects
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into levels  
CREATE POLICY "Allow authenticated insert on levels" ON levels
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into question_types
CREATE POLICY "Allow authenticated insert on question_types" ON question_types
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into questions
DROP POLICY IF EXISTS "Allow authenticated insert on questions" ON questions;
CREATE POLICY "Allow authenticated insert on questions" ON questions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into mcq_options
DROP POLICY IF EXISTS "Allow authenticated insert on mcq_options" ON mcq_options;
CREATE POLICY "Allow authenticated insert on mcq_options" ON mcq_options
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into matching_pairs
DROP POLICY IF EXISTS "Allow authenticated insert on matching_pairs" ON matching_pairs;
CREATE POLICY "Allow authenticated insert on matching_pairs" ON matching_pairs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into fill_answers
DROP POLICY IF EXISTS "Allow authenticated insert on fill_answers" ON fill_answers;
CREATE POLICY "Allow authenticated insert on fill_answers" ON fill_answers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into reorder_items
DROP POLICY IF EXISTS "Allow authenticated insert on reorder_items" ON reorder_items;
CREATE POLICY "Allow authenticated insert on reorder_items" ON reorder_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to insert into truefalse_answers
DROP POLICY IF EXISTS "Allow authenticated insert on truefalse_answers" ON truefalse_answers;
CREATE POLICY "Allow authenticated insert on truefalse_answers" ON truefalse_answers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also allow anon to read all lookup tables (for filtering)
CREATE POLICY IF NOT EXISTS "Allow anon select on subjects" ON subjects
  FOR SELECT TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow anon select on levels" ON levels
  FOR SELECT TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow anon select on question_types" ON question_types
  FOR SELECT TO anon
  USING (true);
