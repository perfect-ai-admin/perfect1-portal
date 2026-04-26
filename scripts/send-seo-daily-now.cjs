// One-shot: send today's SEO daily email manually
// Uses Node.js crypto (works locally), bypasses the broken n8n Code node
const https = require('https');
const crypto = require('crypto');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRWLBeptRiQZKx\nJHka3iLA0+urEeBXT5dasiBwL10RAv1D/sguJmPIs1PR5AsjaBIUcWT1WIQAsi8U\nwIJkhBQLc8A0FuSeEtfE4/P84d6mnnKRtueGOuNPUXj8hf42h7AiXuuboUGT/Vha\nKa58Pa/D9q+kOR2K/UnHclw3jrao7I27ReL3T/NMFen4i2UAaO6lHlxRZ5Fl0G3H\nflLTb2T7FKttQn9PTXOFbEed7Phh0mMZH2moDKQ1SZWrh/RcUDsjYLnCGUZrsRSj\nvsB9hOpztgwrwiaLjk41w2iVnzp2CzDEhaJLVOeR6YqD6T8KC5EMMP1vsv3fHdQE\n7fhXy1RjAgMBAAECggEARTDPZhE0m975WVPpNPCbQukn+Iv5flH/f8nkv79fvpoi\n1ADW763fh/uBJht9dO/WHeyWhiKBymsZ9X1k+0zOBTT2HyE74WTv7JK81uVePeqb\nij6OCgbXjyUp3Ch7K1GwbMO7kl37OyreMzqYgVawC5AyYBBCi+gIJQPOp8wi4fRo\nIOZk41u8X0/28WRsbnDYpDG4SI46uKrcxi9GOXDBFFJf7AMhdie14/B9muPwGncb\nq77p1Fd73D8ngYXZ8PSLIgisw8bg/9A18Zt6Z6DXxUhzUaOzPxHliAZ/eLZSniSH\nGKRnjVWf43v4FXMCUA46WkH9dlzbbgYhH/TIY/mz3QKBgQDplyKPlx5pn3gTGQaV\nDMmg8YIbQlmN0Q9wFtubtPbTu30XRiZl/giYOD1TAn38o/feYDz9A7btVT8/Fowg\nNXSOxk7vLKhMvo+fKh43Q4oB7sqz6lOFCdcbPtIfqD0FX4HVnRBKXw0oMJZF6Psr\nSbiHlrXT8UasoVTxIole33fOdwKBgQDlbiKJTT2dI6Ie4WrTMQwEbkiBuk1mi+yd\nWtS3MXzSZ34kUzqAwHOqDQ5pe/Kn9y8P791COjLh0l8wHB73XjegxjwodGmAqW9S\n3DJF272KZi0XW5e84zZzSgEcNueSd+dRdfPcYPb1OB1uyw4JsVf3aW8KE0/atmf6\nB8VWd2vIdQKBgQDS99MZCI1JK+PQq8uMFm6MU1MEt5oWQXjF7X8OVBSRCkZiHNNV\nTmgIwtJwBFIxOQ4G47hxc0dldpaWrhCEjoLk6ComTZj7JyijwfBkTTV5pWehssMX\n5tlGHCi+ur3R+n5SpXYvFUXWxHsUTOV8JSrqGq3B66m/BD6pQl37N60G5QKBgFxQ\nvnDEtZ/+8ILAbP1hZNZ7kY0xa2dxsdl27NRxgyoeHnF7U7TuuxuXeU8UYoUXPsaI\n21yEkmiu/0IabpNWQ8fbO+WDQdhVVMfgdhIJ4vBHQKl/X0TPn98vzdaOeQtEV709\nWsw37+anl6A28AUSaLTSpa1GLAFzF89RRSQPlTzpAoGBAIIDEVooBV326kl5+0X2\nykQyI/fAgsiLM44+K7Dk/3SpEzYn3x2puE8alH3NLU4rfitKxYljOvqsJubF2A6U\n1uDtZtcxehVPs3N9cysqmLoafqP4AqKCf7NA7s3MGOxPb4ttU5zAhwdqy/sKlaFo\n6ZQ2nKt9D9mCqsdSl2YzPxc0\n-----END PRIVATE KEY-----';

function httpsPost(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const opts = { hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) } };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(data); } });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function main() {
  console.log('Step 1: Fetch SEO daily summary from Supabase...');
  const seoData = await httpsPost(
    'https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/rpc/get_seo_daily_summary',
    { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    {}
  );
  console.log('SEO data keys:', Object.keys(seoData));

  console.log('Step 2: Build GA4 JWT...');
  const now = Math.floor(Date.now() / 1000);
  const CLIENT_EMAIL = 'perfect1-indexing@paorlnik.iam.gserviceaccount.com';
  const TOKEN_URI = 'https://oauth2.googleapis.com/token';
  const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: CLIENT_EMAIL, scope: SCOPE, aud: TOKEN_URI, iat: now, exp: now + 3600 })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(header + '.' + payload);
  const sig = sign.sign(PRIVATE_KEY, 'base64url');
  const jwt = header + '.' + payload + '.' + sig;
  console.log('JWT length:', jwt.length);

  console.log('Step 3: Exchange JWT for GA4 access token...');
  const tokenBody = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(jwt);
  const tokenResp = await httpsPost(
    'https://oauth2.googleapis.com/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    tokenBody
  );
  if (!tokenResp.access_token) { console.error('Token error:', tokenResp); process.exit(1); }
  console.log('Got access token:', tokenResp.access_token.substring(0, 20) + '...');

  console.log('Step 4: Fetch GA4 page data...');
  const ga4Resp = await httpsPost(
    'https://analyticsdata.googleapis.com/v1beta/properties/518965387:runReport',
    { 'Authorization': 'Bearer ' + tokenResp.access_token, 'Content-Type': 'application/json' },
    { dateRanges: [{ startDate: 'today', endDate: 'today' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }], limit: 20, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], metricAggregations: ['TOTAL'] }
  );
  const rowCount = (ga4Resp.rows || []).length;
  console.log('GA4 rows:', rowCount, '| totals:', ga4Resp.totals ? 'yes' : 'no');

  console.log('Step 5: Build email HTML...');
  const today = new Date().toLocaleDateString('he-IL');
  const data = seoData;
  const shortUrl = u => (u || '').replace('https://www.perfect1.co.il', '').slice(0, 60);
  const sec = (title, content) => `<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">${title}</h2>${content}`;
  const row = (label, val) => `<tr><td style="padding:4px 8px;color:#6b7280;">${label}</td><td style="padding:4px 8px;font-weight:600;">${val}</td></tr>`;

  let body = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;">`;
  body += `<h1 style="background:#1a56db;color:white;padding:16px 20px;border-radius:8px;margin:0 0 8px;">SEO יומי — perfect1.co.il</h1>`;
  body += `<p style="color:#6b7280;margin:0 0 24px;">${today} (שוגר ידנית — תיקון אוטומציה)</p>`;

  const topQueries = data.top_queries || [];
  if (topQueries.length > 0) {
    let t = '<table style="width:100%;border-collapse:collapse;">';
    t += '<tr style="background:#f3f4f6;"><th style="padding:6px 8px;text-align:right;">ביטוי</th><th>מיקום</th><th>חשיפות</th><th>קליקים</th></tr>';
    topQueries.slice(0, 10).forEach((q, i) => {
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      t += `<tr style="background:${bg};"><td style="padding:5px 8px;">${q.query}</td><td style="text-align:center;">${(q.avg_position||0).toFixed(1)}</td><td style="text-align:center;">${q.impressions||0}</td><td style="text-align:center;">${q.clicks||0}</td></tr>`;
    });
    t += '</table>';
    body += sec('ביטויים מקודמים היום', t);
  }

  const newOpps = data.new_opportunities || [];
  if (newOpps.length > 0) {
    let t = '<ul style="padding-right:20px;">';
    newOpps.slice(0, 5).forEach(o => {
      t += `<li style="margin-bottom:6px;"><strong>${o.opportunity_type||''}</strong> — ${o.title||''}<br><small style="color:#6b7280;">${shortUrl(o.page_url)}</small></li>`;
    });
    t += '</ul>';
    body += sec(`הזדמנויות חדשות (${newOpps.length})`, t);
  }

  const newIdeas = data.new_content_ideas || [];
  if (newIdeas.length > 0) {
    let t = '<ol style="padding-right:20px;">';
    newIdeas.slice(0, 5).forEach(idea => {
      t += `<li style="margin-bottom:4px;">${idea.suggested_article_title || idea.target_query || ''}</li>`;
    });
    t += '</ol>';
    body += sec(`רעיונות לתוכן (${newIdeas.length})`, t);
  }

  const rows = ga4Resp.rows || [];
  if (rows.length > 0) {
    const totals = (ga4Resp.totals || [{}])[0];
    let t = '';
    if (totals && totals.metricValues) {
      t += `<p>משתמשים פעילים: <strong>${totals.metricValues[1].value}</strong></p>`;
    }
    t += '<table style="width:100%;border-collapse:collapse;"><tr style="background:#f3f4f6;"><th style="padding:6px 8px;text-align:right;">עמוד</th><th>צפיות</th><th>Bounce</th></tr>';
    rows.slice(0, 5).forEach((r, i) => {
      const path = r.dimensionValues[0].value;
      const views = r.metricValues[0].value;
      const bounce = Math.round(parseFloat(r.metricValues[2].value || 0) * 100);
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      const alert = bounce > 70 ? ` <span style="color:#ef4444;">(${bounce}%)</span>` : '';
      t += `<tr style="background:${bg};"><td style="padding:5px 8px;">${path}</td><td style="text-align:center;">${views}</td><td style="text-align:center;">${bounce}%${alert}</td></tr>`;
    });
    t += '</table>';
    body += sec('Google Analytics היום', t);
  }

  const stats = data.stats || {};
  let statsHtml = '<table>';
  statsHtml += row('עמודים במעקב', stats.total_pages || 0);
  statsHtml += row('ביטויים במעקב', stats.total_queries || 0);
  statsHtml += row('הזדמנויות פעילות', stats.active_opportunities || 0);
  statsHtml += row('רעיונות תוכן', stats.total_ideas || 0);
  statsHtml += '</table>';
  body += sec('סטטיסטיקה כללית', statsHtml);
  body += `<p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;">דוח זה מופק אוטומטית על ידי מערכת ה-SEO</p>`;
  body += '</div>';

  const subject = 'SEO יומי — perfect1.co.il — ' + today;
  console.log('Step 6: Send email via Supabase sendEmail function...');
  const emailResp = await httpsPost(
    'https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/sendEmail',
    { 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
    { to: 'yosi5919@gmail.com', subject, html: body, from: 'SEO Bot <no-reply@perfect1.co.il>' }
  );
  console.log('Email response:', JSON.stringify(emailResp));
  console.log('DONE');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
