// tranzilaHandshake — Creates Tranzila handshake token for public payment pages (no auth required)
// Now also creates a payment record if lead_id is provided

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // service_type אופציונלי: אם העמוד שולח 'osek_zeir' — ההזמנה תירשם
     // כ"פתיחת עוסק זעיר אונליין" ולא תתערבב עם עוסק פטור במסך התשלום /
     // ב-reporting של Tranzila / בטבלת payments. ברירת מחדל: osek_patur.
    const { sum, lead_id, service_type } = await req.json();

    if (typeof sum !== 'number' || sum <= 0) {
      return errorResponse('Invalid sum', 400, req);
    }

    const supplier = Deno.env.get('TRANZILA_TERMINAL_NAME');
    const tranzilaPW = Deno.env.get('TRANZILA_TERMINAL_PASSWORd') || Deno.env.get('TRANZILA_TERMINAL_PASSWORD') || '';

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

    // If lead_id provided, create payment record and return paymentId + notifyUrl
    let paymentId = null;
    let notifyUrl = '';

    if (lead_id) {
      const isZeir = service_type === 'osek_zeir' || service_type === 'open_osek_zeir';
      const productType = isZeir ? 'osek_zeir' : 'osek_patur';
      const productName = isZeir ? 'פתיחת עוסק זעיר אונליין' : 'פתיחת עוסק פטור אונליין';

      const { data: payment, error: payErr } = await supabaseAdmin
        .from('payments')
        .insert({
          lead_id,
          product_type: productType,
          product_name: productName,
          amount: sum,
          currency: 'ILS',
          payment_method: 'tranzila',
          status: 'pending',
          source: 'sales_portal',
        })
        .select('id')
        .single();

      if (!payErr && payment) {
        paymentId = payment.id;

        // Update lead with payment reference
        await supabaseAdmin.from('leads').update({
          payment_status: 'pending',
          payment_id: payment.id,
        }).eq('id', lead_id);
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      notifyUrl = `${supabaseUrl}/functions/v1/tranzilaConfirmPayment`;
    }

    return jsonResponse({ thtk, supplier, sum, paymentId, notifyUrl }, 200, req);
  } catch (error) {
    console.error('tranzilaHandshake error:', (error as Error).message);
    return errorResponse('Internal error', 500, req);
  }
});
