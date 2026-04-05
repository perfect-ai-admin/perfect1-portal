# createLeadWithBot Edge Function

## תיאור
Edge Function שמזמנת את ה-RPC function `create_lead_and_trigger_bot` לעריכה של:
1. **יצירת ליד** עם כל הפרטים הנדרשים
2. **סיווג intent** בהתאם ל-page_slug
3. **הכנת bot session** עם flow_type ו-page_intent הנכונים

## שימוש

### POST Request
```
POST https://{project_ref}.functions.supabase.co/createLeadWithBot
```

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "name": "דני כהן",
  "phone": "0501234567",
  "email": "danny@example.com",          // optional
  "message": "רוצה לפתוח עוסק פטור",    // optional
  "page_slug": "osek-patur",               // optional, default: 'osek-patur'
  "business_name": "sales-portal"          // optional, default: 'sales-portal'
}
```

### Response (Success)
```json
{
  "success": true,
  "lead_id": "123e4567-e89b-12d3-a456-426614174000",
  "page_intent": "guide",
  "flow_type": "guide_flow",
  "message": "ליד נוצר בהצלחה"
}
```

### Response (Error)
```json
{
  "success": false,
  "lead_id": null,
  "page_intent": null,
  "flow_type": null,
  "message": "טלפון חובה"
}
```

## Intent Classification (page_slug → page_intent + flow_type)

| page_slug | page_intent | flow_type | service_type |
|-----------|-------------|-----------|---|
| osek-patur | guide | guide_flow | osek_patur_general |
| open-osek-patur | service | service_flow | open_osek_patur |
| osek-murshe | guide | guide_flow | osek_murshe_general |
| open-osek-murshe | service | service_flow | open_osek_murshe |
| hevra-bam | guide | guide_flow | hevra_bam_general |
| compare/osek-patur-vs-murshe | comparison | guide_flow | comparison_guide |
| (default) | guide | guide_flow | general |

## מה קורה בפונקציה

1. **Validation**: בדיקת שם וטלפון (חובה)
2. **Intent Classification**: תרגום page_slug → page_intent, flow_type, service_type
3. **Lead Creation**: הכנסת ליד חדש עם כל השדות הדרושים:
   - name, phone, email, notes
   - source_page, page_intent, flow_type, service_type
   - source='sales_portal', interaction_type='form'
   - status='new', pipeline_stage='new_lead'
   - temperature='warm', priority='medium'
   - bot_current_step='opening', bot_started_at=NOW()
4. **Return**: lead_id + metadata

## Deploy
```bash
npx supabase functions deploy createLeadWithBot --project-ref kkwhbbziwxcxwkepfpus
```

## Notes
- הפונקציה משתמשת בـ `SUPABASE_SERVICE_ROLE_KEY` (יש גישה מלאה)
- CORS מותר לכל אתר (שדה `*` ב-Origin)
- ה-RPC function (`create_lead_and_trigger_bot`) חייבת להיות בדיוק כמו שהוגדרה ב-migration
