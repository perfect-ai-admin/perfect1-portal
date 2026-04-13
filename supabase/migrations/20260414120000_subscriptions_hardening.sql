-- =============================================================
-- Subscriptions Hardening
-- Date: 2026-04-14
-- 1. UNIQUE index on billing_transactions for webhook dedup
-- 2. RLS UPDATE policy for authenticated users (CRM agents)
-- IDEMPOTENT.
-- =============================================================

-- 1. Prevent duplicate billing_transactions from race-condition webhooks
CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_tx_dedup
  ON billing_transactions(subscription_id, tranzila_transaction_id)
  WHERE tranzila_transaction_id IS NOT NULL;

-- 2. Allow CRM agents to update subscriptions (pause/cancel/resume)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='subs_update_auth') THEN
    EXECUTE 'CREATE POLICY "subs_update_auth" ON subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;
