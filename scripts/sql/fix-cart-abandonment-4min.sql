-- Fix cart abandonment: scan payments table directly, 4-min interval (was 7)
-- Old version checked leads.payment_status='link_sent' which is never set.
CREATE OR REPLACE FUNCTION scan_and_trigger_abandoned_followups()
RETURNS TEXT AS $$
DECLARE
  payment_record RECORD;
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
      WHERE name = 'supabase_service_role_key' LIMIT 1;
    EXCEPTION WHEN OTHERS THEN service_key := NULL;
    END;
  END IF;
  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not configured in vault';
  END IF;

  -- Find pending payments 4-30 min old, with linked lead, that haven't been
  -- followed-up yet. Quiet-hours respected by triggerFollowupFlow itself.
  FOR payment_record IN
    SELECT p.lead_id, p.id AS payment_id
    FROM payments p
    JOIN leads l ON l.id = p.lead_id
    WHERE p.status = 'pending'
      AND p.lead_id IS NOT NULL
      AND p.created_at <= NOW() - INTERVAL '4 minutes'
      AND p.created_at >= NOW() - INTERVAL '30 minutes'
      AND COALESCE(l.abandoned_followup_sent_at, '1970-01-01'::timestamptz) < p.created_at
      AND COALESCE(l.do_not_contact, false) = false
      AND l.phone IS NOT NULL AND l.phone <> ''
    LIMIT 20
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/triggerFollowupFlow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'apikey', service_key
      ),
      body := jsonb_build_object(
        'lead_id', payment_record.lead_id,
        'flow_type', 'pre_payment_recovery_flow',
        'source', 'cart_abandoned_4min'
      )
    );
    -- Mark as followed-up so we don't fire again for the same payment
    UPDATE leads SET abandoned_followup_sent_at = NOW() WHERE id = payment_record.lead_id;
    triggered_count := triggered_count + 1;
  END LOOP;
  RETURN 'Triggered cart_abandoned_4min for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql;
