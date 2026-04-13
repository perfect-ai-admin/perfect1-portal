-- =============================================================
-- Billing Alerts — resolve fields + RLS UPDATE
-- IDEMPOTENT.
-- =============================================================
ALTER TABLE billing_alerts ADD COLUMN IF NOT EXISTS resolved_by uuid;
ALTER TABLE billing_alerts ADD COLUMN IF NOT EXISTS notes text;

-- Allow CRM agents to update (resolve) alerts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_alerts' AND policyname='ba_update_auth') THEN
    EXECUTE 'CREATE POLICY "ba_update_auth" ON billing_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
