/**
 * send-article-notification.cjs
 *
 * שולח מייל התראה ידני על מאמר שפורסם.
 * Run: RESEND_API_KEY=re_xxx node scripts/send-article-notification.cjs
 */
const https = require('https');

const RESEND_KEY = process.env.RESEND_API_KEY || '';
if (!RESEND_KEY) {
  console.error('ERROR: Set RESEND_API_KEY env var');
  process.exit(1);
}

const ARTICLE = {
  title: 'יתרונות עוסק מורשה: למה כדאי לבחור במסלול הזה?',
  slug: 'advantages-of-osek-murshe',
  category: 'osek-murshe',
  summary: 'מדריך מקיף על היתרונות הכלכליים של עוסק מורשה — קיזוז מע"מ, הוצאות מוכרות, מעמד מקצועי ועוד.',
  publishedAt: new Date().toLocaleDateString('he-IL'),
};

const url = `https://perfect1.co.il/${ARTICLE.category}/${ARTICLE.slug}`;

const html = `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; background: #f9fafb; padding: 24px; border-radius: 8px;">
  <div style="background: #1E3A5F; color: white; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px;">
    <h2 style="margin: 0; font-size: 18px;">&#x1F4DD; מאמר חדש פורסם באתר</h2>
    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.8;">perfect1.co.il</p>
  </div>

  <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
    <h3 style="color: #1E3A5F; margin: 0 0 12px;">${ARTICLE.title}</h3>
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">${ARTICLE.summary}</p>

    <table style="width: 100%; font-size: 13px; margin-bottom: 16px;">
      <tr>
        <td style="color: #9ca3af; width: 80px; padding: 4px 0;">קטגוריה:</td>
        <td style="color: #374151; font-weight: bold;">${ARTICLE.category}</td>
      </tr>
      <tr>
        <td style="color: #9ca3af; padding: 4px 0;">Slug:</td>
        <td style="color: #374151;">${ARTICLE.slug}</td>
      </tr>
      <tr>
        <td style="color: #9ca3af; padding: 4px 0;">תאריך:</td>
        <td style="color: #374151;">${ARTICLE.publishedAt}</td>
      </tr>
    </table>

    <a href="${url}" style="display: inline-block; background: #1E3A5F; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">
      &#x1F517; פתח מאמר באתר
    </a>
  </div>

  <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
    נשלח אוטומטית מ-perfect1.co.il
  </p>
</div>
`;

function resendSend(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, body: { raw: d } }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Sending article notification email...');
  console.log(`Article: ${ARTICLE.title}`);
  console.log(`URL: ${url}\n`);

  const result = await resendSend({
    from: 'Perfect One <no-reply@perfect1.co.il>',
    to: ['yosi5919@gmail.com'],
    subject: `מאמר חדש פורסם: ${ARTICLE.title}`,
    html,
  });

  console.log(`Status: ${result.status}`);
  console.log(`Response:`, JSON.stringify(result.body, null, 2));

  if (result.status === 200 || result.status === 201) {
    console.log(`\nSUCCESS. Message ID: ${result.body.id}`);
    console.log('Check yosi5919@gmail.com for the notification.');
  } else {
    console.error('\nFAILED. Check error above.');
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
