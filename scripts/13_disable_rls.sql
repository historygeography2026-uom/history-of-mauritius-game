-- Disable RLS on all tables to allow service role inserts
-- This is required for server-side bulk operations (admin API imports)
-- Service role should bypass RLS anyway, but Supabase requires explicit disabling

ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE matching_pairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE fill_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reorder_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE truefalse_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, relrowsecurity
FROM pg_tables
JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public'
ORDER BY tablename;
