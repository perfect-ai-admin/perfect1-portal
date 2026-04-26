-- =============================================================
-- FollowUp Bot — Smoke Tests
-- Run these manually in Supabase SQL editor AFTER deploying:
--   1. Both migrations (20260411110000, 20260411120000)
--   2. Edge functions (followupDispatch, triggerManualFollowup)
--   3. n8n workflow (optional — hardening migration sends directly to edge function)
--   4. pg_cron + pg_net extensions
--   5. ALTER DATABASE postgres SET app.followup_dispatch_url = '...';
--      ALTER DATABASE postgres SET app.followup_service_role = '...';
--
-- Each test block prints expected vs actual. Replace :TEST_LEAD_ID.
-- =============================================================

-- ---- SETUP: create a test lead ----
-- (Run once; reuse id for all tests)
INSERT INTO leads (name, phone, pipeline_stage, whatsapp_opt_in, do_not_contact, followup_paused)
VALUES ('TEST followup bot', '+972501234567', 'new_lead', true, false, false)
RETURNING id;  -- <— copy this UUID; referred to as :TEST_LEAD_ID below

-- ============================================================
-- SCENARIO 0: configuration health
-- ============================================================
SELECT
  followup_dispatch_url()                         AS dispatch_url,
  followup_service_role() <> ''                   AS service_role_set,
  (SELECT count(*) FROM automation_rules
    WHERE is_active = true)                       AS active_rules,
  (SELECT count(*) FROM cron.job
    WHERE jobname = 'followup-tick')              AS cron_job_scheduled;

-- Expected: dispatch_url non-empty, service_role_set=true, active_rules>=11, cron_job_scheduled=1

-- ============================================================
-- SCENARIO 0b: cron health (run 5+ minutes after deploy)
-- ============================================================
SELECT followup_cron_health();

-- Expected: { "ok": true, "last_status": "succeeded", "dispatch_url_configured": true }

-- ============================================================
-- SCENARIO 1: status change → quote_sent
-- ============================================================
-- BEFORE: no logs for the test lead
SELECT count(*) AS logs_before FROM automation_logs WHERE lead_id = :'TEST_LEAD_ID';

-- Trigger:
UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = :'TEST_LEAD_ID';

-- Wait 2-5 seconds for async webhook to resolve, then:
SELECT rule_name, result, created_at
FROM automation_logs
WHERE lead_id = :'TEST_LEAD_ID'
ORDER BY created_at DESC
LIMIT 5;

-- Expected row: rule_name='quote_sent_day0', result='sent'
-- Also verify the lead was updated:
SELECT followup_sequence_name, followup_sequence_step, next_followup_date
FROM leads WHERE id = :'TEST_LEAD_ID';
-- Expected: quote_followup / 1 / (now + 1d)

-- ============================================================
-- SCENARIO 6: duplicate event protection
-- ============================================================
-- Fire the same status_change twice by toggling:
UPDATE leads SET pipeline_stage = 'contacted' WHERE id = :'TEST_LEAD_ID';
UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = :'TEST_LEAD_ID';

-- Because event_key buckets status_change by changed_at timestamp,
-- the two dispatches have different keys. To test true dedup, call the
-- edge function directly twice with the SAME payload:
--
--   curl -X POST https://<project>.supabase.co/functions/v1/followupDispatch \
--     -H "Authorization: Bearer $SERVICE_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"event_type":"status_change","lead_id":":TEST_LEAD_ID","from_status":"contacted","to_status":"quote_sent","changed_at":"2026-04-11T12:00:00Z"}'
--
-- Run twice. Expected second response: executions[*].result='dedup'
SELECT rule_name, result, count(*)
FROM automation_logs
WHERE lead_id = :'TEST_LEAD_ID' AND rule_name = 'quote_sent_day0'
GROUP BY 1, 2;
-- Only ONE row should have result='sent' for the same event.

-- ============================================================
-- SCENARIO 2: waiting_for_documents sequence
-- ============================================================
UPDATE leads SET
  pipeline_stage = 'waiting_for_documents',
  followup_sequence_name = NULL,
  followup_sequence_step = 0,
  next_followup_date = NULL,
  followup_paused = false
WHERE id = :'TEST_LEAD_ID';

-- Expect: waiting_documents_day0 → sent, sequence=docs_followup, step=1
SELECT followup_sequence_name, followup_sequence_step FROM leads WHERE id = :'TEST_LEAD_ID';

-- Manually advance time for the cron tick test:
UPDATE leads SET next_followup_date = now() - interval '1 minute'
WHERE id = :'TEST_LEAD_ID';

-- Trigger the cron handler manually via edge function:
--   curl -X POST .../followupDispatch -d '{"event_type":"cron_tick"}'
-- Expected: waiting_documents_day2 executes, step advances to 2.

-- ============================================================
-- SCENARIO 3: no_answer recovery with cooldown
-- ============================================================
UPDATE leads SET
  pipeline_stage = 'no_answer',
  followup_sequence_name = NULL,
  followup_sequence_step = 0,
  next_followup_date = NULL,
  followup_paused = false
WHERE id = :'TEST_LEAD_ID';

-- First attempt → sent.
-- Immediately fire cron_tick again: expected result='skipped_cooldown' (20h window).
-- After 20h simulated: advance next_followup_date and call cron_tick again.

-- ============================================================
-- SCENARIO 4: inbound reply stops sequence
-- ============================================================
-- Insert an inbound message — the trigger trg_followup_inbound fires:
INSERT INTO whatsapp_messages (lead_id, phone, direction, sender_type, message_text, message_type)
VALUES (:'TEST_LEAD_ID', '+972501234567', 'inbound', 'user', 'כן אני מעוניין, תתקשרו אליי', 'text');

-- Wait a moment, then verify:
SELECT followup_paused, last_contact_at, needs_human, sub_status
FROM leads WHERE id = :'TEST_LEAD_ID';
-- Expected: paused=true, last_contact_at~now, needs_human=true, sub_status='interested'

SELECT rule_name, result, action_payload->>'classification'
FROM automation_logs
WHERE lead_id = :'TEST_LEAD_ID' AND trigger_type = 'inbound_message'
ORDER BY created_at DESC LIMIT 1;
-- Expected: rule_name like 'inbound_interested'

SELECT task_type, priority, status
FROM tasks
WHERE lead_id = :'TEST_LEAD_ID' AND is_automated = true
ORDER BY created_at DESC LIMIT 1;
-- Expected: task_type='inbound_interested', status='pending'

-- ============================================================
-- SCENARIO 5: manual trigger
-- ============================================================
-- From your CRM UI OR direct curl (authenticated user):
--   curl -X POST https://<project>.supabase.co/functions/v1/triggerManualFollowup \
--     -H "Authorization: Bearer <user_jwt>" \
--     -d '{"lead_id":":TEST_LEAD_ID","rule_name":"quote_sent_day0"}'
-- Expected: success=true, dispatch.results[0].result='sent' (or 'skipped_cooldown' if recently sent)

-- ============================================================
-- SCENARIO 7: WhatsApp failure fallback
-- ============================================================
-- Set lead phone to an invalid format, then trigger a rule:
UPDATE leads SET phone = 'invalid', followup_paused = false WHERE id = :'TEST_LEAD_ID';
UPDATE leads SET pipeline_stage = 'contacted' WHERE id = :'TEST_LEAD_ID';
UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = :'TEST_LEAD_ID';

-- Expected:
-- (a) automation_logs has result='failed' with error
-- (b) a task was created with task_type='whatsapp_send_failed'
SELECT rule_name, result, error FROM automation_logs WHERE lead_id = :'TEST_LEAD_ID' ORDER BY created_at DESC LIMIT 1;
SELECT task_type, priority, notes FROM tasks WHERE lead_id = :'TEST_LEAD_ID' AND task_type = 'whatsapp_send_failed';

-- Restore:
UPDATE leads SET phone = '+972501234567' WHERE id = :'TEST_LEAD_ID';

-- ============================================================
-- SCENARIO 8: cron tick execution
-- ============================================================
-- Create a lead with a due followup:
UPDATE leads SET
  followup_sequence_name = 'quote_followup',
  followup_sequence_step = 1,
  next_followup_date = now() - interval '10 seconds',
  followup_paused = false,
  do_not_contact = false
WHERE id = :'TEST_LEAD_ID';

-- Wait for the next cron run (up to 5 min) or force via:
SELECT followup_dispatch(jsonb_build_object('event_type', 'cron_tick', 'ts', now()));

-- Verify:
SELECT rule_name, result FROM automation_logs
WHERE lead_id = :'TEST_LEAD_ID' AND trigger_type = 'cron_tick'
ORDER BY created_at DESC LIMIT 1;
-- Expected: result='sent' (or skipped_cooldown if too soon)

-- ============================================================
-- KPI view sanity
-- ============================================================
SELECT * FROM followup_kpi_daily WHERE day >= current_date - interval '1 day' ORDER BY day DESC, action_type;

-- ============================================================
-- CLEANUP
-- ============================================================
DELETE FROM automation_logs WHERE lead_id = :'TEST_LEAD_ID';
DELETE FROM tasks WHERE lead_id = :'TEST_LEAD_ID';
DELETE FROM whatsapp_messages WHERE lead_id = :'TEST_LEAD_ID';
DELETE FROM leads WHERE id = :'TEST_LEAD_ID';
