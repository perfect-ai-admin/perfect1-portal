-- =============================================================
-- FollowUp Bot — Automation Engine
-- Date: 2026-04-11
-- Adds: lead fields, automation_rules, automation_logs,
--       dispatch trigger, pg_cron tick, seed rules.
-- IDEMPOTENT: safe to run multiple times.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================================
-- 1. Extend leads with FollowUp fields (additive, non-breaking)
-- =============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sub_status text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_sequence_name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_sequence_step int DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS followup_paused boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS do_not_contact boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS needs_human boolean DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS whatsapp_opt_in boolean DEFAULT true;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_status text;

-- next_followup_date already exists (migration 20260409). Index it for cron polling.
CREATE INDEX IF NOT EXISTS idx_leads_followup_due
  ON leads(next_followup_date)
  WHERE followup_paused = false AND do_not_contact = false;

CREATE INDEX IF NOT EXISTS idx_leads_sequence
  ON leads(followup_sequence_name, followup_sequence_step)
  WHERE followup_sequence_name IS NOT NULL;

-- =============================================================
-- 2. automation_rules — data-driven rule engine
-- =============================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  trigger_type text NOT NULL
    CHECK (trigger_type IN ('status_change', 'cron_tick', 'inbound_message', 'manual')),
  trigger_config jsonb NOT NULL DEFAULT '{}',
  conditions jsonb NOT NULL DEFAULT '[]',
  action_type text NOT NULL
    CHECK (action_type IN ('send_whatsapp', 'create_task', 'update_lead', 'start_sequence', 'stop_sequence')),
  action_config jsonb NOT NULL DEFAULT '{}',
  cooldown_hours int NOT NULL DEFAULT 0,
  max_per_lead int,
  priority int NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger
  ON automation_rules(trigger_type, is_active);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='automation_rules' AND policyname='arules_service_role') THEN
    EXECUTE 'CREATE POLICY "arules_service_role" ON automation_rules FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='automation_rules' AND policyname='arules_select_auth') THEN
    EXECUTE 'CREATE POLICY "arules_select_auth" ON automation_rules FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =============================================================
-- 3. automation_logs — execution audit + idempotency guard
-- =============================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  rule_name text,
  event_key text NOT NULL,
  trigger_type text,
  action_type text,
  action_payload jsonb,
  result text NOT NULL
    CHECK (result IN ('pending', 'sent', 'skipped_cooldown', 'skipped_stop', 'skipped_dnc', 'skipped_quiet_hours', 'skipped_max', 'failed', 'dedup')),
  error text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_logs_event_key
  ON automation_logs(event_key);
CREATE INDEX IF NOT EXISTS idx_automation_logs_lead
  ON automation_logs(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_lead_sent
  ON automation_logs(rule_id, lead_id, created_at DESC)
  WHERE result = 'sent';

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='automation_logs' AND policyname='alogs_service_role') THEN
    EXECUTE 'CREATE POLICY "alogs_service_role" ON automation_logs FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='automation_logs' AND policyname='alogs_select_auth') THEN
    EXECUTE 'CREATE POLICY "alogs_select_auth" ON automation_logs FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- =============================================================
-- 4. Dispatcher URL — stored in app settings
-- =============================================================
-- NOTE: set once manually in Supabase dashboard:
-- ALTER DATABASE postgres SET app.followup_dispatcher_url = 'https://n8n.perfect-1.one/webhook/followup-dispatcher';

CREATE OR REPLACE FUNCTION followup_dispatcher_url() RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    current_setting('app.followup_dispatcher_url', true),
    'https://n8n.perfect-1.one/webhook/followup-dispatcher'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================================
-- 5. Status-change trigger → dispatch to FollowUp Bot
--    (separate from existing notify_n8n_lead_change which
--     targets a different webhook — both can coexist)
-- =============================================================
CREATE OR REPLACE FUNCTION notify_followup_status_change() RETURNS trigger AS $$
DECLARE
  payload jsonb;
BEGIN
  IF NEW.pipeline_stage IS DISTINCT FROM OLD.pipeline_stage THEN
    payload := jsonb_build_object(
      'event_type', 'status_change',
      'lead_id', NEW.id,
      'from_status', OLD.pipeline_stage,
      'to_status', NEW.pipeline_stage,
      'changed_at', now()
    );

    PERFORM net.http_post(
      followup_dispatcher_url(),
      payload,
      '{}'::jsonb,
      '{"Content-Type": "application/json"}'::jsonb,
      5000
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_followup_status_change ON leads;
CREATE TRIGGER trg_followup_status_change
  AFTER UPDATE OF pipeline_stage ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_followup_status_change();

-- =============================================================
-- 6. pg_cron tick — every 5 minutes
-- =============================================================
DO $$ BEGIN
  PERFORM cron.unschedule('followup-tick');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'followup-tick',
  '*/5 * * * *',
  $cron$
    SELECT net.http_post(
      followup_dispatcher_url(),
      jsonb_build_object('event_type', 'cron_tick', 'ts', now()),
      '{}'::jsonb,
      '{"Content-Type": "application/json"}'::jsonb,
      5000
    );
  $cron$
);

-- =============================================================
-- 7. KPI view
-- =============================================================
CREATE OR REPLACE VIEW followup_kpi_daily AS
SELECT
  date_trunc('day', created_at) AS day,
  action_type,
  result,
  count(*) AS n
FROM automation_logs
GROUP BY 1, 2, 3;

-- =============================================================
-- 8. Seed rules — 3 MVP sequences
-- =============================================================

-- -------- Sequence 1: Quote Follow-up --------
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('quote_sent_day0',
 'Initial quote message when lead moves to quote_sent',
 'status_change',
 '{"to_status":"quote_sent"}'::jsonb,
 'send_whatsapp',
 '{"template":"quote_sent_day0","body":"שלום {{name}}, שלחנו לך את הצעת המחיר. נשמח לשמוע מה דעתך.","then_update":{"next_followup_date":"+1d","followup_sequence_name":"quote_followup","followup_sequence_step":1}}'::jsonb,
 0, 1),

('quote_reminder_day1',
 'Day 1 reminder in quote_followup sequence',
 'cron_tick',
 '{"sequence":"quote_followup","step":1}'::jsonb,
 'send_whatsapp',
 '{"template":"quote_reminder_day1","body":"היי {{name}}, רק לוודא שההצעה התקבלה. יש שאלות?","then_update":{"next_followup_date":"+2d","followup_sequence_step":2}}'::jsonb,
 20, 1),

('quote_reminder_day3',
 'Day 3 final reminder in quote_followup sequence',
 'cron_tick',
 '{"sequence":"quote_followup","step":2}'::jsonb,
 'send_whatsapp',
 '{"template":"quote_reminder_day3","body":"שלום {{name}}, זו תזכורת אחרונה לגבי ההצעה. אשמח לתשובה.","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0}}'::jsonb,
 20, 1)
ON CONFLICT (name) DO NOTHING;

-- -------- Sequence 2: Waiting for Documents --------
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('waiting_documents_day0',
 'Initial documents request when lead moves to waiting_for_documents',
 'status_change',
 '{"to_status":"waiting_for_documents"}'::jsonb,
 'send_whatsapp',
 '{"template":"waiting_documents_day0","body":"שלום {{name}}, כדי להתקדם נזדקק למסמכים הבאים: תעודת זהות, אישור ניהול חשבון בנק. נא להעלות כאן: {{upload_link}}","then_update":{"next_followup_date":"+2d","followup_sequence_name":"docs_followup","followup_sequence_step":1}}'::jsonb,
 0, 1),

('waiting_documents_day2',
 'Day 2 reminder for missing documents',
 'cron_tick',
 '{"sequence":"docs_followup","step":1}'::jsonb,
 'send_whatsapp',
 '{"template":"waiting_documents_day2","body":"תזכורת ידידותית — עדיין ממתינים למסמכים כדי להמשיך.","then_update":{"next_followup_date":"+2d","followup_sequence_step":2}}'::jsonb,
 20, 1),

('waiting_documents_day4',
 'Day 4 final reminder + open task for agent',
 'cron_tick',
 '{"sequence":"docs_followup","step":2}'::jsonb,
 'create_task',
 '{"task_type":"call_lead","priority":"high","notes":"לקוח לא שלח מסמכים לאחר 4 ימים — צור קשר ידני","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0,"needs_human":true}}'::jsonb,
 20, 1)
ON CONFLICT (name) DO NOTHING;

-- -------- Sequence 3: No Answer Recovery --------
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours, max_per_lead)
VALUES
('no_answer_day0',
 'First recovery attempt when lead moves to no_answer',
 'status_change',
 '{"to_status":"no_answer"}'::jsonb,
 'send_whatsapp',
 '{"template":"no_answer_day0","body":"שלום {{name}}, ניסיתי להתקשר ולא הצלחתי לתפוס אותך. מתי נוח לדבר?","then_update":{"next_followup_date":"+1d","followup_sequence_name":"no_answer_recovery","followup_sequence_step":1}}'::jsonb,
 0, 1),

('no_answer_day1',
 'Second recovery attempt — different phrasing',
 'cron_tick',
 '{"sequence":"no_answer_recovery","step":1}'::jsonb,
 'send_whatsapp',
 '{"template":"no_answer_day1","body":"היי {{name}}, רק לוודא שקיבלת את ההודעה שלי. אפשר גם להחזיר לי כאן בוואטסאפ.","then_update":{"next_followup_date":"+2d","followup_sequence_step":2}}'::jsonb,
 20, 1),

('no_answer_day3',
 'Third and final recovery attempt',
 'cron_tick',
 '{"sequence":"no_answer_recovery","step":2}'::jsonb,
 'send_whatsapp',
 '{"template":"no_answer_day3","body":"שלום {{name}}, זו הפנייה האחרונה מצדי. אם תרצה להתקדם — אני זמין.","then_update":{"next_followup_date":null,"followup_sequence_name":null,"followup_sequence_step":0}}'::jsonb,
 20, 1)
ON CONFLICT (name) DO NOTHING;

-- -------- Stop rules --------
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, action_type, action_config, cooldown_hours)
VALUES
('stop_on_paid',
 'Stop any active sequence when lead becomes paid',
 'status_change',
 '{"to_status":"paid"}'::jsonb,
 'stop_sequence',
 '{}'::jsonb,
 0),
('stop_on_not_relevant',
 'Stop any active sequence when lead becomes not_relevant',
 'status_change',
 '{"to_status":"not_relevant"}'::jsonb,
 'stop_sequence',
 '{}'::jsonb,
 0)
ON CONFLICT (name) DO NOTHING;
