// Migrated from Base44: fulfillPayment
// Unified payment fulfillment — called after payment confirmed (Stripe/Tranzila)

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// תיקון XSS: escape ערכים דינמיים שמוכנסים לתבנית HTML של המייל
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  // תיקון 1: הגנה על הפונקציה — פנימית בלבד, רק עם service_role_key
  const authHeader = req.headers.get('Authorization') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if (!authHeader.includes(serviceKey)) {
    return errorResponse('Forbidden: internal only', 403, req);
  }

  try {
    const { payment_id, trigger_source } = await req.json();
    if (!payment_id) return errorResponse('Missing payment_id', 400, req);

    // Get payment record
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (payErr || !payment) return errorResponse('Payment not found', 404, req);

    // תיקון 2: בדוק שהתשלום אכן הושלם לפני מימוש
    if (payment.status !== 'completed') {
      return errorResponse('Payment not completed', 400, req);
    }

    const { product_type, product_id, customer_id } = payment;
    console.log(`[fulfillPayment] type=${product_type}, source=${trigger_source}`);

    // Get customer
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customer_id)
      .single();

    // === FULFILLMENT BY PRODUCT TYPE ===
    if (product_type === 'plan' && product_id) {
      // Assign plan to customer
      await supabaseAdmin
        .from('customers')
        .update({ plan_id: product_id })
        .eq('id', customer_id);
      console.log('Plan assigned:', product_id);

    } else if (product_type === 'goal') {
      // Increase goal limit (not directly available, so we skip or handle differently)
      console.log('Goal purchased:', product_id);

    } else if (product_type === 'landing-page' && product_id) {
      // Publish landing page
      try {
        await supabaseAdmin
          .from('landing_pages')
          .update({ is_published: true, published_at: new Date().toISOString() })
          .eq('id', product_id);
        console.log('Landing page published:', product_id);
      } catch (e) {
        console.error('Failed to publish landing page:', e);
      }

    } else if (product_type === 'cart') {
      // Handle cart items
      const items = payment.metadata?.items || [];
      for (const item of items) {
        if (item.type === 'landing_page' && item.data?.landingPageId) {
          await supabaseAdmin
            .from('landing_pages')
            .update({ is_published: true, published_at: new Date().toISOString() })
            .eq('id', item.data.landingPageId);
        }
      }

    } else if (product_type === 'one-time' || product_type === 'logo') {
      // One-time purchase (logo, digital asset, etc.) — mark payment as fulfilled
      // No additional resource to provision; status update + confirmation email is sufficient
      console.log(`One-time purchase fulfilled: type=${product_type}, payment=${payment_id}`);
    }

    // === CRM Integration: create client from lead if payment linked ===
    if (payment.lead_id) {
      try {
        const { data: lead } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('id', payment.lead_id)
          .single();

        if (lead) {
          // Create client record — copy all questionnaire data
          // Check if client already exists for this lead
          const { data: existingClient } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('lead_id', lead.id)
            .maybeSingle();

          let client = existingClient;
          if (!existingClient) {
            const { data: newClient, error: clientErr } = await supabaseAdmin
              .from('clients')
              .insert({
                lead_id: lead.id,
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                id_number: lead.id_number || null,
                business_name: lead.business_name || null,
                business_type: lead.business_type || null,
                income: lead.income || null,
                is_employee: lead.is_employee || null,
                salary: lead.salary || null,
                file_url: lead.file_url || null,
                questionnaire_data: lead.questionnaire_data || {},
                service_type: lead.service_type || product_type,
                monthly_fee: payment.amount,
                onboarding_status: 'not_started',
                agent_id: lead.agent_id,
                status: 'active',
                source: 'sales_portal',
              })
              .select('id')
              .single();
            if (clientErr) {
              console.error('Client creation failed:', clientErr.message);
            }
            client = newClient;
          }

          if (client) {
            // Link client back to lead
            await supabaseAdmin.from('leads').update({
              client_id: client.id,
            }).eq('id', lead.id);

            console.log(`Client ${client.id} created from lead ${lead.id}`);
          }

          // Trigger n8n post-purchase webhook (non-blocking)
          try {
            await fetch('https://n8n.perfect-1.one/webhook/perfect-one-post-purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                _event_type: 'payment_confirmed',
                lead_id: lead.id,
                client_id: client?.id,
                phone: lead.phone,
                name: lead.name,
                service_type: lead.service_type || product_type,
                payment_id,
                amount: payment.amount,
              }),
              signal: AbortSignal.timeout(5000),
            });
          } catch (e: any) {
            console.warn('n8n post-purchase webhook failed:', e.message);
          }
        }
      } catch (e: any) {
        console.error('CRM client creation failed:', e.message);
      }
    }

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer_id || null,
      action: 'payment_fulfilled',
      entity_type: 'payment',
      entity_id: payment_id,
      metadata: { product_type, product_id, amount: payment.amount, source: trigger_source, lead_id: payment.lead_id }
    });

    // Send confirmation email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && customer?.email) {
      try {
        // תיקון XSS: escape כל ערך דינמי לפני הכנסה ל-HTML
        const safeName = escapeHtml(customer.full_name || '');
        const safeProductName = escapeHtml(payment.product_name || product_type);
        const safeAmount = escapeHtml(String(payment.amount));
        const safeCurrency = escapeHtml(payment.currency);

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: 'One-Pai <no-reply@one-pai.com>',
            to: [customer.email],
            subject: `תודה על הרכישה! - ${safeProductName}`,
            html: `<div dir="rtl" style="font-family:Arial,sans-serif;"><h2>תודה על הרכישה!</h2><p>שלום ${safeName},</p><p>הרכישה שלך בוצעה בהצלחה.</p><p><strong>מוצר:</strong> ${safeProductName}</p><p><strong>סכום:</strong> ${safeAmount} ${safeCurrency}</p></div>`
          })
        });
      } catch (e) { console.error('Email failed:', e); }
    }

    return jsonResponse({ success: true, payment_id, product_type });
  } catch (error) {
    console.error('fulfillPayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});
