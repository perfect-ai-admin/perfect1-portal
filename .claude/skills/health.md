---
name: health
description: "בדיקת בריאות מערכת — לידים, בוט, WhatsApp, תשלומים, הסכמים. שימוש: /health. מופעל כש: בדיקת מצב, health check, משהו לא עובד, סטטוס מערכת. קשור ל: workflow-status, debug-lead, db-query."
user_invocable: true
---

# Skill: Health Check

בדיקת בריאות מלאה של מערכת פרפקט וואן.

## בדיקות (הרץ במקביל)

```sql
-- 1. לידים 24h
SELECT count(*) as leads_24h FROM leads WHERE created_at > now() - interval '24 hours';

-- 2. Bot sessions 24h
SELECT count(*) as sessions_24h FROM bot_sessions WHERE created_at > now() - interval '24 hours';

-- 3. WhatsApp 24h
SELECT
  count(*) as total,
  count(*) FILTER (WHERE direction = 'outbound') as sent,
  count(*) FILTER (WHERE direction = 'inbound') as received
FROM whatsapp_messages WHERE created_at > now() - interval '24 hours';

-- 4. תשלומים 7d
SELECT
  count(*) as total,
  coalesce(sum(amount), 0) as revenue,
  count(*) FILTER (WHERE status = 'completed') as completed,
  count(*) FILTER (WHERE status = 'failed') as failed
FROM payments WHERE created_at > now() - interval '7 days';

-- 5. הסכמים 7d
SELECT
  count(*) as total,
  count(*) FILTER (WHERE status = 'signed') as signed,
  count(*) FILTER (WHERE status = 'pending') as pending
FROM agreements WHERE created_at > now() - interval '7 days';

-- 6. Pipeline breakdown
SELECT stage, count(*) FROM leads GROUP BY stage ORDER BY count(*) DESC;
```

## פלט

```
🏥 Health Check — {תאריך ושעה}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

| מערכת | סטטוס | מספר | פירוט |
|--------|--------|------|--------|
| לידים (24h) | ✅ | 12 | |
| Bot Sessions (24h) | ✅ | 8 | |
| WhatsApp (24h) | ✅ | 45 | 📤 30 📥 15 |
| תשלומים (7d) | ⚠️ | 3 | 2 ✅ 1 ❌, 598₪ |
| הסכמים (7d) | ✅ | 5 | 3 חתומים, 2 ממתינים |

📊 Pipeline:
new_lead: 45 | contacted: 23 | qualified: 12 | converted: 8
```

- ✅ = תקין
- ⚠️ = יש כשלונות או ירידה חריגה
- ❌ = 0 פעילות בזמן שצפויה
