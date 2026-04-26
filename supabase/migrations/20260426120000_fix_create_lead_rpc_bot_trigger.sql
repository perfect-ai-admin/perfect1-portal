-- Fix: create_lead_and_trigger_bot RPC was setting bot_current_step='opening'
-- and bot_started_at=NOW() at lead-insert time, BEFORE any actual WhatsApp send.
-- Result: scan_and_trigger_catchup_bot (which requires bot_current_step IS NULL)
-- would skip these leads forever — they appeared "in flow" but no greeting was ever sent.
--
-- Fix: leave bot_current_step / bot_started_at / flow_type as NULL on insert.
-- Catchup scanner will pick them up within 1 minute and call botStartFlow,
-- which now correctly sets these fields ONLY after a successful WhatsApp send.

CREATE OR REPLACE FUNCTION create_lead_and_trigger_bot(
  p_name text,
  p_phone text,
  p_email text DEFAULT '',
  p_message text DEFAULT '',
  p_page_slug text DEFAULT 'osek-patur',
  p_business_name text DEFAULT 'sales-portal'
)
RETURNS TABLE(
  lead_id uuid,
  page_intent text,
  flow_type text,
  success boolean,
  message text
) AS $$
DECLARE
  v_lead_id uuid;
  v_error_msg text := '';
BEGIN
  IF p_name IS NULL OR p_name = '' THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, false, 'שם חובה'::text;
    RETURN;
  END IF;

  IF p_phone IS NULL OR p_phone = '' THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, false, 'טלפון חובה'::text;
    RETURN;
  END IF;

  -- Insert lead WITHOUT bot-state fields. botStartFlow (triggered by catchup)
  -- will populate page_intent / flow_type / service_type / bot_current_step /
  -- bot_started_at after a successful greeting send.
  INSERT INTO leads (
    name,
    phone,
    email,
    notes,
    source_page,
    source,
    interaction_type,
    status,
    pipeline_stage,
    temperature,
    contact_attempts,
    priority
  ) VALUES (
    p_name,
    p_phone,
    COALESCE(NULLIF(p_email, ''), NULL),
    p_message,
    COALESCE(NULLIF(p_page_slug, ''), p_business_name, 'landing-page'),
    'sales_portal',
    'form',
    'new',
    'new_lead',
    'warm',
    0,
    'medium'
  )
  RETURNING id INTO v_lead_id;

  RETURN QUERY SELECT
    v_lead_id,
    NULL::text,
    NULL::text,
    true,
    'ליד נוצר בהצלחה — בוט יישלח תוך דקה'::text;

  RETURN;

EXCEPTION WHEN OTHERS THEN
  v_error_msg := COALESCE(SQLERRM, 'שגיאה לא ידועה');
  RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, false, v_error_msg;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION create_lead_and_trigger_bot TO anon, authenticated;
