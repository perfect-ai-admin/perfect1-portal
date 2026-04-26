---
name: edge-function
description: "יצירת/עריכת Supabase Edge Function חדשה. שימוש: /edge-function {name}. מופעל כש: צריך פונקציה חדשה, endpoint חדש, webhook handler. קשור ל: deploy-functions, backend-agent."
user_invocable: true
---

# Skill: Edge Function Scaffolding

**קלט:** `$ARGUMENTS` — שם הפונקציה (camelCase, למשל `crmArchiveLead`)

## תהליך

1. **בדוק שלא קיימת**: `supabase/functions/$ARGUMENTS/`
2. **צור תיקייה + index.ts**:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // TODO: implement logic

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
```

3. **אם צריך shared utilities** — import מ-`../_shared/`:
   - `supabaseAdmin.ts` — admin client + helpers
   - `whatsappHelper.ts` — WhatsApp שליחה/שמירה
   - `botIntentClassifier.ts` — intent classification

4. **דווח**: "Edge Function `{name}` נוצרה — מוכנה ל-deploy"

## כללים

- Deno runtime — לא Node.js
- CORS headers חובה בכל response
- `OPTIONS` handler חובה
- Service role key ל-admin operations, לא anon key
- Error handling עם status codes מתאימים
