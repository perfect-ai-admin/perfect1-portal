-- =============================================================
-- pg_cron jobs for delayed follow-up flows
-- - Abandoned checkout: 7 min after payment_link_clicked_at, no payment
-- - Post-payment onboarding: 7 min after paid_at, no onboarding sent
-- Date: 2026-04-12
-- IDEMPOTENT: drops existing jobs first
-- =============================================================

-- Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Drop existing jobs if they exist (idempotent)
DO $$ BEGIN
  PERFORM cron.unschedule('followup_abandoned_checkout');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  PERFORM cron.unschedule('followup_post_payment_onboarding');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- Function: scan_and_trigger_abandoned_followups
-- Calls triggerFollowupFlow for leads who clicked pay but didn't complete after 7 min
-- =====================================================

CREATE OR REPLACE FUNCTION scan_and_trigger_abandoned_followups()
RETURNS TEXT AS $$
DECLARE
  lead_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  -- Read config from vault or hardcode (we'll use Supabase vault)
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := current_setting('app.service_role_key', true);

  -- Fallback: read from vault.decrypted_secrets if exists
  IF service_key IS NULL OR service_key = '' THEN
    BEGIN
      SELECT decrypted_secret INTO service_key
      FROM vault.decrypted_secrets
      WHERE name = 'supabase_service_role_key'
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      service_key := NULL;
    END;
  END IF;

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not configured in vault';
  END IF;

  FOR lead_record IN
    SELECT id, phone
    FROM leads
    WHERE payment_status = 'link_sent'
      AND abandoned_followup_sent_at IS NULL
      AND payment_link_clicked_at IS NOT NULL
      AND payment_link_clicked_at <= NOW() - INTERVAL '7 minutes'
      AND payment_link_clicked_at >= NOW() - INTERVAL '24 hours'  -- only recent leads
    LIMIT 20
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/triggerFollowupFlow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'lead_id', lead_record.id,
        'flow_type', 'pre_payment_recovery_flow'
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Triggered abandoned_checkout for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: scan_and_trigger_post_payment_onboarding
-- Calls triggerFollowupFlow for leads who paid but haven't received onboarding after 7 min
-- =====================================================

CREATE OR REPLACE FUNCTION scan_and_trigger_post_payment_onboarding()
RETURNS TEXT AS $$
DECLARE
  lead_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := current_setting('app.service_role_key', true);

  IF service_key IS NULL OR service_key = '' THEN
    BEGIN
      SELECT decrypted_secret INTO service_key
      FROM vault.decrypted_secrets
      WHERE name = 'supabase_service_role_key'
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      service_key := NULL;
    END;
  END IF;

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not configured in vault';
  END IF;

  FOR lead_record IN
    SELECT id
    FROM leads
    WHERE payment_status = 'paid'
      AND post_payment_onboarding_sent_at IS NULL
      AND paid_at IS NOT NULL
      AND paid_at <= NOW() - INTERVAL '7 minutes'
      AND paid_at >= NOW() - INTERVAL '24 hours'
    LIMIT 20
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/triggerFollowupFlow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object(
        'lead_id', lead_record.id,
        'flow_type', 'post_payment_onboarding_flow'
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Triggered post_payment_onboarding for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Schedule the jobs — every minute
-- =====================================================

SELECT cron.schedule(
  'followup_abandoned_checkout',
  '* * * * *',  -- every minute
  $$SELECT scan_and_trigger_abandoned_followups();$$
);

SELECT cron.schedule(
  'followup_post_payment_onboarding',
  '* * * * *',  -- every minute
  $$SELECT scan_and_trigger_post_payment_onboarding();$$
);
