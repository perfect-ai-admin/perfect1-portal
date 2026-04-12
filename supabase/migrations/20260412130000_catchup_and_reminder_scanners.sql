-- =============================================================
-- 3 new scanners:
-- 1. catchup: start bot for leads that entered without botStartFlow
-- 2. callback_reminder: remind leads who started accountant callback but didn't finish
-- 3. free_question_recovery: re-engage leads who asked a question and went silent
-- Date: 2026-04-12
-- =============================================================

-- =====================================================
-- 1. CATCHUP: leads without bot (entered via old n8n or direct insert)
-- Runs: every minute
-- Condition: lead created in last 2 hours, has phone, no flow_type, no bot_current_step
-- Action: call botStartFlow for each
-- =====================================================

CREATE OR REPLACE FUNCTION scan_and_trigger_catchup_bot()
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
    SELECT id, name, phone, source_page
    FROM leads
    WHERE flow_type IS NULL
      AND bot_current_step IS NULL
      AND phone IS NOT NULL
      AND phone != ''
      AND created_at >= NOW() - INTERVAL '2 hours'
      AND created_at <= NOW() - INTERVAL '30 seconds'
      AND source = 'sales_portal'
    LIMIT 10
  LOOP
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/botStartFlow',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'apikey', service_key
      ),
      body := jsonb_build_object(
        'lead_id', lead_record.id,
        'lead_name', lead_record.name,
        'phone', lead_record.phone,
        'page_slug', COALESCE(lead_record.source_page, 'open-osek-patur')
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Catchup bot triggered for ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CALLBACK REMINDER: leads who started accountant questionnaire but didn't finish
-- Runs: every 5 minutes
-- Condition: active session of accountant_callback_flow, last message > 30 min ago, no completion
-- Action: send a gentle reminder via WhatsApp
-- =====================================================

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

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not found in vault';
  END IF;

  FOR session_record IN
    SELECT s.id as session_id, s.lead_id, s.phone, s.current_step
    FROM bot_sessions s
    WHERE s.flow_type IN ('accountant_callback_flow', 'pre_payment_recovery_flow', 'post_payment_onboarding_flow')
      AND s.completed_at IS NULL
      AND s.last_message_at IS NOT NULL
      AND s.last_message_at <= NOW() - INTERVAL '30 minutes'
      AND s.last_message_at >= NOW() - INTERVAL '24 hours'
      AND s.current_step NOT LIKE '%completed%'
    LIMIT 10
  LOOP
    -- Send a gentle reminder via the edge function
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/botHandleReply',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'apikey', service_key
      ),
      body := jsonb_build_object(
        'phone', session_record.phone,
        'message', '_system_reminder',
        'idMessage', 'reminder_' || session_record.session_id
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Callback reminder sent to ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. FREE QUESTION RECOVERY: leads who asked questions and went silent
-- Runs: every 5 minutes
-- Condition: active free_question_flow, last message > 30 min ago
-- Action: send recovery menu
-- =====================================================

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

  IF service_key IS NULL THEN
    RETURN 'ERROR: service_role_key not found in vault';
  END IF;

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
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key,
        'apikey', service_key
      ),
      body := jsonb_build_object(
        'phone', session_record.phone,
        'message', '_system_recovery',
        'idMessage', 'recovery_' || session_record.session_id
      )
    );
    triggered_count := triggered_count + 1;
  END LOOP;

  RETURN 'Free question recovery sent to ' || triggered_count || ' leads';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEDULE the jobs
-- =====================================================

-- Drop existing if they exist
DO $$ BEGIN PERFORM cron.unschedule('catchup_bot'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('callback_reminder'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('free_question_recovery'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'catchup_bot',
  '* * * * *',
  $$SELECT scan_and_trigger_catchup_bot();$$
);

SELECT cron.schedule(
  'callback_reminder',
  '*/5 * * * *',
  $$SELECT scan_and_trigger_callback_reminder();$$
);

SELECT cron.schedule(
  'free_question_recovery',
  '*/5 * * * *',
  $$SELECT scan_and_trigger_free_question_recovery();$$
);
