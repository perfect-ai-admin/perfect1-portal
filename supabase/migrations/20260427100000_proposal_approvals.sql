-- Digital quote/proposal approvals for company-formation flow.
-- Customer signs off on a quote (no payment yet); row drives downstream
-- email + sales follow-up. Service-role only writes (via Edge Function).

CREATE TABLE IF NOT EXISTS proposal_approvals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name               TEXT        NOT NULL,
  phone                   TEXT        NOT NULL,
  email                   TEXT        NOT NULL,
  requested_company_name  TEXT,
  id_number               TEXT,
  notes                   TEXT,

  proposal_type           TEXT        NOT NULL DEFAULT 'company_formation',
  setup_price             NUMERIC(10,2) NOT NULL DEFAULT 1999,
  monthly_price           NUMERIC(10,2) NOT NULL DEFAULT 899,
  annual_report_price     NUMERIC(10,2) NOT NULL DEFAULT 4000,
  vat_included            BOOLEAN     NOT NULL DEFAULT FALSE,

  approved_terms          BOOLEAN     NOT NULL DEFAULT TRUE,
  status                  TEXT        NOT NULL DEFAULT 'proposal_approved',

  ip_address              TEXT,
  user_agent              TEXT,

  approved_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_approvals_email      ON proposal_approvals (email);
CREATE INDEX IF NOT EXISTS idx_proposal_approvals_phone      ON proposal_approvals (phone);
CREATE INDEX IF NOT EXISTS idx_proposal_approvals_approved   ON proposal_approvals (approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_approvals_status     ON proposal_approvals (status);

ALTER TABLE proposal_approvals ENABLE ROW LEVEL SECURITY;

-- Only the service role (Edge Function) writes here. Anonymous /
-- authenticated clients have no INSERT/SELECT path — the public form
-- submits via the approveCompanyProposal Edge Function.
CREATE POLICY "service_role_full_access_proposal_approvals"
  ON proposal_approvals
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Admin customers can read approvals from the CRM.
CREATE POLICY "admin_read_proposal_approvals"
  ON proposal_approvals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND customers.role = 'admin'
    )
  );
