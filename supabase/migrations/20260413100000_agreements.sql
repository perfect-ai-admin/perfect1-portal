-- =============================================================
-- Agreements: FillFaster digital signature integration
-- Date: 2026-04-13
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- 1. NEW TABLE: agreements
-- =====================================================

CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Agreement type
  template_key VARCHAR(50) NOT NULL,
  template_label VARCHAR(200),

  -- FillFaster integration
  fillfaster_form_id VARCHAR(100),
  fillfaster_submission_id VARCHAR(100),
  submission_link TEXT,
  signed_pdf_url TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'opened', 'signed', 'failed', 'expired')),

  -- Timestamps
  sent_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,

  -- Data
  prefilled_data JSONB DEFAULT '{}',
  user_data JSONB DEFAULT '{}',
  webhook_data JSONB DEFAULT '{}',

  -- Audit
  agent_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agreements_lead ON agreements(lead_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_agreements_submission ON agreements(fillfaster_submission_id)
  WHERE fillfaster_submission_id IS NOT NULL;

-- RLS
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreements' AND policyname='agreements_service_role') THEN
    EXECUTE 'CREATE POLICY "agreements_service_role" ON agreements FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreements' AND policyname='agreements_select_auth') THEN
    EXECUTE 'CREATE POLICY "agreements_select_auth" ON agreements FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreements' AND policyname='agreements_insert_auth') THEN
    EXECUTE 'CREATE POLICY "agreements_insert_auth" ON agreements FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agreements' AND policyname='agreements_update_auth') THEN
    EXECUTE 'CREATE POLICY "agreements_update_auth" ON agreements FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_agreements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_agreements_updated_at') THEN
    CREATE TRIGGER trg_agreements_updated_at
      BEFORE UPDATE ON agreements
      FOR EACH ROW
      EXECUTE FUNCTION update_agreements_updated_at();
  END IF;
END $$;

-- =====================================================
-- 2. NEW COLUMNS ON leads: agreement tracking
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS agreement_status VARCHAR(20) DEFAULT 'none';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agreement_id UUID;

CREATE INDEX IF NOT EXISTS idx_leads_agreement_status ON leads(agreement_status)
  WHERE agreement_status != 'none';

-- =====================================================
-- 3. Storage bucket for signed PDFs (private)
-- =====================================================
-- Run manually in Supabase dashboard or via:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('agreements', 'agreements', false)
-- ON CONFLICT (id) DO NOTHING;
