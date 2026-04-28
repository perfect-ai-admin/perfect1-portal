-- Alt-services nurture sequence: gentle re-engagement for leads who said
-- "no thanks" to accounting but might want marketing / AI / automation.
-- Pipeline_stage transition to 'nurture_alt' starts the sequence.
-- 4 value-first messages over ~7 weeks. Each has 2-3 buttons:
--   alt_interested / alt_consult — caught by botHandleReply (high-prio task)
--   alt_unsubscribe              — caught by botHandleReply (do_not_contact=true)

-- Step 0: triggered on status_change to nurture_alt — schedules step 1 in 7 days.
-- No WhatsApp here so the operator's classification doesn't immediately spam.
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_init',
  'Alt-services nurture — start sequence on status_change to nurture_alt',
  'status_change',
  '{"to_status":"nurture_alt"}'::jsonb,
  '[]'::jsonb,
  'update_lead',
  '{
    "patch": {
      "followup_sequence_name": "alt_nurture",
      "followup_sequence_step": 1,
      "next_followup_date": "+7d",
      "followup_paused": false,
      "do_not_contact": false
    }
  }'::jsonb,
  0, 1, 50, true
) ON CONFLICT (name) DO UPDATE SET
  trigger_config = EXCLUDED.trigger_config,
  action_config = EXCLUDED.action_config,
  is_active = true;

-- Step 1 (day 7): Customer-acquisition tip
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_step1',
  'Alt-services nurture step 1 — referral tip (~day 7)',
  'cron_tick',
  '{"sequence":"alt_nurture","step":1}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "היי {{name|חברות}} 👋\n\nעברו כמה ימים — לא להתאמץ, רק רציתי לחלוק טיפ קצר על העסק שלך.\n\n💡 *הדרך הזולה ביותר להביא לקוחות חדשים:*\nתבקש מ-3 לקוחות שאתה יודע שמרוצים — להמליץ עליך בכתב או להעביר את הפרטים שלך לחבר.\n\nרוב האנשים מסכימים. עולה 0 ₪. ממוצע: 1-2 לקוחות חדשים בחודש.\n\nאצלנו בפרפקט וואן יש מערכת שעוזרת לעצמאיים לבקש את ההמלצות אוטומטית. רוצה לראות?",
    "buttons": [
      {"id":"alt_interested","label":"מעניין, ספר עוד"},
      {"id":"alt_unsubscribe","label":"תפסיקו לפנות אליי"}
    ],
    "then_update": {
      "followup_sequence_step": 2,
      "next_followup_date": "+14d"
    }
  }'::jsonb,
  20, 1, 100, true
) ON CONFLICT (name) DO UPDATE SET
  action_config = EXCLUDED.action_config,
  is_active = true;

-- Step 2 (day ~21): AI / automation tip
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_step2',
  'Alt-services nurture step 2 — AI/automation tip (~day 21)',
  'cron_tick',
  '{"sequence":"alt_nurture","step":2}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "היי {{name|חברות}} 👋\n\nהטיפ של היום על AI ואוטומציה —\n\n🤖 אם אתה מבזבז שעות בלענות בוואצאפ/אימייל ללקוחות פוטנציאליים — יש דרך טובה יותר.\n\nמערכת AI יכולה:\n• לענות 24/7 לפניות הראשוניות\n• לסנן רק את הרציניים שיגיעו אליך\n• לבדוק זמינות ולקבוע פגישות\n\nעצמאיים שאצלנו מקבלים *פי 3* פניות, חוסכים 6-10 שעות בשבוע, וסוגרים יותר עסקאות.\n\nרוצה לראות איך זה עובד אצל עסק דומה לשלך?",
    "buttons": [
      {"id":"alt_interested","label":"כן, אני רוצה לראות"},
      {"id":"alt_unsubscribe","label":"תפסיקו לפנות אליי"}
    ],
    "then_update": {
      "followup_sequence_step": 3,
      "next_followup_date": "+14d"
    }
  }'::jsonb,
  20, 1, 100, true
) ON CONFLICT (name) DO UPDATE SET
  action_config = EXCLUDED.action_config,
  is_active = true;

-- Step 3 (day ~35): Business management tip
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_step3',
  'Alt-services nurture step 3 — profit visibility tip (~day 35)',
  'cron_tick',
  '{"sequence":"alt_nurture","step":3}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "היי {{name|חברות}} 👋\n\nהטיפ של היום על ניהול עסק קטן —\n\n📊 רוב העצמאיים פשוט *לא יודעים* כמה הם באמת מרוויחים. רואים כסף נכנס — אבל אחוז הרווח האמיתי? לא ברור.\n\nזו סיבה מספר 1 ל-burnout: לעבוד הרבה ולהרגיש שזה לא מתקדם.\n\nאצלנו פיתחנו מערכת פשוטה (לא תוכנת חשבונאות מסורבלת) שמראה בזמן אמת:\n• כמה אתה מרוויח לפי שירות\n• איזה לקוח הכי רווחי\n• מה הטרנד החודשי\n\nרוצה הדגמה של 10 דקות?",
    "buttons": [
      {"id":"alt_interested","label":"כן, רוצה הדגמה"},
      {"id":"alt_unsubscribe","label":"תפסיקו לפנות אליי"}
    ],
    "then_update": {
      "followup_sequence_step": 4,
      "next_followup_date": "+14d"
    }
  }'::jsonb,
  20, 1, 100, true
) ON CONFLICT (name) DO UPDATE SET
  action_config = EXCLUDED.action_config,
  is_active = true;

-- Step 4 (day ~49): Soft consult CTA — last in sequence
INSERT INTO automation_rules (
  name, description, trigger_type, trigger_config, conditions,
  action_type, action_config, cooldown_hours, max_per_lead, priority, is_active
) VALUES (
  'alt_nurture_step4',
  'Alt-services nurture step 4 — gentle consult CTA + close sequence (~day 49)',
  'cron_tick',
  '{"sequence":"alt_nurture","step":4}'::jsonb,
  '[]'::jsonb,
  'send_whatsapp',
  '{
    "body": "{{name|חברות}}, זאת ההודעה האחרונה שלי בסדרה הזו 🙏\n\nאם הטיפים עזרו — מעולה!\n\nאם רק רצית לדעת מה אנחנו עושים: *פרפקט וואן הוא הבית של עצמאיים* — לא רק חשבונאות. אנחנו עוזרים להגדיל מכירות, לאוטומציה של תהליכים, ולנהל עסק חכם יותר.\n\nשיחת ייעוץ של 20 דקות (חינם) יכולה לחסוך לך חודשים של ניסוי וטעייה.",
    "buttons": [
      {"id":"alt_consult","label":"רוצה שיחת ייעוץ"},
      {"id":"alt_unsubscribe","label":"תפסיקו לפנות אליי"}
    ],
    "then_update": {
      "followup_sequence_name": null,
      "followup_sequence_step": null,
      "next_followup_date": null,
      "followup_paused": true,
      "sub_status": "alt_nurture_completed"
    }
  }'::jsonb,
  20, 1, 100, true
) ON CONFLICT (name) DO UPDATE SET
  action_config = EXCLUDED.action_config,
  is_active = true;
