-- =============================================================
-- follow_up_nurture sequence — 7 automation rules
-- Trigger: pipeline_stage changes to 'follow_up' (במעקב)
-- Sequence: 5 outbound WhatsApp messages + 1 close rule + stop_on_converted
-- IDEMPOTENT: ON CONFLICT (name) DO NOTHING
-- =============================================================

-- ---- Day 0: מיידי — חידוש קשר + מיצוב ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_day0',
  'Follow-up nurture — step 1: re-engagement on status change to follow_up',
  'status_change',
  '{"to_status":"follow_up"}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "היי {{name|חברות}}, כאן הצוות מפרפקט וואן 👋\n\nרצינו לחזור אליך אחרי השיחה שלנו.\n\nפרפקט וואן הוא הבית של עצמאיים — אנחנו מטפלים בכל הבירוקרטיה כדי שתוכל להתמקד בעסק שלך 💼\n\nמה חדש אצלך? יש משהו שנוכל לעזור?",
    "then_update": {
      "followup_sequence_name": "follow_up_nurture",
      "followup_sequence_step": 1,
      "next_followup_date": "+1d",
      "followup_paused": false
    }
  }'::jsonb,
  0,
  1,
  50,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Day 1: שאלה קצרה (cron, step 1) ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_day1',
  'Follow-up nurture — step 2: qualifying question, day 1',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":1}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "{{name|היי}} שאלה קצרה —\n\nאתה מתכנן לפתוח את העסק בקרוב, או שאתה עדיין בשלב הבדיקה? 🤔\n\nזה יעזור לי להתאים לך את הצעד הנכון.",
    "then_update": {
      "followup_sequence_step": 2,
      "next_followup_date": "+3d"
    }
  }'::jsonb,
  20,
  1,
  100,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Day ~4: טיפ מקצועי — הוצאות מוכרות (cron, step 2) ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_day3',
  'Follow-up nurture — step 3: professional tip on recognized expenses, day ~4',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":2}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "טיפ מקצועי שאנחנו אוהבים לשתף 💡\n\nעצמאי יכול להכיר בהוצאות רבות כהוצאה מוכרת:\n• 📱 טלפון עסקי\n• 🚗 נסיעות לפגישות\n• 💻 ציוד מחשוב\n• 📚 השתלמויות מקצועיות\n\nהרבה עצמאיים מפסידים אלפי שקלים בשנה כי הם לא יודעים מה מותר לנכות.\n\nאנחנו עוזרים לך לא לפספס אף שקל 🙏",
    "then_update": {
      "followup_sequence_step": 3,
      "next_followup_date": "+4d"
    }
  }'::jsonb,
  20,
  1,
  100,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Day ~8: שירותים משלימים (cron, step 3) ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_day7',
  'Follow-up nurture — step 4: cross-sell complementary services, day ~8',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":3}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "{{name|היי}}, בנוסף לרישום כעצמאי — אנחנו גם מציעים חבילה שלמה לעצמאיים:\n\n🧾 ניהול קבלות חודשי\n💳 כרטיס ביקור מקצועי\n🌐 דף נחיתה לעסק\n📣 חבילת שיווק דיגיטלי\n\nהלקוחות שלנו חוסכים זמן ונראים מקצועיים מהיום הראשון.\n\nרוצה לשמוע עוד? 😊",
    "then_update": {
      "followup_sequence_step": 4,
      "next_followup_date": "+7d"
    }
  }'::jsonb,
  20,
  1,
  100,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Day ~15: סגירה עדינה (cron, step 4) ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_day14',
  'Follow-up nurture — step 5: gentle close / opt-out, day ~15',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":4}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "{{name|שלום}}, זה המסר האחרון שלי בסדרה הזו 🙏\n\nרציתי לשאול בכנות — האם הנושא עדיין רלוונטי עבורך?\n\n✅ כן, אני מעוניין\n⏸️ לא עכשיו, תחזרו אחר כך\n❌ לא רלוונטי יותר\n\nתענה לי כאן ואטפל בהתאם. אם לא נשמע — אסגור את הפנייה ואתה תמיד יכול לחזור אלינו כשתרצה 😊",
    "then_update": {
      "followup_sequence_step": 5,
      "next_followup_date": "+3d",
      "sub_status": "awaiting_close_response"
    }
  }'::jsonb,
  20,
  1,
  100,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Day ~18: סגירת sequence ללא תגובה (cron, step 5) ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'follow_up_no_reply_close',
  'Follow-up nurture — close silently after 5 messages with no reply',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":5}'::jsonb,
  '[]'::jsonb,
  'update_lead',
  '{
    "patch": {
      "followup_sequence_name": null,
      "followup_sequence_step": 0,
      "next_followup_date": null,
      "followup_paused": true,
      "sub_status": "followup_completed_no_reply",
      "next_action": "re_engage_manual_30d"
    }
  }'::jsonb,
  0,
  1,
  100,
  true
) ON CONFLICT (name) DO NOTHING;

-- ---- Stop rule: עצירת sequence כשליד הופך ל-converted ----
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
)
VALUES (
  'stop_on_converted',
  'Stop any active sequence when lead is converted',
  'status_change',
  '{"to_status":"converted"}'::jsonb,
  '[]'::jsonb,
  'stop_sequence',
  '{}'::jsonb,
  0,
  null,
  10,
  true
) ON CONFLICT (name) DO NOTHING;
