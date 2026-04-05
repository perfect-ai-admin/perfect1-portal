-- Migration: Bot Flow Engine
-- Date: 2026-03-31
-- Adds bot fields to leads table + creates bot_sessions table

-- ============================================
-- 1. Add bot fields to leads table
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS page_intent VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS flow_type VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_first_answer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_second_answer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_third_answer TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_current_step VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_desired_action VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_outcome_state VARCHAR(30);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_handoff_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_last_message_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_messages_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_started_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bot_completed_at TIMESTAMPTZ;

-- ============================================
-- 2. Bot Sessions table
-- ============================================
CREATE TABLE IF NOT EXISTS bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  flow_type VARCHAR(30) NOT NULL,
  page_intent VARCHAR(30) NOT NULL,
  page_slug VARCHAR(100),
  current_step VARCHAR(30) DEFAULT 'opening',
  answers JSONB DEFAULT '{}',
  temperature VARCHAR(10),
  outcome_state VARCHAR(30),
  messages_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Bot Events table (analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS bot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES bot_sessions(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_page_intent ON leads(page_intent);
CREATE INDEX IF NOT EXISTS idx_leads_flow_type ON leads(flow_type);
CREATE INDEX IF NOT EXISTS idx_leads_bot_outcome ON leads(bot_outcome_state);

CREATE INDEX IF NOT EXISTS idx_bot_sessions_lead_id ON bot_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_phone ON bot_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_flow_type ON bot_sessions(flow_type);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_outcome ON bot_sessions(outcome_state);

CREATE INDEX IF NOT EXISTS idx_bot_events_session ON bot_events(session_id);
CREATE INDEX IF NOT EXISTS idx_bot_events_lead ON bot_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_bot_events_type ON bot_events(event_type);

-- ============================================
-- 5. RLS
-- ============================================
ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_bot_sessions" ON bot_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_bot_events" ON bot_events FOR ALL TO service_role USING (true) WITH CHECK (true);
