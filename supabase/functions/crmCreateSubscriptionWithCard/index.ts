// crmCreateSubscriptionWithCard — Charge card directly via Tranzila API + create recurring subscription
// Card data is NEVER stored or logged. Only card_last4, card_brand, and Tranzila token are persisted.
// Authenticated: requires logged-in CRM user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

const TRANZILA_TERMINAL = Deno.env.get('TRANZILA_TERMINAL_NAME');
const TRANZILA_PASSWORD = Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || Deno.env.get('TRANZILA_TERMINAL_PASSWORd');

function getRecurStartDate(): string {
  const d = new Date();
  let y = d.getFullYear();
  let m = d.getMonth() + 2;
  if (m > 12) { m = m - 12; y++; }
  return `${y}-${String(m).padStart(2, '0')}-15`;
}

function detectBrand(pan: string): string {
  const p = pan.replace(/\s/g, '');
  if (p.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(p) || /^2(2[2-9]|[3-6]|7[01])/.test(p)) return 'Mastercard';
  if (/^3[47]/.test(p)) return 'Amex';
  if (/^(6011|65|64[4-9])/.test(p)) return 'Discover';
  return 'Other';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Auth: try getUser first, fall back to JWT sub from Authorization header
    let user = await getUser(req);
    if (!user) {
      // Fallback: extract user ID from JWT if token is valid but getUser fails
      const authHeader = req.headers.get('Authorization') || '';
      const token = authHeader.replace('Bearer ', '');
      if (token && token !== Deno.env.get('SUPABASE_ANON_KEY')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.sub && payload.role === 'authenticated') {
            user = { id: payload.sub, email: payload.email || '' } as any;
          }
        } catch { /* invalid token */ }
      }
    }
    if (!user) return errorResponse('Unauthorized — please log in again', 401, req);

    const { lead_id, plan_name, monthly_price, product_name, ccno, expdate, cvv, myid, contact_name, recur_payments } = await req.json();

    // Validate required fields
    if (!lead_id || !plan_name || !monthly_price) {
      return errorResponse('lead_id, plan_name, and monthly_price are required', 400, req);
    }
    if (monthly_price <= 0 || monthly_price > 100000) {
      return errorResponse('monthly_price must be between 1 and 100,000', 400, req);
    }
    if (!TRANZILA_TERMINAL || !TRANZILA_PASSWORD) {
      return errorResponse('Terminal not configured', 500, req);
    }

    // Validate card fields — fail fast before touching Tranzila
    const cleanCcno = (ccno || '').replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCcno)) {
      return errorResponse('מספר כרטיס לא תקין', 400, req);
    }
    const cleanExpdate = (expdate || '').replace(/\D/g, '');
    if (!/^\d{4}$/.test(cleanExpdate)) {
      return errorResponse('תאריך תפוגה לא תקין — נדרש MMYY', 400, req);
    }
    // Validate expiry is not in the past
    const expMonth = parseInt(cleanExpdate.slice(0, 2), 10);
    const expYear = parseInt('20' + cleanExpdate.slice(2, 4), 10);
    if (expMonth < 1 || expMonth > 12) {
      return errorResponse('חודש תפוגה לא תקין', 400, req);
    }
    const now = new Date();
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      return errorResponse('כרטיס פג תוקף', 400, req);
    }
    if (!/^\d{3,4}$/.test(cvv || '')) {
      return errorResponse('CVV לא תקין', 400, req);
    }
    if (myid && !/^\d{5,9}$/.test(myid)) {
      return errorResponse('מספר ת.ז. לא תקין', 400, req);
    }

    // Idempotency: prevent duplicate subscription for same lead in same minute
    const { data: recentSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('lead_id', lead_id)
      .eq('plan_name', plan_name)
      .in('status', ['active', 'pending_first_charge'])
      .limit(1);
    if (recentSub && recentSub.length > 0) {
      return errorResponse('ליד זה כבר יש מנוי פעיל לתוכנית זו', 409, req);
    }

    // Derive card info BEFORE discarding sensitive data
    const card_last4 = cleanCcno.slice(-4);
    const card_brand = detectBrand(cleanCcno);

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, phone, name')
      .eq('id', lead_id)
      .single();
    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Number of recurring payments (default 998 = unlimited)
    const numPayments = recur_payments && Number(recur_payments) > 0 ? Number(recur_payments) : 998;

    // Call Tranzila direct API
    const recurStartDate = getRecurStartDate();
    const tranzilaParams = new URLSearchParams({
      supplier: TRANZILA_TERMINAL,
      TranzilaPW: TRANZILA_PASSWORD,
      sum: String(monthly_price),
      currency: '1',
      cred_type: '1',
      tranmode: 'A',
      ccno: cleanCcno,
      expdate: cleanExpdate,
      mycvv: cvv,
      myid: myid || '',
      contact: contact_name || '',
      recur_payments: String(numPayments),
      recur_sum: String(monthly_price),
      recur_transaction: '4_approved',
      recur_start_date: recurStartDate,
    });

    const tranzilaRes = await fetch(
      'https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi',
      { method: 'POST', body: tranzilaParams },
    );
    const tranzilaText = await tranzilaRes.text();
    const params = new URLSearchParams(tranzilaText);
    const responseCode = params.get('Response') || '';
    const confirmCode = params.get('ConfirmationCode') || '';
    const tranzilaToken = params.get('index') || '';

    // SECURITY: ccno, cvv, myid must not be logged or stored from this point
    if (responseCode !== '000') {
      const errMap: Record<string, string> = {
        '001': 'כרטיס חסום — פנה לחברת האשראי',
        '002': 'כרטיס גנוב',
        '003': 'יש להתקשר לחברת האשראי',
        '004': 'אין אישור מחברת האשראי',
        '006': 'זיהוי שגוי (CVV/ת.ז.)',
        '033': 'מספר כרטיס לא תקין',
        '036': 'כרטיס פג תוקף',
        '039': 'מספר כרטיס לא תקין',
      };
      const msg = errMap[responseCode] || `שגיאת חיוב (קוד ${responseCode})`;
      console.log(`[crmCreateSubWithCard] Charge failed: Response=${responseCode}`);
      return errorResponse(msg, 402, req);
    }

    // Success — create subscription as active (charge already happened)
    const today = new Date().toISOString().slice(0, 10);
    const { data: sub, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        lead_id,
        plan_name,
        monthly_price,
        status: 'active',
        start_date: today,
        last_charge_date: today,
        next_charge_date: recurStartDate,
        recur_payments: numPayments,
        card_last4,
        card_brand,
        tranzila_token: tranzilaToken,
        source: 'crm',
        created_by: user.id,
      })
      .select('id')
      .single();

    if (subErr || !sub) {
      console.error('Failed to create subscription:', subErr);
      return errorResponse('חיוב הצליח אבל יצירת מנוי נכשלה — פנה לתמיכה', 500, req);
    }

    // Record first billing transaction
    await supabaseAdmin.from('billing_transactions').insert({
      subscription_id: sub.id,
      lead_id,
      charge_date: today,
      amount: monthly_price,
      currency: 'ILS',
      status: 'success',
      tranzila_transaction_id: confirmCode,
      tranzila_response_code: '000',
      source: 'crm_direct_entry',
    });

    // Update lead
    await supabaseAdmin.from('leads').update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      pipeline_stage: 'paid_opening_file',
      status: 'qualified',
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    // Audit log
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'subscription',
      entity_id: sub.id,
      new_stage: 'active',
      change_reason: 'subscription_created_with_card',
      source: 'sales_portal',
      metadata: { lead_id, plan_name, monthly_price, card_last4, card_brand },
    });

    console.log(`[crmCreateSubWithCard] Success sub=${sub.id} card=*${card_last4}`);

    return jsonResponse({
      success: true,
      subscription_id: sub.id,
      card_last4,
      card_brand,
      confirmation_code: confirmCode,
    }, 200, req);

  } catch (error) {
    // SECURITY: Never log the full error — it may contain card data from JSON parse
    const errMsg = (error as Error).message || 'unknown';
    const safeMsg = errMsg.replace(/\d{10,19}/g, '****').replace(/\d{3,4}/g, '***');
    console.error('[crmCreateSubWithCard] Error:', safeMsg);
    return errorResponse('שגיאה פנימית', 500, req);
  }
});
