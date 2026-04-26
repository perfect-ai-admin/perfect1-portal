-- =============================================================
-- FollowUp Bot: deferred_quiet_hours support + sequence updates
-- =============================================================

-- ----------------------------------------------------------
-- שלב 1: הוסף deferred_quiet_hours ל-CHECK constraint
-- ----------------------------------------------------------
ALTER TABLE automation_logs DROP CONSTRAINT IF EXISTS automation_logs_result_check;
ALTER TABLE automation_logs ADD CONSTRAINT automation_logs_result_check
  CHECK (result IN (
    'pending', 'sent', 'skipped_cooldown', 'skipped_stop', 'skipped_dnc',
    'skipped_quiet_hours', 'skipped_max', 'failed', 'dedup', 'deferred_quiet_hours'
  ));

-- ----------------------------------------------------------
-- שלב 2: הוסף rule ל-deferred day0 (cron_tick step 0)
-- ----------------------------------------------------------
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_deferred_day0',
  'Follow-up nurture — send deferred day0 message after quiet hours',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":0}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "היי {{name|חברות}}, כאן הצוות מפרפקט וואן 👋\n\nרצינו לחזור אליך אחרי השיחה שלנו.\n\nפרפקט וואן הוא הבית של עצמאיים — אנחנו מטפלים בכל הבירוקרטיה כדי שתוכל להתמקד בעסק שלך 💼\n\nמה חדש אצלך? יש משהו שנוכל לעזור?",
    "then_update": {
      "followup_sequence_step": 1,
      "next_followup_date": "tomorrow@10"
    }
  }'::jsonb,
  0, 1, 50, true
) ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------
-- שלב 3: עדכן follow_up_day0 — tomorrow@10 במקום +1d
-- ----------------------------------------------------------
UPDATE automation_rules
SET action_config = '{
  "body": "היי {{name|חברות}}, כאן הצוות מפרפקט וואן 👋\n\nרצינו לחזור אליך אחרי השיחה שלנו.\n\nפרפקט וואן הוא הבית של עצמאיים — אנחנו מטפלים בכל הבירוקרטיה כדי שתוכל להתמקד בעסק שלך 💼\n\nמה חדש אצלך? יש משהו שנוכל לעזור?",
  "then_update": {
    "followup_sequence_name": "follow_up_nurture",
    "followup_sequence_step": 1,
    "next_followup_date": "tomorrow@10",
    "followup_paused": false
  }
}'::jsonb
WHERE name = 'follow_up_day0';

-- ----------------------------------------------------------
-- שלב 4: עדכן follow_up_day1 — כפתורים + tomorrow@10
-- ----------------------------------------------------------
UPDATE automation_rules
SET action_config = '{
  "body": "{{name|היי}} שאלה קצרה —\n\nאתה מתכנן לפתוח את העסק בקרוב, או שאתה עדיין בשלב הבדיקה? 🤔",
  "buttons": [
    {"id": "ready_to_start", "label": "רוצה להתחיל"},
    {"id": "still_checking", "label": "עדיין בודק"},
    {"id": "call_me_later", "label": "תחזרו אליי"}
  ],
  "then_update": {
    "followup_sequence_step": 2,
    "next_followup_date": "+3d"
  }
}'::jsonb
WHERE name = 'follow_up_day1';

-- ----------------------------------------------------------
-- שלב 5: עדכן follow_up_day14 — כפתורים
-- ----------------------------------------------------------
UPDATE automation_rules
SET action_config = '{
  "body": "{{name|שלום}}, זה המסר האחרון שלי בסדרה הזו 🙏\n\nרציתי לשאול בכנות — האם הנושא עדיין רלוונטי עבורך?",
  "buttons": [
    {"id": "ready_to_start", "label": "כן, רלוונטי"},
    {"id": "timing_objection", "label": "לא עכשיו"},
    {"id": "asked_for_human", "label": "אפשר שיחה"}
  ],
  "then_update": {
    "followup_sequence_step": 5,
    "next_followup_date": "+3d",
    "sub_status": "awaiting_close_response"
  }
}'::jsonb
WHERE name = 'follow_up_day14';

-- ----------------------------------------------------------
-- שלב 6: ודא הכל
-- ----------------------------------------------------------
SELECT
  name,
  trigger_type,
  action_config->'buttons'                          AS buttons,
  action_config->'then_update'->>'next_followup_date' AS next_date
FROM automation_rules
WHERE name LIKE 'follow_up_%' OR name = 'stop_on_converted'
ORDER BY priority, name;
