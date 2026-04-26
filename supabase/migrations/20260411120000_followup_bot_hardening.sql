-- =============================================================
-- FollowUp Bot — Hardening Pass
-- Date: 2026-04-11
-- Repoints triggers/cron to the followupDispatch edge function
-- instead of n8n webhook (n8n is now a thin relay, not the brain).
-- Adds INSERT trigger, inbound whatsapp_messages trigger,
-- cron health check function. IDEMPOTENT.
-- =============================================================

-- =============================================================
-- 1. Helper: resolve followupDispatch URL from settings
-- =============================================================
-- Set once per environment:
--   ALTER DATABASE postgres SET app.followup_dispatch_url = 'https://<project>.supabase.co/functions/v1/followupDispatch';
--   ALTER DATABASE postgres SET app.followup_service_role = '<service_role_jwt>';
--
-- Fallback to n8n webhook is kept so the old value still works.

CREATE OR REPLACE FUNCTION followup_dispatch_url() RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.followup_dispatch_url', true),
    current_setting('app.followup_dispatcher_url', true),
    ''
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION followup_service_role() RETURNS text AS $$
BEGIN
  RETURN COALESCE(current_setting('app.followup_service_role', true), '');
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================
-- 2. Central dispatch helper — called from all triggers/cron
-- =============================================================
CREATE OR REPLACE FUNCTION followup_dispatch(payload jsonb) RETURNS void AS $$
DECLARE
  url text := followup_dispatch_url();
  token text := followup_service_role();
  headers jsonb;
BEGIN
  IF url = '' THEN
    RAISE NOTICE 'followup_dispatch: no URL configured, skipping';
    RETURN;
  END IF;

  headers := '{"Content-Type": "application/json"}'::jsonb;
  IF token <> '' THEN
    headers := headers || jsonb_build_object('Authorization', 'Bearer ' || token);
  END IF;

  PERFORM net.http_post(
    url,
    payload,
    '{}'::jsonb,
    headers,
    5000
  );
EXCEPTION WHEN OTHERS THEN
  -- Never block the original transaction on webhook failures
  RAISE NOTICE 'followup_dispatch failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 3. Re-wire status change trigger to use the helper
-- =============================================================
CREATE OR REPLACE FUNCTION notify_followup_status_change() RETURNS trigger AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    PERFORM followup_dispatch(jsonb_build_object(
      'event_type', 'status_change',
      'lead_id', NEW.id,
      'from_status', COALESCE(OLD.pipeline_stage, ''),
      'to_status', COALESCE(NEW.pipeline_stage, ''),
      'changed_at', now()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 4. INSERT trigger — new leads created directly with actionable status
-- =============================================================
CREATE OR REPLACE FUNCTION notify_followup_new_lead() RETURNS trigger AS $$
BEGIN
  IF NEW.pipeline_stage IS NOT NULL
     AND NEW.pipeline_stage NOT IN ('new_lead', 'contacted') THEN
    PERFORM followup_dispatch(jsonb_build_object(
      'event_type', 'status_change',
      'lead_id', NEW.id,
      'from_status', '',
      'to_status', NEW.pipeline_stage,
      'changed_at', now()
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_followup_new_lead ON leads;
CREATE TRIGGER trg_followup_new_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_followup_new_lead();

-- =============================================================
-- 5. Inbound message trigger — whatsapp_messages → dispatch
-- =============================================================
CREATE OR REPLACE FUNCTION notify_followup_inbound() RETURNS trigger AS $$
BEGIN
  -- Only care about new inbound messages from users.
  -- already_stored=true tells the edge function NOT to re-insert the row
  -- (this row already exists), preventing infinite recursion.
  IF NEW.direction = 'inbound' AND NEW.sender_type = 'user' THEN
    PERFORM followup_dispatch(jsonb_build_object(
      'event_type', 'inbound_message',
      'lead_id', NEW.lead_id,
      'phone', NEW.phone,
      'message_text', COALESCE(NEW.message_text, ''),
      'greenapi_message_id', NEW.greenapi_message_id,
      'already_stored', true,
      'raw_payload', COALESCE(NEW.raw_payload, '{}'::jsonb)
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_followup_inbound ON whatsapp_messages;
CREATE TRIGGER trg_followup_inbound
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_followup_inbound();

-- =============================================================
-- 6. Repoint the pg_cron tick to the new helper
-- =============================================================
DO $$ BEGIN
  PERFORM cron.unschedule('followup-tick');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'followup-tick',
  '*/5 * * * *',
  $cron$ SELECT followup_dispatch(jsonb_build_object('event_type', 'cron_tick', 'ts', now())); $cron$
);

-- =============================================================
-- 7. Cron health check — callable from SQL or from an admin page
-- =============================================================
CREATE OR REPLACE FUNCTION followup_cron_health() RETURNS jsonb AS $$
DECLARE
  job_id bigint;
  last_run timestamptz;
  last_status text;
  last_msg text;
  ok boolean;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'followup-tick';
  IF job_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'followup-tick job not found');
  END IF;

  SELECT start_time, status, return_message
  INTO last_run, last_status, last_msg
  FROM cron.job_run_details
  WHERE jobid = job_id
  ORDER BY start_time DESC
  LIMIT 1;

  ok := (last_status = 'succeeded') AND (last_run > now() - interval '15 minutes');

  RETURN jsonb_build_object(
    'ok', ok,
    'job_id', job_id,
    'last_run', last_run,
    'last_status', last_status,
    'last_message', last_msg,
    'dispatch_url_configured', followup_dispatch_url() <> ''
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 8. Trigger-overlap note
-- =============================================================
-- The existing trg_notify_n8n_lead_change (migration 20260331100000)
-- sends a DIFFERENT payload to a DIFFERENT webhook (perfect-one-osek-patur)
-- and is used by the legacy bot-v5/mentor flow. It does NOT send
-- WhatsApp directly — it delegates to n8n. Keeping it active is safe:
-- both triggers are additive and have independent side effects.
-- If the legacy flow is decommissioned, drop it with:
--   DROP TRIGGER trg_notify_n8n_lead_change ON leads;

-- =============================================================
-- 9. Small index to speed lookups from inbound handler
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_wamsg_lead_direction
  ON whatsapp_messages(lead_id, direction, created_at DESC);
