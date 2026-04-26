-- =============================================================
-- Fix: leads.updated_at missing column
-- Date: 2026-04-11
-- Root cause: useUpdateLeadStage (and 5 other places in useCRM.js)
-- write to leads.updated_at, but the column never existed on `leads`.
-- PostgREST rejects the UPDATE with PGRST204, silently breaking
-- every status change from the CRM UI.
--
-- This migration adds the missing column (matching project
-- convention — clients/tasks/payments/automation_rules all have it)
-- and a BEFORE UPDATE trigger to keep it fresh automatically.
-- IDEMPOTENT.
-- =============================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Backfill existing rows with a sensible value
UPDATE leads
   SET updated_at = COALESCE(pipeline_entered_at, created_at, now())
 WHERE updated_at IS NULL;

-- Auto-touch on every UPDATE
CREATE OR REPLACE FUNCTION leads_touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION leads_touch_updated_at();

-- Force PostgREST to reload its schema cache so the new column
-- becomes immediately visible to the REST API.
NOTIFY pgrst, 'reload schema';
