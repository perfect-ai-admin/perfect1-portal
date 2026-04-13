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
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, plan_name, monthly_price, product_name, ccno, expdate, cvv, myid, contact_name } = await req.json();

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
    if (!/^\d{4}$/.test(expdate || '')) {
      return errorResponse('תאריך תפוגה לא תקין — נדרש MMYY', 400, req);
    }
    if (!/^\d{3,4}$/.test(cvv || '')) {
      return errorResponse('CVV לא תקין', 400, req);
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
      expdate,
      mycvv: cvv,
      myid: myid || '',
      contact: contact_name || '',
      recur_payments: '998',
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
        recur_payments: 998,
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
    console.error('crmCreateSubscriptionWithCard error:', (error as Error).message);
    return errorResponse('שגיאה פנימית', 500, req);
  }
});
