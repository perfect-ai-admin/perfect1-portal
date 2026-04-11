-- =============================================================
-- Bot State Machine + Lead Scoring + Events Audit Log
-- Date: 2026-04-12
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- 1. LEADS: state machine + payment tracking columns
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_state VARCHAR(60);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS selected_path VARCHAR(60);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_link_clicked_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS abandoned_followup_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS post_payment_onboarding_sent_at TIMESTAMPTZ;

-- Identity document fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS identity_document_type VARCHAR(30);
  -- license / passport / parent_id / national_id
ALTER TABLE leads ADD COLUMN IF NOT EXISTS identity_file_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS identity_id_number VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS identity_uploaded_at TIMESTAMPTZ;

-- Lead scoring + next action
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_recommended_action VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_bot_interaction_at TIMESTAMPTZ;

-- Index for scheduled jobs (abandoned checkout, post-payment onboarding)
CREATE INDEX IF NOT EXISTS idx_leads_payment_link_clicked ON leads(payment_link_clicked_at)
  WHERE payment_status = 'link_sent' AND abandoned_followup_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_paid_onboarding ON leads(paid_at)
  WHERE payment_status = 'paid' AND post_payment_onboarding_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_bot_state ON leads(bot_state)
  WHERE bot_state IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC)
  WHERE lead_score > 0;

-- =====================================================
-- 2. LEAD_EVENTS: audit log for all bot/CRM events
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(60) NOT NULL,
    -- path_selected, question_asked, question_answered, media_received,
    -- score_changed, state_transition, payment_started, payment_completed,
    -- identity_received, questionnaire_completed, owner_notified,
    -- abandoned_recovered, cross_sell_offered
  event_data JSONB DEFAULT '{}',
  score_delta INTEGER DEFAULT 0,
  previous_state VARCHAR(60),
  new_state VARCHAR(60),
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_score_delta ON lead_events(lead_id)
  WHERE score_delta <> 0;

ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_events' AND policyname='lead_events_service_role') THEN
    EXECUTE 'CREATE POLICY "lead_events_service_role" ON lead_events FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_events' AND policyname='lead_events_select_auth') THEN
    EXECUTE 'CREATE POLICY "lead_events_select_auth" ON lead_events FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =====================================================
-- 3. Helper function: increment lead_score atomically
-- =====================================================

CREATE OR REPLACE FUNCTION increment_lead_score(
  p_lead_id UUID,
  p_delta INTEGER,
  p_reason VARCHAR DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  new_score INTEGER;
BEGIN
  UPDATE leads
  SET lead_score = COALESCE(lead_score, 0) + p_delta,
      last_bot_interaction_at = NOW()
  WHERE id = p_lead_id
  RETURNING lead_score INTO new_score;

  -- Log the event
  INSERT INTO lead_events (lead_id, event_type, score_delta, event_data, source)
  VALUES (
    p_lead_id,
    'score_changed',
    p_delta,
    jsonb_build_object('reason', p_reason, 'new_total', new_score),
    'sales_portal'
  );

  -- Auto-mark as hot if score >= 70
  IF new_score >= 70 THEN
    UPDATE leads SET temperature = 'hot' WHERE id = p_lead_id AND (temperature IS NULL OR temperature != 'hot');
  END IF;

  RETURN new_score;
END;
$$ LANGUAGE plpgsql;
