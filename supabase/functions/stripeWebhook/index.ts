// Migrated from Base44: stripeWebhook

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

async function verifyStripeSignature(body: string, signature: string): Promise<boolean> {
  if (!STRIPE_WEBHOOK_SECRET) return false;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(STRIPE_WEBHOOK_SECRET);

  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );

  const parts = signature.split(',').reduce((acc: Record<string, string>, part: string) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signatureHash = parts['v1'];
  if (!timestamp || !signatureHash) return false;

  const signedContent = `${timestamp}.${body}`;
  const signedData = encoder.encode(signedContent);
  const sig = new Uint8Array(signatureHash.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));

  return await crypto.subtle.verify('HMAC', key, sig, signedData);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405);

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) return errorResponse('Missing signature', 400);

    const body = await req.text();
    const isValid = await verifyStripeSignature(body, signature);
    if (!isValid) return errorResponse('Invalid signature', 401);

    const event = JSON.parse(body);
    console.log('Stripe webhook event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata.payment_id;

      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          metadata: {
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            stripe_customer_id: session.customer
          },
          completed_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      // Call fulfillment
      try {
        await supabaseAdmin.functions.invoke('fulfillPayment', {
          body: { payment_id: paymentId, trigger_source: 'stripe_webhook' }
        });
      } catch (e) {
        console.error('[stripeWebhook] Fulfillment error:', (e as Error).message);
      }
    }

    if (event.type === 'charge.failed') {
      const charge = event.data.object;
      const paymentId = charge.metadata?.payment_id;
      if (paymentId) {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed', failure_reason: charge.failure_message })
          .eq('id', paymentId);
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return errorResponse((error as Error).message);
  }
});
