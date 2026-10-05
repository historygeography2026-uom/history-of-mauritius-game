-- ===========================
-- Migration: 16_add_guest_token.sql
-- Adds guest_token column to practice_attempts for anonymous user tracking
-- ===========================

-- Add nullable UUID column for guest identity
ALTER TABLE practice_attempts ADD COLUMN IF NOT EXISTS guest_token UUID;

-- Index for efficient guest-based queries (only on non-null values)
CREATE INDEX IF NOT EXISTS idx_pa_guest_token ON practice_attempts(guest_token) WHERE guest_token IS NOT NULL;

-- Composite index for wrong-answer aggregation queries
CREATE INDEX IF NOT EXISTS idx_pa_wrong_answers ON practice_attempts(question_id, is_correct) WHERE NOT is_correct;
