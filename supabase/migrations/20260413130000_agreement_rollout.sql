-- =============================================================
-- Agreement Rollout: events table, feature flags, stats
-- Date: 2026-04-13
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- 1. system_settings — key/value feature flags
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'false',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_settings' AND policyname='settings_service_role') THEN
    EXECUTE 'CREATE POLICY "settings_service_role" ON system_settings FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_settings' AND policyname='settings_select_auth') THEN
    EXECUTE 'CREATE POLICY "settings_select_auth" ON system_settings FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- Default: agreements OFF
INSERT INTO system_settings (key, value, description)
VALUES ('agreements_enabled', 'false', 'FillFaster agreement signing feature flag')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 2. agreement_events — audit trail for every webhook
-- =====================================================

CREATE TABLE IF NOT EXISTS agreement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  event_name VARCHAR(50) NOT NULL,
  payload JSONB DEFAULT '{}',
  source VARCHAR(50) DEFAULT 'fillfaster',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ag_events_agreement ON agreement_events(agreement_id);
CREATE INDEX IF NOT EXISTS idx_ag_events_name ON agreement_events(event_name);
CREATE INDEX IF NOT EXISTS idx_ag_events_created ON agreement_events(created_at DESC);

ALTER TABLE agreement_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreement_events' AND policyname='ag_events_service_role') THEN
    EXECUTE 'CREATE POLICY "ag_events_service_role" ON agreement_events FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreement_events' AND policyname='ag_events_select_auth') THEN
    EXECUTE 'CREATE POLICY "ag_events_select_auth" ON agreement_events FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreement_events' AND policyname='ag_events_insert_auth') THEN
    EXECUTE 'CREATE POLICY "ag_events_insert_auth" ON agreement_events FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- 3. RPC: agreement stats (last N days)
-- =====================================================

CREATE OR REPLACE FUNCTION get_agreement_stats(days_back INT DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'sent_count', COUNT(*) FILTER (WHERE status IN ('sent','opened','signed')),
    'opened_count', COUNT(*) FILTER (WHERE status IN ('opened','signed')),
    'signed_count', COUNT(*) FILTER (WHERE status = 'signed'),
    'pending_count', COUNT(*) FILTER (WHERE status = 'pending'),
    'failed_count', COUNT(*) FILTER (WHERE status = 'failed'),
    'conversion_rate', CASE
      WHEN COUNT(*) FILTER (WHERE status IN ('sent','opened','signed')) = 0 THEN 0
      ELSE ROUND(
        COUNT(*) FILTER (WHERE status = 'signed')::NUMERIC /
        COUNT(*) FILTER (WHERE status IN ('sent','opened','signed'))::NUMERIC * 100, 1
      )
    END,
    'period_days', days_back
  ) INTO result
  FROM agreements
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
