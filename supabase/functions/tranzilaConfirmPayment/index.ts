// Migrated from Base44: tranzilaConfirmPayment
// Called after Tranzila payment completes (from client or webhook)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { payment_id, transaction_id, success, error_message } = payload;

    if (!payment_id) return errorResponse('Missing payment_id', 400);

    // Verify payment exists
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (payErr || !payment) return errorResponse('Payment not found', 404);

    if (success) {
      // Update payment to completed with transaction metadata
      const { error: updateErr } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          metadata: {
            ...(payment.metadata || {}),
            transaction_id,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', payment_id);

      if (updateErr) return errorResponse(updateErr.message);

      // Trigger fulfillment
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      await fetch(`${supabaseUrl}/functions/v1/fulfillPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ payment_id, trigger_source: 'tranzila' })
      });

    } else {
      // Mark payment as failed
      const { error: updateErr } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: error_message || 'Payment failed'
        })
        .eq('id', payment_id);

      if (updateErr) return errorResponse(updateErr.message);
    }

    return jsonResponse({ success: true, payment_id });
  } catch (error) {
    console.error('tranzilaConfirmPayment error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
