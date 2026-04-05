-- Migration: create_lead_and_trigger_bot RPC Function
-- Date: 2026-04-05
-- Purpose: Unified RPC function to create lead + classify intent + initialize bot flow
-- This consolidates the lead creation + bot flow logic into a single atomic operation

-- ============================================
-- RPC function: create_lead_and_trigger_bot
-- ============================================
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
  v_page_intent text := 'guide';
  v_flow_type text := 'guide_flow';
  v_service_type text := 'osek_patur_general';
  v_error_msg text := '';
BEGIN
  -- Input validation
  IF p_name IS NULL OR p_name = '' THEN
    v_error_msg := 'שם חובה';
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, false, v_error_msg;
    RETURN;
  END IF;

  IF p_phone IS NULL OR p_phone = '' THEN
    v_error_msg := 'טלפון חובה';
    RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::text, false, v_error_msg;
    RETURN;
  END IF;

  -- 1. Classify intent based on page_slug
  -- This mirrors the logic from botIntentClassifier
  CASE p_page_slug
    WHEN 'osek-patur' THEN
      v_page_intent := 'guide';
      v_flow_type := 'guide_flow';
      v_service_type := 'osek_patur_general';
    WHEN 'open-osek-patur' THEN
      v_page_intent := 'service';
      v_flow_type := 'service_flow';
      v_service_type := 'open_osek_patur';
    WHEN 'osek-murshe' THEN
      v_page_intent := 'guide';
      v_flow_type := 'guide_flow';
      v_service_type := 'osek_murshe_general';
    WHEN 'open-osek-murshe' THEN
      v_page_intent := 'service';
      v_flow_type := 'service_flow';
      v_service_type := 'open_osek_murshe';
    WHEN 'hevra-bam' THEN
      v_page_intent := 'guide';
      v_flow_type := 'guide_flow';
      v_service_type := 'hevra_bam_general';
    WHEN 'compare/osek-patur-vs-murshe' THEN
      v_page_intent := 'comparison';
      v_flow_type := 'guide_flow';
      v_service_type := 'comparison_guide';
    ELSE
      v_page_intent := 'guide';
      v_flow_type := 'guide_flow';
      v_service_type := 'general';
  END CASE;

  -- 2. Insert lead with all bot-related fields
  INSERT INTO leads (
    name,
    phone,
    email,
    notes,
    source_page,
    page_intent,
    flow_type,
    service_type,
    source,
    interaction_type,
    status,
    pipeline_stage,
    temperature,
    contact_attempts,
    priority,
    bot_current_step,
    bot_started_at
  ) VALUES (
    p_name,
    p_phone,
    COALESCE(NULLIF(p_email, ''), NULL),
    p_message,
    COALESCE(NULLIF(p_page_slug, ''), p_business_name, 'landing-page'),
    v_page_intent,
    v_flow_type,
    v_service_type,
    'sales_portal',
    'form',
    'new',
    'new_lead',
    'warm',
    0,
    'medium',
    'opening',
    NOW()
  )
  RETURNING id INTO v_lead_id;

  -- 3. Return successful result
  RETURN QUERY SELECT
    v_lead_id,
    v_page_intent,
    v_flow_type,
    true,
    'ליד נוצר בהצלחה';

  RETURN;

EXCEPTION WHEN OTHERS THEN
  -- Return error
  v_error_msg := COALESCE(SQLERRM, 'שגיאה לא ידועה');
  RETURN QUERY SELECT
    NULL::uuid,
    NULL::text,
    NULL::text,
    false,
    v_error_msg;
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION create_lead_and_trigger_bot TO anon, authenticated;

-- ============================================
-- Comments (documentation)
-- ============================================
COMMENT ON FUNCTION create_lead_and_trigger_bot IS
  'Unified function to create a lead + classify intent + initialize bot flow. '
  'Input: name, phone, email (optional), message (optional), page_slug, business_name. '
  'Returns: lead_id, page_intent, flow_type, success (boolean), message (text).';
