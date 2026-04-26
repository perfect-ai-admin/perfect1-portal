# FollowUp Bot — דוח QA ו-Production Readiness

**תאריך:** 2026-04-11
**תחום:** Perfect One / פרפקט וואן — CRM + WhatsApp automation
**גרסה:** MVP hardened (pre-production)

---

## 1. מה השתנה בסיבוב ההקשחה

במהלך ה-audit זוהו 4 פערים קריטיים בגרסה הראשונה של המערכת. בוצע refactor ארכיטקטוני שמעביר את כל הלוגיקה העסקית ל-edge function `followupDispatch`, ו-n8n הופך ל-thin relay בלבד.

### שינוי ארכיטקטורה מרכזי

| רכיב | לפני | אחרי |
|---|---|---|
| "מוח" האוטומציה | code nodes ב-n8n עם HTTP calls ל-Supabase | Edge function `followupDispatch` (Deno/TypeScript) |
| Secrets | `SUPABASE_SERVICE_ROLE_KEY` נצרב ל-workflow JSON (דליפה ל-`docs/`) | `Deno.env` בלבד, אפס סודות ב-n8n |
| GreenAPI | Placeholder `${GREENAPI_INSTANCE_ID}` עם escape שבור → URL שבור ב-runtime | reuse של `whatsappHelper.sendAndStoreMessage` הקיים + production-tested |
| Inbound | רק `followup_paused=true` | Store → classify (6 קטגוריות) → sub_status → task → log |
| Type safety | אין | `deno check` עובר נקי |
| Failure handling | שקט | `failed` ב-log + task אוטומטית לנציג |

### Production fixes מפורטים

1. **Placeholder secrets הוסרו** — לא היה URL GreenAPI עובד; תוקן ע"י שימוש ב-`whatsappHelper.ts` הקיים שקורא מ-`Deno.env.get('GREENAPI_API_TOKEN')`.
2. **Dedup אמיתי של הודעות יוצאות** — ניצול ה-`UNIQUE(greenapi_message_id)` שכבר קיים בטבלת `whatsapp_messages`.
3. **Idempotency DB-level** — `UNIQUE(event_key)` ב-`automation_logs`; ניסיון שני → `result='dedup'`.
4. **INSERT trigger נוסף** — לידים שנוצרים עם `pipeline_stage` פעיל (לא `new_lead`/`contacted`) מדפץ' מיידית.
5. **Inbound DB trigger על `whatsapp_messages`** — **המשמעות: כל הודעה נכנסת, מאיזו workflow n8n שהיא מגיעה (sales-bot, bot-v5, קיים או עתידי), אוטומטית מעצור רצף**. אין צורך לגעת בעוד workflow.
6. **Keyword classification** — 6 קטגוריות: `interested`, `objection_price`, `asked_for_human`, `sent_documents`, `not_relevant`, `general_reply`. לא דורש LLM.
7. **WhatsApp failure → task** — כשל שליחה פותח task ב-`priority='high'` לנציג ומסמן `automation_logs.result='failed'`.
8. **Cron health function** — `SELECT followup_cron_health()` מחזיר JSON עם `ok`/`last_status`/`last_run`/`dispatch_url_configured`.
9. **Quiet hours** — לא שולח WhatsApp בין 21:00-08:00 (Asia/Jerusalem) למעט `event_type='manual'`.
10. **Retry ב-n8n relay** — HTTP Request עם `retry: { maxTries: 3, waitBetweenTries: 2000 }` + timeout 30s.

---

## 2. קבצים שנוצרו / עודכנו בסיבוב זה

| קובץ | סטטוס | תיאור |
|---|---|---|
| `supabase/migrations/20260411110000_followup_bot.sql` | ללא שינוי | הסכמה הבסיסית מהסיבוב הקודם |
| `supabase/migrations/20260411120000_followup_bot_hardening.sql` | **חדש** | helper `followup_dispatch()`, INSERT trigger, inbound trigger, cron health, reroute to edge function |
| `supabase/functions/followupDispatch/index.ts` | **חדש** | המוח — 450 שורות TypeScript, מטפל ב-4 event types, guards, cooldown, idempotency, execution, logging |
| `supabase/functions/triggerManualFollowup/index.ts` | **עודכן** | קורא ל-`followupDispatch` במקום ל-n8n |
| `scripts/deploy-followup-bot.cjs` | **עודכן** | פורס relay workflow יחיד ב-n8n, ללא קוד לוגי ב-code nodes |
| `docs/followup-dispatcher.json` | ייווצר ע"י הסקריפט | snapshot של ה-workflow |
| `docs/followup-bot-smoke-tests.sql` | **חדש** | בדיקות E2E ידניות ל-8 התרחישים |
| `docs/followup-bot-qa-report.md` | **חדש** | הדוח הזה |

### קבצים קיימים שעליהם המערכת מסתמכת (reuse)

- `supabase/functions/_shared/whatsappHelper.ts` — שליחה + אחסון הודעות. Production-tested, עובד גם עבור bot-v5, post-purchase, crmSendWhatsApp.
- `supabase/functions/_shared/supabaseAdmin.ts` — admin client, CORS, helpers.
- מיגרציות קיימות: `whatsapp_messages`, `leads`, `tasks`, `status_history`.

---

## 3. הוראות פריסה סופיות (one-shot)

### 3.1 Prerequisites ב-Supabase

- Extensions: `pg_cron`, `pg_net` — קיימים ב-Supabase Cloud אך דורשים `CREATE EXTENSION` (כלול ב-migration).
- Env vars של הפרויקט (ב-Supabase dashboard → Edge Functions → Secrets):
  - `SUPABASE_URL` (אוטומטי)
  - `SUPABASE_SERVICE_ROLE_KEY` (אוטומטי)
  - `GREENAPI_API_TOKEN` — חובה!
  - `GREENAPI_INSTANCE_ID` — חובה!

### 3.2 Deploy

```bash
# 1. Apply migrations (both in order)
supabase db push
# (or run each SQL file in the Supabase SQL editor)

# 2. Deploy edge functions
supabase functions deploy followupDispatch --no-verify-jwt
supabase functions deploy triggerManualFollowup

# NOTE: --no-verify-jwt on followupDispatch because it's called by
# pg_net (server-to-server) and from n8n. It authenticates internally
# by requiring service_role when called server-side. triggerManualFollowup
# REQUIRES JWT because it's called from an authenticated CRM agent.

# 3. Configure DB settings (run once, in Supabase SQL editor)
ALTER DATABASE postgres SET app.followup_dispatch_url =
  'https://<project-ref>.supabase.co/functions/v1/followupDispatch';
ALTER DATABASE postgres SET app.followup_service_role =
  '<SERVICE_ROLE_JWT>';
SELECT pg_reload_conf();
-- Verify:
SELECT followup_dispatch_url(), followup_service_role() <> '';

# 4. Deploy n8n relay workflow (optional — DB triggers already call
#    the edge function directly via pg_net; n8n is only needed if you
#    want an external webhook entry point, e.g. for manual CRM buttons
#    or external integrations)
export N8N_API_URL=https://n8n.perfect-1.one/api/v1
export N8N_API_KEY=<n8n_token>
export SUPABASE_URL=https://<project-ref>.supabase.co
node scripts/deploy-followup-bot.cjs

# 5. In n8n UI, activate the "followup-dispatcher" workflow.
```

### 3.3 Post-deploy health check

```sql
-- In Supabase SQL editor:
SELECT followup_cron_health();
-- Expected after 5+ minutes:
-- { "ok": true, "last_status": "succeeded", ..., "dispatch_url_configured": true }

SELECT count(*) FROM automation_rules WHERE is_active = true;
-- Expected: 11 (3 quote + 3 docs + 3 no_answer + 2 stop)
```

---

## 4. תוצאות בדיקות

### 4.1 Static checks — עברו ✅

| בדיקה | תוצאה |
|---|---|
| `deno check supabase/functions/followupDispatch/index.ts` | ✅ אין שגיאות |
| `deno check supabase/functions/triggerManualFollowup/index.ts` | ✅ אין שגיאות |
| `node --check scripts/deploy-followup-bot.cjs` | ✅ SYNTAX OK |
| Review של migration SQL | ✅ idempotent (`IF NOT EXISTS`, `DO $$ EXCEPTION`) |
| Review of secrets — אין `$env`/`process.env` בתוך code nodes | ✅ אין |
| Reuse של helpers קיימים | ✅ `whatsappHelper.ts`, `supabaseAdmin.ts` |

### 4.2 E2E scenarios — מוכנים להרצה, מחכים לסביבת פרודקשן

**חשוב:** אני לא יכול להריץ את הבדיקות האלה מהסביבה הנוכחית — אין לי `SUPABASE_SERVICE_ROLE_KEY`, `GREENAPI_API_TOKEN`, או מספר טלפון אמיתי לבדיקה. כל תרחיש הוכן כבלוק SQL נפרד ב-[docs/followup-bot-smoke-tests.sql](followup-bot-smoke-tests.sql) והגדרתי expected results לכל אחד.

| # | תרחיש | סטטוס | הערות |
|---|---|---|---|
| 1 | Status change → quote_sent | 📋 מוכן | בדוק ב-SQL smoke test, blocks 1 ו-6 |
| 2 | Waiting for documents sequence | 📋 מוכן | block 2 |
| 3 | No answer recovery + cooldown | 📋 מוכן | block 3, דורש מעבר זמן או force cron |
| 4 | Inbound reply stops automation | 📋 מוכן | block 4, INSERT ל-`whatsapp_messages` עם direction=inbound — DB trigger עושה את השאר |
| 5 | Manual trigger from CRM | 📋 מוכן | block 5, דורש JWT של agent |
| 6 | Duplicate event protection | 📋 מוכן | block 6, דורש קריאת curl כפולה עם אותו payload |
| 7 | WhatsApp failure → task | 📋 מוכן | block 7, telefon לא תקין → fallback task |
| 8 | Cron tick execution | 📋 מוכן | block 8, `SELECT followup_dispatch(...)` ישירות |

### 4.3 בדיקות שבוצעו ברמת הקוד

- **Flow trace של scenario 1** (status_change → quote_sent): trigger `trg_followup_status_change` מופעל על `UPDATE OF pipeline_stage` → `followup_dispatch()` שולח POST ל-edge function → `handleStatusChange()` טוען את הליד + rules → מסנן לפי `trigger_config.to_status` → `executeRule()` עובר guards → מחשב `eventKey` → מנסה INSERT ל-`automation_logs` → ה-UNIQUE constraint תופס כפילויות → `sendAndStoreMessage` שולח דרך GreenAPI ושומר ב-`whatsapp_messages` → אם הצליח, `result='sent'` + `last_contact_at` מתעדכן. **בוצעה סקירת קוד ידנית של כל השלבים.** ✅

- **Flow trace של scenario 4** (inbound): INSERT ב-`whatsapp_messages WHERE direction='inbound' AND sender_type='user'` → trigger `trg_followup_inbound` → `followup_dispatch({event_type:'inbound_message', lead_id, phone, message_text, greenapi_message_id})` → `handleInboundMessage` → ה-`storeInboundMessage` מטפל ב-dedup (שאני מעביר את אותו record) — **edge case אפשרי: כפל שמירה**. אבל `storeInboundMessage` בודק `greenapi_message_id` UNIQUE לפני insert ומחזיר `null` אם כבר קיים, ואז ממשיך עם הלוגיקה. OK.

  ⚠️ **בעיה זוהה:** ה-trigger `trg_followup_inbound` מופעל אחרי ה-INSERT, כלומר הרשומה כבר קיימת. אז `storeInboundMessage` בתוך ה-edge function יכשל ב-UNIQUE (זה אותו ה-`greenapi_message_id`) ויחזיר `null`. הזרימה ממשיכה. זה תקין אבל גורם ל-log מיותר. **לא blocker.**

- **Trigger overlap:**
  - `trg_notify_n8n_lead_change` (קיים, migration 20260331) → webhook `perfect-one-osek-patur` → bot-v5/mentor logic
  - `trg_followup_status_change` (חדש) → edge function → FollowUp Bot logic
  - שני ה-triggers מופעלים על `UPDATE OF pipeline_stage`. שניהם שולחים HTTP בקשות לצרכנים שונים. **אין duplicate WhatsApp** כי בעלי האחריות שונים לחלוטין. **תועד ב-migration.**

- **pg_cron validation:** ה-migration מריץ `cron.unschedule('followup-tick')` בתוך DO block עם exception handler, ואז `cron.schedule`. `followup_cron_health()` מאפשר אימות בזמן ריצה.

---

## 5. סיכונים שנותרו

### HIGH
- **GREENAPI_API_TOKEN / GREENAPI_INSTANCE_ID** חייבים להיות מוגדרים ב-Supabase dashboard לפני ההפעלה. בלעדיהם, `whatsappHelper` מדפיס warning ומחזיר `success: false` → המערכת תפתח task לכל rule, וזה יעצור את עצמו לטובה (לא יישלחו הודעות שגויות).
- **app.followup_dispatch_url** ו-**app.followup_service_role** חייבים להיות מוגדרים ב-Postgres (`ALTER DATABASE postgres SET ...`). בלעדיהם ה-triggers ו-cron יריצו `RAISE NOTICE` ויחזרו בלי שגיאה — המערכת "שקטה" אבל לא עובדת. **חובה להריץ את `SELECT followup_cron_health()` אחרי deploy.**

### MEDIUM
- **ה-trigger החדש הוא AFTER UPDATE OF pipeline_stage**. אם עדכון `pipeline_stage` מתבצע בתוך transaction גדול, ה-webhook נשלח באסינכרוני (pg_net) — לא מעכב את ה-commit. אבל אם ה-transaction rollback, ה-webhook כבר נשלח → עדכון שלא קרה מדפץ' לאוטומציה. **mitigation:** pg_net משתמש ב-`AFTER UPDATE` אחרי commit — נבדק ב-pg_net docs, הוא מבצע את הקריאה מ-background worker אחרי ה-commit. OK.
- **Concurrency / race condition:** שני status_change ברצף מהיר על אותו ליד עלולים להפעיל את אותו rule פעמיים לפני ש-event_key הראשון נכתב. ה-UNIQUE על `event_key` מגן מ-2 inserts בו-זמניים. **acceptable.**
- **Inbound classification** היא keyword-based. עברית לא תמיד מדויקת (ניבים, שגיאות כתיב). **mitigation:** הסיווג רק מפעיל task creation — הסוכן רואה את ההודעה המלאה ומחליט. אם הסיווג שגוי, הנזק = task מיותר. לא שולח הודעה שגויה.

### LOW
- **Quiet hours הוגדרו קשיחות 21:00-08:00** Asia/Jerusalem. לא ניתן לשנות פר-rule. אם צריך גמישות, זה refactor של ~10 שורות ב-`executeRule`.
- **`max_per_lead` מתבצעת ב-COUNT query** אחרי הגארדים האחרים. על טבלת `automation_logs` עם מיליונים של שורות, זה יכול להיות איטי. **mitigation:** יש אינדקס ממוקד `idx_automation_logs_rule_lead_sent WHERE result='sent'`. תקין עד ~100K לידים.
- **cron_tick מוגבל ל-50 לידים** בכל ריצה. על עומס 100+ לידים בו-זמנית, חלקם יחכו 5 דק' נוספות. **mitigation:** העלאת ה-limit ל-200 או הרצת cron כל 1 דקה.

---

## 6. מגבלות ידועות (לא תוקנו במכוון)

1. **אין UI לניהול rules** — rules מוגדרים כ-seed ב-migration. שינוי rule דורש SQL. Phase 2.
2. **אין broadcast/campaign** — רק per-lead manual trigger. Phase 2.
3. **אין AI summary / intent classification** — Phase 2, דורש guardrails נוספים.
4. **אין A/B testing של נוסחים** — הטקסטים קבועים ב-`action_config.body`.
5. **WhatsApp media/PDF** — `whatsappHelper.sendAndStoreMessage` תומך רק טקסט. PDF/קישורים עובדים אם מוטמעים בטקסט. שליחת קובץ אמיתי דורשת הרחבה של ה-helper (`sendFile` של GreenAPI).
6. **Multi-channel (SMS/email)** — רק WhatsApp.

---

## 7. Verdict

### **READY WITH LIMITATIONS** ⚠️

המערכת **מוכנה לפריסה production**, בכפוף ל-4 דרישות חובה לפני ההפעלה:

1. ✅ **Static analysis עבר** — TypeScript נקי, JS תחבירית תקין, SQL idempotent
2. ⚠️ **Env vars חייבים להיות מוגדרים** לפני הפעלת edge function:
   - `GREENAPI_API_TOKEN`, `GREENAPI_INSTANCE_ID`
3. ⚠️ **DB settings חייבים להיות מוגדרים** אחרי migration:
   - `app.followup_dispatch_url`, `app.followup_service_role`
4. ⚠️ **Smoke tests חייבים להירץ ידנית** בסביבת staging לפני הפעלה בלידים אמיתיים:
   - לפחות scenarios 1, 4, 6 (status change / inbound stop / dedup) על ליד בדיקה

### המלצת go-live

**Phase A (היום):** Deploy ל-production, הפעלה על rules בלבד עם `is_active=false` (dry run).
**Phase B (24h):** הפעל `quote_sent_day0` (rule אחד בלבד) על ליד בדיקה אמיתי + מספר WhatsApp שלך. אמת WhatsApp מגיעה + log ב-`automation_logs` עם `result='sent'`.
**Phase C (48h):** הפעל את כל 11 ה-rules. מעקב יומי ב-`followup_kpi_daily` לוודא `result='failed'` נמוך.
**Phase D (שבוע+):** ניטור שוטף, הרחבה ל-AI classification + broadcast.

### אסור להפעיל בלי:
- `SELECT followup_cron_health();` מחזיר `{"ok": true, "dispatch_url_configured": true}`
- בדיקה ידנית עם ליד בדיקה וטלפון שבשליטתך
- גיבוי של `automation_rules` לפני שינויים

---

## 8. הערה לסוכן הבא

כל קבצי ה-smoke tests, ה-migrations, וה-edge functions מוכנים לריצה. אין baggage — ה-refactor הסיר את כל הקוד הבעייתי מהסיבוב הראשון. הנקודה העיקרית: **n8n הוא relay, לא מוח.** אם יש באג — בדוק קודם ב-`followupDispatch` logs (ב-Supabase dashboard → Edge Functions → Logs), לא ב-n8n UI.
