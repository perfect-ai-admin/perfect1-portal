// approveCompanyProposal — public form-submit endpoint for the digital
// company-formation quote page. Validates input, persists to
// proposal_approvals, and fires two Resend emails (customer + admin).

import {
  supabaseAdmin,
  getCorsHeaders,
  jsonResponse,
  errorResponse,
  escapeHtml,
  validateEmail,
  validatePhone,
  sanitizeString,
  checkRateLimit,
} from '../_shared/supabaseAdmin.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_ADDRESS   = Deno.env.get('PROPOSAL_FROM_EMAIL') || 'Perfect One <no-reply@one-pai.com>';
const ADMIN_EMAIL    = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'yosi5919@gmail.com';

const SETUP_PRICE         = 1999;
const MONTHLY_PRICE       = 899;
const ANNUAL_REPORT_PRICE = 4000;

interface RequestBody {
  full_name: string;
  phone: string;
  email: string;
  requested_company_name?: string;
  id_number?: string;
  notes?: string;
  approved_terms?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405, req);
  }

  try {
    const body = (await req.json()) as RequestBody;

    const fullName = sanitizeString(body.full_name || '', 120).trim();
    const phoneRaw = (body.phone || '').trim();
    const email    = (body.email || '').trim().toLowerCase();
    const company  = sanitizeString(body.requested_company_name || '', 200).trim();
    const idNumber = sanitizeString(body.id_number || '', 20).trim();
    const notes    = sanitizeString(body.notes || '', 1000).trim();

    if (!fullName)           return errorResponse('שם מלא חובה', 400, req);
    if (!phoneRaw)           return errorResponse('טלפון חובה', 400, req);
    if (!email)              return errorResponse('אימייל חובה', 400, req);
    if (!validateEmail(email))            return errorResponse('כתובת אימייל לא תקינה', 400, req);
    const phone = validatePhone(phoneRaw);
    if (!phone)              return errorResponse('מספר טלפון לא תקין', 400, req);

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    const userAgent = req.headers.get('user-agent') || null;

    if (!checkRateLimit(`proposal:${ipAddress || phone}`, 5, 60_000)) {
      return errorResponse('יותר מדי בקשות — נסו שוב בעוד דקה', 429, req);
    }

    // Idempotency: dedupe a double-click within 5 minutes for same email.
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: existing } = await supabaseAdmin
      .from('proposal_approvals')
      .select('id')
      .eq('email', email)
      .eq('proposal_type', 'company_formation')
      .gte('approved_at', fiveMinAgo)
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      return jsonResponse({ success: true, id: existing.id, deduped: true }, 200, req);
    }

    const { data: row, error: insertError } = await supabaseAdmin
      .from('proposal_approvals')
      .insert({
        full_name: fullName,
        phone,
        email,
        requested_company_name: company || null,
        id_number: idNumber || null,
        notes: notes || null,
        proposal_type: 'company_formation',
        setup_price: SETUP_PRICE,
        monthly_price: MONTHLY_PRICE,
        annual_report_price: ANNUAL_REPORT_PRICE,
        vat_included: false,
        approved_terms: true,
        status: 'proposal_approved',
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select('id, approved_at')
      .single();

    if (insertError || !row) {
      console.error('[approveCompanyProposal] insert failed:', insertError);
      return errorResponse('שגיאה בשמירת ההצעה — נסו שוב', 500, req);
    }

    // Fire emails — failures here MUST NOT break the success response.
    if (RESEND_API_KEY) {
      const approvedAt = new Date(row.approved_at).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });

      const customerHtml = renderCustomerEmail({ fullName });
      const adminHtml = renderAdminEmail({
        fullName, phone, email, company, idNumber, notes, approvedAt, ip: ipAddress,
      });

      await Promise.allSettled([
        sendResend({
          to: email,
          subject: 'הצעת המחיר להקמת חברה בע״מ — הצעד הבא',
          html: customerHtml,
        }),
        sendResend({
          to: ADMIN_EMAIL,
          subject: 'ליד חדש — הצעת מחיר להקמת חברה בע״מ',
          html: adminHtml,
        }),
      ]).catch((err) => console.error('[approveCompanyProposal] mail batch error:', err));
    } else {
      console.warn('[approveCompanyProposal] RESEND_API_KEY missing — skipping emails');
    }

    return jsonResponse({ success: true, id: row.id }, 200, req);
  } catch (error) {
    console.error('[approveCompanyProposal] error:', error);
    return errorResponse((error as Error).message || 'Internal error', 500, req);
  }
});

async function sendResend(opts: { to: string; subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[Resend] ${opts.to} failed:`, text);
  }
  return res.ok;
}

function renderCustomerEmail({ fullName }: { fullName: string }) {
  const name = escapeHtml(fullName);
  return `
    <div style="direction:rtl;font-family:Arial,Heebo,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;line-height:1.7">
      <div style="background:linear-gradient(135deg,#0f2a4a,#1e3a8a);color:#fff;padding:28px 24px;border-radius:14px 14px 0 0">
        <h1 style="margin:0;font-size:22px">תודה ${name} — הצעד הבא בדרך</h1>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 14px 14px">
        <p>שלום ${name},</p>
        <p>קיבלנו את הפרטים שלך — שמחים שהתעניינת בהקמת חברה בע״מ דרכנו.</p>

        <h3 style="color:#0f2a4a;margin-top:24px;margin-bottom:8px">תזכורת לפרטי ההצעה</h3>
        <ul style="padding-inline-start:20px;margin:0">
          <li><strong>הקמת חברה בע״מ:</strong> 1,999 ₪ (תשלום חד־פעמי) — כולל בדיקת שם, תקנון, אימות חתימות, פרוטוקול מורשה חתימה ופתיחת תיקים ברשויות.</li>
          <li><strong>ניהול חודשי לשנה הראשונה:</strong> 899 ₪ + מע״מ לחודש — כולל הנהלת חשבונות שוטפת, עד 3 תלושי שכר, וליווי יועץ.</li>
          <li><strong>דוח שנתי לחברה:</strong> 4,000 ₪ + מע״מ (משולם בנפרד אחת לשנה).</li>
        </ul>

        <h3 style="color:#0f2a4a;margin-top:24px;margin-bottom:8px">הצעד הבא</h3>
        <p>נציג מהצוות שלנו יחזור אליך בקרוב טלפונית כדי לעבור על הפרטים, לבחור שם לחברה ולהתחיל בתהליך ההקמה. אין מה למלא או לחתום בשלב הזה — אנחנו עושים בשבילך את כל העבודה.</p>

        <p style="margin-top:24px;color:#6b7280;font-size:13px">
          המחירים אינם כוללים אגרות ממשלתיות אלא אם צוין אחרת במפורש.
        </p>

        <p style="margin-top:28px">בברכה,<br/><strong>פרפקט וואן</strong></p>
      </div>
    </div>
  `;
}

function renderAdminEmail(p: {
  fullName: string; phone: string; email: string;
  company?: string; idNumber?: string; notes?: string;
  approvedAt: string; ip?: string | null;
}) {
  const row = (label: string, value?: string | null) =>
    value ? `<tr><td style="padding:6px 8px;color:#6b7280;font-weight:600;white-space:nowrap">${label}</td><td style="padding:6px 8px">${escapeHtml(value)}</td></tr>` : '';
  return `
    <div style="direction:rtl;font-family:Arial,Heebo,sans-serif;max-width:640px;margin:0 auto;color:#111827;line-height:1.6">
      <h2 style="color:#0f2a4a">לקוח אישר הצעת מחיר להקמת חברה בע״מ</h2>

      <h3 style="margin-bottom:6px">פרטי הלקוח</h3>
      <table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden">
        ${row('שם מלא', p.fullName)}
        ${row('טלפון', p.phone)}
        ${row('אימייל', p.email)}
        ${row('שם חברה מבוקש', p.company)}
        ${row('תעודת זהות', p.idNumber)}
        ${row('הערות', p.notes)}
      </table>

      <h3 style="margin-top:18px;margin-bottom:6px">פרטי ההצעה</h3>
      <table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;overflow:hidden">
        <tr><td style="padding:6px 8px;color:#6b7280;font-weight:600">הקמת חברה</td><td style="padding:6px 8px">1,999 ₪</td></tr>
        <tr><td style="padding:6px 8px;color:#6b7280;font-weight:600">ניהול חודשי</td><td style="padding:6px 8px">899 ₪ + מע״מ לחודש (שנה ראשונה)</td></tr>
        <tr><td style="padding:6px 8px;color:#6b7280;font-weight:600">דוח שנתי</td><td style="padding:6px 8px">4,000 ₪ + מע״מ</td></tr>
        <tr><td style="padding:6px 8px;color:#6b7280;font-weight:600">סטטוס</td><td style="padding:6px 8px">proposal_approved</td></tr>
        <tr><td style="padding:6px 8px;color:#6b7280;font-weight:600">תאריך אישור</td><td style="padding:6px 8px">${escapeHtml(p.approvedAt)}</td></tr>
        ${row('IP', p.ip || undefined)}
      </table>
    </div>
  `;
}
