-- =============================================================
-- RLS Policies for critical tables
-- Created: 2026-03-28
-- =============================================================

-- ===================== leads =====================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public INSERT (lead submission forms)
CREATE POLICY "leads_insert_public"
  ON leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated-only SELECT
CREATE POLICY "leads_select_authenticated"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated-only UPDATE
CREATE POLICY "leads_update_authenticated"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated-only DELETE
CREATE POLICY "leads_delete_authenticated"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- ===================== customers =====================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select_authenticated"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "customers_update_authenticated"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "customers_insert_authenticated"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "customers_delete_authenticated"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- ===================== payments =====================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_authenticated"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "payments_insert_authenticated"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "payments_update_authenticated"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===================== billing_documents =====================
ALTER TABLE billing_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_documents_select_authenticated"
  ON billing_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "billing_documents_insert_authenticated"
  ON billing_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "billing_documents_update_authenticated"
  ON billing_documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ===================== crm_leads =====================
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

-- Public INSERT (lead forms)
CREATE POLICY "crm_leads_insert_public"
  ON crm_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "crm_leads_select_authenticated"
  ON crm_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "crm_leads_update_authenticated"
  ON crm_leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "crm_leads_delete_authenticated"
  ON crm_leads FOR DELETE
  TO authenticated
  USING (true);

-- ===================== followup_leads =====================
ALTER TABLE followup_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followup_leads_select_authenticated"
  ON followup_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "followup_leads_insert_authenticated"
  ON followup_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "followup_leads_update_authenticated"
  ON followup_leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "followup_leads_delete_authenticated"
  ON followup_leads FOR DELETE
  TO authenticated
  USING (true);
