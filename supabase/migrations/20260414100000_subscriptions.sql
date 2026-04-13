-- =============================================================
-- Subscriptions & Billing Transactions
-- Date: 2026-04-14
-- Adds recurring billing infrastructure for Tranzila integration.
-- IDEMPOTENT: safe to run multiple times.
-- =============================================================

-- =============================================================
-- 1. subscriptions — tracks recurring billing state per customer
-- =============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  plan_name varchar(100) NOT NULL,
  monthly_price numeric(10,2) NOT NULL,
  currency varchar(10) DEFAULT 'ILS',
  status varchar(30) DEFAULT 'pending_first_charge'
    CHECK (status IN ('active', 'paused', 'cancelled', 'failed', 'pending_first_charge')),
  start_date date NOT NULL,
  last_charge_date date,
  next_charge_date date,
  tranzila_recur_id text,
  recur_payments integer DEFAULT 998,
  cancellation_reason text,
  cancelled_at timestamptz,
  paused_at timestamptz,
  pause_reason text,
  failure_count integer DEFAULT 0,
  last_failure_reason text,
  metadata jsonb DEFAULT '{}',
  source varchar(50) DEFAULT 'crm',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_charge ON subscriptions(next_charge_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lead ON subscriptions(lead_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='subs_service_role') THEN
    EXECUTE 'CREATE POLICY "subs_service_role" ON subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='subs_select_auth') THEN
    EXECUTE 'CREATE POLICY "subs_select_auth" ON subscriptions FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =============================================================
-- 2. billing_transactions — per-charge audit trail
-- =============================================================
CREATE TABLE IF NOT EXISTS billing_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  lead_id uuid,
  client_id uuid,
  charge_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency varchar(10) DEFAULT 'ILS',
  status varchar(20) NOT NULL
    CHECK (status IN ('success', 'failed', 'refunded', 'pending')),
  tranzila_transaction_id text,
  tranzila_response_code text,
  failure_reason text,
  payment_id uuid,
  notify_payload jsonb,
  source varchar(50) DEFAULT 'tranzila_notify',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_tx_sub_date ON billing_transactions(subscription_id, charge_date DESC);
CREATE INDEX IF NOT EXISTS idx_billing_tx_status ON billing_transactions(status, created_at DESC);

ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_transactions' AND policyname='btx_service_role') THEN
    EXECUTE 'CREATE POLICY "btx_service_role" ON billing_transactions FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='billing_transactions' AND policyname='btx_select_auth') THEN
    EXECUTE 'CREATE POLICY "btx_select_auth" ON billing_transactions FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =============================================================
-- 3. Link payments to subscriptions (optional FK)
-- =============================================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id);
