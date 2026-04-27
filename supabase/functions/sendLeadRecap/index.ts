// sendLeadRecap — one-off operator helper. POST { lead_id, to } sends a
// human-readable summary of a lead (questionnaire status, payment status,
// what was captured, what's missing) to the given email via Resend.

import { supabaseAdmin, jsonResponse, errorResponse, getCorsHeaders } from '../_shared/supabaseAdmin.ts';

function escapeHtml(s: string): string {
  return String(s ?? '').replace(/[<>&"]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c] as string));
}

function row(label: string, value: string | null | undefined, mono = false): string {
  if (!value) return '';
  return `<tr><td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-weight:500;width:160px;">${label}</td><td style="padding:8px 14px;border-bottom:1px solid #e5e7eb;color:#1f2937;${mono ? 'font-family:monospace;font-size:13px;' : ''}">${escapeHtml(value)}</td></tr>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });
  try {
    const { lead_id, to } = await req.json();
    if (!lead_id || !to) return errorResponse('lead_id + to required', 400, req);

    const { data: lead } = await supabaseAdmin.from('leads').select('*').eq('id', lead_id).single();
    if (!lead) return errorResponse('Lead not found', 404, req);

    // Latest payment for this lead (if any)
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('id, status, amount, created_at, metadata, failure_reason')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false })
      .limit(5);
    const latestPaid = (payments || []).find(p => p.status === 'completed');
    const latestPending = (payments || []).find(p => p.status === 'pending');

    // Questionnaire — from lead row OR fallback to payment metadata
    const q = lead.questionnaire_data || {};
    const metaQ = (latestPending?.metadata as any)?.questionnaire || (latestPaid?.metadata as any)?.questionnaire || {};
    const merged = {
      id_number: lead.id_number || q.id_number || metaQ.id_number,
      business_name: lead.business_name || q.business_name || metaQ.businessName,
      business_type: lead.business_type || q.business_type || metaQ.businessType,
      income: lead.income || q.income || metaQ.income,
      is_employee: lead.is_employee || q.is_employee || metaQ.is_employee,
      salary: lead.salary || q.salary || metaQ.salary,
      file_url: lead.file_url || q.file_url || metaQ.file_url,
    };
    const hasAnyQuestionnaire = Object.values(merged).some(Boolean);

    const html = `<!DOCTYPE html><html dir="rtl" lang="he"><body style="font-family:Heebo,Arial,sans-serif;background:#f3f4f6;margin:0;">
<table style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#1E3A5F,#2C5282);padding:24px;text-align:center;">
  <h1 style="color:#fff;margin:0;font-size:22px;">📋 סיכום ליד — ${escapeHtml(lead.name || '')}</h1>
</td></tr>
<tr><td style="padding:24px;">
  <h2 style="color:#1f2937;margin:0 0 12px 0;font-size:16px;">פרטי ליד</h2>
  <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;margin:0 0 20px 0;">
    ${row('שם', lead.name)}
    ${row('טלפון', lead.phone)}
    ${row('אימייל', lead.email)}
    ${row('סטטוס pipeline', lead.pipeline_stage)}
    ${row('מקור', lead.source_page)}
    ${row('נכנס', new Date(lead.created_at).toLocaleString('he-IL'))}
  </table>

  <h2 style="color:#1f2937;margin:0 0 12px 0;font-size:16px;">תשלומים (${payments?.length || 0})</h2>
  ${(payments || []).length === 0 ? '<p style="color:#9ca3af;">אין רשומות תשלום</p>' : `
  <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;margin:0 0 20px 0;font-size:14px;">
    <tr style="background:#e5e7eb;"><th style="padding:8px;text-align:right;">סטטוס</th><th style="padding:8px;text-align:right;">סכום</th><th style="padding:8px;text-align:right;">תאריך</th><th style="padding:8px;text-align:right;">סיבת כשל</th></tr>
    ${(payments || []).map(p => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><span style="background:${p.status==='completed'?'#d1fae5':p.status==='pending'?'#fef3c7':'#fee2e2'};color:${p.status==='completed'?'#065f46':p.status==='pending'?'#78350f':'#7f1d1d'};padding:2px 8px;border-radius:4px;font-weight:600;">${p.status}</span></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">₪${p.amount}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${new Date(p.created_at).toLocaleString('he-IL')}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#dc2626;font-size:12px;">${escapeHtml(p.failure_reason || '')}</td></tr>`).join('')}
  </table>`}

  <h2 style="color:#1f2937;margin:0 0 12px 0;font-size:16px;">תשובות שאלון</h2>
  ${!hasAnyQuestionnaire ? `<div style="background:#fef3c7;border-right:4px solid #f59e0b;padding:14px 18px;border-radius:8px;color:#78350f;">
    <strong>⚠️ אין נתוני שאלון.</strong><br>
    הליד לא מילא את השאלון הארוך ב-/open-osek-patur-online (או שהמילוי לא הסתיים). יש לפנות ידנית כדי לאסוף: ת״ז, תז של אחד ההורים, אישור ניהול חשבון בנק, סוג עסק, צפי הכנסה.
  </div>` : `
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
    ${row('תעודת זהות', merged.id_number)}
    ${row('שם העסק', merged.business_name)}
    ${row('סוג העסק', merged.business_type)}
    ${row('צפי הכנסה חודשי', merged.income ? `₪${merged.income}` : null)}
    ${row('עובד שכיר במקביל', merged.is_employee === 'yes' ? 'כן' : merged.is_employee === 'no' ? 'לא' : merged.is_employee)}
    ${row('גובה שכר', merged.salary && merged.is_employee === 'yes' ? `₪${merged.salary}` : null)}
  </table>
  ${merged.file_url ? `<div style="margin-top:14px;background:#fef3c7;padding:14px 18px;border-radius:8px;border-right:4px solid #f59e0b;"><p style="margin:0 0 8px 0;color:#78350f;font-weight:600;">📎 צילום ת״ז שהועלה</p><a href="${escapeHtml(merged.file_url)}" target="_blank" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600;">צפה בצילום</a></div>` : ''}
  `}

  <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Lead ID: ${escapeHtml(lead_id)}</p>
</td></tr>
</table></body></html>`;

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return errorResponse('RESEND_API_KEY missing', 500, req);

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: 'פרפקט וואן <payments@perfect1.co.il>',
        to: [to],
        subject: `📋 סיכום ליד — ${lead.name} (${lead.phone})`,
        html,
      }),
    });
    const respText = await r.text();
    if (!r.ok) return errorResponse(`Resend ${r.status}: ${respText}`, 502, req);
    return jsonResponse({ success: true, sent_to: to, lead_name: lead.name }, 200, req);
  } catch (e) {
    return errorResponse((e as Error).message, 500, req);
  }
});
