# פורטל - הגשת ליד עם bot integration

## תהליך זרימה

```
[Form Submit] → [createLeadWithBot RPC] → [Lead Created] → [Bot Session Initialized]
```

### 1. טופס בפורטל (React Component)

**Location:** `src/portal/components/PortalLeadForm.jsx`

```jsx
import { useState } from 'react';
import { supabase } from '@/src/api/portalSupabaseClient';

export default function PortalLeadForm({ pageSlug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const email = formData.get('email');
    const message = formData.get('message');

    try {
      // Call Edge Function (HTTP)
      const response = await fetch('https://{project_ref}.functions.supabase.co/createLeadWithBot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          page_slug: pageSlug || 'osek-patur',
          business_name: 'sales-portal'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Success!
        console.log('Liead created:', result.lead_id);
        // Redirect to WhatsApp or show confirmation
        // window.location.href = `https://wa.me/${phone}...`;
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('שגיאה בשליחת הטופס');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="שם מלא" required />
      <input name="phone" placeholder="טלפון" type="tel" required />
      <input name="email" placeholder="אימייל" type="email" />
      <textarea name="message" placeholder="הודעה"></textarea>
      <button disabled={loading}>{loading ? 'שליחה...' : 'שלח'}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 2. RPC Function Flow

```sql
-- ייקרא מה-Edge Function
SELECT * FROM create_lead_and_trigger_bot(
  p_name := 'דני כהן',
  p_phone := '0501234567',
  p_email := 'danny@example.com',
  p_message := 'רוצה לפתוח עוסק פטור',
  p_page_slug := 'osek-patur'
);

-- Returns:
-- lead_id: 123e4567-e89b-12d3-a456-426614174000
-- page_intent: 'guide'
-- flow_type: 'guide_flow'
-- success: true
-- message: 'ליד נוצר בהצלחה'
```

### 3. ליד נוצר ב-Database

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "דני כהן",
  "phone": "0501234567",
  "email": "danny@example.com",
  "notes": "רוצה לפתוח עוסק פטור",
  "source_page": "osek-patur",
  "source": "sales_portal",
  "interaction_type": "form",
  "status": "new",
  "pipeline_stage": "new_lead",
  "page_intent": "guide",
  "flow_type": "guide_flow",
  "service_type": "osek_patur_general",
  "temperature": "warm",
  "priority": "medium",
  "bot_current_step": "opening",
  "bot_started_at": "2026-04-05T22:30:00Z",
  "created_at": "2026-04-05T22:30:00Z"
}
```

### 4. Bot Session (Optional Trigger)

אם אתה רוצה שה-bot session יוושם automaticly, אתה צריך הוספת trigger:

```sql
CREATE OR REPLACE TRIGGER create_bot_session_on_lead_insert
AFTER INSERT ON leads
FOR EACH ROW
WHEN (NEW.source = 'sales_portal' AND NEW.page_intent IS NOT NULL)
EXECUTE FUNCTION init_bot_session_on_new_lead();
```

---

## Integration Points

### A. Web Form (React Portal)
```
PortalLeadForm.jsx → fetch() → createLeadWithBot Edge Function
```

### B. WhatsApp Integration
לאחר יצירת הליד, אפשר לשלוח הודעת WhatsApp:

```javascript
// After lead creation
const result = await fetch('...createLeadWithBot...').then(r => r.json());
if (result.success) {
  // Send WhatsApp message
  const phoneEncoded = encodeURIComponent(phone);
  window.open(`https://wa.me/${phoneEncoded}?text=שלום מ-Perfect1!`);
}
```

### C. N8N Webhook (Optional)
ניתן להוסיף trigger ל-N8N:

```sql
-- In migration: 20260331100000_add_n8n_webhook_trigger.sql
-- Already exists, triggers on leads.updated_at change
```

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "lead_id": null,
  "page_intent": null,
  "flow_type": null,
  "message": "שם חובה"
}
```

### Server Errors (500)
```json
{
  "error": "שגיאה בעת יצירת הליד",
  "details": "..." // optional in development
}
```

---

## Security Notes

1. **CORS:** Edge Function מאפשרת `Access-Control-Allow-Origin: *`
   - בProduction, החלף ל-domain ספציפי

2. **Rate Limiting:** כרגע אין rate limiting
   - להוסיף IP-based limits בעתיד

3. **Validation:** RPC בודקת:
   - `p_name` לא ריק
   - `p_phone` לא ריק
   - Email כרגע - לא מתוקן (optional)

4. **Authorization:** ללא בדיקת הרשאות (`SECURITY DEFINER`)
   - כל אחד יכול ליצור ליד
   - זה בכוונה (public sign-up form)

---

## Testing

### Manual Test (cURL)
```bash
curl -X POST http://localhost:3000/createLeadWithBot \
  -H "Content-Type: application/json" \
  -d '{
    "name": "דני כהן",
    "phone": "0501234567",
    "email": "danny@example.com",
    "message": "רוצה לפתוח עוסק פטור",
    "page_slug": "osek-patur"
  }'
```

### React Component Test
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PortalLeadForm from './PortalLeadForm';

test('submits form data', async () => {
  render(<PortalLeadForm pageSlug="osek-patur" />);

  fireEvent.change(screen.getByPlaceholderText('שם מלא'), {
    target: { value: 'דני כהן' }
  });
  fireEvent.change(screen.getByPlaceholderText('טלפון'), {
    target: { value: '0501234567' }
  });

  fireEvent.click(screen.getByText('שלח'));

  // Assert API call was made
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('createLeadWithBot'),
    expect.objectContaining({ method: 'POST' })
  );
});
```

---

## Monitoring

### Queries
```sql
-- Check latest leads
SELECT id, name, phone, page_intent, flow_type, created_at
FROM leads
WHERE source = 'sales_portal'
ORDER BY created_at DESC
LIMIT 20;

-- Check leads by intent
SELECT page_intent, COUNT(*) as count
FROM leads
WHERE source = 'sales_portal'
GROUP BY page_intent;

-- Check bot flow completion
SELECT
  flow_type,
  COUNT(CASE WHEN bot_completed_at IS NOT NULL THEN 1 END) as completed,
  COUNT(*) as total
FROM leads
WHERE source = 'sales_portal'
GROUP BY flow_type;
```

### Logs
- Edge Function logs → Supabase Console → Functions
- PostgreSQL logs → Supabase Console → Logs

---

## Next Steps

1. **Deploy Migration:** `supabase db push`
2. **Deploy Edge Function:** `npx supabase functions deploy createLeadWithBot`
3. **Update Frontend:** הוסף את הטופס לפורטל
4. **Test E2E:** טופס → RPC → Bot Session → WhatsApp
5. **Monitor:** בדוק leads בSQL, תריץ queries
