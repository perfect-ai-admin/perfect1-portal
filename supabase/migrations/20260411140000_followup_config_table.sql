-- =============================================================
-- FollowUp Bot — Configuration via table (not ALTER DATABASE)
-- Reason: Supabase Management API forbids ALTER DATABASE SET of
-- custom parameters. Use a private table instead.
-- IDEMPOTENT.
-- =============================================================

CREATE TABLE IF NOT EXISTS followup_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- RLS: service_role only
ALTER TABLE followup_config ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='followup_config' AND policyname='fcfg_service_role') THEN
    EXECUTE 'CREATE POLICY "fcfg_service_role" ON followup_config FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Replace the helper functions to read from table instead of current_setting
CREATE OR REPLACE FUNCTION followup_dispatch_url() RETURNS text AS $$
DECLARE v text;
BEGIN
  SELECT value INTO v FROM followup_config WHERE key = 'dispatch_url';
  RETURN COALESCE(v, '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION followup_service_role() RETURNS text AS $$
DECLARE v text;
BEGIN
  SELECT value INTO v FROM followup_config WHERE key = 'service_role';
  RETURN COALESCE(v, '');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
