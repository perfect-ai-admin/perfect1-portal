# FollowUp Bot — Phase C Controlled Activation Plan

**תאריך:** 2026-04-11
**מבוסס על:** `docs/followup-bot-pilot-report.md` (Pilot Success בפועל)
**סטטוס מערכת:** מותקנת, 23 rules `is_active=false`, cron רץ, מוכנה להפעלה

---

## חלק א — Pilot Verdict Update

# 🟢 **READY FOR CONTROLLED ROLLOUT**

מעדכן מ-"READY WITH LIMITATIONS" ל-"READY FOR CONTROLLED ROLLOUT" על סמך **תוצאות אמיתיות בלבד** מה-pilot:

| הוכחה אמיתית | סטטוס |
|---|---|
| 4 migrations applied בפרודקשן | ✅ |
| 2 edge functions deployed | ✅ |
| DB triggers fires: status_change, new_lead, inbound, previous_status, history | ✅ מאומת ב-scenarios A/B/C |
| GreenAPI send עובד — `greenapi_message_id='3EB00E227D2FAA81715876'` | ✅ |
| Memory fields נכתבים (last_outbound, lead_summary, next_action, no_answer_attempts) | ✅ מאומת |
| Inbound classification + task creation | ✅ 1 row + 1 task (loop תוקן) |
| UNIQUE(event_key) dedup | ✅ call #2 = `dedup` |
| `followup_paused` guard | ✅ call #1 = `skipped_stop` |
| pg_cron → pg_net → edge → 200 | ✅ job_run_details `succeeded` |
| `followup_cron_health()` = `ok:true` | ✅ |

**Caveats שנותרו (מדוע "controlled" ולא "full"):**

1. **Human visual WA confirmation חסר.** אישרתי ש-GreenAPI קיבל 200 + idMessage; לא ראיתי בעיניי שה-handset קיבל. יש לקבל אישור מהמשתמש לפני Wave 2.
2. **Classification Hebrew = keyword-based.** עובד על דוגמאות אבל לא עובר LLM. ב-scope מוגדר: "asked_for_human" גובר על "interested" כשיש "תתקשרו" — זה תקין אבל שונה מציפיות.
3. **לא נוסו עדיין cron-driven rules על ליד אמיתי.** ה-pilot אימת את ה-cron chain אבל לא rule קונקרטי של reminder יום-1/יום-3.
4. **sales-bot-response workflow ב-n8n לא חובר לפלו החדש.** כרגע DB trigger על `whatsapp_messages` INSERT עוצר רצפים רק כש-**מישהו** מכניס שורה שם. אם n8n workflow קיים שמטפל ב-inbound של GreenAPI כבר עושה INSERT — עובד. אם לא — inbound מהחוץ לא יפעיל את ה-trigger.

**Mitigation:** 3 waves מדורגים, rollback מיידי, monitoring אגרסיבי.

---

## חלק ב — Phase C Activation Plan (3 Waves)

**עקרון מנחה:** מפעילים לפי blast radius — הכי קטן קודם.
- Wave 1 = terminal states (close-out messages) — בלי רצפים, בלי cron, בלי לולאות
- Wave 2 = single-fire status_change rules — אחד בכל מעבר, בלי cron
- Wave 3 = cron-driven sequences — הסיכון הכי גבוה (תזמון אוטומטי, multi-step)

כל Wave מחייב **24h של יציבות** לפני המעבר הבא.

---

### 🟢 Wave 1 — Terminal State Rules (5 rules)

**מפעילים ב-יום 1, בצהריים (שעה בה יש צוות לפקח).**

```sql
UPDATE automation_rules SET is_active = true WHERE name IN (
  'stop_on_paid',
  'stop_on_not_relevant',
  'paid_thankyou',
  'not_relevant_ack',
  'completed_thanks'
);

-- Verify
SELECT name, is_active FROM automation_rules
WHERE name IN ('stop_on_paid','stop_on_not_relevant','paid_thankyou','not_relevant_ack','completed_thanks')
ORDER BY name;
-- Expected: 5 rows, is_active = true
```

**למה דווקא אלה:**
- כולם `status_change` trigger — אירוע יחיד, אין cron
- כולם `max_per_lead=1` → לא יכולים להישלח פעמיים
- כולם על מעברים שהסוכן **מבקש במפורש** (paid / completed / not_relevant) — המשתמש מצפה להודעה
- 2 מהם (`stop_on_paid`, `stop_on_not_relevant`) הם `stop_sequence` — שמרניים במהותם, עוצרים רצפים אחרים
- ההודעות קצרות, מכבדות, לא pushy:
  - _"תודה {{name}} 🙏 התשלום התקבל. נתחיל בטיפול ונעדכן אותך בקרוב."_
  - _"תודה {{name}} על העדכון. אם בעתיד תצטרך אותנו — אני כאן 🙏"_
  - _"{{name}}, סיימנו 🎉 תודה על האמון."_

**סיכונים:**
- 🟡 ליד שכבר קיבל הודעה ידנית מהסוכן — יקבל גם הודעת auto. **Mitigation:** `max_per_lead=1` חוסם אחרי הראשונה, אבל לא חוסם "הראשונה" היוצאת אם הסוכן כבר שלח אחת ידנית. קביל.
- 🟢 אין סיכון ללולאה — אין cron.
- 🟢 אין סיכון ל-spam — single-shot.

**מה לנטר (ראו חלק ג לפרטים):**
- `automation_logs` → Wave 1 rules only, `result='sent'` count vs `result='failed'`
- האם הגיעו הודעות לסוכנים (task creation על paid? לא — אין task; רק message)
- לוגים של edge function ב-Supabase dashboard

**Success criteria ל-Wave 1 (24h):**
- `failed` count = 0
- לפחות 1 הודעה אמיתית נשלחה (אם הייתה תנועה בפרודקשן)
- אין תלונות מסוכנים על הודעה שגויה
- `followup_cron_health()` נשאר `ok:true`

---

### 🟡 Wave 2 — Single-Fire Status Change Rules (8 rules)

**מפעילים ב-יום 2, רק אחרי 24h של יציבות ב-Wave 1.**

```sql
UPDATE automation_rules SET is_active = true WHERE name IN (
  'attempted_contact_day0',
  'contacted_summary',
  'interested_acknowledge',
  'quote_sent_day0',
  'waiting_documents_day0',
  'payment_pending_day0',
  'no_answer_day0',
  'in_process_ack'
);

-- Verify
SELECT name, is_active,
       action_config->>'body' AS message_preview
FROM automation_rules
WHERE name IN ('attempted_contact_day0','contacted_summary','interested_acknowledge',
               'quote_sent_day0','waiting_documents_day0','payment_pending_day0',
               'no_answer_day0','in_process_ack')
ORDER BY name;
```

**למה דווקא אלה:**
- כולם `trigger_type='status_change'` — אירוע יחיד פר-מעבר
- כולם `max_per_lead=1` — לא מפוצצים את הלקוח
- כולם `send_whatsapp` + `then_update` שמגדיר רק `next_followup_date` — לא קורא לעוד rules בחזרה
- כל הקטגוריות הקריטיות של ה-funnel מכוסות (contact → interested → quote → docs → payment → process)
- `no_answer_day0` אומת ב-Scenario B של ה-pilot — הקריטי ביותר

**סיכונים:**
- 🟡 `attempted_contact_day0` + `no_answer_day0` ישנם במהותם "nudge" — סיכון קל ל-perceived spam אם סוכן מסמן סטטוסים הלוך-חזור. **Mitigation:** `max_per_lead=1` + `event_key` עם `changed_at` bucket → לא יישלח פעמיים.
- 🟡 אם ליד נכנס ישירות ל-`quote_sent` (בלי לעבור interested) — יקבל הודעת quote בלי welcome. קביל, זה הרצון העסקי.
- 🟡 Quiet hours check — אם מעבר סטטוס קורה ב-21:00-08:00 IL, הודעה **לא** נשלחת (`skipped_quiet_hours`). כרגע זה נחשב ל-"loss" ב-KPI. להבנה, לא לתיקון.
- 🔴 אם `whatsapp_opt_in=false` על ליד אמיתי (למשל, הוקם ב-CRM בלי השדה) — הבוט **יחסום**. **Mitigation:** לבדוק שהdefault הוא true (וזה כבר המקרה ב-schema).

**מה לנטר:**
- Split של `result` ב-`automation_logs` — אחוז `sent` vs `skipped_*` vs `failed`
- אילו rules זוכים להפעלה בכלל (יתכן ש-`in_process_ack` אף פעם לא יתפוס אם סוכנים לא מסמנים את הסטטוס)
- תלונות של לקוחות (via inbound classification `not_relevant` → agent task)

**Success criteria ל-Wave 2 (24h):**
- `result='failed'` < 5% מ-total sends
- אין `automation_logs` עם אותו rule_name שנשלח פעמיים לאותו ליד בטעות
- ≥ 1 inbound reply נתפס כ-classifying correctly (יחייב `followup_paused=true`)
- cron health נשאר `ok:true`

---

### 🔴 Wave 3 — Cron-Driven Sequences (10 rules)

**מפעילים ב-יום 3 או 4, רק אחרי 24-48h של יציבות ב-Wave 2.**

```sql
UPDATE automation_rules SET is_active = true WHERE name IN (
  -- Quote follow-up sequence (days 1 and 3)
  'quote_reminder_day1',
  'quote_reminder_day3',
  -- Documents follow-up sequence (days 2 and 4)
  'waiting_documents_day2',
  'waiting_documents_day4',
  -- Payment follow-up sequence
  'payment_pending_day1',
  'payment_pending_day3',
  -- No answer recovery sequence (already have day0 from Wave 2)
  'no_answer_day1',
  'no_answer_day3',
  -- Long tail
  'followup_later_schedule',
  'followup_later_touch'
);

-- Verify total active count
SELECT count(*) FILTER (WHERE is_active) AS active,
       count(*) AS total
FROM automation_rules;
-- Expected: active=23, total=23
```

**למה דווקא אלה (ולמה אחרונים):**
- כולם `trigger_type='cron_tick'` — ירוצו אוטומטית כל 5 דקות לפי `next_followup_date`
- כל one של הם `max_per_lead=1` או `2` (long-tail) — חסימת spam
- `cooldown_hours=20` — גם אם cron רץ פעמיים ביום, לא ישלח
- **הסיכון העיקרי:** הם משתמשים ב-`followup_sequence_name` + `followup_sequence_step` שחייבים להיות מוגדרים ע"י Wave 2 rule (למשל `quote_sent_day0` מגדיר `sequence='quote_followup', step=1`). אם Wave 2 לא רץ, Wave 3 לא יעשה כלום. זה מכוון.

**סיכונים:**
- 🔴 Multiple leads במקביל ב-cron בטחית יצירת 50+ הודעות בריצה אחת. **Mitigation:** `limit 50` ב-query של cron. אם יש 100 ממתינים, 50 יחכו 5 דקות נוספות.
- 🔴 **Stuck sequences:** אם ליד נכנס ל-`quote_followup` ואז הסטטוס שלו משתנה ידנית ל-`followup_later`, הרצף הישן עלול להמשיך כי `followup_sequence_name` לא מתאפס. **Mitigation:** `stop_on_paid` + `stop_on_not_relevant` מ-Wave 1 כבר פותרים את זה לחלק מהמקרים. למקרים אחרים — בדיקה ידנית ב-monitoring.
- 🟡 `cooldown_hours=20` — אם הסוכן רוצה לשלוח תזכורת **ידנית** באותו יום, הוא לא יתוסף כי הרצף כבר שלח. המלצה: סוכן משתמש ב-`triggerManualFollowup` עם rule שונה. לא blocker.
- 🟡 `followup_later_touch` הוא `cooldown_hours=0, max_per_lead=2` — במקרי edge, ליד יכול לקבל 2 touches ב-14 יום + 28 יום. זה מכוון.

**מה לנטר (הכי אגרסיבי):**
- כל `result` ב-`automation_logs` עם `trigger_type='cron_tick'`
- כל נעילה של `followup_sequence_name` — לא אמור להישאר ליד "תקוע" ברצף
- ratio של `skipped_cooldown` — גבוה = הגנה עובדת, נמוך = קריטי לבדוק שלא שולחים כפול
- cron execution time ב-`cron.job_run_details.return_message`

**Success criteria ל-Wave 3 (48h):**
- 0 לידים עם `followup_sequence_name` שלא השתנה 72+ שעות אחרי הפעלה (stuck detection)
- `result='failed'` < 5%
- duplicate detection עובד (כל `event_key` unique)
- `followup_cron_health()` נשאר `ok:true` לאורך 48h רצוף

---

## חלק ג — Monitoring & Guardrails (24-48h לכל Wave)

### 📊 Dashboard Query Set — להריץ כל 2-4 שעות אחרי Wave activation

#### 1. Top-line KPI
```sql
-- Last 24h summary by action and result
SELECT
  action_type,
  result,
  count(*) AS n,
  round(100.0 * count(*) / sum(count(*)) OVER (PARTITION BY action_type), 1) AS pct
FROM automation_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY 1, 2
ORDER BY 1, 3 DESC;
```
**Alert:** `result='failed'` > 5% → investigate immediately.

#### 2. Failure drill-down
```sql
SELECT rule_name, error, count(*)
FROM automation_logs
WHERE result = 'failed' AND created_at > now() - interval '24 hours'
GROUP BY 1, 2
ORDER BY 3 DESC;
```
**Alert:** any row with count > 3 → disable that specific rule.

#### 3. Sent messages (outbound)
```sql
SELECT
  date_trunc('hour', created_at) AS hour,
  count(*) FILTER (WHERE delivery_status = 'sent') AS sent,
  count(*) FILTER (WHERE delivery_status = 'failed') AS failed,
  count(*) FILTER (WHERE delivery_status = 'pending') AS pending
FROM whatsapp_messages
WHERE direction = 'outbound' AND sender_type = 'bot'
  AND created_at > now() - interval '24 hours'
GROUP BY 1
ORDER BY 1 DESC;
```
**Alert:** `failed / (sent+failed) > 10%` → GreenAPI issue (check token, quota, instance status).

#### 4. Inbound classification accuracy check
```sql
SELECT
  action_payload->'classification'->>'category' AS category,
  count(*) AS n
FROM automation_logs
WHERE trigger_type = 'inbound_message'
  AND created_at > now() - interval '24 hours'
GROUP BY 1
ORDER BY 2 DESC;
```
**Alert:** extreme skew (e.g. all `general_reply`) → classification broken; review `lib.ts`.

#### 5. Duplicate / idempotency violations
```sql
-- Unique event_keys with count > 1 should NEVER exist (UNIQUE constraint)
SELECT event_key, count(*)
FROM automation_logs
GROUP BY 1 HAVING count(*) > 1;
```
**Alert:** ANY row here → critical bug, escalate.

```sql
-- Dedup events (informational — should exist = guard working)
SELECT count(*) AS dedup_events
FROM automation_logs
WHERE result = 'dedup' AND created_at > now() - interval '24 hours';
```

#### 6. Stuck sequences (Wave 3 only)
```sql
SELECT id, name, pipeline_stage, followup_sequence_name, followup_sequence_step,
       next_followup_date, last_contact_at
FROM leads
WHERE followup_sequence_name IS NOT NULL
  AND followup_paused = false
  AND (next_followup_date < now() - interval '48 hours' OR next_followup_date IS NULL)
  AND last_contact_at < now() - interval '24 hours'
ORDER BY last_contact_at ASC
LIMIT 20;
```
**Alert:** ≥ 3 rows → investigate why cron didn't pick them up.

#### 7. Paused leads (inbound stop working?)
```sql
SELECT count(*) AS paused_today
FROM leads
WHERE followup_paused = true
  AND last_inbound_at > now() - interval '24 hours';
```
**Expected:** > 0 if inbound happened and was captured.

#### 8. Tasks created by bot
```sql
SELECT task_type, priority, status, count(*)
FROM tasks
WHERE is_automated = true
  AND created_at > now() - interval '24 hours'
GROUP BY 1, 2, 3
ORDER BY 4 DESC;
```
**Expected after Wave 2:** inbound-related tasks. **Expected after Wave 3:** also `payment_stalled`, `call_lead` tasks.

#### 9. Cron health
```sql
SELECT followup_cron_health();

-- Last 10 cron runs
SELECT start_time, end_time, status, return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'followup-tick')
ORDER BY start_time DESC LIMIT 10;
```
**Alert:** any `status != 'succeeded'` → cron broken.

#### 10. Per-rule performance
```sql
SELECT rule_name,
       count(*) FILTER (WHERE result = 'sent') AS sent,
       count(*) FILTER (WHERE result LIKE 'skipped_%') AS skipped,
       count(*) FILTER (WHERE result = 'failed') AS failed
FROM automation_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY 1
ORDER BY sent DESC;
```

### 🚨 Alert thresholds

| מטריקה | Warning | Critical |
|---|---|---|
| `failed` rate | > 5% | > 10% |
| GreenAPI delivery failed | > 5% | > 15% |
| Cron `last_status` | `pending` > 5 min | `failed` |
| Stuck sequences | ≥ 3 | ≥ 10 |
| Same `event_key` count > 1 | — | ANY (unique constraint broken) |
| Duplicate WA send (same lead same rule < 1h) | 1 | ≥ 3 |

### 👁️ Manual eyeball checks (לבצע 3x ביום ב-48h הראשונים)

1. Supabase Dashboard → Edge Functions → `followupDispatch` → Logs (אחרי כל wave). חפש error/exception.
2. GreenAPI dashboard → check message queue + delivery stats.
3. 5 `lead_memory` view rows → `SELECT * FROM lead_memory WHERE last_outbound_at > now() - interval '4 hours' LIMIT 5;` — האם `lead_summary` ו-`next_action` הגיוניים?
4. Sampling של 3 הודעות אחרונות:
```sql
SELECT lead_id, message_text, created_at FROM whatsapp_messages
WHERE direction='outbound' AND sender_type='bot'
ORDER BY created_at DESC LIMIT 3;
```
קרא את הטקסטים — האם הם הגיוניים לסטטוס? האם יש `{{unknown_var}}` שלא הוחלף?

---

## חלק ד — Rollback & Recovery

### 🔴 Kill switches (מהיר לאיטי)

#### Kill switch #1 — Disable ALL automation (הכי מהיר, 1 פקודה)
```sql
UPDATE automation_rules SET is_active = false;
```
**מה זה עושה:** מפסיק מיד את כל ה-rules. המערכת הופכת ל-no-op. אף הודעה לא תישלח. Triggers עדיין ירוצו אבל `handleStatusChange` יחזיר מערך ריק (אין rules פעילים).

**Side effects:** 0 — לא מוחק נתונים, לא משנה לידים. בטוח להריץ בכל רגע.

**חזרה:** הפעל מחדש rules ספציפיים ב-wave הבא.

#### Kill switch #2 — Unschedule cron (עוצר רק רצפים)
```sql
SELECT cron.unschedule('followup-tick');
```
**מה זה עושה:** עוצר את ה-cron tick. status_change rules עדיין ירוצו (כי הם מופעלים ע"י DB trigger ישיר, לא cron), אבל sequences לא יתקדמו.

**חזרה:**
```sql
SELECT cron.schedule('followup-tick', '*/5 * * * *',
  $$SELECT followup_dispatch(jsonb_build_object('event_type','cron_tick','ts',now()));$$);
```

#### Kill switch #3 — Drop DB trigger (עוצר גם status_change)
```sql
ALTER TABLE leads DISABLE TRIGGER trg_followup_status_change;
ALTER TABLE whatsapp_messages DISABLE TRIGGER trg_followup_inbound;
```
**מה זה עושה:** ה-triggers לא יירו. המערכת מתה לחלוטין. CRM עובד בלי automation בכלל.

**חזרה:** `ENABLE TRIGGER ...`

#### Kill switch #4 — Blanket pause all leads (nuclear)
```sql
-- Pause ALL active sequences (bulk)
UPDATE leads SET followup_paused = true
WHERE followup_sequence_name IS NOT NULL AND followup_paused = false;
```
**מה זה עושה:** עוצר כל רצף אקטיבי. לא מוחק. Reversible ע"י `SET followup_paused=false` לבחירה.

### 🔍 איך מאתרים איזה rule גרם לבעיה

```sql
-- Step 1: mass failure pattern
SELECT rule_name, count(*) FROM automation_logs
WHERE result = 'failed' AND created_at > now() - interval '2 hours'
GROUP BY 1 ORDER BY 2 DESC LIMIT 10;

-- Step 2: same rule repeating per lead
SELECT rule_name, lead_id, count(*) FROM automation_logs
WHERE created_at > now() - interval '2 hours'
GROUP BY 1, 2 HAVING count(*) > 1
ORDER BY 3 DESC LIMIT 20;

-- Step 3: look at the specific errors
SELECT rule_name, error, action_payload FROM automation_logs
WHERE result = 'failed' AND created_at > now() - interval '2 hours'
ORDER BY created_at DESC LIMIT 20;

-- Step 4: edge function logs (Supabase Dashboard → Functions → followupDispatch → Logs)
-- Search for "action failed" and check the console.error lines
```

### 🛑 Disable a single problematic rule

```sql
UPDATE automation_rules SET is_active = false WHERE name = 'quote_reminder_day1';

-- Log it for postmortem
INSERT INTO automation_logs (lead_id, rule_id, rule_name, event_key, trigger_type, action_type, result, error)
VALUES (
  NULL,
  (SELECT id FROM automation_rules WHERE name = 'quote_reminder_day1'),
  'quote_reminder_day1',
  'manual_disable_' || extract(epoch from now())::text,
  'manual',
  'update_lead',
  'failed',
  'MANUAL_DISABLE: reason here'
);
```

### ✅ Recovery without data loss

**אם הפעלה השתבשה אבל לא היו נזקים:**
```sql
-- 1. Disable all
UPDATE automation_rules SET is_active = false;

-- 2. Reset any stuck leads to a neutral state
UPDATE leads SET
  followup_paused = false,
  followup_sequence_name = NULL,
  followup_sequence_step = 0,
  next_followup_date = NULL
WHERE followup_sequence_name IS NOT NULL
  AND last_contact_at > now() - interval '2 hours';

-- 3. Verify clean state
SELECT count(*) FROM leads WHERE followup_sequence_name IS NOT NULL;
SELECT count(*) FROM automation_rules WHERE is_active = true;

-- 4. Start over from Wave 1 after post-mortem
```

**אם הודעות שגויות כבר נשלחו:**
- אי אפשר לבטל הודעות WhatsApp שכבר יצאו — GreenAPI אין לו retract
- פתח tasks ידניים לסוכנים: "ליד X קיבל הודעת bot שגויה, לפנות ידנית"
```sql
INSERT INTO tasks (title, description, task_type, priority, status, is_automated, lead_id)
SELECT
  'תיקון שליחת bot שגויה',
  'המערכת שלחה הודעה שגויה בזמן ' || created_at::text || '. ליצור קשר לתיקון.',
  'bot_incident_cleanup',
  'high',
  'pending',
  false,
  lead_id
FROM automation_logs
WHERE created_at BETWEEN '<start>' AND '<end>'
  AND result = 'sent'
  AND rule_name = '<buggy_rule>';
```

### 🟢 Safe fallback state (baseline)

אם הכול נכשל, המצב הבטוח הוא:
```sql
UPDATE automation_rules SET is_active = false;
-- cron יכול להמשיך לרוץ (לא יקרה כלום כי אין rules)
-- triggers יכולים להמשיך לרוץ (יחזירו logs ריקים)
-- המערכת חוזרת למצב Pilot Success של אחרי cleanup
```

**זה המצב שהמערכת נמצאת בו כרגע.** אין סיכון בהפעלה — הכול reversible בפקודה אחת.

---

## 🏷️ המלצת שם למערכת

### שם פנימי לתפעול (יום-יום)
**`FollowUp Bot`**
קצר, ברור, משתמשים בו כבר. כל הדוחות והקוד כבר עם השם הזה. אל תשנה.

### שם מקצועי/טכני (תיעוד ארכיטקטורה, onboarding מפתחים)
**`Lead Journey Engine`** (LJE)
- "Lead" ולא "Customer" כי זה מבוסס על מצב ה-lead
- "Journey" מדגיש את ה-state machine + memory layer
- "Engine" מבדיל מ-"bot" סתם — זה rules+triggers+cron+memory, לא chat-bot
- שימושי ב-README, architecture diagrams, onboarding

### שם אופציונלי למיתוג (אם יתפרסם ללקוחות/עובדים)
**`Perfect Pulse`**
- רגש של "דופק" → המערכת "מרגישה" את הלידים בזמן אמת
- "Perfect" מחזיר למותג
- אפשרות אחרת: **`Perfect Heartbeat`** (דומה אבל יותר חם) או **`ClearPath`** (ניוטראלי, מדגיש אוטומציית נתיב ברור)
- אם אתה רוצה שמירה מלאה על השם הקיים: **`Perfect FollowUp`** (branded version של הפנימי)

**ההמלצה שלי:** תשאיר את 3 הרמות — `FollowUp Bot` לדיבור יומיומי, `Lead Journey Engine` בקוד/ארכיטקטורה, ו-`Perfect Pulse` רק אם יהיה מה למתג החוצה (ל-clients או landing page).

---

## ⏱️ Timeline מומלץ להפעלה

| Time | Action | Responsible |
|---|---|---|
| יום 1, 11:00 IL | הרץ Wave 1 SQL | CTO/Dev |
| יום 1, 11:00–14:00 | Monitoring אגרסיבי (כל שעה) | CTO/QA |
| יום 1, 14:00 | Check #1: Wave 1 success criteria | CTO |
| יום 1, 22:00 | Check #2: 11h of activity | On-call |
| יום 2, 09:00 | Check #3: 24h stability. אם OK → Wave 2 | CTO |
| יום 2, 11:00 IL | הרץ Wave 2 SQL | CTO |
| יום 2, 11:00–17:00 | Monitoring (כל 2 שעות) | CTO/QA |
| יום 3, 11:00 | Check: 24h of Wave 2 stability | CTO |
| יום 4, 11:00 IL | הרץ Wave 3 SQL | CTO |
| יום 4–5 | Monitoring (כל 4 שעות) | On-call |
| יום 6 | Final review → Phase D (Full production mode) | Team |

**Phase D = אין חדש. זה פשוט אומר "כל ה-rules דולקים, מעבר להפעלה שוטפת, monitoring פעם ביום."**

---

## צ'קליסט מהיר לפני כל wave

- [ ] `followup_cron_health()` → `ok: true`
- [ ] `SELECT count(*) FROM automation_rules WHERE is_active = true;` — מספר נכון לפני wave
- [ ] לבצע backup של `automation_rules` במקרה rollback:
  ```sql
  CREATE TABLE IF NOT EXISTS automation_rules_backup_YYYYMMDD AS
  SELECT * FROM automation_rules;
  ```
- [ ] הודע לצוות בסלאק/וואטסאפ: "Wave X going live ב-HH:MM"
- [ ] פתוח dashboard של Supabase Edge Function logs בטאב נפרד
- [ ] הרץ query #1 (Top-line KPI) מיד אחרי הפעלה
- [ ] Schedule check-in ל-2 שעות קדימה
