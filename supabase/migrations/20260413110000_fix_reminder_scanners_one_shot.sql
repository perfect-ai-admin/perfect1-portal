-- =============================================================
-- FIX: Reminder scanners must close session after sending
-- so they fire ONCE only, not every 5 minutes forever.
-- Date: 2026-04-13
-- =============================================================

CREATE OR REPLACE FUNCTION scan_and_trigger_callback_reminder()
RETURNS TEXT AS $$
DECLARE
  session_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := get_service_role_key();
  IF service_key IS NULL THEN RETURN 'ERROR: no key'; END IF;

  FOR session_record IN
    SELECT s.id as session_id, s.lead_id, s.phone
    FROM bot_sessions s
    WHERE s.flow_type IN ('accountant_callback_flow', 'pre_payment_recovery_flow', 'post_payment_onboarding_flow')
      AND s.completed_at IS NULL
      AND s.last_message_at IS NOT NULL
      AND s.last_message_at <= NOW() - INTERVAL '30 minutes'
      AND s.last_message_at >= NOW() - INTERVAL '24 hours'
    LIMIT 10
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/botHandleReply',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||service_key,'apikey',service_key),
      body := jsonb_build_object('phone',session_record.phone,'message','_system_reminder','idMessage','reminder_'||session_record.session_id)
    );
    -- Close session immediately so it never fires again
    UPDATE bot_sessions SET completed_at=NOW(), outcome_state='reminder_sent_and_closed' WHERE id=session_record.session_id;
    triggered_count := triggered_count + 1;
  END LOOP;
  RETURN 'Reminder: ' || triggered_count || ' (closed)';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION scan_and_trigger_free_question_recovery()
RETURNS TEXT AS $$
DECLARE
  session_record RECORD;
  service_key TEXT;
  supabase_url TEXT;
  triggered_count INTEGER := 0;
BEGIN
  supabase_url := 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
  service_key := get_service_role_key();
  IF service_key IS NULL THEN RETURN 'ERROR: no key'; END IF;

  FOR session_record IN
    SELECT s.id as session_id, s.lead_id, s.phone
    FROM bot_sessions s
    WHERE s.flow_type = 'free_question_flow'
      AND s.completed_at IS NULL
      AND s.last_message_at IS NOT NULL
      AND s.last_message_at <= NOW() - INTERVAL '30 minutes'
      AND s.last_message_at >= NOW() - INTERVAL '24 hours'
    LIMIT 10
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/botHandleReply',
      headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||service_key,'apikey',service_key),
      body := jsonb_build_object('phone',session_record.phone,'message','_system_recovery','idMessage','recovery_'||session_record.session_id)
    );
    UPDATE bot_sessions SET completed_at=NOW(), outcome_state='recovery_sent_and_closed' WHERE id=session_record.session_id;
    triggered_count := triggered_count + 1;
  END LOOP;
  RETURN 'Recovery: ' || triggered_count || ' (closed)';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
