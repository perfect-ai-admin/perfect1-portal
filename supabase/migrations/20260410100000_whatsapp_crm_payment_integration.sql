-- =============================================================
-- WhatsApp + CRM + Payment Integration
-- Date: 2026-04-10
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- 1. NEW TABLE: whatsapp_messages
-- Stores every WhatsApp message (inbound + outbound)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_text TEXT,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'button', 'media', 'payment_link', 'template')),
  button_id VARCHAR(50),
  greenapi_message_id VARCHAR(100) UNIQUE,
  delivery_status VARCHAR(20) DEFAULT 'sent'
    CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sender_type VARCHAR(10) NOT NULL DEFAULT 'bot'
    CHECK (sender_type IN ('bot', 'user', 'agent', 'system')),
  session_id UUID REFERENCES bot_sessions(id) ON DELETE SET NULL,
  agent_id UUID,
  source VARCHAR(50) DEFAULT 'sales_portal',
  raw_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wamsg_lead_id ON whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_wamsg_phone ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_wamsg_greenapi_id ON whatsapp_messages(greenapi_message_id)
  WHERE greenapi_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wamsg_lead_created ON whatsapp_messages(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wamsg_session ON whatsapp_messages(session_id)
  WHERE session_id IS NOT NULL;

-- RLS
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='whatsapp_messages' AND policyname='wamsg_service_role') THEN
    EXECUTE 'CREATE POLICY "wamsg_service_role" ON whatsapp_messages FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='whatsapp_messages' AND policyname='wamsg_select_auth') THEN
    EXECUTE 'CREATE POLICY "wamsg_select_auth" ON whatsapp_messages FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='whatsapp_messages' AND policyname='wamsg_insert_auth') THEN
    EXECUTE 'CREATE POLICY "wamsg_insert_auth" ON whatsapp_messages FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
END $$;

-- =====================================================
-- 2. NEW COLUMNS ON leads: payment tracking + handoff
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)
  DEFAULT 'none';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_link_sent_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS payment_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS handoff_mode VARCHAR(10) DEFAULT 'bot';

-- Add check constraints safely
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'leads_payment_status_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_payment_status_check
      CHECK (payment_status IN ('none', 'link_sent', 'pending', 'paid', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'leads_handoff_mode_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_handoff_mode_check
      CHECK (handoff_mode IN ('bot', 'agent', 'none'));
  END IF;
END $$;

-- =====================================================
-- 3. PAYMENTS TABLE: create if missing + add lead_id
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  product_type VARCHAR(50),
  product_name VARCHAR(200),
  product_id UUID,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'ILS',
  payment_method VARCHAR(30) DEFAULT 'tranzila',
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  failure_reason TEXT,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='payments_service_role') THEN
    EXECUTE 'CREATE POLICY "payments_service_role" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Add lead_id if table already existed without it
ALTER TABLE payments ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'sales_portal';

CREATE INDEX IF NOT EXISTS idx_payments_lead_id ON payments(lead_id)
  WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add authenticated SELECT on payments for CRM
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='payments_select_auth') THEN
    EXECUTE 'CREATE POLICY "payments_select_auth" ON payments FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =====================================================
-- 3b. AI_AGENTS TABLE: create if missing
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_agents' AND policyname='ai_agents_service_role') THEN
    EXECUTE 'CREATE POLICY "ai_agents_service_role" ON ai_agents FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_agents' AND policyname='agents_select_auth') THEN
    EXECUTE 'CREATE POLICY "agents_select_auth" ON ai_agents FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =====================================================
-- 4. INDEX for payment_status lookups
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_payment_status ON leads(payment_status)
  WHERE payment_status != 'none';
