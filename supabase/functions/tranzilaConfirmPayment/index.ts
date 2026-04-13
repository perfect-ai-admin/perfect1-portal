// tranzilaConfirmPayment — Called from client after payment OR via Tranzila notify webhook

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, formatPhone } from '../_shared/whatsappHelper.ts';

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

      // אימות חתימת webhook מטרנזילה
      const notifyUrlKey = formData.get('notify_url_key') as string || '';
      const expectedIpnKey = Deno.env.get('TRANZILA_IPN_KEY');
      if (!expectedIpnKey) {
        console.warn('[tranzilaConfirmPayment] WARNING: TRANZILA_IPN_KEY not configured — webhook not verified. Set this secret ASAP.');
      } else if (notifyUrlKey !== expectedIpnKey) {
        console.error('[tranzilaConfirmPayment] Webhook signature mismatch');
        return errorResponse('Forbidden: invalid webhook signature', 403, req);
      }

      console.log(`[tranzilaConfirmPayment] Notify callback: payment_id=${payment_id}, Response=${tranzilaResponse}, txn=${transaction_id}`);

      // === Check if this is a recurring subscription charge ===
      if (payment_id) {
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('id', payment_id)
          .maybeSingle();

        if (sub) {
          return await handleRecurringChargeNotify(sub, transaction_id, tranzilaResponse, Object.fromEntries(formData), req);
        }
      }
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

    // Fallback: if payment has no lead_id, try to find lead by customer phone
    if (!payment.lead_id && payment.customer_id) {
      try {
        const { data: customer } = await supabaseAdmin
          .from('customers')
          .select('phone_e164, phone')
          .eq('id', payment.customer_id)
          .single();
        const custPhone = customer?.phone_e164 || customer?.phone;
        if (custPhone) {
          const cleanPhone = custPhone.replace(/[^0-9]/g, '');
          const normalizedPhone = cleanPhone.startsWith('972') ? cleanPhone : cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : cleanPhone;
          const { data: matchedLead } = await supabaseAdmin
            .from('leads')
            .select('id')
            .or(`phone.eq.${normalizedPhone},phone.eq.0${normalizedPhone.substring(3)}`)
            .eq('source', 'sales_portal')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (matchedLead) {
            payment.lead_id = matchedLead.id;
            await supabaseAdmin.from('payments').update({ lead_id: matchedLead.id }).eq('id', payment_id);
            console.log(`Linked payment ${payment_id} to lead ${matchedLead.id} via phone fallback`);
          }
        }
      } catch (e: any) {
        console.warn('Phone-based lead lookup failed:', e.message);
      }
    }

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

      // === CRM Integration: update lead if payment is linked ===
      if (payment.lead_id) {
        try {
          // Update lead to "שילם – פתיחת תיק"
          await supabaseAdmin.from('leads').update({
            payment_status: 'paid',
            paid_at: new Date().toISOString(),
            pipeline_stage: 'paid_opening_file',
            status: 'qualified',
          }).eq('id', payment.lead_id);

          // Log status history
          await supabaseAdmin.from('status_history').insert({
            entity_type: 'lead',
            entity_id: payment.lead_id,
            new_stage: 'paid_opening_file',
            new_status: 'payment_confirmed',
            change_reason: 'payment_confirmed',
            source: 'sales_portal',
            metadata: { payment_id, transaction_id, amount: payment.amount },
          });

          // Fetch full lead data for email
          const { data: lead } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', payment.lead_id)
            .single();

          // Send immediate "thanks + please send ID" WhatsApp to customer
          if (lead?.phone) {
            try {
              const customerPhone = formatPhone(lead.phone);
              const thanksMsg = `תודה, קיבלנו את התשלום שלך 🙏\nאנחנו מתחילים לטפל בפתיחת התיק שלך.\n\nכדי שנוכל להתקדם, יש לשלוח לנו כאן אחד מהבאים:\n\n📄 צילום רישיון נהיגה\n📄 צילום דרכון\n📄 או מספר ת״ז של אחד ההורים\n\nברגע שנקבל את הפרטים נמשיך לטפל עבורך.`;

              await sendAndStoreMessage(supabaseAdmin, {
                phone: customerPhone,
                message: thanksMsg,
                lead_id: payment.lead_id,
                sender_type: 'system',
                message_type: 'text',
              });
            } catch (e: any) {
              console.warn('Failed to send post-payment thanks msg:', e.message);
            }
          }

          // Fetch bot session answers (questionnaire data)
          const { data: botSession } = await supabaseAdmin
            .from('bot_sessions')
            .select('answers, flow_type, temperature')
            .eq('lead_id', payment.lead_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Fetch WhatsApp conversation
          const { data: waMessages } = await supabaseAdmin
            .from('whatsapp_messages')
            .select('direction, message_text, sender_type, created_at')
            .eq('lead_id', payment.lead_id)
            .order('created_at', { ascending: true });

          // Send email with all lead data
          const resendApiKey = Deno.env.get('RESEND_API_KEY');
          if (resendApiKey && lead) {
            const answersHtml = botSession?.answers
              ? Object.entries(botSession.answers).map(([k, v]) => `<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">${k}</td><td style="padding:4px 8px;border:1px solid #ddd;">${v}</td></tr>`).join('')
              : '<tr><td colspan="2">אין תשובות שאלון</td></tr>';

            const conversationHtml = (waMessages || []).map(m =>
              `<div style="margin:4px 0;padding:6px 10px;border-radius:8px;${m.direction === 'outbound' ? 'background:#dcfce7;text-align:right;' : 'background:#f1f5f9;text-align:left;'}">
                <small style="color:#666;">${m.sender_type} | ${new Date(m.created_at).toLocaleString('he-IL')}</small><br/>
                ${m.message_text || ''}
              </div>`
            ).join('');

            try {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                body: JSON.stringify({
                  from: 'Perfect One <onboarding@resend.dev>',
                  to: ['yosi5919@gmail.com'],
                  subject: `💰 תשלום התקבל! ${lead.name} — ₪${payment.amount} — פתיחת תיק`,
                  html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;">
                    <h2 style="color:#10B981;">💰 תשלום התקבל — פתיחת תיק</h2>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">שם</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.name || ''}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">טלפון</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.phone || ''}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">אימייל</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.email || ''}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">שירות</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.service_type || payment.product_type || ''}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">סכום</td><td style="padding:4px 8px;border:1px solid #ddd;">₪${payment.amount}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">מזהה תשלום</td><td style="padding:4px 8px;border:1px solid #ddd;">${payment_id}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">Transaction ID</td><td style="padding:4px 8px;border:1px solid #ddd;">${transaction_id}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">ת.ז.</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.id_number || 'לא הוזן'}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">עיר</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.city || 'לא הוזן'}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">טמפרטורה</td><td style="padding:4px 8px;border:1px solid #ddd;">${botSession?.temperature || lead.temperature || ''}</td></tr>
                      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:bold;">מקור</td><td style="padding:4px 8px;border:1px solid #ddd;">${lead.source_page || lead.landing_url || ''}</td></tr>
                    </table>
                    <h3 style="color:#1E3A5F;">📋 תשובות השאלון</h3>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                      ${answersHtml}
                    </table>
                    <h3 style="color:#1E3A5F;">💬 שיחת WhatsApp</h3>
                    <div style="background:#f8fafc;padding:12px;border-radius:8px;max-height:400px;overflow:auto;">
                      ${conversationHtml || '<p>אין שיחה</p>'}
                    </div>
                    <hr style="margin:24px 0;"/>
                    <p style="color:#666;font-size:12px;">נשלח אוטומטית מ-Perfect One CRM</p>
                  </div>`
                })
              });
              console.log(`Payment email sent for lead ${payment.lead_id}`);
            } catch (emailErr: any) {
              console.error('Payment email failed:', emailErr.message);
            }
          }

          console.log(`Lead ${payment.lead_id} updated to paid_opening_file`);
        } catch (e: any) {
          console.error('Lead update after payment failed:', e.message);
        }
      }
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

      // === CRM Integration: update lead payment_status to failed ===
      if (payment.lead_id) {
        try {
          await supabaseAdmin.from('leads').update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          }).eq('id', payment.lead_id);
        } catch (e: any) {
          console.error('Lead failed-payment update error:', e.message);
        }
      }

      console.log(`Payment ${payment_id} failed with Response: ${tranzilaResponse}`);
    }

    return jsonResponse({ success: true, payment_id });
  } catch (error) {
    console.error('tranzilaConfirmPayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});

// === Recurring subscription charge handler ===
async function handleRecurringChargeNotify(
  sub: Record<string, unknown>,
  transactionId: string,
  tranzilaResponse: string,
  rawPayload: Record<string, unknown>,
  req: Request,
) {
  const isSuccess = tranzilaResponse === '000' || tranzilaResponse === '0';
  const today = new Date().toISOString().slice(0, 10);

  // Idempotency: check if we already processed this charge
  if (transactionId) {
    const { data: existing } = await supabaseAdmin
      .from('billing_transactions')
      .select('id')
      .eq('subscription_id', sub.id)
      .eq('tranzila_transaction_id', transactionId)
      .maybeSingle();

    if (existing) {
      console.log(`[recurring] Already processed txn=${transactionId} for sub=${sub.id}`);
      return jsonResponse({ success: true, already_processed: true }, 200, req);
    }
  }

  // Determine if subscription is paused/cancelled (Tranzila charged despite CRM pause)
  const chargedWhileSuspended = sub.status === 'paused' || sub.status === 'cancelled';

  // Insert billing transaction (DB-level dedup via UNIQUE index)
  const { error: insertErr } = await supabaseAdmin.from('billing_transactions').insert({
    subscription_id: sub.id,
    lead_id: sub.lead_id,
    client_id: sub.client_id,
    charge_date: today,
    amount: sub.monthly_price,
    currency: sub.currency || 'ILS',
    status: isSuccess ? 'success' : 'failed',
    tranzila_transaction_id: transactionId || null,
    tranzila_response_code: tranzilaResponse,
    failure_reason: chargedWhileSuspended
      ? `charged_while_${sub.status}`
      : (isSuccess ? null : `Tranzila Response: ${tranzilaResponse}`),
    notify_payload: rawPayload,
  });

  // DB-level dedup: unique constraint violation = already processed
  if (insertErr) {
    if (insertErr.code === '23505' || String(insertErr.message || '').includes('duplicate')) {
      console.log(`[recurring] DB dedup — txn=${transactionId} sub=${sub.id}`);
      return jsonResponse({ success: true, already_processed: true }, 200, req);
    }
    console.error('[recurring] billing_transactions insert failed:', insertErr);
  }

  // If subscription is paused/cancelled, don't change status — just log the charge
  if (chargedWhileSuspended) {
    console.warn(`[recurring] Charged while ${sub.status}! sub=${sub.id} txn=${transactionId}. Manual action needed in My Tranzila.`);
    return jsonResponse({ success: true, subscription_id: sub.id, warning: `charged_while_${sub.status}` }, 200, req);
  }

  if (isSuccess) {
    // Calculate next charge date: 15th of next month
    const d = new Date();
    let y = d.getFullYear();
    let m = d.getMonth() + 2;
    if (m > 12) { m = m - 12; y++; }
    const nextCharge = `${y}-${String(m).padStart(2, '0')}-15`;

    const newStatus = (sub.status === 'pending_first_charge' || sub.status === 'failed') ? 'active' : (sub.status as string);

    await supabaseAdmin.from('subscriptions').update({
      last_charge_date: today,
      next_charge_date: nextCharge,
      status: newStatus,
      failure_count: 0,
      updated_at: new Date().toISOString(),
    }).eq('id', sub.id);

    console.log(`[recurring] Charge success sub=${sub.id}, next=${nextCharge}`);
  } else {
    const newFailCount = ((sub.failure_count as number) || 0) + 1;
    const newStatus = newFailCount >= 3 ? 'failed' : (sub.status as string);

    await supabaseAdmin.from('subscriptions').update({
      failure_count: newFailCount,
      last_failure_reason: `Tranzila Response: ${tranzilaResponse}`,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }).eq('id', sub.id);

    console.log(`[recurring] Charge failed sub=${sub.id}, failures=${newFailCount}`);
  }

  return jsonResponse({ success: true, subscription_id: sub.id, charge_result: isSuccess ? 'success' : 'failed' }, 200, req);
}
