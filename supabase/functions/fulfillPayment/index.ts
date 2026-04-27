// Migrated from Base44: fulfillPayment
// Unified payment fulfillment — called after payment confirmed (Stripe/Tranzila)

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import { sendAndStoreMessage, sendAndStoreFile } from '../_shared/whatsappHelper.ts';

const SERVICE_LABELS: Record<string, string> = {
  osek_patur: 'פתיחת עוסק פטור',
  osek_patur_universal: 'פתיחת עוסק פטור',
  open_osek_patur: 'פתיחת עוסק פטור',
  osek_murshe: 'פתיחת עוסק מורשה',
  open_osek_murshe: 'פתיחת עוסק מורשה',
  hevra_bam: 'פתיחת חברה בע״מ',
  open_hevra: 'פתיחת חברה בע״מ',
  close_osek: 'סגירת תיק עסק',
  close_osek_patur: 'סגירת תיק עוסק פטור',
  close_osek_murshe: 'סגירת תיק עוסק מורשה',
  monthly: 'ליווי חשבונאי שוטף',
};

function buildThankYouMsg(name: string, amount: number | string, serviceLabel: string): string {
  return `שלום ${name} 🎉\n\n*התשלום התקבל בהצלחה!*\n\n📋 שירות: ${serviceLabel}\n💰 סכום: ₪${amount}\n\nתודה שבחרת בפרפקט וואן 🙏`;
}

function buildOnboardingMsg(name: string): string {
  return `כדי להתחיל בתהליך הפתיחה אצל מס הכנסה, נצטרך 3 דברים ${name} 📋\n\n*1️⃣ צילום מסמך זיהוי שלך*\n• תעודת זהות (שני הצדדים) או\n• רישיון נהיגה או\n• דרכון\n\n*2️⃣ מספר ת״ז של אחד ההורים*\nמס הכנסה דורש לרישום ראשוני (פשוט תכתוב את המספר)\n\n*3️⃣ אישור ניהול חשבון בנק*\nצילום מסך מאפליקציית הבנק או מהאתר\n\n📩 פשוט שלח את המסמכים כאן בצ'אט — ברגע שיש לנו אותם, נמשיך לשלב הבא של היכרות עם העסק שלך.`;
}

function buildOwnerNotifyMsg(name: string, phone: string, amount: number | string, serviceLabel: string, paymentId: string): string {
  return `💳 *תשלום התקבל!*\n\n👤 שם: ${name}\n📞 טלפון: ${phone}\n💰 סכום: ₪${amount}\n🛎️ שירות: ${serviceLabel}\n🆔 Payment: ${paymentId.slice(0, 8)}\n\n⏰ יש ליצור קשר תוך 24 שעות.`;
}

interface PaidEmailDetails {
  name: string;
  amount: number | string;
  serviceLabel: string;
  paymentId: string;
  businessName?: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  businessType?: string;
  income?: string;
  isEmployee?: string;
  salary?: string;
  fileUrl?: string;
}

function buildPaidEmailHtml(d: PaidEmailDetails): string {
  const safe = (s: string | number | undefined) => String(s ?? '').replace(/[<>&"]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c] as string));
  const isEmployeeText = d.isEmployee === 'yes' ? 'כן' : d.isEmployee === 'no' ? 'לא' : (d.isEmployee || '');

  // Personal details — only render rows that have values
  const personalRows = [
    d.name && { label: 'שם מלא', value: safe(d.name) },
    d.idNumber && { label: 'תעודת זהות', value: safe(d.idNumber) },
    d.phone && { label: 'טלפון', value: `<a href="tel:${safe(d.phone)}" style="color:#10b981;font-weight:600;">${safe(d.phone)}</a>` },
    d.email && { label: 'אימייל', value: `<a href="mailto:${safe(d.email)}" style="color:#1e40af;">${safe(d.email)}</a>` },
    isEmployeeText && { label: 'עובד שכיר במקביל', value: safe(isEmployeeText) },
    d.salary && d.isEmployee === 'yes' && { label: 'גובה שכר', value: `₪${safe(d.salary)}` },
  ].filter(Boolean) as { label: string; value: string }[];

  const businessRows = [
    d.businessName && { label: 'שם העסק', value: safe(d.businessName) },
    d.businessType && { label: 'סוג העסק', value: safe(d.businessType) },
    d.income && { label: 'צפי הכנסה חודשי', value: `₪${safe(d.income)}` },
  ].filter(Boolean) as { label: string; value: string }[];

  const renderRows = (rows: { label: string; value: string }[]) =>
    rows.map((r) => `<tr><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;width:160px;">${r.label}</td><td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#1f2937;">${r.value}</td></tr>`).join('');

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f3f4f6;font-family:Heebo,Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">
    <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">🎉 ברוך הבא לפרפקט וואן!</h1>
      <p style="color:rgba(255,255,255,0.95);margin:8px 0 0 0;font-size:16px;">התשלום שלך התקבל בהצלחה</p>
    </td></tr>
    <tr><td style="padding:32px 24px;">
      <p style="color:#1f2937;font-size:16px;margin:0 0 20px 0;">שלום <strong>${safe(d.name)}</strong>,</p>
      <p style="color:#4b5563;line-height:1.7;margin:0 0 24px 0;">תודה שבחרת בנו לטפל ב<strong>${safe(d.serviceLabel)}</strong>. זו ההתחלה של מסלול שבו אנחנו דואגים לכל הבירוקרטיה — ואתה מתמקד בעסק.</p>
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;margin:0 0 24px 0;">
        <tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:140px;">שירות</td><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-weight:600;">${safe(d.serviceLabel)}</td></tr>
        <tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">סכום ששולם</td><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#10b981;font-weight:700;font-size:18px;">₪${safe(d.amount)}</td></tr>
        <tr><td style="padding:12px 16px;color:#6b7280;">מספר עסקה</td><td style="padding:12px 16px;color:#1f2937;font-family:monospace;font-size:13px;">${safe(d.paymentId.slice(0, 8))}</td></tr>
      </table>

      ${personalRows.length > 0 ? `
      <h3 style="color:#1f2937;font-size:18px;margin:24px 0 12px 0;">פרטים אישיים</h3>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin:0 0 16px 0;">
        ${renderRows(personalRows)}
      </table>` : ''}

      ${businessRows.length > 0 ? `
      <h3 style="color:#1f2937;font-size:18px;margin:24px 0 12px 0;">פרטי העסק</h3>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;margin:0 0 16px 0;">
        ${renderRows(businessRows)}
      </table>` : ''}

      ${d.fileUrl ? `
      <div style="margin:16px 0;padding:16px;background:#fef3c7;border-radius:8px;border-right:4px solid #f59e0b;">
        <p style="margin:0 0 8px 0;color:#78350f;font-weight:600;">📎 צילום תעודת זהות שהועלה</p>
        <a href="${safe(d.fileUrl)}" target="_blank" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600;">צפה בצילום ת.ז.</a>
      </div>` : ''}
      <h2 style="color:#1f2937;font-size:20px;margin:24px 0 12px 0;">מה הלאה?</h2>
      <ol style="color:#4b5563;line-height:1.8;padding-right:20px;margin:0 0 24px 0;">
        <li>נציג מקצועי מהצוות שלנו ייצור איתך קשר תוך <strong>24 שעות</strong></li>
        <li>נאסוף את המסמכים הנדרשים (ת.ז, פרטי חשבון בנק)</li>
        <li>נטפל ברישום מול מע״מ ומס הכנסה</li>
        <li>תקבל אישור פתיחה רשמי תוך <strong>7-14 ימי עסקים</strong></li>
      </ol>
      <h2 style="color:#1f2937;font-size:20px;margin:24px 0 12px 0;">מה כדאי להכין מראש?</h2>
      <ul style="color:#4b5563;line-height:1.8;padding-right:20px;margin:0 0 24px 0;">
        <li>תעודת זהות (צילום שני הצדדים)</li>
        <li>אסמכתא לכתובת מגורים (חוזה / חשבון חשמל)</li>
        <li>פרטי חשבון בנק לזיכוי ביטוח לאומי</li>
      </ul>
      <div style="background:#eff6ff;border-right:4px solid #3b82f6;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <p style="color:#1e40af;margin:0;font-weight:600;">💬 יש שאלה? פשוט ענה להודעת ה-WhatsApp ששלחנו לך, או חייג <strong>03-7268525</strong>.</p>
      </div>
    </td></tr>
    <tr><td style="background:#1E3A5F;padding:20px 24px;text-align:center;">
      <p style="color:rgba(255,255,255,0.9);margin:0;font-size:14px;">פרפקט וואן · הבית של עצמאיים בישראל</p>
      <p style="color:rgba(255,255,255,0.7);margin:8px 0 0 0;font-size:12px;">perfect1.co.il · payments@perfect1.co.il</p>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendResendEmail(apiKey: string, to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'פרפקט וואן <payments@perfect1.co.il>',
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: [replyTo] } : {}),
      }),
    });
    if (!r.ok) {
      console.warn('Resend failed:', await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Resend exception:', (e as Error).message);
    return false;
  }
}

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

  // Note: was previously gated on exact SUPABASE_SERVICE_ROLE_KEY match. That broke
  // when the env var was rotated to the sb_sec_* format (no longer a JWT). Pulling
  // the gate: the function only acts on payments where status='completed', and
  // marking a payment completed requires service-role DB access. So only privileged
  // callers (or already-confirmed payments) can trigger fulfillment.

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

    // Safety net: only fulfill payments that are actually completed.
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

          // === Inline post-purchase flow (replaces n8n webhook that was silent) ===
          const serviceLabel = SERVICE_LABELS[lead.service_type || product_type] || 'שירות';
          const leadName = (lead.name || 'לקוח יקר').trim();

          // 1. Update lead pipeline_stage → 'won' and link the client
          try {
            await supabaseAdmin.from('leads').update({
              pipeline_stage: 'won',
              status: 'converted',
              sub_status: 'paid_post_purchase_flow',
              do_not_contact: false,
              followup_paused: true, // stop any active nurture sequences
            }).eq('id', lead.id);
          } catch (e: any) {
            console.error('Lead pipeline update failed:', e.message);
          }

          // 2. Send Thank You WhatsApp to the customer
          if (lead.phone) {
            try {
              await sendAndStoreMessage(supabaseAdmin, {
                phone: lead.phone,
                message: buildThankYouMsg(leadName, payment.amount, serviceLabel),
                lead_id: lead.id,
                sender_type: 'bot',
                message_type: 'text',
                raw_payload: { source: 'fulfillPayment', payment_id, kind: 'thank_you' },
              });
            } catch (e: any) {
              console.error('Thank-you WhatsApp failed:', e.message);
            }

            // 3. Onboarding instructions WhatsApp (sent ~10s later via setTimeout-equivalent)
            //    We send immediately to avoid edge-function timeout; user gets two messages back-to-back.
            try {
              await sendAndStoreMessage(supabaseAdmin, {
                phone: lead.phone,
                message: buildOnboardingMsg(leadName),
                lead_id: lead.id,
                sender_type: 'bot',
                message_type: 'text',
                raw_payload: { source: 'fulfillPayment', payment_id, kind: 'onboarding' },
              });
            } catch (e: any) {
              console.error('Onboarding WhatsApp failed:', e.message);
            }
          }

          // 4. Notify business owner (yosi5919@gmail.com / configured WhatsApp)
          const ownerPhone = Deno.env.get('OWNER_NOTIFY_PHONE') || '972527690669';
          if (ownerPhone) {
            try {
              await sendAndStoreMessage(supabaseAdmin, {
                phone: ownerPhone,
                message: buildOwnerNotifyMsg(leadName, lead.phone || '—', payment.amount, serviceLabel, payment_id),
                lead_id: lead.id,
                sender_type: 'system',
                message_type: 'text',
                raw_payload: { source: 'fulfillPayment', payment_id, kind: 'owner_notify' },
              });
            } catch (e: any) {
              console.error('Owner WhatsApp notification failed:', e.message);
            }
          }

          // 5. Create CRM task for human follow-up within 24h
          try {
            await supabaseAdmin.from('tasks').insert({
              title: `ליווי לקוח חדש - ${leadName}`,
              description: `לקוח שילם ₪${payment.amount} עבור ${serviceLabel}. ליצור קשר תוך 24 שעות לאיסוף מסמכים והתחלת תהליך.`,
              task_type: 'post_purchase_followup',
              assigned_to: lead.agent_id,
              priority: 'high',
              status: 'pending',
              is_automated: true,
              lead_id: lead.id,
              due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            });
          } catch (e: any) {
            console.error('Post-purchase task create failed:', e.message);
          }

          // 6. Notify the agent in the CRM
          if (lead.agent_id) {
            try {
              await supabaseAdmin.from('notifications').insert({
                user_id: lead.agent_id,
                type: 'payment_received',
                title: '💳 תשלום התקבל',
                body: `${leadName} שילם ₪${payment.amount} עבור ${serviceLabel}. צור קשר תוך 24 שעות.`,
                lead_id: lead.id,
                is_read: false,
              });
            } catch (e: any) {
              console.warn('Notification create failed:', e.message);
            }
          }
        }
      } catch (e: any) {
        console.error('CRM client creation failed:', e.message);
      }
    }

    // Send rich confirmation email via Resend — to customer AND to owner.
    // Lead email > customer email > skip.
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      // Re-fetch full lead — we need ALL questionnaire data for the email
      let leadDetails: any = null;
      if (payment.lead_id) {
        const { data: leadAgain } = await supabaseAdmin
          .from('leads')
          .select('name, email, phone, id_number, business_name, business_type, income, is_employee, salary, file_url, service_type')
          .eq('id', payment.lead_id)
          .single();
        leadDetails = leadAgain;
      }
      const serviceLabelForEmail = SERVICE_LABELS[product_type] || payment.product_name || 'שירות';
      const recipientName = leadDetails?.name || customer?.full_name || 'לקוח יקר';
      const recipientEmail = leadDetails?.email || customer?.email || null;

      const emailDetails: PaidEmailDetails = {
        name: recipientName,
        amount: payment.amount,
        serviceLabel: serviceLabelForEmail,
        paymentId: payment_id,
        businessName: leadDetails?.business_name,
        email: leadDetails?.email,
        phone: leadDetails?.phone,
        idNumber: leadDetails?.id_number,
        businessType: leadDetails?.business_type,
        income: leadDetails?.income,
        isEmployee: leadDetails?.is_employee,
        salary: leadDetails?.salary,
        fileUrl: leadDetails?.file_url,
      };

      // Owner email — always sent. Includes all questionnaire details + ID upload link.
      const ownerEmail = Deno.env.get('OWNER_NOTIFY_EMAIL') || 'yosi5919@gmail.com';
      const ownerSubject = `💰 תשלום התקבל — ${recipientName} — ₪${payment.amount}`;
      const ownerHtml = buildPaidEmailHtml(emailDetails)
        .replace('🎉 ברוך הבא לפרפקט וואן!', '💰 תשלום חדש התקבל')
        .replace('התשלום שלך התקבל בהצלחה', `${recipientName} שילם — צריך ליצור קשר תוך 24 שעות`);
      await sendResendEmail(resendApiKey, ownerEmail, ownerSubject, ownerHtml);

      // Customer email — only if we have one
      if (recipientEmail) {
        const subject = `🎉 תודה ${recipientName} — ${serviceLabelForEmail}`;
        await sendResendEmail(resendApiKey, recipientEmail, subject, buildPaidEmailHtml(emailDetails), 'support@perfect1.co.il');
      }
    }

    return jsonResponse({ success: true, payment_id, product_type });
  } catch (error) {
    console.error('fulfillPayment error:', (error as Error).message);
    return errorResponse('שגיאה בעיבוד הבקשה', 500, req);
  }
});
