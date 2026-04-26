---
name: lead-flow
description: "מעקב וניתוח מסע ליד מלא — מרגע הכניסה דרך בוט, WhatsApp, CRM ועד תשלום. שימוש: /lead-flow {phone}. מופעל כש: debug ליד, בעיית המרה, ליד תקוע, מעקב ליד. קשור ל: debug-lead, bot-agent, crm-agent."
user_invocable: true
---

# Skill: ניתוח מסע ליד מלא

**קלט:** `$ARGUMENTS` — מספר טלפון (עם או בלי 972)

## שלב 1: נרמול

המר לפורמט `972XXXXXXXXX` (הסר 0 מוביל, הוסף 972)

## שלב 2: שלוף מכל הטבלאות

```sql
-- 1. ליד
SELECT id, full_name, email, phone, source, page_slug, stage, temperature,
       created_at, updated_at
FROM leads WHERE phone LIKE '%{PHONE}%'
ORDER BY created_at DESC LIMIT 3;

-- 2. Bot sessions
SELECT id, phone, page_intent, flow_type, current_step, completed_at, created_at
FROM bot_sessions WHERE phone LIKE '%{PHONE}%'
ORDER BY created_at DESC LIMIT 5;

-- 3. WhatsApp
SELECT id, phone, direction, message_type, body, status, created_at
FROM whatsapp_messages WHERE phone LIKE '%{PHONE}%'
ORDER BY created_at DESC LIMIT 15;

-- 4. Communications
SELECT id, channel, direction, content, created_at
FROM communications WHERE lead_id IN (SELECT id FROM leads WHERE phone LIKE '%{PHONE}%')
ORDER BY created_at DESC LIMIT 10;

-- 5. Payments
SELECT id, amount, status, provider, created_at
FROM payments WHERE lead_id IN (SELECT id FROM leads WHERE phone LIKE '%{PHONE}%');

-- 6. Agreements
SELECT id, status, signed_at, created_at
FROM agreements WHERE lead_id IN (SELECT id FROM leads WHERE phone LIKE '%{PHONE}%');
```

## שלב 3: בנה Timeline

סדר **כל** האירועים כרונולוגית:

```
⏱️ Timeline ליד: {שם} ({טלפון})
━━━━━━━━━━━━━━━━━━━━━━━━━━━

[10:00] 🟢 ליד נוצר — source: google, page: osek-patur
[10:01] 🤖 Bot session — intent: osek-patur, flow: sales
[10:01] 📤 WhatsApp נשלח — "שלום! ראינו שאתה מתעניין..."
[10:05] 📥 WhatsApp נכנס — "כן, כמה עולה?"
[10:05] 📤 WhatsApp נשלח — "המחיר שלנו..."
[11:00] 📞 שיחה יוצאת — נציג: יוסי
[14:00] 💳 תשלום — 299₪, Tranzila, success
[14:01] 📝 הסכם — נשלח, ממתין לחתימה
```

## שלב 4: אבחון

| סטטוס | משמעות |
|--------|---------|
| ✅ הושלם | ליד → bot → WhatsApp → תשלום → הסכם |
| ⚠️ תקוע | זהה איפה נעצר + למה |
| ❌ נכשל | זהה את נקודת הכשלון + error |

דווח המלצה: מה לעשות כדי להמשיך את הליד.
