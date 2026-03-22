import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Admin-only function to retry a failed billing document or resend email.
 * Input: { billing_document_id, action: 'retry_issue' | 'resend_email' }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { billing_document_id, action } = await req.json();
    if (!billing_document_id || !action) {
      return Response.json({ error: 'Missing billing_document_id or action' }, { status: 400 });
    }

    const docs = await base44.asServiceRole.entities.BillingDocument.filter({ id: billing_document_id });
    if (!docs?.length) {
      return Response.json({ error: 'Billing document not found' }, { status: 404 });
    }
    const doc = docs[0];

    if (action === 'retry_issue') {
      if (doc.issue_status === 'issued') {
        return Response.json({ status: 'already_issued', document_number: doc.document_number });
      }
      if (doc.retry_count >= 5) {
        return Response.json({ error: 'Maximum retry count reached (5)' }, { status: 400 });
      }

      // Call the main invoice function with admin_retry trigger
      const result = await base44.functions.invoke('issueMorningInvoice', {
        payment_id: doc.payment_id,
        trigger_source: 'admin_retry',
      });

      return Response.json({ status: 'retry_sent', result: result?.data });
    }

    if (action === 'resend_email') {
      if (doc.issue_status !== 'issued') {
        return Response.json({ error: 'Document not yet issued, cannot resend' }, { status: 400 });
      }
      if (!doc.pdf_url) {
        return Response.json({ error: 'No PDF URL available' }, { status: 400 });
      }

      const email = doc.customer_email || doc.sent_to_email;
      if (!email) {
        return Response.json({ error: 'No email address available' }, { status: 400 });
      }

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `חשבונית מס/קבלה מספר ${doc.document_number || ''} – Perfect One`,
        body: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#1E3A5F,#2C5282);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
              <h2 style="color:white;margin:0;">חשבונית מס / קבלה</h2>
            </div>
            <div style="background:white;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#374151;font-size:15px;">שלום ${doc.customer_name || ''},</p>
              <p style="color:#374151;font-size:15px;">מצורפת חשבונית מס/קבלה עבור התשלום שלך.</p>
              <table style="width:100%;margin:16px 0;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6b7280;">מספר מסמך:</td><td style="padding:8px 0;font-weight:bold;">${doc.document_number || '-'}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;">סכום:</td><td style="padding:8px 0;font-weight:bold;">₪${doc.amount_total?.toFixed(2) || '-'}</td></tr>
              </table>
              <div style="text-align:center;margin:20px 0;">
                <a href="${doc.pdf_url}" style="display:inline-block;background:#1E3A5F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">צפה בחשבונית</a>
              </div>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Perfect One – ניהול עסקי חכם</p>
            </div>
          </div>
        `,
      });

      await base44.asServiceRole.entities.BillingDocument.update(billing_document_id, {
        send_status: 'sent',
        sent_to_email: email,
        sent_at: new Date().toISOString(),
      });

      return Response.json({ status: 'email_sent', email });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[RetryBilling] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});