-- Migration: add_n8n_webhook_trigger
-- Date: 2026-03-31
-- Sends webhook to n8n on INSERT or relevant UPDATE of leads table

-- Enable pg_net for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that sends webhook to n8n when lead changes
CREATE OR REPLACE FUNCTION notify_n8n_lead_change()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://n8n.perfect-1.one/webhook/perfect-one-osek-patur';
  payload JSONB;
  event_type TEXT;
  lost_reason_text TEXT;
  lost_reason_cat TEXT;
  mapped_reason TEXT;
  agent_name_val TEXT;
BEGIN
  -- Determine event type (INSERT handled by submitLeadToN8N - webhook only for status changes)
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    event_type := 'status_change';
  ELSE
    -- No relevant change, skip
    RETURN NEW;
  END IF;

  -- Get lost reason details if exists
  IF NEW.lost_reason_id IS NOT NULL THEN
    SELECT reason_text, category INTO lost_reason_text, lost_reason_cat
    FROM lost_reasons WHERE id = NEW.lost_reason_id;

    -- Map category to n8n reason
    mapped_reason := CASE lost_reason_cat
      WHEN 'price' THEN 'price_too_high'
      WHEN 'timing' THEN 'not_now'
      WHEN 'competitor' THEN 'prefers_other_accountant'
      WHEN 'trust' THEN 'too_complicated'
      WHEN 'communication' THEN
        CASE
          WHEN lost_reason_text ILIKE '%מספר שגוי%' THEN 'wrong_number'
          WHEN lost_reason_text ILIKE '%ספאם%' THEN 'spam'
          ELSE 'no_answer_3_plus'
        END
      WHEN 'need' THEN
        CASE
          WHEN lost_reason_text ILIKE '%סגר%' THEN 'decided_not_to_open_business'
          WHEN lost_reason_text ILIKE '%שכיר%' THEN 'employer_doesnt_allow'
          ELSE 'not_now'
        END
      ELSE 'other'
    END;
  END IF;

  -- Get agent name if assigned
  IF NEW.agent_id IS NOT NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'full_name', email) INTO agent_name_val
    FROM auth.users WHERE id = NEW.agent_id;
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    '_event_type', event_type,
    'lead_id', NEW.id,
    'name', NEW.name,
    'phone', NEW.phone,
    'email', COALESCE(NEW.email, ''),
    'category', COALESCE(NEW.service_type, 'osek_patur'),
    'source_page', COALESCE(NEW.source_page, ''),
    'page_intent', COALESCE(NEW.page_intent, ''),
    'service_type', COALESCE(NEW.service_type, ''),
    'new_status', COALESCE(NEW.pipeline_stage, NEW.status),
    'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.pipeline_stage, OLD.status) ELSE '' END,
    'not_interested_reason', COALESCE(mapped_reason, ''),
    'not_interested_category', COALESCE(lost_reason_cat, ''),
    'had_conversation', COALESCE(NEW.contact_attempts, 0) > 0,
    'agent_name', COALESCE(agent_name_val, ''),
    'notes', COALESCE(NEW.notes, '') || CASE WHEN NEW.lost_reason_note IS NOT NULL THEN ' | ' || NEW.lost_reason_note ELSE '' END
  );

  -- Send webhook (fire-and-forget, non-blocking)
  -- pg_net signature: http_post(url, body, params, headers, timeout_ms)
  PERFORM net.http_post(
    webhook_url,
    payload,
    '{}'::jsonb,
    '{"Content-Type": "application/json"}'::jsonb,
    5000
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on leads table (UPDATE only - INSERT handled by submitLeadToN8N)
DROP TRIGGER IF EXISTS trg_notify_n8n_lead_change ON leads;
CREATE TRIGGER trg_notify_n8n_lead_change
  AFTER UPDATE OF pipeline_stage, status, lost_reason_id
  ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_n8n_lead_change();
