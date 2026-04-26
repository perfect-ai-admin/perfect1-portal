---
name: debug-lead
description: "מעקב טכני אחרי ליד — DB records, bot sessions, WhatsApp messages, errors. שימוש: /debug-lead {phone}. מופעל כש: ליד לא קיבל הודעה, בוט לא עבד, בעיה טכנית עם ליד. קשור ל: lead-flow, bot-agent, health."
user_invocable: true
---

# Skill: Debug Lead

**קלט:** `$ARGUMENTS` — מספר טלפון

## תהליך

1. **נרמל** — `05X` → `9725X`, `+972` → `972`
2. **שלוף records:**

```sql
-- ליד
SELECT * FROM leads WHERE phone LIKE '%{PHONE}%' ORDER BY created_at DESC LIMIT 3;

-- Bot sessions
SELECT * FROM bot_sessions WHERE phone LIKE '%{PHONE}%' ORDER BY created_at DESC LIMIT 5;

-- WhatsApp (הודעות + סטטוס)
SELECT id, direction, body, status, error, created_at
FROM whatsapp_messages WHERE phone LIKE '%{PHONE}%'
ORDER BY created_at DESC LIMIT 10;
```

3. **בדוק כשלונות:**
   - bot_session ללא `completed_at`? → בוט תקוע
   - WhatsApp עם `status = 'failed'`? → בעיית שליחה
   - ליד ללא bot_session? → `botStartFlow` נכשל
   - bot_session עם `page_intent = NULL`? → intent classification נכשל

4. **דווח:**
```
🔍 Debug: {phone}
━━━━━━━━━━━━━━━━

ליד: {יש/אין} — stage: {stage}, source: {source}
Bot: {יש/אין} — intent: {intent}, step: {step}, completed: {yes/no}
WhatsApp: {X} הודעות — {sent} נשלחו, {failed} נכשלו

❌ בעיה שזוהתה: {תיאור}
💡 המלצה: {פעולה}
```
