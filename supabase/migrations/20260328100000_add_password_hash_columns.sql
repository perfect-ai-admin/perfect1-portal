-- =============================================================
-- Add password_hash and password_salt columns to ai_agents
-- For migrating from plaintext to hashed passwords
-- Created: 2026-03-28
-- =============================================================

ALTER TABLE ai_agents
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS password_salt TEXT;

-- Keep the original password column for now (legacy fallback).
-- Once all agents have been migrated (logged in at least once),
-- the password column can be dropped with:
-- ALTER TABLE ai_agents DROP COLUMN password;
