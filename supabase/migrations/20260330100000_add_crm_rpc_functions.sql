-- Migration: add_crm_rpc_functions
-- Date: 2026-03-30
-- Purpose: Postgres RPC functions for CRM operations, bypassing Edge Functions CORS issues

-- ============================================
-- RPC function: Update lead pipeline stage
-- ============================================
CREATE OR REPLACE FUNCTION crm_update_lead_stage(
  p_lead_id uuid,
  p_new_stage text,
  p_change_reason text DEFAULT NULL,
  p_lost_reason_id text DEFAULT NULL,
  p_lost_reason_note text DEFAULT NULL,
  p_follow_up_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_stage text;
  v_admin_id uuid;
  v_new_status text;
BEGIN
  -- Check if caller is admin
  SELECT id INTO v_admin_id
  FROM customers
  WHERE email = (auth.jwt() ->> 'email') AND role = 'admin';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  -- Get current stage
  SELECT pipeline_stage INTO v_old_stage
  FROM leads
  WHERE id = p_lead_id AND source = 'sales_portal';

  IF v_old_stage IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  -- Determine new status
  IF p_new_stage IN ('converted') THEN
    v_new_status := 'converted';
  ELSIF p_new_stage IN ('not_interested', 'disqualified', 'duplicate', 'spam') THEN
    v_new_status := 'closed';
  ELSE
    v_new_status := 'active';
  END IF;

  -- Update lead
  UPDATE leads SET
    pipeline_stage = p_new_stage,
    status = v_new_status,
    pipeline_entered_at = now(),
    updated_at = now(),
    converted_at = CASE WHEN p_new_stage = 'converted' THEN now() ELSE converted_at END,
    is_spam = CASE WHEN p_new_stage = 'spam' THEN true ELSE is_spam END,
    lost_reason_note = CASE WHEN p_new_stage IN ('not_interested', 'disqualified') THEN COALESCE(p_lost_reason_note, lost_reason_note) ELSE lost_reason_note END,
    sla_deadline = NULL
  WHERE id = p_lead_id AND source = 'sales_portal';

  -- Write status history
  INSERT INTO status_history (entity_type, entity_id, old_stage, new_stage, old_status, new_status, changed_by, change_reason, source, metadata)
  VALUES ('lead', p_lead_id, v_old_stage, p_new_stage, v_old_stage, p_new_stage, v_admin_id, p_change_reason, 'sales_portal',
    jsonb_build_object('lost_reason_id', p_lost_reason_id, 'lost_reason_note', p_lost_reason_note, 'follow_up_date', p_follow_up_date));

  -- Create follow-up task if needed
  IF p_follow_up_date IS NOT NULL AND p_new_stage IN ('not_interested', 'disqualified') THEN
    INSERT INTO tasks (title, description, task_type, lead_id, assigned_to, created_by, priority, status, due_date, source)
    VALUES ('מעקב ליד שנפל', 'ליד סומן כ-"' || p_new_stage || '". סיבה: ' || COALESCE(p_lost_reason_note, 'לא צוינה'),
      'follow_up', p_lead_id, v_admin_id, v_admin_id, 'medium', 'pending', p_follow_up_date, 'sales_portal');
  END IF;

  RETURN jsonb_build_object('success', true, 'new_stage', p_new_stage, 'old_stage', v_old_stage);
END;
$$;

-- ============================================
-- RPC function: Delete lead (soft or hard)
-- ============================================
CREATE OR REPLACE FUNCTION crm_delete_lead(
  p_lead_id uuid,
  p_hard_delete boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_old_stage text;
BEGIN
  -- Check if caller is admin
  SELECT id INTO v_admin_id
  FROM customers
  WHERE email = (auth.jwt() ->> 'email') AND role = 'admin';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  -- Verify lead exists
  SELECT pipeline_stage INTO v_old_stage
  FROM leads
  WHERE id = p_lead_id AND source = 'sales_portal';

  IF v_old_stage IS NULL THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF p_hard_delete THEN
    -- Delete related data first
    DELETE FROM communications WHERE lead_id = p_lead_id AND source = 'sales_portal';
    DELETE FROM tasks WHERE lead_id = p_lead_id AND source = 'sales_portal';
    DELETE FROM status_history WHERE entity_id = p_lead_id AND entity_type = 'lead' AND source = 'sales_portal';
    -- Delete the lead itself
    DELETE FROM leads WHERE id = p_lead_id AND source = 'sales_portal';
  ELSE
    -- Soft delete: move to disqualified
    UPDATE leads SET
      pipeline_stage = 'disqualified',
      status = 'closed',
      updated_at = now(),
      sla_deadline = NULL
    WHERE id = p_lead_id AND source = 'sales_portal';

    -- Log the soft delete
    INSERT INTO status_history (entity_type, entity_id, old_stage, new_stage, changed_by, change_reason, source)
    VALUES ('lead', p_lead_id, v_old_stage, 'disqualified', v_admin_id, 'נמחק מה-CRM', 'sales_portal');
  END IF;

  RETURN jsonb_build_object('success', true, 'deleted', p_lead_id);
END;
$$;

-- ============================================
-- RPC function: Add communication/note
-- ============================================
CREATE OR REPLACE FUNCTION crm_add_communication(
  p_lead_id uuid,
  p_channel text,
  p_direction text DEFAULT 'internal',
  p_content text DEFAULT NULL,
  p_subject text DEFAULT NULL,
  p_outcome text DEFAULT NULL,
  p_follow_up_needed boolean DEFAULT false,
  p_follow_up_date timestamptz DEFAULT NULL,
  p_next_step text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_comm_id uuid;
BEGIN
  -- Check if caller is admin
  SELECT id INTO v_admin_id
  FROM customers
  WHERE email = (auth.jwt() ->> 'email') AND role = 'admin';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  -- Insert communication
  INSERT INTO communications (lead_id, agent_id, channel, direction, subject, content, outcome, follow_up_needed, follow_up_date, next_step, source)
  VALUES (
    p_lead_id,
    v_admin_id,
    p_channel,
    COALESCE(p_direction, CASE WHEN p_channel = 'note' THEN 'internal' ELSE NULL END),
    p_subject,
    p_content,
    p_outcome,
    p_follow_up_needed,
    p_follow_up_date,
    p_next_step,
    'sales_portal'
  )
  RETURNING id INTO v_comm_id;

  -- Update lead activity timestamp
  UPDATE leads SET updated_at = now() WHERE id = p_lead_id AND source = 'sales_portal';

  -- Create follow-up task if needed
  IF p_follow_up_needed AND p_follow_up_date IS NOT NULL THEN
    INSERT INTO tasks (title, task_type, lead_id, assigned_to, created_by, priority, status, due_date, source)
    VALUES (COALESCE(p_next_step, 'מעקב'), 'follow_up', p_lead_id, v_admin_id, v_admin_id, 'medium', 'pending', p_follow_up_date, 'sales_portal');
  END IF;

  RETURN jsonb_build_object('success', true, 'id', v_comm_id);
END;
$$;

-- ============================================
-- Grant execute permissions to authenticated users
-- ============================================
GRANT EXECUTE ON FUNCTION crm_update_lead_stage TO authenticated;
GRANT EXECUTE ON FUNCTION crm_delete_lead TO authenticated;
GRANT EXECUTE ON FUNCTION crm_add_communication TO authenticated;
