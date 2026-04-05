# RPC Functions Documentation

## סקירה כללית
RPC (Remote Procedure Call) functions הם פונקציות PostgreSQL שמופעלות בIsole צד השרת של Supabase. הם מספקים דרך בטוחה וביעילה לביצוע פעולות מורכבות ישירות מצד הלקוח.

---

## 1. create_lead_and_trigger_bot

**מטרה:** יצירה של ליד חדש עם סיווג intent ואתחול bot flow

**Location:**
- Migration: `supabase/migrations/20260405100000_create_lead_and_trigger_bot.sql`
- Edge Function: `supabase/functions/createLeadWithBot/`

### Signature
```sql
create_lead_and_trigger_bot(
  p_name text,
  p_phone text,
  p_email text DEFAULT '',
  p_message text DEFAULT '',
  p_page_slug text DEFAULT 'osek-patur',
  p_business_name text DEFAULT 'sales-portal'
) RETURNS TABLE(lead_id uuid, page_intent text, flow_type text, success boolean, message text)
```

### שימוש

#### דרך Edge Function (מומלץ)
```javascript
const response = await fetch('https://{project_ref}.functions.supabase.co/createLeadWithBot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'דני כהן',
    phone: '0501234567',
    email: 'danny@example.com',
    message: 'רוצה לפתוח עוסק פטור',
    page_slug: 'osek-patur'
  })
});

const result = await response.json();
console.log(result.lead_id, result.flow_type);
```

#### דרך RPC ישיר (מDeno/Edge Functions)
```typescript
const { data, error } = await supabaseAdmin.rpc('create_lead_and_trigger_bot', {
  p_name: 'דני כהן',
  p_phone: '0501234567',
  p_email: 'danny@example.com',
  p_message: 'רוצה לפתוח עוסק פטור',
  p_page_slug: 'osek-patur',
  p_business_name: 'sales-portal'
});
```

### Intent Classification
הפונקציה מסווגת את ה-intent בהתאם ל-page_slug:

| page_slug | page_intent | flow_type | service_type |
|-----------|-------------|-----------|---|
| osek-patur | guide | guide_flow | osek_patur_general |
| open-osek-patur | service | service_flow | open_osek_patur |
| osek-murshe | guide | guide_flow | osek_murshe_general |
| hevra-bam | guide | guide_flow | hevra_bam_general |
| compare/* | comparison | guide_flow | comparison_guide |

### שדות שנוצרים בטבלת leads
```javascript
{
  name: string,                 // שם הליד
  phone: string,                // טלפון
  email: string?,               // אימייל (optional)
  notes: string?,               // הערות/הודעה
  source_page: string,          // page_slug
  page_intent: string,          // סיווג ה-intent
  flow_type: string,            // סוג ה-flow ל-bot
  service_type: string,         // סוג השירות
  source: 'sales_portal',       // תמיד
  interaction_type: 'form',     // תמיד
  status: 'new',                // תמיד
  pipeline_stage: 'new_lead',   // תמיד
  temperature: 'warm',          // תמיד
  contact_attempts: 0,          // תמיד
  priority: 'medium',           // תמיד
  bot_current_step: 'opening',  // תמיד
  bot_started_at: NOW()         // זמן יצירה
}
```

### Error Handling
הפונקציה מחזירה `success: false` עם הודעת שגיאה בעברית:
- `"שם חובה"` - לא סופק name
- `"טלפון חובה"` - לא סופק phone
- `"שגיאה לא ידועה"` - שגיאה PostgreSQL

---

## 2. crm_update_lead_stage (קיים)

**מטרה:** עדכון stage של ליד בצינור מכירות

**Location:** `supabase/migrations/20260330100000_add_crm_rpc_functions.sql`

---

## 3. crm_delete_lead (קיים)

**מטרה:** מחיקה soft/hard של ליד

**Location:** `supabase/migrations/20260330100000_add_crm_rpc_functions.sql`

---

## 4. crm_add_communication (קיים)

**מטרה:** הוספת תקשורת או הערה ללידן

**Location:** `supabase/migrations/20260330100000_add_crm_rpc_functions.sql`

---

## הרשאות (Permissions)

כל ה-RPC functions מדריגות עם `SECURITY DEFINER` וגם קיבלו GRANT:

```sql
GRANT EXECUTE ON FUNCTION create_lead_and_trigger_bot TO anon, authenticated;
```

משמעות: **כל משתמש** (אפילו ללא הרשאות) יכול להריץ את הפונקציה.

---

## Schema Dependencies

הפונקציה `create_lead_and_trigger_bot` תלויה בטבלות:

1. **leads** (עם שדות: name, phone, email, notes, source_page, page_intent, flow_type, service_type, etc.)
2. **bot_sessions** (יוצרת session עם bot_started_flow function בTrigger)

**Migrations Required:**
- `20260328100100_add_rls_policies.sql`
- `20260328100200_add_source_column.sql`
- `20260328100300_crm_tables.sql`
- `20260331200000_bot_flow_engine.sql` ← **חובה** (מוסיף שדות page_intent, flow_type ל-leads)
- `20260405100000_create_lead_and_trigger_bot.sql` ← **חדש**

---

## Testing

### Local Test (Node.js / Deno)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);
const { data, error } = await supabase.rpc('create_lead_and_trigger_bot', {
  p_name: 'דני כהן',
  p_phone: '0501234567',
  p_page_slug: 'osek-patur'
});

console.log(data, error);
```

### cURL
```bash
curl -X POST https://kkwhbbziwxcxwkepfpus.functions.supabase.co/createLeadWithBot \
  -H "Content-Type: application/json" \
  -d '{
    "name": "דני כהן",
    "phone": "0501234567",
    "page_slug": "osek-patur"
  }'
```

---

## Monitoring & Debugging

### Logs
- Supabase Console → Functions → createLeadWithBot → Recent Logs
- Edge Function logs כתובים ל-`console.log`

### Queries
זאת לרמזור אם something is wrong:
```sql
SELECT id, name, phone, page_intent, flow_type, created_at
FROM leads
WHERE source = 'sales_portal'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Roadmap

- [ ] הוסף trigger ל-bot_sessions לאחר יצירת ליד
- [ ] הוסף validation לטלפון (פורמט ישראלי)
- [ ] הוסף rate limiting
- [ ] הוסף webhook trigger ל-N8N
