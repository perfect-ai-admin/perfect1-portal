-- =============================================================
-- Fix: scanner functions can't read vault secrets because they run as postgres
-- Solution: create a SECURITY DEFINER helper that reads the vault
-- Date: 2026-04-12
-- =============================================================

-- Helper function to read the service_role_key from vault
-- Must be SECURITY DEFINER to access vault.decrypted_secrets
CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT AS $$
DECLARE
  key_value TEXT;
BEGIN
  SELECT decrypted_secret INTO key_value
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_service_role_key'
  LIMIT 1;
  RETURN key_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rewrite the scanners to use this helper
CREATE OR REPLACE FUNCTION scan_and_trigger_abandoned_followups()
RETURNS TEXT AS $$
DECLARE
  lead_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := get_service_role_key();

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not found in vault';
  END IF;

  FOR lead_record IN
    SELECT id, phone
    FROM leads
    WHERE payment_status = 'link_sent'
      AND abandoned_followup_sent_at IS NULL
      AND payment_link_clicked_at IS NOT NULL
      AND payment_link_clicked_at <= NOW() - INTERVAL '7 minutes'
      AND payment_link_clicked_at >= NOW() - INTERVAL '24 hours'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION scan_and_trigger_post_payment_onboarding()
RETURNS TEXT AS $$
DECLARE
  lead_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := get_service_role_key();

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not found in vault';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
