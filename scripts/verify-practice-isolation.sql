-- ===========================
-- Practice Mode — Isolation Verification Queries
-- ===========================
-- Run these AFTER a practice session to confirm zero leakage
-- between practice tables and gamified tables.

-- 1. Verify no practice question IDs leaked into the gamified leaderboard
-- Expected: count = 0
SELECT 'leaderboard_leak_check' AS test,
       COUNT(*) AS violations
FROM leaderboard;
-- (Practice mode never writes to leaderboard — this confirms no rows appeared after a session)

-- 2. Verify no gamified question IDs appear in practice_attempts
-- Expected: count = 0 (FK constraint enforces this, but double-check)
SELECT 'gamified_in_practice_check' AS test,
       COUNT(*) AS violations
FROM practice_attempts pa
WHERE pa.question_id IN (SELECT id FROM questions);

-- 3. Verify no practice question IDs appear in gamified answer tables
-- Expected: all counts = 0
SELECT 'practice_in_mcq_options' AS test, COUNT(*) AS violations
FROM mcq_options WHERE question_id IN (SELECT id FROM practice_questions);

SELECT 'practice_in_matching_pairs' AS test, COUNT(*) AS violations
FROM matching_pairs WHERE question_id IN (SELECT id FROM practice_questions);

SELECT 'practice_in_fill_answers' AS test, COUNT(*) AS violations
FROM fill_answers WHERE question_id IN (SELECT id FROM practice_questions);

SELECT 'practice_in_reorder_items' AS test, COUNT(*) AS violations
FROM reorder_items WHERE question_id IN (SELECT id FROM practice_questions);

SELECT 'practice_in_truefalse_answers' AS test, COUNT(*) AS violations
FROM truefalse_answers WHERE question_id IN (SELECT id FROM practice_questions);

-- 4. Verify every practice attempt has a valid session
-- Expected: count = 0
SELECT 'orphan_attempts' AS test,
       COUNT(*) AS violations
FROM practice_attempts pa
LEFT JOIN practice_sessions ps ON pa.session_id = ps.id
WHERE ps.id IS NULL;

-- 5. Verify every practice session has a valid student
-- Expected: count = 0
SELECT 'orphan_sessions' AS test,
       COUNT(*) AS violations
FROM practice_sessions ps
LEFT JOIN users u ON ps.student_id = u.id
WHERE u.id IS NULL;

-- 6. Verify practice_sessions.questions_served references valid questions
-- Expected: count = 0
SELECT 'invalid_questions_served' AS test,
       COUNT(*) AS violations
FROM practice_sessions ps,
     LATERAL unnest(ps.questions_served) AS served_id
WHERE NOT EXISTS (
  SELECT 1 FROM practice_questions pq WHERE pq.id = served_id
);

-- 7. Summary counts (informational)
SELECT 'practice_units' AS table_name, COUNT(*) AS row_count FROM practice_units
UNION ALL
SELECT 'practice_questions', COUNT(*) FROM practice_questions
UNION ALL
SELECT 'practice_sessions', COUNT(*) FROM practice_sessions
UNION ALL
SELECT 'practice_attempts', COUNT(*) FROM practice_attempts
UNION ALL
SELECT 'gamified_questions', COUNT(*) FROM questions
UNION ALL
SELECT 'leaderboard', COUNT(*) FROM leaderboard
ORDER BY table_name;
