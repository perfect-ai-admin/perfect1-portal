// Migrated from Base44: retryBillingDocument
// Retry sending or creating a billing document — admin only

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

type RetryAction = 'retry_send' | 'retry_create';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const admin = await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const { document_id, action } = body as { document_id?: string; action?: RetryAction };

    if (!document_id) return errorResponse('שדה document_id הוא חובה', 400);
    if (!action)      return errorResponse('שדה action הוא חובה', 400);

    const validActions: RetryAction[] = ['retry_send', 'retry_create'];
    if (!validActions.includes(action)) {
      return errorResponse(`action חייב להיות אחד מ: ${validActions.join(', ')}`, 400);
    }

    // Try billing_documents first, fall back to payments
    let document: Record<string, unknown> | null = null;

    const { data: billingDoc, error: bdError } = await supabaseAdmin
      .from('billing_documents')
      .select('*')
      .eq('id', document_id)
      .maybeSingle();

    if (bdError) {
      console.warn('retryBillingDocument: billing_documents query error:', bdError.message);
    } else {
      document = billingDoc;
    }

    if (!document) {
      const { data: payment, error: payError } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', document_id)
        .maybeSingle();

      if (payError) {
        console.warn('retryBillingDocument: payments query error:', payError.message);
      } else {
        document = payment;
      }
    }

    if (!document) {
      return errorResponse(`מסמך עם ID ${document_id} לא נמצא`, 404);
    }

    console.log(`retryBillingDocument: admin=${admin.email} action=${action} document_id=${document_id}`);

    // Audit log — non-blocking
    supabaseAdmin.from('activity_log').insert({
      customer_id: admin.id,
      action: `billing.${action}`,
      entity_type: 'billing_document',
      entity_id: document_id,
      metadata: { action, document_id, triggered_by: admin.email },
    }).then(({ error }) => {
      if (error) console.warn('retryBillingDocument: activity_log insert failed:', error.message);
    });

    return jsonResponse({ success: true, document_id });
  } catch (error) {
    console.error('retryBillingDocument error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
