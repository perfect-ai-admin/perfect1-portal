---
name: db-query
description: "שאילתת DB מהירה על Supabase. שימוש: /db-query {sql or natural language}. מופעל כש: צריך לשלוף נתונים, בדיקת DB, ספירות, סטטיסטיקות. קשור ל: health, debug-lead, backend-agent."
user_invocable: true
---

# Skill: שאילתת DB

**קלט:** `$ARGUMENTS` — SQL ישיר או שאלה בשפה טבעית

## תהליך

1. **אם SQL** — הרץ ישירות דרך `mcp__supabase__execute_sql`
2. **אם שפה טבעית** — תרגם ל-SQL לפי טבלאות ידועות:

### טבלאות עיקריות

| טבלה | שימוש | שדות מפתח |
|-------|--------|-----------|
| `leads` | לידים | id, full_name, phone, email, source, stage, temperature, created_at |
| `bot_sessions` | sessions בוט | phone, page_intent, flow_type, current_step, completed_at |
| `whatsapp_messages` | הודעות WA | phone, direction, body, status, created_at |
| `communications` | תקשורת | lead_id, channel, direction, content |
| `payments` | תשלומים | lead_id, amount, status, provider |
| `subscriptions` | מנויים | lead_id, plan, status, started_at |
| `agreements` | הסכמים | lead_id, status, signed_at |
| `landing_pages` | דפי נחיתה | user_id, title, slug, published |

## דוגמאות

- "כמה לידים היום" → `SELECT count(*) FROM leads WHERE created_at > now() - interval '24 hours'`
- "לידים חמים" → `SELECT * FROM leads WHERE temperature = 'hot' ORDER BY created_at DESC LIMIT 20`
- "תשלומים השבוע" → `SELECT sum(amount), count(*) FROM payments WHERE created_at > now() - interval '7 days' AND status = 'completed'`

## כללים

- SELECT בלבד — אל תרוץ UPDATE/DELETE בלי אישור מפורש
- LIMIT 50 ברירת מחדל
- הצג תוצאות כטבלה בעברית
