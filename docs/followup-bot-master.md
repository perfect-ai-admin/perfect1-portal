# FollowUp Bot / Lead Journey Bot — Master Document

**תאריך:** 2026-04-11
**מערכת:** Perfect One / פרפקט וואן — CRM + WhatsApp automation
**גרסה:** MVP production-hardened + Status Architecture v1
**קהל יעד:** CTO, QA Lead, Head of CRM Automation

מסמך עבודה אחד. שני חלקים:

- **חלק א:** Final QA Report + Production Verdict
- **חלק ב:** FollowUp Bot Status Architecture (הגדרה מלאה של הבוט כמנוע סטטוסים)

---

# חלק א — Final QA Report + Production Verdict

## 1. Executive Summary

מערכת FollowUp Bot נבנתה כ-MVP על גבי ה-CRM הקיים של פרפקט וואן (Supabase + n8n + GreenAPI). היא נועדה להגיב אוטומטית לשינויי סטטוס של לידים, להריץ רצפי תזכורות מוגדרים בכללים, ולעצור רצפים כשלקוח עונה.

בסיבוב הנוכחי בוצע **refactor ארכיטקטוני מלא** לאחר audit שגילה 4 בעיות קריטיות ב-draft הראשון (placeholder secrets, דליפת `SERVICE_KEY` ל-JSON, code nodes מפוזרים, inbound שטחי). התוצאה: **n8n הוא thin webhook relay**, **Supabase Edge Function `followupDispatch` הוא המוח היחיד**, כל הלוגיקה ב-TypeScript שנבדקת כקוד רגיל עם unit tests שרצים בפועל.

**סטטוס נוכחי:** `READY WITH LIMITATIONS` — הקוד ומיגרציות עוברים בדיקות סטטיות וכל 33 unit tests עוברים. בדיקות E2E עם WhatsApp אמיתי חייבות להתבצע ב-staging לפני go-live.

### מה השתנה בסיבוב האחרון (beyond פעם קודמת)

| # | שיפור | קבצים |
|---|---|---|
| 1 | חילוץ לוגיקה טהורה ל-`lib.ts` — מאפשר unit tests אמיתיים | `lib.ts` חדש |
| 2 | **33 Deno unit tests** שרצים ועוברים — מכסים eventKey, renderTemplate, resolveDate, buildLeadPatch, inQuietHours, evaluateConditions, classifyInbound, buildLeadSummary | `lib_test.ts` |
| 3 | **באג קריטי נתפס ע"י test:** הסדר של regex ב-classifyInbound היה שגוי, "לא מעוניין" היה מסווג כ-`interested` | תוקן ב-`lib.ts` |
| 4 | **שדות זיכרון מלאים** על `leads`: `previous_status`, `last_inbound_message`, `last_inbound_at`, `last_outbound_message`, `last_outbound_at`, `lead_summary`, `next_action`, `no_answer_attempts` | migration חדש |
| 5 | `previous_status` מתעדכן אוטומטית ע"י trigger BEFORE UPDATE | DB trigger |
| 6 | `status_history` מתעדכן על כל מעבר ע"י trigger AFTER UPDATE | DB trigger |
| 7 | Seed rules לכל 13 הסטטוסים (8 חדשים + 3 נוסחי no_answer חדשים) | migration חדש |
| 8 | View `lead_memory` לסיכום זיכרון הבוט לכל ליד | migration חדש |
| 9 | `buildLeadSummary` מחושב אוטומטית אחרי כל פעולה ונשמר ל-DB | `index.ts` |
| 10 | `next_action` נרשם אחרי כל פעולה — שקיפות מלאה של "מה הבוט הולך לעשות אחר כך" | `index.ts` |

## 2. מה נבנה בפועל

### 2.1 Database layer (Supabase)

**3 מיגרציות — idempotent, safe to re-run:**

| מיגרציה | תאריך | אחריות |
|---|---|---|
| `20260411110000_followup_bot.sql` | 2026-04-11 | Base: 9 שדות חדשים ב-`leads`, טבלאות `automation_rules` + `automation_logs`, UNIQUE על `event_key` (idempotency), 11 seed rules בסיסיים, pg_cron job, view `followup_kpi_daily` |
| `20260411120000_followup_bot_hardening.sql` | 2026-04-11 | Hardening: helper `followup_dispatch()`, INSERT trigger, inbound trigger על `whatsapp_messages`, re-wire cron ל-edge function, `followup_cron_health()` |
| `20260411130000_followup_bot_memory_and_statuses.sql` | 2026-04-11 | Memory layer: 8 שדות זיכרון, `previous_status` tracking trigger, `status_history` auto-log, seed rules לכל 13 הסטטוסים (כולל 3 no_answer variants), view `lead_memory` |

**טבלאות מרכזיות:**

- `automation_rules` — חוקים כ-data, לא קוד. ניתן להפעיל/לכבות חוק בלי deploy.
- `automation_logs` — כל פעולה נרשמת. `UNIQUE(event_key)` = DB-level idempotency guard.
- `status_history` — כל מעבר סטטוס נרשם אוטומטית (מהמיגרציה השלישית).
- `whatsapp_messages` — הודעות יוצאות ונכנסות, עם dedup על `greenapi_message_id` (קיים קודם).
- `leads` — הורחבה ב-17 שדות בסך הכל: 9 control fields + 8 memory fields.

### 2.2 Business logic (Supabase Edge Functions)

| פונקציה | אחריות | שורות |
|---|---|---|
| `followupDispatch/index.ts` | **המוח**. 4 event handlers: `status_change`, `cron_tick`, `inbound_message`, `manual`. מנהל guards → cooldown → idempotency → execution → memory fields → logging | ~450 |
| `followupDispatch/lib.ts` | **לוגיקה טהורה** לחלופה לבדיקות: `eventKey`, `renderTemplate`, `resolveDate`, `buildLeadPatch`, `inQuietHours`, `evaluateConditions`, `classifyInbound`, `buildLeadSummary` | ~150 |
| `followupDispatch/lib_test.ts` | **33 unit tests** שרצים בפועל. כיסוי: idempotency, templating, date math, guards, classification, memory | ~240 |
| `triggerManualFollowup/index.ts` | Edge function שה-CRM קורא כשנציג לוחץ "שלח תזכורת עכשיו". מאמת ליד + rule, מעביר ל-`followupDispatch` עם `event_type='manual'` | ~75 |

### 2.3 n8n Workflow (thin relay)

| Workflow | אחריות |
|---|---|
| `followup-dispatcher` | **Webhook → HTTP Request → Edge Function**. אין code nodes. אין סודות. 3 retries עם backoff. נפרס ע"י `scripts/deploy-followup-bot.cjs` |

### 2.4 תמיכת deploy ו-QA

| קובץ | תפקיד |
|---|---|
| `scripts/deploy-followup-bot.cjs` | פורס את ה-relay workflow ל-n8n API. אפס סודות ב-workflow JSON. |
| `docs/followup-bot-smoke-tests.sql` | 8 תרחישי E2E ל-SQL editor ב-Supabase, עם expected results |
| `docs/followup-bot-qa-report.md` | דוח QA מגרסה קודמת (הגרסה המאוחדת הזו גוברת עליו) |
| `docs/followup-bot-master.md` | **המסמך הזה** — source of truth לתכולה, סטטוסים, תהליך go-live |

## 3. Refactor ארכיטקטוני — מה נעשה ולמה

### 3.1 הבעיה המקורית

ב-draft הראשון, n8n החזיק את כל ה-brain בתוך code nodes:
- `${GREENAPI_INSTANCE_ID}` — escape שבור → URL שבור
- `SERVICE_KEY` נצרב לתוך `docs/*.json` = דליפת סודות (!)
- לוגיקה מפוזרת בין 4 code nodes — שגיאות שקטות, לא testable
- Inbound handling ברמת "only set paused=true", בלי זיכרון, בלי classification

### 3.2 החלטת ארכיטקטורה

| רכיב | לפני | אחרי |
|---|---|---|
| "מוח" | code nodes ב-n8n | `followupDispatch` edge function |
| Secrets | hardcoded ב-JSON | `Deno.env.get()` בלבד |
| GreenAPI | regex placeholder שבור | reuse `whatsappHelper.sendAndStoreMessage` הקיים |
| Dedup | מנסה לנחש | `UNIQUE(event_key)` ב-DB + `UNIQUE(greenapi_message_id)` ב-`whatsapp_messages` |
| Testability | 0 | 33 passing unit tests |
| Memory | אין | `lib_test.ts` מאמת `buildLeadSummary` על 4 תרחישים |
| Inbound | `followup_paused=true` בלבד | Store → classify → sub_status → task → memory → log |
| Entry points | webhook n8n בלבד | DB trigger → pg_net → edge (3 מקורות: status change, cron, inbound) + n8n webhook שמפנה לאותו edge + manual button |

### 3.3 למה zה טוב יותר

1. **Testability:** כל הלוגיקה הטהורה מכוסה ב-unit tests. 33 tests עוברים מקומית ב-55ms. CI-ready.
2. **Security:** secrets נשארים ב-Supabase Vault, לעולם לא מגיעים ל-n8n JSON או ל-git.
3. **Reuse:** `whatsappHelper.ts` כבר בשימוש ב-bot-v5, post-purchase, crmSendWhatsApp — production-tested.
4. **Single source of truth:** אם יש באג, בודקים לוגים ב-Supabase Dashboard → Edge Functions. לא רודפים בין 5 workflows.
5. **DB-as-source-of-truth:** טריגרים ב-DB מפעילים את ה-edge function ישירות. n8n הוא בונוס, לא חובה. המערכת תעבוד גם אם n8n מושבת.

## 4. קבצים שעודכנו / נוצרו — ואחריות של כל אחד

| # | קובץ | סטטוס | אחריות |
|---|---|---|---|
| 1 | `supabase/migrations/20260411110000_followup_bot.sql` | קיים | Base schema + 11 seed rules |
| 2 | `supabase/migrations/20260411120000_followup_bot_hardening.sql` | קיים | Dispatch helper + triggers + cron + health function |
| 3 | `supabase/migrations/20260411130000_followup_bot_memory_and_statuses.sql` | **חדש** | Memory fields + all 13 status rules + `lead_memory` view |
| 4 | `supabase/functions/followupDispatch/index.ts` | **עודכן** | Imports מ-`lib.ts`, כותב memory fields, מחושב `lead_summary` ו-`next_action` |
| 5 | `supabase/functions/followupDispatch/lib.ts` | **חדש** | 8 פונקציות טהורות — לגמרי ללא Supabase/Deno.env |
| 6 | `supabase/functions/followupDispatch/lib_test.ts` | **חדש** | 33 Deno tests — כל הלוגיקה מכוסה |
| 7 | `supabase/functions/triggerManualFollowup/index.ts` | קיים | מפעיל rule ידנית מ-CRM button |
| 8 | `scripts/deploy-followup-bot.cjs` | קיים | פורס thin relay ל-n8n |
| 9 | `docs/followup-bot-smoke-tests.sql` | קיים | 8 תרחישי E2E ידניים |
| 10 | `docs/followup-bot-master.md` | **חדש** | המסמך הזה |

## 5. בדיקות שבוצעו בפועל ✅

### 5.1 Static analysis
- ✅ `deno check supabase/functions/followupDispatch/index.ts` — nonCode errors
- ✅ `deno check supabase/functions/followupDispatch/lib.ts` — nonCode errors
- ✅ `deno check supabase/functions/triggerManualFollowup/index.ts` — nonCode errors
- ✅ `node --check scripts/deploy-followup-bot.cjs` — SYNTAX OK
- ✅ SQL migrations — ידני review, כולם `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` / `DO $$ EXCEPTION` = idempotent

### 5.2 Unit tests — בוצעו בפועל, רצו, עברו

```
deno test --no-lock supabase/functions/followupDispatch/lib_test.ts
running 33 tests from ./supabase/functions/followupDispatch/lib_test.ts

ok | 33 passed | 0 failed (55ms)
```

כיסוי מלא:

| אזור | tests | מה נבדק בפועל |
|---|---|---|
| `eventKey` | 4 | Determinism, uniqueness, null handling, format regex |
| `renderTemplate` | 3 | Known fields, missing fields, null template |
| `resolveDate` | 4 | `+1d`, `+3h`, null/undefined, ISO passthrough |
| `buildLeadPatch` | 2 | Date resolution for `next_followup_date`, null input |
| `inQuietHours` | 3 | Boolean return, night (IL 23:00), day (IL 13:00) |
| `evaluateConditions` | 5 | Empty, eq match/mismatch, in, exists |
| `classifyInbound` | 8 | 6 categories + edge case "לא מעוניין" vs "מעוניין" |
| `buildLeadSummary` | 4 | Status+prev, default, no_answer_attempts, truncation |

**הבאג הקריטי שנתפס ע"י test:** `classifyInbound('לא מעוניין תודה')` היה מחזיר `interested` בגלל סדר בדיקות regex שגוי. התיקון: `not_relevant` נבדק **ראשון** לפני `interested`. **זה בדיוק הסוג של באג שהיה מגיע לפרודקשן בלי בדיקות.**

### 5.3 Code review ידני של flows קריטיים
- ✅ Scenario 1 (status_change → quote_sent): זרימה מלאה מ-trigger עד log מסומן.
- ✅ Scenario 4 (inbound → pause): DB trigger ב-`whatsapp_messages` INSERT → edge → memory + task + log.
- ✅ Scenario 6 (duplicate protection): `event_key` SHA-256 עם bucket לפי `changed_at` וליום עבור cron.
- ✅ Trigger overlap: `trg_notify_n8n_lead_change` (legacy bot-v5) ו-`trg_followup_status_change` (חדש) פונים ל-webhooks שונים. בוצעה סקירה — **אין duplicate WhatsApp**. תועד במיגרציית hardening.

## 6. בדיקות שלא בוצעו — ולמה

### 6.1 בדיקות שחייבות סביבה עם סודות אמיתיים

| בדיקה | למה לא בוצעה |
|---|---|
| E2E: `supabase db push` על DB חי | אין גישה ל-DB production/staging ממכונת הפיתוח |
| E2E: שליחת WhatsApp אמיתית דרך GreenAPI | חסר `GREENAPI_API_TOKEN` + `GREENAPI_INSTANCE_ID` |
| E2E: שליחה לטלפון בדיקה וקבלה הלוך-חזור | אין מספר טלפון בבעלות לבדיקה |
| E2E: deploy ל-n8n API | חסר `N8N_API_KEY` |
| E2E: trigger אמיתי `pipeline_stage='quote_sent'` וצפייה ב-WhatsApp על הטלפון | נגזרת מכל הנ"ל |
| E2E: קרון באמת רץ כל 5 דקות | דורש מעקב ב-Supabase cron logs לאחר deploy |
| E2E: INSERT ל-`whatsapp_messages` עם `direction=inbound` ובדיקה ש-`followup_paused=true` | דורש גישה ל-DB חי |

**מסקנה:** כל 8 התרחישים של `docs/followup-bot-smoke-tests.sql` **מוכנים להרצה**, עם expected results מפורטים, אך **חייבים להתבצע ידנית בסביבת staging/production ע"י מפתח עם הרשאות.**

### 6.2 מה לא בוצע ולא תוקן

- **אין test integration של Edge Function מול Supabase חי** — דורש Supabase CLI + DB test. לא תוקן בגלל היעדר גישה לסביבה.
- **אין load test** — לא נבדקה התנהגות ב-100+ לידים בו-זמנית. מקובל ל-MVP.
- **אין retry של pg_net** — אם edge function לא מגיב, pg_net לא מנסה שוב. Acceptable כי יש cron tick כל 5 דקות שמאתר לידים עם `next_followup_date` בעבר.

## 7. סיכונים פתוחים

### 🔴 HIGH — חייב טיפול לפני go-live

| סיכון | מיטיגציה |
|---|---|
| `GREENAPI_API_TOKEN` / `GREENAPI_INSTANCE_ID` לא מוגדרים | ב-Supabase dashboard → Edge Functions → Secrets, הגדר את שני המשתנים |
| `app.followup_dispatch_url` / `app.followup_service_role` לא מוגדרים | הרץ `ALTER DATABASE postgres SET ...` ב-SQL editor (ר' סעיף 9) |
| DB trigger שולח webhook לפני ש-config מוגדר → שקט | הרץ `SELECT followup_cron_health()` ובדוק `dispatch_url_configured: true` |
| לא בוצעה בדיקת WhatsApp אמיתית מקצה לקצה | Phase B של go-live: ליד בדיקה אחד בלבד עם טלפון שלך |

### 🟠 MEDIUM — לפקח אחרי go-live

| סיכון | מיטיגציה |
|---|---|
| Race condition: עדכון סטטוס בתוך transaction שרולבק → webhook יצא בכל זאת | pg_net רץ בworker נפרד אחרי commit — מאומת ב-docs של pg_net. acceptable. |
| שני status changes ברצף מהיר עלולים להפעיל את אותו rule | `event_key` מבודד לפי `changed_at` ISO — שני events במיקרו-שניות שונות יקבלו `event_key` שונה → שני מסרים. acceptable כי `cooldown_hours` של רוב הכללים = 20h. |
| Classification עברית keyword-based → false positives | המטרה היא **פתיחת task**, לא שליחת תגובה. סוכן רואה את ההודעה המלאה. false positive = task מיותר, לא נזק ללקוח. |
| `max_per_lead` = COUNT query → איטי על סקייל | אינדקס ממוקד קיים: `idx_automation_logs_rule_lead_sent`. תקין עד ~100K לידים. |
| cron_tick מוגבל ל-50 לידים בריצה | על עומס >50, חלקם יחכו 5 דקות נוספות. acceptable ל-MVP. ניתן להגדיל ל-200 בקלות. |

### 🟡 LOW — לא חוסם

| סיכון | הערה |
|---|---|
| Quiet hours 21:00-08:00 קשיחים | אם צריך שונה פר-rule, 10 שורות refactor |
| אין UI לניהול rules | כרגע SQL בלבד. Phase 2. |
| אין A/B testing של נוסחים | נוסחים קבועים ב-`action_config.body`. Phase 2. |
| WhatsApp PDF/media — רק טקסט | קישורים עובדים בתוך טקסט. שליחת קובץ אמיתי = Phase 2. |

## 8. Preconditions ל-go-live

**לפני ההפעלה, כל הסעיפים חייבים להיות ✅:**

- [ ] Migrations הוחלו על production DB: `20260411110000`, `20260411120000`, `20260411130000`
- [ ] Extensions זמינים: `pg_net`, `pg_cron`
- [ ] Edge Function secrets מוגדרים: `GREENAPI_API_TOKEN`, `GREENAPI_INSTANCE_ID`
- [ ] DB settings מוגדרים:
  - [ ] `app.followup_dispatch_url` = `https://<project>.supabase.co/functions/v1/followupDispatch`
  - [ ] `app.followup_service_role` = `<SERVICE_ROLE_JWT>`
- [ ] Edge functions פרוסות: `followupDispatch`, `triggerManualFollowup`
- [ ] `SELECT followup_cron_health();` מחזיר `{"ok": true, "dispatch_url_configured": true}`
- [ ] `SELECT count(*) FROM automation_rules WHERE is_active = true;` ≥ 15 (11 בסיסיים + 4-5 מהמיגרציה השלישית)
- [ ] בוצע smoke test אחד לפחות (Scenario 1) על ליד בדיקה עם טלפון שלך

## 9. שלבי deployment מדויקים

```bash
# ============================================================
# Step 1. Apply all 3 migrations
# ============================================================
cd "c:/Users/USER/Desktop/קלואד קוד/פרפקט וואן - מכירות"
supabase db push
# או: הרץ כל SQL file ב-Supabase SQL editor בסדר הכרונולוגי

# ============================================================
# Step 2. Set Edge Function secrets
# ============================================================
# ב-Supabase Dashboard → Edge Functions → Secrets, הוסף:
#   GREENAPI_API_TOKEN = <your token>
#   GREENAPI_INSTANCE_ID = <your instance>
# (SUPABASE_URL ו-SUPABASE_SERVICE_ROLE_KEY מוגדרים אוטומטית)

# ============================================================
# Step 3. Deploy Edge Functions
# ============================================================
supabase functions deploy followupDispatch --no-verify-jwt
supabase functions deploy triggerManualFollowup
# הערה: --no-verify-jwt חיוני על followupDispatch כי הוא נקרא מ-pg_net (server-to-server).
# הפונקציה בודקת internally שהיא מופעלת עם service_role.

# ============================================================
# Step 4. Configure DB settings (one-time)
# ============================================================
# ב-Supabase SQL editor:
ALTER DATABASE postgres SET app.followup_dispatch_url =
  'https://<PROJECT_REF>.supabase.co/functions/v1/followupDispatch';
ALTER DATABASE postgres SET app.followup_service_role =
  '<SERVICE_ROLE_JWT>';
SELECT pg_reload_conf();

-- Verify
SELECT followup_dispatch_url(), followup_service_role() <> '' AS token_set;

# ============================================================
# Step 5. (Optional) Deploy n8n relay
# ============================================================
# DB triggers כבר קוראים ל-edge function ישירות דרך pg_net.
# n8n relay הוא בונוס עבור webhook חיצוני (CRM button, integrations).
export N8N_API_URL=https://n8n.perfect-1.one/api/v1
export N8N_API_KEY=<n8n_token>
export SUPABASE_URL=https://<project-ref>.supabase.co
node scripts/deploy-followup-bot.cjs

# ב-n8n UI: הפעל את ה-workflow "followup-dispatcher"

# ============================================================
# Step 6. Post-deploy health check
# ============================================================
# ב-Supabase SQL editor, 5+ דקות אחרי deploy:
SELECT followup_cron_health();
-- מוכרח להחזיר: {"ok": true, "last_status": "succeeded", "dispatch_url_configured": true}

SELECT count(*) FILTER (WHERE is_active = true) AS active_rules FROM automation_rules;
-- מוכרח: >= 15
```

## 10. Smoke tests שחייבים להריץ

**כל התרחישים מוכנים ב-[docs/followup-bot-smoke-tests.sql](followup-bot-smoke-tests.sql) עם expected results מפורטים.**

לפני שמפעילים על לידים אמיתיים, חובה להריץ **לפחות 3** תרחישים בסביבת staging:

### Scenario 1: Status change → quote_sent (חובה)
```sql
INSERT INTO leads (name, phone, pipeline_stage, whatsapp_opt_in)
VALUES ('TEST', '+972<YOUR_PHONE>', 'new_lead', true) RETURNING id;

UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = ':TEST_ID';

-- Expected: WhatsApp מגיע לטלפון שלך
-- Expected: automation_logs מכיל שורה עם rule_name='quote_sent_day0', result='sent'
-- Expected: leads.last_outbound_message מכיל את הטקסט ששלחנו
-- Expected: leads.previous_status = 'new_lead', pipeline_stage = 'quote_sent'
-- Expected: status_history מכיל שורה חדשה
```

### Scenario 4: Inbound reply stops sequence (חובה)
```sql
INSERT INTO whatsapp_messages (lead_id, phone, direction, sender_type, message_text, message_type)
VALUES (':TEST_ID', '+972<YOUR_PHONE>', 'inbound', 'user', 'כן מעוניין בבקשה', 'text');

-- Expected: leads.followup_paused = true
-- Expected: leads.last_inbound_message = 'כן מעוניין בבקשה'
-- Expected: leads.needs_human = true
-- Expected: leads.sub_status = 'interested'
-- Expected: tasks שורה חדשה עם task_type='inbound_interested'
-- Expected: automation_logs שורה עם trigger_type='inbound_message'
```

### Scenario 6: Duplicate protection (חובה)
```bash
# קרא לאותו payload פעמיים:
curl -X POST https://<project>.supabase.co/functions/v1/followupDispatch \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"status_change","lead_id":"<TEST_ID>","to_status":"contacted","changed_at":"2026-04-11T12:00:00Z"}'

# הרץ שוב עם אותו payload בדיוק
```
```sql
SELECT result, count(*) FROM automation_logs
WHERE lead_id = ':TEST_ID' AND rule_name = 'contacted_summary'
GROUP BY result;

-- Expected: result='sent' → 1 row only
-- השני חוזר מה-edge function כ-'dedup' בלי לכתוב שורה חדשה
```

### Scenario 7: WhatsApp failure fallback
```sql
UPDATE leads SET phone = 'invalid_phone' WHERE id = ':TEST_ID';
UPDATE leads SET pipeline_stage = 'contacted' WHERE id = ':TEST_ID';
UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = ':TEST_ID';

SELECT result, error FROM automation_logs
WHERE lead_id = ':TEST_ID' ORDER BY created_at DESC LIMIT 1;
-- Expected: result='failed'

SELECT task_type, priority FROM tasks
WHERE lead_id = ':TEST_ID' AND task_type = 'whatsapp_send_failed';
-- Expected: שורה עם priority='high'
```

## 11. Verdict סופי

# ⚠️ **READY WITH LIMITATIONS**

המערכת מוכנה לפריסת production בכפוף ל-go-live plan המדורג ב-סעיף 12.

**מה שאושר:**
- ✅ ארכיטקטורה (n8n = relay, Supabase = brain)
- ✅ Static analysis נקי על כל הקוד
- ✅ 33 unit tests עוברים בפועל (כולל באג קריטי שנתפס בתהליך)
- ✅ Idempotency guaranteed at DB level
- ✅ Dedup של WhatsApp מובטח ע"י UNIQUE constraint קיים
- ✅ Memory layer מלא (זיכרון הבוט + history)
- ✅ Inbound flow מסווג + יוצר task + שומר זיכרון
- ✅ כל 13 הסטטוסים מכוסים ב-seed rules
- ✅ Code review ידני של flows קריטיים
- ✅ Rollback safe (כל מיגרציה idempotent, edge function ניתנת למחיקה)

**מה שלא אושר:**
- ❌ לא בוצע E2E אמיתי עם WhatsApp על טלפון (דורש סביבה עם סודות)
- ❌ לא בוצע cron run אמיתי בפועל (דורש deploy + המתנה 5 דקות)
- ❌ לא בוצעה בדיקת load
- ❌ לא בוצעה בדיקת אמיתית של `followup_cron_health()` על DB חי

**אסור להעלות לפרודקשן בלי:**
1. הרצת הצ'קליסט של סעיף 8 ✅ על כל שורה
2. ביצוע Phase A+B מסעיף 12
3. `SELECT followup_cron_health()` מחזיר ok
4. Scenario 1 עובר על טלפון אמיתי

## 12. Go-live Plan מדורג

### Phase A — Dry run (יום 1)
**מטרה:** לאמת שהמערכת פרוסה ומחוברת, בלי לשלוח הודעות.
- [ ] Deploy migrations + edge functions לפרודקשן
- [ ] הגדר secrets + DB settings
- [ ] `UPDATE automation_rules SET is_active = false;` — כבה את כל הכללים
- [ ] בצע שינוי סטטוס בליד בדיקה → וודא שה-edge function נקראה (Supabase logs)
- [ ] `SELECT followup_cron_health();` → ok=true
- [ ] אין הודעות WhatsApp יוצאות
- ✅ **Gate:** edge function logs מראים "received event_type=status_change" ולא failures

### Phase B — Single rule pilot (יום 2)
**מטרה:** לאמת שליחת WhatsApp אמיתית, end-to-end, עם ליד בדיקה ומספר שלך.
- [ ] צור ליד בדיקה עם שמך והטלפון שלך
- [ ] `UPDATE automation_rules SET is_active = true WHERE name = 'quote_sent_day0';`
- [ ] `UPDATE leads SET pipeline_stage = 'quote_sent' WHERE id = <test>;`
- [ ] וודא: WhatsApp מגיע, `last_outbound_message` נשמר, `automation_logs.result='sent'`, `status_history` מתעדכן
- [ ] שלח תגובה מהטלפון שלך: "כן מעוניין"
- [ ] וודא: `followup_paused=true`, task נפתח, `last_inbound_message` נשמר
- [ ] כבה את הכלל: `UPDATE automation_rules SET is_active = false WHERE name = 'quote_sent_day0';`
- ✅ **Gate:** הודעה יוצאה + הודעה נכנסה + task + כל השדות העדכניים

### Phase C — All rules enabled (יום 3-7)
**מטרה:** הפעלה מלאה עם ניטור אגרסיבי.
- [ ] `UPDATE automation_rules SET is_active = true;`
- [ ] הרץ `SELECT * FROM followup_kpi_daily WHERE day = current_date;` כל שעה ביום הראשון
- [ ] וודא `result='failed'` < 5% מהכלל
- [ ] בדוק ב-`lead_memory` view 5 לידים אמיתיים — `lead_summary` ו-`next_action` הגיוניים
- [ ] וודא שאין הודעות בשעות שקט (21:00-08:00) — `SELECT count(*) FROM automation_logs WHERE action_type='send_whatsapp' AND extract(hour from created_at at time zone 'Asia/Jerusalem') NOT BETWEEN 8 AND 20 AND result='sent';`
- ✅ **Gate:** שבוע ללא incidents, failure rate תחת 5%

### Phase D — Extension (שבוע 2+)
- רצפי broadcast / campaign UI
- LLM-based classification להחליף keyword
- תמיכה ב-PDF/media ב-GreenAPI
- Dashboard UI ל-`lead_memory`

## 13. Post-go-live monitoring plan

### Daily (אוטומטי דרך ניטור/Slack)
```sql
-- KPI daily
SELECT day, action_type, result, n
FROM followup_kpi_daily
WHERE day >= current_date - interval '1 day'
ORDER BY 1 DESC, 2, 3;

-- Failure rate alert threshold: >5%
SELECT
  round(100.0 * count(*) FILTER (WHERE result = 'failed') / NULLIF(count(*), 0), 2) AS failure_pct
FROM automation_logs
WHERE created_at > now() - interval '24 hours';

-- Cron health
SELECT followup_cron_health();
```

### Weekly
- Review 10 random `lead_memory` rows — האם `lead_summary` מדויק, `next_action` הגיוני?
- Review `automation_logs WHERE result='failed'` — האם יש pattern חוזר?
- Review `tasks WHERE task_type='whatsapp_send_failed'` — האם GreenAPI יציב?
- `SELECT count(*) FROM automation_logs WHERE trigger_type='inbound_message' AND created_at > now() - interval '7 days';` — כמה לקוחות ענו?

### Alerts (חובה להגדיר)
- `followup_cron_health()` → `ok=false` → alert
- Failure rate > 10% במשך שעה → alert
- `GREENAPI_API_TOKEN` missing (מופיע ב-edge function logs) → alert

## 14. Rollback considerations

### אם משהו הולך רע ב-Phase A
- `UPDATE automation_rules SET is_active = false;` — עוצר כל הכללים
- `SELECT cron.unschedule('followup-tick');` — עוצר cron
- המערכת "מתה" מידית, בלי נזק לדאטה.

### אם משהו הולך רע אחרי Phase B/C
- אותו רצף: disable rules + unschedule cron.
- `DELETE FROM automation_logs WHERE created_at > '<rollback_point>';` — ננקה logs אם צריך
- `UPDATE leads SET followup_paused = false, followup_sequence_name = null, next_followup_date = null WHERE followup_sequence_name IS NOT NULL;` — reset סיטואציות תלויות
- **כל ההודעות שכבר נשלחו אי אפשר לבטל** — לכן Phase A/B הם חובה לפני Phase C.

### DB rollback
כל ה-migrations שלנו הן additive — אין `DROP TABLE`/`DROP COLUMN`. rollback נקי:
```sql
-- Downgrade (use with caution, loses rule data)
DROP TRIGGER IF EXISTS trg_log_status_history ON leads;
DROP TRIGGER IF EXISTS trg_track_previous_status ON leads;
DROP TRIGGER IF EXISTS trg_followup_status_change ON leads;
DROP TRIGGER IF EXISTS trg_followup_new_lead ON leads;
DROP TRIGGER IF EXISTS trg_followup_inbound ON whatsapp_messages;
SELECT cron.unschedule('followup-tick');
-- Tables (optional, destroys data):
-- DROP TABLE automation_logs;
-- DROP TABLE automation_rules;
```

## 15. המלצות לגרסה הבאה (Phase 2+)

לפי סדר עדיפות:

1. **Integration tests מול Supabase instance** — ב-CI, עם Supabase local + fake GreenAPI.
2. **LLM classification** — להחליף keyword regex ב-Claude/OpenAI call. Guardrails: האגנט רק מציע next_status, לא מבצע אותו אוטומטית.
3. **Broadcast/campaign tool** — SQL-driven selection + rule execution על bulk of leads.
4. **A/B testing של נוסחים** — variant A/B ב-`automation_rules` עם assignment ב-`event_key`.
5. **Dashboard UI** — צפייה ב-`lead_memory`, history graph, KPI realtime.
6. **Media support** — הרחבה של `whatsappHelper.sendAndStoreFile()` ל-PDF.
7. **Multi-channel** — Email + SMS fallback כש-WhatsApp נכשל.
8. **Outbound hooks ל-CRM UI** — עדכונים בזמן אמת למסך של הנציג.

---

# חלק ב — FollowUp Bot Status Architecture

## 1. שם והגדרת תפקיד

**שם:** FollowUp Bot / Lead Journey Bot
**תפקיד:** מנוע אוטומציה חכם מבוסס סטטוסים, זיכרון, מעברים ותגובות קצרות. מנהל כל ליד לאורך ה-journey מרגע יצירתו ועד סגירה/הפקעה, מגיב אוטומטית לשינויי סטטוס, זוכר כל אינטראקציה, ועוצר רצפים ברגע שלקוח ענה.

**פילוסופיה מנחה:**
- **CRM is source of truth.** הבוט אף פעם לא מחליט סטטוס לבד. הוא רק מגיב למה שה-CRM מספר לו.
- **Memory first.** כל פעולה כותבת ל-`last_outbound_message`, `last_inbound_message`, `lead_summary`, `status_history`.
- **Short + human.** הודעות תחת 2 שורות, עברית פשוטה, אמוג'י אחד מקסימום, תמיד ממשיך את השיחה שהייתה.
- **Agent-in-the-loop.** כל תגובה נכנסת פותחת task לנציג. הבוט לא מוכר, הוא מזרים.

## 2. זיכרון נדרש (מה הבוט זוכר על כל ליד)

ממומש ב-`leads` טבלה כשדות קשיחים + `status_history` כ-audit log + `automation_logs` כ-execution history. View `lead_memory` מרכז הכול למבט אחד.

### 2.1 שדות חובה על `leads`

| שדה | סוג | מי כותב | תיאור |
|---|---|---|---|
| `pipeline_stage` | text | CRM UI / triggers | **current_status** — הסטטוס הנוכחי. מקור האמת. |
| `previous_status` | text | DB trigger BEFORE UPDATE | הסטטוס שהיה לפני המעבר האחרון. מתעדכן אוטומטית. |
| `sub_status` | text | בוט (מ-inbound classification) / סוכן | הבחנה עדינה בתוך סטטוס (`price_objection`, `docs_received`, `interested`) |
| `followup_sequence_name` | text | בוט | רצף אקטיבי (`quote_followup`, `docs_followup`, `no_answer_recovery`, `payment_followup`, `long_tail`) |
| `followup_sequence_step` | int | בוט | הצעד הנוכחי ברצף (0/1/2/3) |
| `followup_paused` | boolean | בוט (על inbound) / סוכן | אם true — אף rule לא ירוץ על הליד (חוץ מ-stop_sequence) |
| `do_not_contact` | boolean | סוכן | hard block — לא שולחים שום דבר לעולם |
| `needs_human` | boolean | בוט / סוכן | סימון שהוא דורש מבט אנושי |
| `whatsapp_opt_in` | boolean | CRM | האם הסכים לקבל WhatsApp |
| `last_contact_at` | timestamptz | בוט | last touch (in או out) |
| `last_inbound_message` | text | בוט (truncate 500) | ההודעה האחרונה שנכנסה |
| `last_inbound_at` | timestamptz | בוט | זמן ההודעה האחרונה שנכנסה |
| `last_outbound_message` | text | בוט (truncate 500) | ההודעה האחרונה שיצאה |
| `last_outbound_at` | timestamptz | בוט | זמן ההודעה האחרונה שיצאה |
| `lead_summary` | text | בוט (`buildLeadSummary`) | סיכום קצר בעברית של מצב הליד. מחושב מחדש אחרי כל פעולה. |
| `next_action` | text | בוט | שם ה-rule הבא שהבוט מתכנן להריץ, או "review_reply -> interested" אחרי inbound |
| `next_followup_date` | timestamptz | בוט | מתי cron_tick אמור לבדוק את הליד |
| `no_answer_attempts` | int | בוט | כמה פעמים כבר ניסינו ברצף no_answer |

### 2.2 אודיט מחוץ ל-`leads`

| טבלה | תפקיד |
|---|---|
| `status_history` | כל מעבר סטטוס. `{old_status, new_status, changed_by, change_reason, changed_at}` |
| `automation_logs` | כל ניסיון פעולה. `{rule_name, event_key, result, error, action_payload, created_at}` |
| `whatsapp_messages` | כל הודעה יוצאת/נכנסת. `{direction, message_text, greenapi_message_id, delivery_status, sender_type, created_at}` |
| `tasks` | משימות אנושיות שנפתחו. `{task_type, priority, status, notes, assigned_to, lead_id}` |

### 2.3 View לאגרטור הכל — `lead_memory`

```sql
SELECT * FROM lead_memory WHERE id = :lead_id;
-- מחזיר: current_status, previous_status, followup_sequence, paused flags,
--        last_inbound/outbound, lead_summary, next_action,
--        messages_sent_total, status_transitions
```

## 3. סטטוסים — מפה מלאה של 13 הסטטוסים

לכל סטטוס: הגדרה עסקית, מתי נכנסים, שדות שמתעדכנים, הודעה מותרת, דוגמה, מעבר לסטטוס הבא, תנאי עצירה, sub-status, מתי צריך נציג, אוטומציות מותרות/אסורות.

---

### 3.1 `new_lead`
- **הגדרה עסקית:** ליד שזה עתה נכנס ל-CRM (טופס, landing page, manual). עוד לא נעשה שום ניסיון ליצירת קשר.
- **מתי נכנסים:** INSERT ל-`leads` (או ע"י CRM wizard).
- **שדות שמתעדכנים:** `created_at`, `source`, `pipeline_stage='new_lead'`, `whatsapp_opt_in=true` (default).
- **הודעות מותרות:** opening message אחת בלבד, וולקומית קלה, אסור pushy.
- **דוגמה:** _"שלום {{name}} 👋 קיבלנו את הפרטים שלך. נחזור אליך בקרוב."_
- **מעבר הבא:** `attempted_contact` (סוכן מתחיל לנסות) / `contacted` (אם יש שיחה מיידית).
- **תנאי עצירה:** `do_not_contact=true`, `whatsapp_opt_in=false`.
- **Sub-status:** `from_web_form`, `from_landing`, `from_manual`.
- **מתי צריך נציג:** תמיד — ליד חדש דורש הקצאה.
- **מותר:** welcome message יחיד. **אסור:** תזכורות חוזרות, הצעות מחיר.

---

### 3.2 `attempted_contact`
- **הגדרה עסקית:** הסוכן ניסה להתקשר ולא הצליח לתפוס. או הבוט ניסה ליצור קשר ראשוני ולא קיבל תגובה.
- **מתי נכנסים:** סוכן לוחץ "ניסיתי להתקשר" ב-CRM, או אחרי שיחה שלא נענתה.
- **שדות:** `pipeline_stage='attempted_contact'`, `contact_attempts++`, `next_followup_date=+1d`, `followup_sequence_name='attempted_contact'`.
- **הודעות:** nudge עדין אחד.
- **דוגמה:** _"שלום {{name}}, ניסיתי להתקשר אליך. מתי נוח לך לדבר כמה דקות?"_
- **מעבר הבא:** `contacted` (אם עונים), `no_answer` (אם 3 ניסיונות), `not_relevant` (סוכן מסמן).
- **תנאי עצירה:** לקוח ענה בוואטסאפ → `followup_paused=true`.
- **Sub-status:** `one_attempt`, `two_attempts`, `three_attempts`.
- **נציג:** כן, לפי הצורך.
- **מותר:** nudge אחד. **אסור:** רצף ארוך.

---

### 3.3 `contacted`
- **הגדרה עסקית:** התקיימה שיחה — טלפונית או בוואטסאפ. מידע ראשוני נאסף.
- **מתי נכנסים:** סוכן מסמן "דיברתי", או תגובת inbound עם `classifyInbound → general_reply/interested`.
- **שדות:** `last_contact_at=now()`, `followup_paused=false`, `needs_human` לפי שיקול.
- **הודעות:** summary message קצר אחרי השיחה.
- **דוגמה:** _"היי {{name}}, היה נעים לדבר איתך 🙏 אם יש שאלה נוספת אני כאן."_
- **מעבר הבא:** `interested` (אם הביע עניין), `quote_sent` (אם מבקש הצעה), `followup_later` (אם לא זה הזמן), `not_relevant`.
- **תנאי עצירה:** הסוכן קובע מעבר ידני.
- **Sub-status:** `initial_call`, `second_call`, `questions_asked`.
- **נציג:** כן, למיפוי הצרכים.
- **מותר:** post-call summary אחד. **אסור:** pricing automation בלי גיבוי סוכן.

---

### 3.4 `interested`
- **הגדרה עסקית:** הלקוח אמר "כן, אני מעוניין". ממתין להצעת מחיר או המשך תהליך.
- **מתי נכנסים:** סוכן מסמן ידנית, או inbound classified as `interested` (עדיין דורש אישור סוכן).
- **שדות:** `sub_status='interested'`, `needs_human=true`, `next_followup_date=+1d`.
- **הודעות:** acknowledgment מלהיב-אך-לא-לוחץ.
- **דוגמה:** _"מעולה {{name}} 🎯 אני מכין לך הצעה ונחזור אליך היום."_
- **מעבר הבא:** `quote_sent` (אחרי שנשלחה הצעה).
- **תנאי עצירה:** סוכן מעביר, לקוח משנה דעת.
- **Sub-status:** `awaiting_quote`, `price_discussion`, `needs_info`.
- **נציג:** כן — חייב לשלוח הצעה בעצמו.
- **מותר:** 1 acknowledgment. **אסור:** לשלוח מחיר אוטומטית.

---

### 3.5 `quote_sent`
- **הגדרה עסקית:** הסוכן שלח הצעת מחיר. ממתינים להחלטה.
- **מתי נכנסים:** סוכן שולח הצעה ולוחץ על הכפתור ב-CRM.
- **שדות:** `pipeline_stage='quote_sent'`, `quote_status='sent'`, `followup_sequence_name='quote_followup'`, `followup_sequence_step=1`, `next_followup_date=+1d`.
- **הודעות:** יום 0, 1, 3 — רצף תזכורות.
- **דוגמאות:**
  - יום 0: _"שלום {{name}}, שלחנו לך את הצעת המחיר. נשמח לשמוע מה דעתך."_
  - יום 1: _"היי {{name}}, רק לוודא שההצעה התקבלה. יש שאלות?"_
  - יום 3: _"שלום {{name}}, זו תזכורת אחרונה לגבי ההצעה. אשמח לתשובה."_
- **מעבר הבא:** `payment_pending` (קיבל), `followup_later` (דחה לעכשיו), `not_relevant` (סירב).
- **תנאי עצירה:** לקוח ענה → `followup_paused=true` → סוכן רואה task.
- **Sub-status:** `quote_viewed`, `quote_revised`, `price_objection`.
- **נציג:** כן — סוכן מקבל task אחרי כל תגובת לקוח.
- **מותר:** 3 תזכורות מקסימום, ב-cooldown של 20h ביניהן. **אסור:** תזכורות יותר תכופות.

---

### 3.6 `waiting_for_documents`
- **הגדרה עסקית:** הלקוח צריך להעלות מסמכים (תעודת זהות, חשבון בנק וכו'). ממתינים.
- **מתי נכנסים:** אחרי הסכמה / תשלום, לפני תחילת טיפול.
- **שדות:** `followup_sequence_name='docs_followup'`, `next_followup_date=+2d`.
- **הודעות:** יום 0, 2, 4 (יום 4 פותח task לנציג במקום הודעה).
- **דוגמה:** _"שלום {{name}}, כדי להתקדם נזדקק לתעודת זהות ואישור ניהול חשבון. נא להעלות כאן: {{upload_link}}"_
- **מעבר הבא:** `in_process` (מסמכים התקבלו) או `followup_later` (לקוח חרש).
- **תנאי עצירה:** מסמכים התקבלו (manual/trigger).
- **Sub-status:** `partial_docs`, `all_received`, `needs_correction`.
- **נציג:** ביום 4 — task אוטומטי "לקוח לא שלח מסמכים לאחר 4 ימים".
- **מותר:** 2 תזכורות אוטומטיות. **אסור:** תזכורות אגרסיביות כל יום.

---

### 3.7 `payment_pending`
- **הגדרה עסקית:** נשלח קישור לתשלום, ממתינים לעמלה.
- **מתי נכנסים:** סוכן שלח payment link (הגם שיכול להיות מה-CRM).
- **שדות:** `payment_status='link_sent'`, `payment_link_sent_at=now()`, `followup_sequence_name='payment_followup'`.
- **הודעות:** יום 0, 1, 3 (יום 3 פותח task).
- **דוגמה:** _"שלום {{name}}, שלחנו לך קישור לתשלום. ברגע שתסיים נמשיך קדימה."_
- **מעבר הבא:** `paid` (תשלום הושלם — webhook מ-Stripe/Tranzila), `followup_later` (דחה).
- **תנאי עצירה:** תשלום הושלם (payment webhook מחליף status).
- **Sub-status:** `link_viewed`, `card_failed`, `price_objection`.
- **נציג:** אחרי יום 3 — task "payment_stalled".
- **מותר:** 2 תזכורות + task. **אסור:** לחץ אגרסיבי.

---

### 3.8 `paid`
- **הגדרה עסקית:** התשלום התקבל, אפשר להתחיל לעבוד.
- **מתי נכנסים:** payment webhook מ-Stripe/Tranzila מעדכן `payment_status='paid'` ו-trigger ב-CRM מעדכן `pipeline_stage='paid'`.
- **שדות:** `paid_at=now()`, `followup_sequence_name=null`, `followup_sequence_step=0`, `followup_paused=false` (resetting so in_process rules can run).
- **הודעות:** thank you חם + מה השלב הבא.
- **דוגמה:** _"תודה {{name}} 🙏 התשלום התקבל. נתחיל בטיפול ונעדכן אותך בקרוב."_
- **מעבר הבא:** `waiting_for_documents` (אם עוד לא) או `in_process`.
- **תנאי עצירה:** אף פעם לא נעצר — רק עובר הלאה.
- **Sub-status:** `first_payment`, `subscription`, `partial`.
- **נציג:** כן — onboarding.
- **מותר:** thank you אחד + notification לנציג. **אסור:** upsell אוטומטי.

---

### 3.9 `in_process`
- **הגדרה עסקית:** הצוות פעיל על הטיפול של הלקוח. פתיחת עוסק, הגשת מסמכים, וכו'.
- **מתי נכנסים:** סוכן מסמן "התחלתי", או אוטומטי אחרי שמסמכים הושלמו.
- **שדות:** `pipeline_stage='in_process'`, `followup_sequence_name=null`, `next_followup_date=null`.
- **הודעות:** acknowledgment אחד שהטיפול החל.
- **דוגמה:** _"שלום {{name}}, התחלנו בטיפול בבקשה שלך. נעדכן ברגע שיש התקדמות."_
- **מעבר הבא:** `completed`.
- **תנאי עצירה:** סטטוס נשאר עד סיום.
- **Sub-status:** `docs_review`, `filed_with_authority`, `awaiting_approval`.
- **נציג:** כן — עושה את העבודה.
- **מותר:** updates ידניים של הסוכן. **אסור:** תזכורות אוטומטיות (הלקוח לא צריך לעשות כלום).

---

### 3.10 `completed`
- **הגדרה עסקית:** הטיפול הסתיים, השירות סופק.
- **מתי נכנסים:** סוכן מסמן "סיימתי".
- **שדות:** `pipeline_stage='completed'`, `completed_at=now()`, `followup_sequence_name=null`.
- **הודעות:** סיום חם + הזמנה לחזור.
- **דוגמה:** _"{{name}}, סיימנו 🎉 תודה על האמון. אם משהו נוסף יצוץ — אני כאן."_
- **מעבר הבא:** terminal — לא עובר הלאה אוטומטית.
- **תנאי עצירה:** סטטוס סופי.
- **Sub-status:** `successful`, `partial`, `no_followup`.
- **נציג:** אופציונלי — לבקש חוות דעת.
- **מותר:** thank-you אחד. **אסור:** משהו שיכול להתפרש כ-upsell.

---

### 3.11 `no_answer`
- **הגדרה עסקית:** ניסינו ליצור קשר מספר פעמים ולא הצלחנו (אין תגובות, אין שיחה).
- **מתי נכנסים:** סוכן מסמן אחרי מספר ניסיונות, או אוטומטית אחרי X ניסיונות שלא נענו.
- **שדות:** `pipeline_stage='no_answer'`, `followup_sequence_name='no_answer_recovery'`, `no_answer_attempts=1/2/3`, `next_followup_date=+1d`.
- **הודעות:** 3 וריאציות בקצב 0/1/3 ימים. ראה סעיף 4 למטה.
- **מעבר הבא:** `contacted` (אם עונים), `followup_later` (אחרי 3 ניסיונות כושלים), `not_relevant` (סוכן מחליט).
- **תנאי עצירה:** לקוח ענה, `no_answer_attempts >= 3`.
- **Sub-status:** אין — מעקב ע"י `no_answer_attempts` int.
- **נציג:** לא בהכרח — המערכת מנהלת אוטונומית עד 3 ניסיונות.
- **מותר:** עד 3 הודעות, cooldown 20h ביניהן. **אסור:** יותר מ-3 הודעות, הודעות באותו יום.

---

### 3.12 `followup_later`
- **הגדרה עסקית:** ליד פוטנציאלי אבל לא עכשיו. "תחזרו אליי בעוד חודש". long tail.
- **מתי נכנסים:** ידני מסוכן, או אוטומטי אחרי `no_answer_day3`.
- **שדות:** `pipeline_stage='followup_later'`, `followup_sequence_name='long_tail'`, `next_followup_date=+14d`.
- **הודעות:** touch אחד אחרי 14 ימים.
- **דוגמה:** _"שלום {{name}}, עבר קצת זמן — רק לבדוק אם עכשיו זה הזמן להתקדם."_
- **מעבר הבא:** `interested` / `contacted` / `not_relevant` לפי התגובה.
- **תנאי עצירה:** לקוח ענה, `max_per_lead=2` על long_tail touch.
- **Sub-status:** `cold`, `warm`, `seasonal`.
- **נציג:** לא חובה.
- **מותר:** touch 1-2 לכל 14 ימים. **אסור:** הודעות תכופות.

---

### 3.13 `not_relevant`
- **הגדרה עסקית:** לא ליד. אדם לא רלוונטי, הכיר אותנו בטעות, לא מעוניין בכלל.
- **מתי נכנסים:** סוכן מסמן, או inbound classified as `not_relevant` (באישור סוכן).
- **שדות:** `pipeline_stage='not_relevant'`, `followup_sequence_name=null`, `followup_paused=true`, `do_not_contact=true` (מומלץ).
- **הודעות:** פרידה מכבדת אחת.
- **דוגמה:** _"תודה {{name}} על העדכון. אם בעתיד תצטרך אותנו — אני כאן 🙏"_
- **מעבר הבא:** terminal. rare re-engagement בעתיד.
- **תנאי עצירה:** נצחי.
- **Sub-status:** `wrong_number`, `spam`, `declined`, `competitor`.
- **נציג:** לא.
- **מותר:** פרידה אחת בלבד. **אסור:** כל דבר אחר.

---

## 4. no_answer — אפיון מדויק

### 4.1 הנוסח הבסיסי
**_"היי, ניסינו להשיג אותך לגבי פתיחת עוסק פטור. מתי זמין לשיחה?"_**

### 4.2 3 וריאציות לרצף (נשמרות ב-DB, sequence `no_answer_recovery`)

| ניסיון | cooldown | נוסח | מטרה |
|---|---|---|---|
| 1 (day 0) | מיידי לאחר סימון no_answer | _"היי {{name}}, ניסיתי להשיג אותך לגבי {{service_type_label}}. מתי זמין לשיחה?"_ | ידידותי, ברור, עם הקשר |
| 2 (day 1) | 24h | _"{{name}}, רק לוודא שראית את ההודעה. אפשר להחזיר לי גם כאן בוואטסאפ 🙏"_ | קל ולא לוחץ, מציע ערוץ חלופי |
| 3 (day 3) | 48h | _"{{name}}, זו פנייה אחרונה מצדי. אם תרצה להמשיך — פשוט תענה לי כאן ונתקדם."_ | סגירת מעגל מכבדת |

### 4.3 מתי שולחים
- **יום 0:** מיד כש-`pipeline_stage` הופך ל-`no_answer`. `no_answer_attempts=1`.
- **יום 1:** cron_tick מזהה `followup_sequence_name='no_answer_recovery' AND step=1 AND next_followup_date<=now()`. `no_answer_attempts=2`.
- **יום 3:** cron_tick על step=2. `no_answer_attempts=3`. אחרי הודעה זו, `pipeline_stage` עובר אוטומטית ל-`followup_later` והרצף נעצר.

### 4.4 כמה פעמים שולחים
- **מקסימום 3 הודעות לרצף.**
- אם הלקוח חוזר ל-`no_answer` (אחרי תקופת `followup_later`), יכול להיווצר רצף חדש (`no_answer_attempts` מתאפס כש-stats עובר).

### 4.5 תנאי עצירה
1. **Inbound reply** — ברגע שלקוח עונה, `followup_paused=true`, רצף מפסיק מיד (DB trigger על `whatsapp_messages`).
2. **Status change** — סוכן משנה ל-`contacted`/`not_relevant`/`interested` ידנית → stop rules מתוך seed מפסיקים הכול.
3. **Quiet hours** — 21:00-08:00 Asia/Jerusalem — הודעות נדחות.
4. **`do_not_contact=true`** — hard block.
5. **`whatsapp_opt_in=false`** — hard block.
6. **`max_per_lead=1`** לכל rule — גם אם cron רץ פעמיים, לא תשלח הודעה פעמיים.
7. **`cooldown_hours=20`** — אי אפשר להפעיל rule שוב עם 20h מאז `result='sent'` אחרון.
8. **Day 3 auto-transition ל-`followup_later`** — הרצף נסגר אוטומטית.

### 4.6 מתי מעבירים ל-`followup_later` vs `not_relevant`
- **`followup_later` (אוטומטי):** אחרי 3 ניסיונות בלי תגובה, `pipeline_stage` הופך ל-`followup_later`. הרציונל: המספר תקין, הלקוח רק עסוק כרגע.
- **`not_relevant` (ידני):** רק הסוכן יכול. אחרי שבדק ויודע בוודאות: מספר שגוי, spam, מישהו אחר, לא רלוונטי. **הבוט לא מעביר ל-`not_relevant` אוטומטית, כי זה החלטה עם השלכות (כולל `do_not_contact`).**

### 4.7 איך שומרים שלא יהיה ספאם
מנגנוני הגנה שמופעלים בסדר הזה, **כל אחד מספיק לבדו כדי לעצור**:

1. **`event_key` UNIQUE** (DB) — בלתי אפשרי לשלוח פעמיים אותו event גם אם הטריגר קופץ פעמיים.
2. **`cooldown_hours=20`** — שורה ב-rules, נבדקת ב-edge function לפני כל action.
3. **`max_per_lead=1`** — שורה ב-rules, COUNT query לפני ביצוע.
4. **`followup_paused`** — מופעל אוטומטית ע"י inbound trigger.
5. **`do_not_contact`** — סוכן מפעיל ידנית, hard block.
6. **`whatsapp_opt_in`** — נבדק לפני כל send_whatsapp.
7. **Quiet hours** — Asia/Jerusalem 21:00-08:00, בדיקה ב-code.
8. **Auto-transition אחרי 3** — יציאה אוטומטית מהרצף ל-`followup_later`.

**Unit tests מאמתים:** `classifyInbound('לא מעוניין')` → `not_relevant` ולא `interested` (באג שהיה בגרסה ראשונה ותופס על ידי test).

## 5. Status Machine Table — המפה המלאה

פורמט: `status → trigger → action → message → next_status → stop_condition`

| Current Status | Trigger (מה מפעיל) | Action (מה קורה) | Message / Template | Next Status (יעד פוטנציאלי) | Stop Condition |
|---|---|---|---|---|---|
| `new_lead` | INSERT trigger | `new_lead_welcome` (לא ב-seed MVP, אופציונלי Phase 2) | _"שלום {{name}} 👋 קיבלנו את הפרטים שלך..."_ | `attempted_contact` / `contacted` | `do_not_contact`, `whatsapp_opt_in=false` |
| `attempted_contact` | status_change | `attempted_contact_day0` | _"שלום {{name}}, ניסיתי להתקשר אליך. מתי נוח לדבר?"_ | `contacted` / `no_answer` | inbound reply, `followup_paused` |
| `contacted` | status_change | `contacted_summary` | _"היי {{name}}, היה נעים לדבר 🙏..."_ | `interested` / `quote_sent` / `followup_later` | manual by agent |
| `interested` | status_change | `interested_acknowledge` | _"מעולה {{name}} 🎯 אני מכין לך הצעה ונחזור אליך היום."_ | `quote_sent` | agent sends quote |
| `quote_sent` | status_change | `quote_sent_day0` | _"שלחנו את הצעת המחיר..."_ | `payment_pending` / `followup_later` / `not_relevant` | inbound reply |
| `quote_sent` (step 1) | cron_tick | `quote_reminder_day1` | _"היי, רק לוודא שההצעה התקבלה..."_ | same | inbound reply, 20h cooldown |
| `quote_sent` (step 2) | cron_tick | `quote_reminder_day3` | _"זו תזכורת אחרונה..."_ | self, sequence ends | inbound reply, max_per_lead |
| `waiting_for_documents` | status_change | `waiting_documents_day0` | _"נזדקק לתעודת זהות ואישור ניהול חשבון..."_ | `in_process` | docs received |
| `waiting_for_documents` (step 1) | cron_tick | `waiting_documents_day2` | _"תזכורת ידידותית — ממתינים למסמכים..."_ | same | inbound reply |
| `waiting_for_documents` (step 2) | cron_tick | `waiting_documents_day4` | **create_task** "לקוח לא שלח מסמכים לאחר 4 ימים" | `in_process` / `followup_later` | task opened for agent |
| `payment_pending` | status_change | `payment_pending_day0` | _"שלחנו קישור לתשלום..."_ | `paid` | payment webhook |
| `payment_pending` (step 1) | cron_tick | `payment_pending_day1` | _"היי, רק מזכיר את הקישור..."_ | same | 20h cooldown |
| `payment_pending` (step 2) | cron_tick | `payment_pending_day3` | **create_task** "payment_stalled" | manual | task opened |
| `paid` | status_change | `paid_thankyou` + `stop_on_paid` | _"תודה 🙏 התשלום התקבל..."_ | `waiting_for_documents` / `in_process` | terminal within bot |
| `in_process` | status_change | `in_process_ack` | _"התחלנו בטיפול בבקשה שלך..."_ | `completed` | manual by agent |
| `completed` | status_change | `completed_thanks` | _"סיימנו 🎉 תודה על האמון..."_ | terminal | terminal |
| `no_answer` | status_change | `no_answer_day0` | _"ניסיתי להשיג אותך לגבי {{service_type_label}}..."_ | `contacted` / `followup_later` | inbound reply |
| `no_answer` (step 1) | cron_tick | `no_answer_day1` | _"רק לוודא שראית..."_ | same | 24h cooldown |
| `no_answer` (step 2) | cron_tick | `no_answer_day3` | _"זו פנייה אחרונה..."_ | `followup_later` (auto) | auto-transition |
| `followup_later` | status_change | `followup_later_schedule` (update_lead only, no message) | — | self | scheduled for +14d |
| `followup_later` (step 1, after 14d) | cron_tick | `followup_later_touch` | _"עבר קצת זמן — זה הזמן להתקדם?"_ | `contacted` / `not_relevant` | max_per_lead=2 |
| `not_relevant` | status_change | `not_relevant_ack` + `stop_on_not_relevant` | _"תודה על העדכון..."_ | terminal | terminal |

## 6. סגנון הודעות — עקרונות מחייבים

כל הודעה שהבוט שולח חייבת לעבור 7 הבדיקות הבאות (מודגם ב-seed rules של המיגרציה):

1. **≤ 2 שורות** (או ≤ 160 תווים כקו מנחה)
2. **תמיד פונה בשם:** `{{name}}` כשיש
3. **אמוג'י אחד מקסימום**, רק אם זה מוסיף חום (🙏 🎯 🎉 👋) — לא קישוטי
4. **שאלה פתוחה קצרה** כשרלוונטי: "מתי נוח?", "יש שאלות?", "זה הזמן?"
5. **לא pushy:** בלי "!!!", בלי "חובה", בלי "אם לא תחזור אני..."
6. **מתחבר להיסטוריה:** "ראיתי שהשארת פרטים", "המשך לשיחה שלנו", "ניסיתי להשיג אותך"
7. **CTA ברור אחד**, לא שניים: או "ענה לי", או "לחץ על הקישור", לא גם וגם.

### דוגמאות ✅ / ❌

| ❌ רע | ✅ טוב |
|---|---|
| "שלום! ראינו שפתחת פנייה אלינו!! 😊🎉 נשמח מאוד להציע לך שירות מעולה! אנא חזור אלינו במייל או בטלפון או בוואטסאפ ואנו נשמח לתת לך הצעה!!" | "שלום רון 👋 ראיתי שהשארת פרטים לגבי פתיחת עוסק פטור. מתי נוח לדבר?" |
| "חשוב מאוד שתחזור אלינו!! זו הזדמנות שלא חוזרת!!!" | "רון, רק מזכיר את ההצעה ששלחנו. משהו לא ברור?" |
| "Lead Update: Status changed to quote_sent. Please review the pricing document." | "שלחנו את הצעת המחיר לרון. נשמח לשמוע מה דעתך." |

## 7. היכן הכל חי בקוד (מפה)

| תחום | קובץ | מה זה עושה |
|---|---|---|
| Schema + memory fields | `supabase/migrations/20260411110000_followup_bot.sql`, `20260411130000_followup_bot_memory_and_statuses.sql` | Tables, triggers, seed rules |
| Rule execution | `supabase/functions/followupDispatch/index.ts` | Event handlers, guards, execution, memory updates |
| Pure logic | `supabase/functions/followupDispatch/lib.ts` | eventKey, classifyInbound, buildLeadSummary... |
| Unit tests | `supabase/functions/followupDispatch/lib_test.ts` | 33 tests — רצים עם `deno test` |
| Manual CRM button | `supabase/functions/triggerManualFollowup/index.ts` | Authenticated endpoint לנציג |
| n8n relay | `scripts/deploy-followup-bot.cjs` + `docs/followup-dispatcher.json` | Thin webhook forward |
| Hardening + health | `supabase/migrations/20260411120000_followup_bot_hardening.sql` | Triggers, cron, `followup_cron_health()` |
| Smoke tests | `docs/followup-bot-smoke-tests.sql` | 8 תרחישי E2E ידניים |
| QA + architecture | `docs/followup-bot-master.md` | **המסמך הזה** |

## 8. תוצאות Unit Tests (הרצה בפועל)

```
$ deno test --no-lock supabase/functions/followupDispatch/lib_test.ts
running 33 tests from ./supabase/functions/followupDispatch/lib_test.ts
eventKey: deterministic for same inputs ... ok (1ms)
eventKey: different inputs produce different keys ... ok (0ms)
eventKey: null/undefined treated as empty ... ok (0ms)
eventKey: format is fu_ + 32 hex chars ... ok (0ms)
renderTemplate: substitutes known fields ... ok (0ms)
renderTemplate: missing field becomes empty string ... ok (0ms)
renderTemplate: null/undefined template is empty ... ok (0ms)
resolveDate: +1d adds 86400s from anchor ... ok (3ms)
resolveDate: +3h adds 3 hours from anchor ... ok (0ms)
resolveDate: null/"null"/undefined return null ... ok (0ms)
resolveDate: passthrough ISO string ... ok (0ms)
buildLeadPatch: resolves next_followup_date but keeps other fields ... ok (0ms)
buildLeadPatch: null for then_update returns empty patch ... ok (0ms)
inQuietHours: returns a boolean ... ok (32ms)
inQuietHours: a concrete night-time date is quiet (IL 23:00 local) ... ok (0ms)
inQuietHours: a concrete day-time date is not quiet (IL 13:00 local) ... ok (0ms)
evaluateConditions: empty/no conditions returns true ... ok (0ms)
evaluateConditions: eq match ... ok (0ms)
evaluateConditions: eq mismatch ... ok (0ms)
evaluateConditions: in match ... ok (0ms)
evaluateConditions: exists check ... ok (0ms)
classifyInbound: interested ... ok (0ms)
classifyInbound: pure interested without call-me ... ok (0ms)
classifyInbound: price objection ... ok (0ms)
classifyInbound: asked for human ... ok (0ms)
classifyInbound: sent documents ... ok (0ms)
classifyInbound: not relevant (hard stop) ... ok (0ms)
classifyInbound: general reply when nothing matches ... ok (0ms)
classifyInbound: "לא מעוניין" must NOT match interested ... ok (0ms)
buildLeadSummary: includes status + previous_status ... ok (0ms)
buildLeadSummary: empty lead falls back to default ... ok (0ms)
buildLeadSummary: no_answer attempts included ... ok (0ms)
buildLeadSummary: truncates long inbound message preview ... ok (0ms)

ok | 33 passed | 0 failed (55ms)
```

---

## סיכום

זה מסמך עבודה אחד שמכסה:

- **חלק א:** production QA report, סיכונים, deploy, smoke tests, verdict = **READY WITH LIMITATIONS**
- **חלק ב:** כל 13 הסטטוסים של הבוט, עם הודעות, מעברים, stop conditions, ו-status machine table מלאה

המערכת עומדת מאחורי 33 unit tests שרצים בפועל (55ms). Phase B (single rule pilot עם WhatsApp אמיתי) חייב להתבצע לפני go-live מלא.

**הצעד הבא:** הרץ את סעיף 9 (deployment) → סעיף 10 (smoke tests) → Phase A/B של סעיף 12 → בו-זמנית הגדר monitoring מסעיף 13.
