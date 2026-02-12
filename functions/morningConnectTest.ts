import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MORNING_BASE = "https://api.greeninvoice.co.il/api/v1";

/**
 * Morning (Green Invoice) — test connection and get JWT token.
 * Auth: POST /account/token with { id: api_key, secret: api_secret }
 * Returns JWT token valid for ~20 minutes.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { api_key, api_secret } = await req.json();
    if (!api_key || !api_secret) {
      return Response.json({ error: 'חסרים API Key ו-API Secret' }, { status: 400 });
    }

    // Get JWT token
    const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: api_key, secret: api_secret }),
    });

    if (!tokenResp.ok) {
      const errData = await tokenResp.json().catch(() => ({}));
      return Response.json({ 
        success: false, 
        error: errData.errorMessage || 'פרטי התחברות לא נכונים ל-Morning' 
      });
    }

    const tokenData = await tokenResp.json();
    const jwt = tokenData.token;

    if (!jwt) {
      return Response.json({ success: false, error: 'לא התקבל טוקן מ-Morning' });
    }

    // Fetch business info to verify
    const bizResp = await fetch(`${MORNING_BASE}/businesses/me`, {
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    });
    
    let businessInfo = {};
    if (bizResp.ok) {
      businessInfo = await bizResp.json();
    }

    return Response.json({ 
      success: true, 
      jwt,
      business_id: businessInfo.id || null,
      business_name: businessInfo.name || null,
      business_type: businessInfo.taxType || null,
      is_vat_exempt: businessInfo.taxType === 2, // 2 = עוסק פטור
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});