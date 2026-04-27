-- Cart-abandonment via PAYMENT LINK CLICK (not just pending payment).
-- Catches the case the operator described: lead clicked "פתיחת עוסק פטור
-- אונליין" from the bot, got the link, but never reached the Tranzila form
-- (so no pending payment exists). After 4 min with no payment, the bot
-- starts the qualification flow.
--
-- Lookup is via lead_events.payment_link_clicked which botHandleReply
-- already inserts in production.

CREATE OR REPLACE FUNCTION scan_and_trigger_link_clicked_no_pay()
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
      WHERE name = 'supabase_service_role_key' LIMIT 1;
    EXCEPTION WHEN OTHERS THEN service_key := NULL;
    END;
  END IF;
  IF service_key IS NULL THEN RETURN 'ERROR: service_role_key not in vault'; END IF;

  FOR lead_record IN
    -- Find leads with a payment_link_clicked event 4-30 min ago
    -- that don't have a completed payment and haven't been followed up yet.
    SELECT DISTINCT ON (e.lead_id)
      e.lead_id,
      e.created_at AS clicked_at,
      l.name,
      l.phone
    FROM lead_events e
    JOIN leads l ON l.id = e.lead_id
    WHERE e.event_type = 'payment_link_clicked'
      AND e.created_at <= NOW() - INTERVAL '4 minutes'
      AND e.created_at >= NOW() - INTERVAL '30 minutes'
      AND COALESCE(l.abandoned_followup_sent_at, '1970-01-01'::timestamptz) < e.created_at
      AND COALESCE(l.do_not_contact, false) = false
      AND l.phone IS NOT NULL AND l.phone <> ''
      -- Skip if they actually paid
      AND NOT EXISTS (
        SELECT 1 FROM payments p
        WHERE p.lead_id = e.lead_id
          AND p.status = 'completed'
          AND p.created_at >= e.created_at
      )
    ORDER BY e.lead_id, e.created_at DESC
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
        'lead_id', lead_record.lead_id,
        'flow_type', 'pre_payment_recovery_flow',
        'source', 'link_clicked_no_pay_4min'
      )
    );
    UPDATE leads SET abandoned_followup_sent_at = NOW() WHERE id = lead_record.lead_id;
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Triggered link_clicked_no_pay for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql;

-- Schedule every minute (same cadence as existing abandon scan)
DO $$ BEGIN
  PERFORM cron.unschedule('followup_link_clicked_no_pay');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'followup_link_clicked_no_pay',
  '* * * * *',
  $cron$SELECT scan_and_trigger_link_clicked_no_pay();$cron$
);
