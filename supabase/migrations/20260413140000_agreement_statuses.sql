-- =============================================================
-- Agreement status expansion: draft, link_ready, delivery_status
-- Date: 2026-04-13
-- IDEMPOTENT
-- =============================================================

-- Drop old check constraint and add expanded one
ALTER TABLE agreements DROP CONSTRAINT IF EXISTS agreements_status_check;
ALTER TABLE agreements ADD CONSTRAINT agreements_status_check
  CHECK (status IN ('draft', 'link_ready', 'pending', 'sent', 'opened', 'signed', 'failed', 'expired'));

-- New columns
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(20) DEFAULT 'not_sent';
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE agreements ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMPTZ;

-- Update existing 'pending' rows to 'draft'
UPDATE agreements SET status = 'draft' WHERE status = 'pending' AND submission_link IS NULL;
UPDATE agreements SET status = 'link_ready' WHERE status = 'pending' AND submission_link IS NOT NULL;
