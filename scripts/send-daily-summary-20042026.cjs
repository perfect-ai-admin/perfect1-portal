// One-shot: send daily summary for 20.04.2026
const https = require('https');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

function httpsPost(urlStr, headers, bodyStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function main() {
  const html = `
<div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;">
<h1 style="background:#1a56db;color:white;padding:16px 20px;border-radius:8px;margin:0 0 16px;">
  סיכום יומי &mdash; perfect1.co.il &mdash; 20.04.2026
</h1>

<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">
  כתבות שפורסמו היום
</h2>
<ul style="padding-right:20px;line-height:1.8;">
  <li>
    <strong>למה לבחור בעוסק מורשה? יתרונות וחסרונות</strong><br>
    <a href="https://perfect1.co.il/osek-murshe/advantages">perfect1.co.il/osek-murshe/advantages</a><br>
    <small style="color:#6b7280;">08:00 &mdash; Auto-published (commit fdef62d7) &mdash; idea 20</small>
  </li>
</ul>

<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">
  סטטוס אוטומציות
</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <tr style="background:#f3f4f6;">
    <th style="padding:8px;text-align:right;">רכיב</th>
    <th style="padding:8px;text-align:right;">סטטוס</th>
    <th style="padding:8px;text-align:right;">הערה</th>
  </tr>
  <tr>
    <td style="padding:6px 8px;">SEO Auto Publisher</td>
    <td style="padding:6px 8px;color:#16a34a;">עובד</td>
    <td style="padding:6px 8px;">פרסם 1 כתבה ב-08:00</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:6px 8px;">Cloudflare Email Routing</td>
    <td style="padding:6px 8px;color:#d97706;">לא ידוע</td>
    <td style="padding:6px 8px;">לא בדקנו אם MX records הופעלו</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">outreachInboundReply function</td>
    <td style="padding:6px 8px;color:#d97706;">חלקי</td>
    <td style="padding:6px 8px;">קוד קיים &mdash; תלוי ב-Email Routing</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:6px 8px;">AI classify intent</td>
    <td style="padding:6px 8px;color:#dc2626;">לא עובד</td>
    <td style="padding:6px 8px;">OPENAI_API_KEY חסר ב-Supabase Secrets</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">התראת מייל לאדמין</td>
    <td style="padding:6px 8px;color:#d97706;">חלקי</td>
    <td style="padding:6px 8px;">יגיע &mdash; אבל intent=unknown (בלי OpenAI)</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:6px 8px;">WhatsApp FollowUp Bot</td>
    <td style="padding:6px 8px;color:#16a34a;">תוקן</td>
    <td style="padding:6px 8px;">GREENAPI_API_TOKEN תוקן (commit b977a3d1)</td>
  </tr>
</table>

<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">
  מצב Flow תגובות ל-Outreach
</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <tr style="background:#f3f4f6;">
    <th style="padding:8px;text-align:right;">שלב</th>
    <th style="padding:8px;text-align:right;">סטטוס</th>
    <th style="padding:8px;text-align:right;">מה חסר</th>
  </tr>
  <tr>
    <td style="padding:6px 8px;">1. נמען עונה על outreach email</td>
    <td style="padding:6px 8px;color:#d97706;">לא ידוע</td>
    <td style="padding:6px 8px;">Cloudflare Email Routing לא הופעל</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:6px 8px;">2. מייל מגיע ל-outreachInboundReply</td>
    <td style="padding:6px 8px;color:#d97706;">תלוי בשלב 1</td>
    <td style="padding:6px 8px;">MX records + Email Worker</td>
  </tr>
  <tr>
    <td style="padding:6px 8px;">3. זיהוי כוונה (interested/not_interested)</td>
    <td style="padding:6px 8px;color:#dc2626;">לא עובד</td>
    <td style="padding:6px 8px;">OPENAI_API_KEY ב-Supabase Secrets</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:6px 8px;">4. התראה למשתמש</td>
    <td style="padding:6px 8px;color:#d97706;">חלקי</td>
    <td style="padding:6px 8px;">יגיע עם "unknown" במקום "interested"</td>
  </tr>
</table>

<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">
  3 משימות פתוחות
</h2>
<ol style="padding-right:20px;line-height:2;">
  <li>
    <strong>Cloudflare Email Routing:</strong>
    הפעל Email Routing ב-Cloudflare עבור perfect1.co.il &mdash;
    הגדר Catch-all שמעביר לכתובת Supabase webhook של <code>outreachInboundReply</code>
  </li>
  <li>
    <strong>OPENAI_API_KEY:</strong>
    הוסף ב-Supabase &rarr; Settings &rarr; Edge Functions &rarr; Secrets
  </li>
  <li>
    <strong>מייל "כתבה חדשה":</strong>
    החלט האם לשלוח ניוזלטר אוטומטי לנרשמים בכל פרסום &mdash; אם כן, הגדר טריגר ב-n8n
  </li>
</ol>

<p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;">
  נשלח על ידי Claude Code Agent | perfect1.co.il
</p>
</div>
`;

  const payload = JSON.stringify({
    to: 'yosi5919@gmail.com',
    subject: 'סיכום יומי — perfect1 — 20.04.2026',
    html: html,
    from: 'no-reply@perfect1.co.il'
  });

  console.log('Sending email via Supabase sendEmail...');
  const resp = await httpsPost(
    'https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/sendEmail',
    {
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    payload
  );
  console.log('Status:', resp.status);
  console.log('Response:', JSON.stringify(resp.body, null, 2));
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
