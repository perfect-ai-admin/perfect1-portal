-- Insert FollowUp Bot automation rules (step 1-5 + close + stop)
-- IDEMPOTENT: ON CONFLICT (name) DO NOTHING
INSERT INTO automation_rules (name, description, trigger_type, trigger_config, conditions, action_type, action_config, cooldown_hours, max_per_lead, priority, is_active)
VALUES
(
  'follow_up_day0',
  'Follow-up nurture — step 1',
  'status_change',
  '{"to_status":"follow_up"}',
  '[]',
  'send_whatsapp',
  '{"body": "היי {{name|חברות}}, כאן הצוות מפרפקט וואן 👋\n\nרצינו לחזור אליך אחרי השיחה שלנו.\n\nפרפקט וואן הוא הבית של עצמאיים — אנחנו מטפלים בכל הבירוקרטיה כדי שתוכל להתמקד בעסק שלך 💼\n\nמה חדש אצלך? יש משהו שנוכל לעזור?", "then_update": {"followup_sequence_name": "follow_up_nurture", "followup_sequence_step": 1, "next_followup_date": "+1d", "followup_paused": false}}',
  0,
  1,
  50,
  true
),
(
  'follow_up_day1',
  'Follow-up nurture — step 2',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":1}',
  '[]',
  'send_whatsapp',
  '{"body": "{{name|היי}} שאלה קצרה —\n\nאתה מתכנן לפתוח את העסק בקרוב, או שאתה עדיין בשלב הבדיקה? 🤔\n\nזה יעזור לי להתאים לך את הצעד הנכון.", "then_update": {"followup_sequence_step": 2, "next_followup_date": "+3d"}}',
  20,
  1,
  100,
  true
),
(
  'follow_up_day3',
  'Follow-up nurture — step 3',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":2}',
  '[]',
  'send_whatsapp',
  '{"body": "טיפ מקצועי שאנחנו אוהבים לשתף 💡\n\nעצמאי יכול להכיר בהוצאות רבות כהוצאה מוכרת:\n• טלפון עסקי\n• נסיעות לפגישות\n• ציוד מחשוב\n• השתלמויות מקצועיות\n\nהרבה עצמאיים מפסידים אלפי שקלים בשנה כי הם לא יודעים מה מותר לנכות.\n\nאנחנו עוזרים לך לא לפספס אף שקל", "then_update": {"followup_sequence_step": 3, "next_followup_date": "+4d"}}',
  20,
  1,
  100,
  true
),
(
  'follow_up_day7',
  'Follow-up nurture — step 4',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":3}',
  '[]',
  'send_whatsapp',
  '{"body": "{{name|היי}}, בנוסף לרישום כעצמאי — אנחנו גם מציעים חבילה שלמה לעצמאיים:\n\nניהול קבלות חודשי\nכרטיס ביקור מקצועי\nדף נחיתה לעסק\nחבילת שיווק דיגיטלי\n\nהלקוחות שלנו חוסכים זמן ונראים מקצועיים מהיום הראשון.\n\nרוצה לשמוע עוד?", "then_update": {"followup_sequence_step": 4, "next_followup_date": "+7d"}}',
  20,
  1,
  100,
  true
),
(
  'follow_up_day14',
  'Follow-up nurture — step 5',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":4}',
  '[]',
  'send_whatsapp',
  '{"body": "{{name|שלום}}, זה המסר האחרון שלי בסדרה הזו.\n\nרציתי לשאול בכנות — האם הנושא עדיין רלוונטי עבורך?\n\nכן, אני מעוניין\nלא עכשיו, תחזרו אחר כך\nלא רלוונטי יותר\n\nתענה לי כאן ואטפל בהתאם.", "then_update": {"followup_sequence_step": 5, "next_followup_date": "+3d", "sub_status": "awaiting_close_response"}}',
  20,
  1,
  100,
  true
),
(
  'follow_up_no_reply_close',
  'Follow-up nurture — close silently',
  'cron_tick',
  '{"sequence":"follow_up_nurture","step":5}',
  '[]',
  'update_lead',
  '{"patch": {"followup_sequence_name": null, "followup_sequence_step": 0, "next_followup_date": null, "followup_paused": true, "sub_status": "followup_completed_no_reply", "next_action": "re_engage_manual_30d"}}',
  0,
  1,
  100,
  true
),
(
  'stop_on_converted',
  'Stop sequence on converted',
  'status_change',
  '{"to_status":"converted"}',
  '[]',
  'stop_sequence',
  '{}',
  0,
  null,
  10,
  true
)
ON CONFLICT (name) DO NOTHING;
