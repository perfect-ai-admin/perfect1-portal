-- =============================================================
-- Billing Health Scanner
-- Date: 2026-04-14
-- Adds: billing_alerts table, cron job for daily scan.
-- IDEMPOTENT.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================================
-- 1. billing_alerts — tracks missing charges and anomalies
-- =============================================================
CREATE TABLE IF NOT EXISTS billing_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_alerts_sub ON billing_alerts(subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_alerts_type ON billing_alerts(alert_type, created_at DESC);

ALTER TABLE billing_alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_alerts' AND policyname='ba_service_role') THEN
    EXECUTE 'CREATE POLICY "ba_service_role" ON billing_alerts FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_alerts' AND policyname='ba_select_auth') THEN
    EXECUTE 'CREATE POLICY "ba_select_auth" ON billing_alerts FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =============================================================
-- 2. Helper: billing scanner URL (same pattern as followup_dispatch_url)
-- =============================================================
CREATE OR REPLACE FUNCTION billing_scanner_url() RETURNS text AS $$
BEGIN
  RETURN 'https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/billingHealthScanner';
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================
-- 3. Cron job — daily at 23:30 UTC (02:30 Israel time)
-- =============================================================
DO $$ BEGIN
  PERFORM cron.unschedule('billing-health-scanner');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'billing-health-scanner',
  '30 23 * * *',
  $cron$
    SELECT net.http_post(
      billing_scanner_url(),
      '{}'::jsonb,
      '{}'::jsonb,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(current_setting('app.followup_service_role', true), '')
      ),
      10000
    );
  $cron$
);
