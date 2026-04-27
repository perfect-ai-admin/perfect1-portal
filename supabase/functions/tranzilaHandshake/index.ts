// tranzilaHandshake — Creates Tranzila handshake token for public payment pages (no auth required)
// Now also creates a payment record if lead_id is provided

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // service_type אופציונלי: אם העמוד שולח 'osek_zeir' — ההזמנה תירשם
     // כ"פתיחת עוסק זעיר אונליין" ולא תתערבב עם עוסק פטור במסך התשלום /
     // ב-reporting של Tranzila / בטבלת payments. ברירת מחדל: osek_patur.
    const { sum, lead_id, service_type, questionnaire } = await req.json();
    // questionnaire (optional) — full form data captured before payment so it
    // survives even if payment fails. Shape: { name, email, businessName,
    // businessType, id_number, income, is_employee, salary, file_url, ... }

    if (typeof sum !== 'number' || sum <= 0) {
      return errorResponse('Invalid sum', 400, req);
    }

    const supplier = Deno.env.get('TRANZILA_TERMINAL_NAME');
    const tranzilaPW = Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || Deno.env.get('TRANZILA_TERMINAL_PASSWORd') || '';

    if (!supplier) return errorResponse('Terminal not configured', 500, req);

    // Create handshake with Tranzila API
    const url = `https://api.tranzila.com/v1/handshake/create?supplier=${encodeURIComponent(supplier)}&sum=${sum}&TranzilaPW=${encodeURIComponent(tranzilaPW)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      console.error('[tranzilaHandshake] API error:', res.status, text);
      return errorResponse('Tranzila handshake failed', 502, req);
    }

    // Response format: "thtk=TOKEN_VALUE"
    const match = text.match(/thtk=(.+)/);
    if (!match || !match[1]) {
      console.error('[tranzilaHandshake] Unexpected response:', text);
      return errorResponse('Invalid handshake response', 502, req);
    }

    const thtk = match[1].trim();

    // Always create a payment record so post-payment automation works
    // even when the user arrives via a direct link (no lead_id yet).
    const isZeir = service_type === 'osek_zeir' || service_type === 'open_osek_zeir';
    const productType = isZeir ? 'osek_zeir' : 'osek_patur';
    const productName = isZeir ? 'פתיחת עוסק זעיר אונליין' : 'פתיחת עוסק פטור אונליין';

    const insertData: Record<string, unknown> = {
      product_type: productType,
      product_name: productName,
      amount: sum,
      currency: 'ILS',
      payment_method: 'tranzila',
      status: 'pending',
      source: 'sales_portal',
      metadata: questionnaire ? { questionnaire, captured_at: new Date().toISOString() } : {},
    };

    if (lead_id) {
      insertData.lead_id = lead_id;
    }

    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert(insertData)
      .select('id')
      .single();

    let paymentId = null;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const notifyUrl = `${supabaseUrl}/functions/v1/tranzilaConfirmPayment`;

    if (!payErr && payment) {
      paymentId = payment.id;

      // If lead_id provided, update lead with payment reference
      if (lead_id) {
        await supabaseAdmin.from('leads').update({
          payment_status: 'pending',
          payment_id: payment.id,
        }).eq('id', lead_id);
      }
    }

    return jsonResponse({ thtk, supplier, sum, paymentId, notifyUrl }, 200, req);
  } catch (error) {
    console.error('tranzilaHandshake error:', (error as Error).message);
    return errorResponse('Internal error', 500, req);
  }
});
