// tranzilaConfirmPayment — Called from client after payment OR via Tranzila notify webhook

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    let payment_id = '';
    let transaction_id = '';
    let tranzilaResponse = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // === Tranzila server-to-server notify callback (form-encoded) ===
      const formData = await req.formData();
      payment_id = formData.get('o_cred_oid') as string || '';
      transaction_id = formData.get('ConfirmationCode') as string || formData.get('index') as string || '';
      tranzilaResponse = formData.get('Response') as string || '';

      // תיקון 1: אימות חתימת webhook מטרנזילה
      const notifyUrlKey = formData.get('notify_url_key') as string || '';
      const expectedIpnKey = Deno.env.get('TRANZILA_IPN_KEY');
      if (expectedIpnKey && notifyUrlKey !== expectedIpnKey) {
        console.error('[tranzilaConfirmPayment] Webhook signature mismatch');
        return errorResponse('Forbidden: invalid webhook signature', 403, req);
      }

      console.log(`[tranzilaConfirmPayment] Notify callback: payment_id=${payment_id}, Response=${tranzilaResponse}, txn=${transaction_id}`);
    } else {
      // === Client-side JSON call ===
      const payload = await req.json();
      payment_id = payload.payment_id || '';
      transaction_id = payload.transaction_id || '';

      // תיקון 3: קבל את tranzila_response מה-payload במקום hardcoded '000'
      tranzilaResponse = payload.tranzila_response ?? '';
      if (tranzilaResponse === '') {
        return errorResponse('Missing tranzila_response', 400, req);
      }

      // תיקון 2: אימות משתמש בנתיב client
      const user = await getUser(req);
      if (!user) {
        return errorResponse('Unauthorized', 401, req);
      }

      // שלוף payment לפני שנמשיך כדי לאמת ownership
      if (!payment_id) return errorResponse('Missing payment_id', 400, req);

      const { data: paymentCheck, error: payCheckErr } = await supabaseAdmin
        .from('payments')
        .select('customer_id')
        .eq('id', payment_id)
        .single();

      if (payCheckErr || !paymentCheck) return errorResponse('Payment not found', 404, req);

      // בדוק שה-payment שייך למשתמש המחובר
      const { data: customerRecord } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!customerRecord || paymentCheck.customer_id !== customerRecord.id) {
        console.error(`[tranzilaConfirmPayment] Ownership mismatch: user=${user.id}, payment_customer=${paymentCheck.customer_id}`);
        return errorResponse('Forbidden', 403, req);
      }

      console.log(`[tranzilaConfirmPayment] Client call: payment_id=${payment_id}, txn=${transaction_id}`);
    }

    if (!payment_id) return errorResponse('Missing payment_id', 400, req);

    // Verify payment exists
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (payErr || !payment) return errorResponse('Payment not found', 404, req);

    const isSuccess = tranzilaResponse === '000' || tranzilaResponse === '0' || tranzilaResponse === 0;

    if (isSuccess) {
      // תיקון 4: עדכון אטומי — מונע race condition
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          metadata: {
            ...(payment.metadata || {}),
            transaction_id,
            tranzila_response: tranzilaResponse,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', payment_id)
        .eq('status', 'pending') // רק אם עדיין pending — מונע עיבוד כפול
        .select()
        .single();

      if (updateErr) {
        console.error('tranzilaConfirmPayment update error:', updateErr.message);
        return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
      }

      // אם לא עודכן — כבר טופל
      if (!updated) {
        return jsonResponse({ success: true, already_completed: true });
      }

      // Trigger fulfillment
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      try {
        await fetch(`${supabaseUrl}/functions/v1/fulfillPayment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`
          },
          body: JSON.stringify({ payment_id, trigger_source: 'tranzila' })
        });
      } catch (e) {
        console.error('fulfillPayment trigger failed:', e);
      }

      console.log(`Payment ${payment_id} confirmed successfully`);
    } else {
      // Mark payment as failed
      const { error: updateErr } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: `Tranzila Response: ${tranzilaResponse}`
        })
        .eq('id', payment_id);

      if (updateErr) {
        console.error('tranzilaConfirmPayment failed update error:', updateErr.message);
        return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
      }

      console.log(`Payment ${payment_id} failed with Response: ${tranzilaResponse}`);
    }

    return jsonResponse({ success: true, payment_id });
  } catch (error) {
    console.error('tranzilaConfirmPayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});
