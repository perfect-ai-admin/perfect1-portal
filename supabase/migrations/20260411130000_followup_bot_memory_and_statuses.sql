-- =============================================================
-- FollowUp Bot — Memory fields + Full status machine
-- Date: 2026-04-11
-- Adds: memory fields on leads, full seed rules for all 13 statuses
--       with 3 variants for no_answer (anti-spam), message templates
--       stored in DB. IDEMPOTENT.
-- =============================================================

-- =============================================================
-- 1. Memory fields (what the bot remembers about each lead)
-- =============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS previous_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_inbound_message text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_inbound_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_outbound_message text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_outbound_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_summary text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS no_answer_attempts int DEFAULT 0;

-- =============================================================
-- 2. Track previous_status automatically
-- =============================================================
CREATE OR REPLACE FUNCTION track_previous_status() RETURNS trigger AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    NEW.previous_status := OLD.pipeline_stage;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_track_previous_status ON leads;
CREATE TRIGGER trg_track_previous_status
  BEFORE UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION track_previous_status();

-- =============================================================
-- 3. Ensure status_history mirrors pipeline_stage changes
--    (status_history table exists already from 20260328100300)
-- =============================================================
CREATE OR REPLACE FUNCTION log_status_history() RETURNS trigger AS $$
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    INSERT INTO status_history(entity_type, entity_id, old_status, new_status, changed_by, change_reason)
    VALUES ('lead', NEW.id, OLD.pipeline_stage, NEW.pipeline_stage, NEW.agent_id, 'followup_bot');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_status_history ON leads;
CREATE TRIGGER trg_log_status_history
  AFTER UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION log_status_history();

-- =============================================================
-- 4. Seed: full status machine rules
--    All 13 statuses. 3 no_answer variants for anti-spam.
--    Messages stored in action_config.body (hebrew, short, human tone).
-- =============================================================

-- ---- attempted_contact (agent tried to call, no answer yet) ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('attempted_contact_day0',
 'Agent tried to call — send soft WhatsApp nudge',
 'status_change',
 '{"to_status":"attempted_contact"}'::jsonb,
 'send_whatsapp',
 '{"body":"שלום {{name}}, ניסיתי להתקשר אליך. מתי נוח לך לדבר כמה דקות?","then_update":{"next_followup_date":"+1d","followup_sequence_name":"attempted_contact","followup_sequence_step":1}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- contacted (we spoke with the lead) ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('contacted_summary',
 'After a call — send short summary + next step',
 'status_change',
 '{"to_status":"contacted"}'::jsonb,
 'send_whatsapp',
 '{"body":"היי {{name}}, היה נעים לדבר איתך 🙏\nאם יש שאלה נוספת אני כאן.","then_update":{"next_followup_date":null}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- interested (lead said yes / interested) ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('interested_acknowledge',
 'Lead expressed interest — acknowledge and set expectation',
 'status_change',
 '{"to_status":"interested"}'::jsonb,
 'send_whatsapp',
 '{"body":"מעולה {{name}} 🎯\nאני מכין לך הצעה ונחזור אליך היום.","then_update":{"next_followup_date":"+1d","needs_human":true}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- payment_pending ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('payment_pending_day0',
 'Payment link sent — initial reminder',
 'status_change',
 '{"to_status":"payment_pending"}'::jsonb,
 'send_whatsapp',
 '{"body":"שלום {{name}}, שלחנו לך קישור לתשלום. ברגע שתסיים נמשיך קדימה.","then_update":{"next_followup_date":"+1d","followup_sequence_name":"payment_followup","followup_sequence_step":1}}'::jsonb,
 0, 1),

('payment_pending_day1',
 'Day 1 payment reminder',
 'cron_tick',
 '{"sequence":"payment_followup","step":1}'::jsonb,
 'send_whatsapp',
 '{"body":"היי {{name}}, רק מזכיר את הקישור לתשלום. משהו לא ברור?","then_update":{"next_followup_date":"+2d","followup_sequence_step":2}}'::jsonb,
 20, 1),

('payment_pending_day3',
 'Day 3 final payment reminder + open task',
 'cron_tick',
 '{"sequence":"payment_followup","step":2}'::jsonb,
 'create_task',
 '{"task_type":"payment_stalled","priority":"high","notes":"לקוח לא השלים תשלום לאחר 3 ימים","then_update":{"next_followup_date":null,"followup_sequence_name":null,"needs_human":true}}'::jsonb,
 20, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- paid (thank you + onboarding) ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('paid_thankyou',
 'Payment received — thank you + stop any active followup',
 'status_change',
 '{"to_status":"paid"}'::jsonb,
 'send_whatsapp',
 '{"body":"תודה {{name}} 🙏 התשלום התקבל.\nנתחיל בטיפול ונעדכן אותך בקרוב.","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0,"followup_paused":false}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- in_process ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('in_process_ack',
 'Moved to in_process — notify lead',
 'status_change',
 '{"to_status":"in_process"}'::jsonb,
 'send_whatsapp',
 '{"body":"שלום {{name}}, התחלנו בטיפול בבקשה שלך. נעדכן ברגע שיש התקדמות.","then_update":{"next_followup_date":null}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- completed ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('completed_thanks',
 'Service completed — close out message',
 'status_change',
 '{"to_status":"completed"}'::jsonb,
 'send_whatsapp',
 '{"body":"{{name}}, סיימנו 🎉 תודה על האמון.\nאם משהו נוסף יצוץ — אני כאן.","then_update":{"next_followup_date":null,"followup_sequence_name":null}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- ---- no_answer (3 variants, anti-spam) ----
-- Override the basic no_answer seed from the first migration with richer variants.
UPDATE automation_rules
  SET action_config = '{"body":"היי {{name}}, ניסיתי להשיג אותך לגבי {{service_type_label}}. מתי זמין לשיחה?","then_update":{"next_followup_date":"+1d","followup_sequence_name":"no_answer_recovery","followup_sequence_step":1,"no_answer_attempts":1}}'::jsonb
  WHERE name = 'no_answer_day0';

UPDATE automation_rules
  SET action_config = '{"body":"{{name}}, רק לוודא שראית את ההודעה. אפשר להחזיר לי גם כאן בוואטסאפ 🙏","then_update":{"next_followup_date":"+2d","followup_sequence_step":2,"no_answer_attempts":2}}'::jsonb
  WHERE name = 'no_answer_day1';

UPDATE automation_rules
  SET action_config = '{"body":"{{name}}, זו פנייה אחרונה מצדי. אם תרצה להמשיך — פשוט תענה לי כאן ונתקדם.","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0,"pipeline_stage":"followup_later","no_answer_attempts":3}}'::jsonb
  WHERE name = 'no_answer_day3';

-- ---- followup_later (long tail, 14-day cycle) ----
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('followup_later_schedule',
 'Schedule a long-tail recheck 14 days later',
 'status_change',
 '{"to_status":"followup_later"}'::jsonb,
 'update_lead',
 '{"patch":{"next_followup_date":"+14d","followup_sequence_name":"long_tail","followup_sequence_step":1,"followup_paused":false}}'::jsonb,
 0, 1),

('followup_later_touch',
 'Long-tail touch after 14 days',
 'cron_tick',
 '{"sequence":"long_tail","step":1}'::jsonb,
 'send_whatsapp',
 '{"body":"שלום {{name}}, עבר קצת זמן — רק לבדוק אם עכשיו זה הזמן להתקדם.","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0}}'::jsonb,
 0, 2)
ON CONFLICT (name) DO NOTHING;

-- ---- not_relevant (stop everything) ----
-- Existing rule stop_on_not_relevant already handles this. Add a confirmation message.
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('not_relevant_ack',
 'Lead marked not relevant — respectful close',
 'status_change',
 '{"to_status":"not_relevant"}'::jsonb,
 'send_whatsapp',
 '{"body":"תודה {{name}} על העדכון. אם בעתיד תצטרך אותנו — אני כאן 🙏","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_paused":true}}'::jsonb,
 0, 1)
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- 5. Helper view — lead memory snapshot
-- =============================================================
CREATE OR REPLACE VIEW lead_memory AS
SELECT
  l.id,
  l.name,
  l.phone,
  l.pipeline_stage        AS current_status,
  l.previous_status,
  l.sub_status,
  l.followup_sequence_name,
  l.followup_sequence_step,
  l.followup_paused,
  l.do_not_contact,
  l.needs_human,
  l.whatsapp_opt_in,
  l.last_inbound_message,
  l.last_inbound_at,
  l.last_outbound_message,
  l.last_outbound_at,
  l.last_contact_at,
  l.next_followup_date,
  l.no_answer_attempts,
  l.lead_summary,
  l.next_action,
  (SELECT count(*) FROM automation_logs al WHERE al.lead_id = l.id AND al.result = 'sent') AS messages_sent_total,
  (SELECT count(*) FROM status_history sh WHERE sh.entity_id = l.id AND sh.entity_type = 'lead') AS status_transitions
FROM leads l;
