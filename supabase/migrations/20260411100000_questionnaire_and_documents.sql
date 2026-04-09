-- =============================================================
-- Questionnaire data + documents on leads and clients
-- Date: 2026-04-11
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- 1. LEADS: questionnaire fields
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_type VARCHAR(200);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS income VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_employee VARCHAR(10);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS salary VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS questionnaire_data JSONB DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_url TEXT;

-- =====================================================
-- 2. CLIENTS: questionnaire fields (copied from lead on conversion)
-- =====================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS id_number VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_type VARCHAR(200);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS income VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_employee VARCHAR(10);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS salary VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS questionnaire_data JSONB DEFAULT '{}';

-- =====================================================
-- 3. DOCUMENTS: ensure lead_id linkage + file tracking
-- =====================================================

-- documents table already exists, just ensure it has what we need
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url TEXT;
