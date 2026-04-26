// Script to patch the SEO Daily workflow — replace WhatsApp with Email
const WORKFLOW_ID = 'pP0LzSvFURy3BCBd';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNzI2ZWM0ZS01NGZkLTQyMTEtYjU1MS1jOTllOWViOWViM2QiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc0NDU3MDYwfQ.dw9xNQruw2woz5dS2J7txvVnlZr8FPFN-dOLxvdP5Zo';
const N8N_BASE = 'https://n8n.perfect-1.one';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRWLBeptRiQZKx
JHka3iLA0+urEeBXT5dasiBwL10RAv1D/sguJmPIs1PR5AsjaBIUcWT1WIQAsi8U
wIJkhBQLc8A0FuSeEtfE4/P84d6mnnKRtueGOuNPUXj8hf42h7AiXuuboUGT/Vha
Ka58Pa/D9q+kOR2K/UnHclw3jrao7I27ReL3T/NMFen4i2UAaO6lHlxRZ5Fl0G3H
flLTb2T7FKttQn9PTXOFbEed7Phh0mMZH2moDKQ1SZWrh/RcUDsjYLnCGUZrsRSj
vsB9hOpztgwrwiaLjk41w2iVnzp2CzDEhaJLVOeR6YqD6T8KC5EMMP1vsv3fHdQE
7fhXy1RjAgMBAAECggEARTDPZhE0m975WVPpNPCbQukn+Iv5flH/f8nkv79fvpoi
1ADW763fh/uBJht9dO/WHeyWhiKBymsZ9X1k+0zOBTT2HyE74WTv7JK81uVePeqb
ij6OCgbXjyUp3Ch7K1GwbMO7kl37OyreMzqYgVawC5AyYBBCi+gIJQPOp8wi4fRo
IOZk41u8X0/28WRsbnDYpDG4SI46uKrcxi9GOXDBFFJf7AMhdie14/B9muPwGncb
q77p1Fd73D8ngYXZ8PSLIgisw8bg/9A18Zt6Z6DXxUhzUaOzPxHliAZ/eLZSniSH
GKRnjVWf43v4FXMCUA46WkH9dlzbbgYhH/TIY/mz3QKBgQDplyKPlx5pn3gTGQaV
DMmg8YIbQlmN0Q9wFtubtPbTu30XRiZl/giYOD1TAn38o/feYDz9A7btVT8/Fowg
NXSOxk7vLKhMvo+fKh43Q4oB7sqz6lOFCdcbPtIfqD0FX4HVnRBKXw0oMJZF6Psr
SbiHlrXT8UasoVTxIole33fOdwKBgQDlbiKJTT2dI6Ie4WrTMQwEbkiBuk1mi+yd
WtS3MXzSZ34kUzqAwHOqDQ5pe/Kn9y8P791COjLh0l8wHB73XjegxjwodGmAqW9S
3DJF272KZi0XW5e84zZzSgEcNueSd+dRdfPcYPb1OB1uyw4JsVf3aW8KE0/atmf6
B8VWd2vIdQKBgQDS99MZCI1JK+PQq8uMFm6MU1MEt5oWQXjF7X8OVBSRCkZiHNNV
TmgIwtJwBFIxOQ4G47hxc0dldpaWrhCEjoLk6ComTZj7JyijwfBkTTV5pWehssMX
5tlGHCi+ur3R+n5SpXYvFUXWxHsUTOV8JSrqGq3B66m/BD6pQl37N60G5QKBgFxQ
vnDEtZ/+8ILAbP1hZNZ7kY0xa2dxsdl27NRxgyoeHnF7U7TuuxuXeU8UYoUXPsaI
21yEkmiu/0IabpNWQ8fbO+WDQdhVVMfgdhIJ4vBHQKl/X0TPn98vzdaOeQtEV709
Wsw37+anl6A28AUSaLTSpa1GLAFzF89RRSQPlTzpAoGBAIIDEVooBV326kl5+0X2
ykQyI/fAgsiLM44+K7Dk/3SpEzYn3x2puE8alH3NLU4rfitKxYljOvqsJubF2A6U
1uDtZtcxehVPs3N9cysqmLoafqP4AqKCf7NA7s3MGOxPb4ttU5zAhwdqy/sKlaFo
6ZQ2nKt9D9mCqsdSl2YzPxc0
-----END PRIVATE KEY-----`;

const buildEmailCode = `const data = $('Fetch Daily Summary').first().json;
const today = new Date().toLocaleDateString('he-IL');
const shortUrl = u => (u || '').replace('https://www.perfect1.co.il', '').slice(0, 60);

const sec = (title, content) => \`<h2 style="color:#1a56db;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-top:24px;">\${title}</h2>\${content}\`;
const row = (label, val) => \`<tr><td style="padding:4px 8px;color:#6b7280;">\${label}</td><td style="padding:4px 8px;font-weight:600;">\${val}</td></tr>\`;

let body = \`<div dir="rtl" style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:20px;">\`;
body += \`<h1 style="background:#1a56db;color:white;padding:16px 20px;border-radius:8px;margin:0 0 8px;">SEO יומי — perfect1.co.il</h1>\`;
body += \`<p style="color:#6b7280;margin:0 0 24px;">\${today}</p>\`;

const topQueries = data.top_queries || [];
if (topQueries.length > 0) {
  let t = '<table style="width:100%;border-collapse:collapse;">';
  t += '<tr style="background:#f3f4f6;"><th style="padding:6px 8px;text-align:right;">ביטוי</th><th>מיקום</th><th>חשיפות</th><th>קליקים</th></tr>';
  topQueries.slice(0, 10).forEach((q, i) => {
    const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
    t += \`<tr style="background:\${bg};"><td style="padding:5px 8px;">\${q.query}</td><td style="text-align:center;">\${(q.avg_position||0).toFixed(1)}</td><td style="text-align:center;">\${q.impressions||0}</td><td style="text-align:center;">\${q.clicks||0}</td></tr>\`;
  });
  t += '</table>';
  body += sec('ביטויים מקודמים היום', t);
}

const newOpps = data.new_opportunities || [];
if (newOpps.length > 0) {
  let t = '<ul style="padding-right:20px;">';
  newOpps.slice(0, 5).forEach(o => {
    t += \`<li style="margin-bottom:6px;"><strong>\${o.opportunity_type||''}</strong> — \${o.title||''}<br><small style="color:#6b7280;">\${shortUrl(o.page_url)}</small></li>\`;
  });
  t += '</ul>';
  body += sec(\`הזדמנויות חדשות (\${newOpps.length})\`, t);
}

const newIdeas = data.new_content_ideas || [];
if (newIdeas.length > 0) {
  let t = '<ol style="padding-right:20px;">';
  newIdeas.slice(0, 5).forEach(idea => {
    t += \`<li style="margin-bottom:4px;">\${idea.suggested_article_title || idea.target_query || ''}</li>\`;
  });
  t += '</ol>';
  body += sec(\`רעיונות לתוכן (\${newIdeas.length})\`, t);
}

try {
  const ga4Raw = $('GA4 - Fetch Page Data Daily').first().json;
  const rows = ga4Raw.rows || [];
  if (rows.length > 0) {
    const totals = (ga4Raw.totals || [{}])[0];
    let t = '';
    if (totals && totals.metricValues) {
      t += \`<p>משתמשים פעילים: <strong>\${totals.metricValues[1].value}</strong></p>\`;
    }
    t += '<table style="width:100%;border-collapse:collapse;"><tr style="background:#f3f4f6;"><th style="padding:6px 8px;text-align:right;">עמוד</th><th>צפיות</th><th>Bounce</th></tr>';
    rows.slice(0, 5).forEach((row, i) => {
      const path = row.dimensionValues[0].value;
      const views = row.metricValues[0].value;
      const bounce = Math.round(parseFloat(row.metricValues[2].value || 0) * 100);
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';
      const alert = bounce > 70 ? \` <span style="color:#ef4444;">(\${bounce}% ⚠️)</span>\` : '';
      t += \`<tr style="background:\${bg};"><td style="padding:5px 8px;">\${path}</td><td style="text-align:center;">\${views}</td><td style="text-align:center;">\${bounce}%\${alert}</td></tr>\`;
    });
    t += '</table>';
    body += sec('Google Analytics היום', t);
  }
} catch(e) {}

const stats = data.stats || {};
let statsHtml = '<table>';
statsHtml += row('עמודים במעקב', stats.total_pages || 0);
statsHtml += row('ביטויים במעקב', stats.total_queries || 0);
statsHtml += row('הזדמנויות פעילות', stats.active_opportunities || 0);
statsHtml += row('רעיונות תוכן', stats.total_ideas || 0);
statsHtml += '</table>';
body += sec('סטטיסטיקה כללית', statsHtml);

body += \`<p style="color:#9ca3af;font-size:12px;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;">דוח זה מופק אוטומטית על ידי מערכת ה-SEO</p>\`;
body += '</div>';

return [{ json: { email_html: body, subject: 'SEO יומי — perfect1.co.il — ' + today } }];`;

const sendEmailJsonBody = `={"to": "yosi5919@gmail.com", "subject": {{ JSON.stringify($json.subject) }}, "html": {{ JSON.stringify($json.email_html) }}, "from": "SEO Bot <no-reply@one-pai.com>"}`;

const payload = {
  name: "SEO - Daily Email Summary",
  nodes: [
    {
      id: "seo-daily-trigger",
      name: "Schedule - 10:45 Daily",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.2,
      position: [200, 300],
      parameters: {
        rule: { interval: [{ field: "cronExpression", expression: "0 45 10 * * *" }] }
      }
    },
    {
      id: "seo-daily-fetch",
      name: "Fetch Daily Summary",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [440, 300],
      parameters: {
        method: "POST",
        url: "https://rtlpqjqdmomyptcdkmrq.supabase.co/rest/v1/rpc/get_seo_daily_summary",
        authentication: "none",
        sendHeaders: true,
        specifyHeaders: "keypair",
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${SUPABASE_SERVICE_KEY}` },
            { name: "apikey", value: SUPABASE_SERVICE_KEY },
            { name: "Content-Type", value: "application/json" }
          ]
        },
        sendBody: true,
        contentType: "json",
        specifyBody: "json",
        jsonBody: "{}",
        options: {}
      }
    },
    {
      id: "ga4-daily-jwt",
      name: "GA4 - Create JWT Daily",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 300],
      parameters: {
        jsCode: `const crypto = require('crypto');
const serviceAccount = {
  client_email: "perfect1-indexing@paorlnik.iam.gserviceaccount.com",
  private_key: ${JSON.stringify(PRIVATE_KEY)},
  token_uri: "https://oauth2.googleapis.com/token"
};
const now = Math.floor(Date.now() / 1000);
const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
const payload = Buffer.from(JSON.stringify({
  iss: serviceAccount.client_email,
  scope: 'https://www.googleapis.com/auth/analytics.readonly',
  aud: serviceAccount.token_uri,
  iat: now,
  exp: now + 3600
})).toString('base64url');
const sign = crypto.createSign('RSA-SHA256');
sign.update(header + '.' + payload);
const signature = sign.sign(serviceAccount.private_key, 'base64url');
const jwt = header + '.' + payload + '.' + signature;
return [{ json: { jwt } }];`
      }
    },
    {
      id: "ga4-daily-token",
      name: "GA4 - Get Access Token Daily",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [900, 300],
      parameters: {
        method: "POST",
        url: "https://oauth2.googleapis.com/token",
        authentication: "none",
        sendHeaders: true,
        specifyHeaders: "keypair",
        headerParameters: { parameters: [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }] },
        sendBody: true,
        contentType: "form-urlencoded",
        specifyBody: "keypair",
        bodyParameters: {
          parameters: [
            { name: "grant_type", value: "urn:ietf:params:oauth:grant-type:jwt-bearer" },
            { name: "assertion", value: "={{ $json.jwt }}" }
          ]
        },
        options: {}
      }
    },
    {
      id: "ga4-daily-query",
      name: "GA4 - Fetch Page Data Daily",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1120, 300],
      parameters: {
        method: "POST",
        url: "https://analyticsdata.googleapis.com/v1beta/properties/518965387:runReport",
        authentication: "none",
        sendHeaders: true,
        specifyHeaders: "keypair",
        headerParameters: {
          parameters: [
            { name: "Authorization", value: "=Bearer {{ $json.access_token }}" },
            { name: "Content-Type", value: "application/json" }
          ]
        },
        sendBody: true,
        contentType: "json",
        specifyBody: "json",
        jsonBody: '{"dateRanges": [{"startDate": "today", "endDate": "today"}], "dimensions": [{"name": "pagePath"}], "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}, {"name": "bounceRate"}, {"name": "averageSessionDuration"}], "limit": 20, "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": true}], "metricAggregations": ["TOTAL"]}',
        options: {}
      }
    },
    {
      id: "seo-daily-build",
      name: "Build Daily Email",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [1340, 300],
      parameters: { jsCode: buildEmailCode }
    },
    {
      id: "seo-daily-send",
      name: "Send Email Report",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.2,
      position: [1560, 300],
      onError: "continueRegularOutput",
      parameters: {
        method: "POST",
        url: "https://rtlpqjqdmomyptcdkmrq.supabase.co/functions/v1/sendEmail",
        authentication: "none",
        sendHeaders: true,
        specifyHeaders: "keypair",
        headerParameters: {
          parameters: [
            { name: "Authorization", value: `Bearer ${SUPABASE_SERVICE_KEY}` },
            { name: "Content-Type", value: "application/json" }
          ]
        },
        sendBody: true,
        contentType: "json",
        specifyBody: "json",
        jsonBody: sendEmailJsonBody,
        options: {}
      }
    }
  ],
  connections: {
    "Schedule - 10:45 Daily": { main: [[{ node: "Fetch Daily Summary", type: "main", index: 0 }]] },
    "Fetch Daily Summary": { main: [[{ node: "GA4 - Create JWT Daily", type: "main", index: 0 }]] },
    "GA4 - Create JWT Daily": { main: [[{ node: "GA4 - Get Access Token Daily", type: "main", index: 0 }]] },
    "GA4 - Get Access Token Daily": { main: [[{ node: "GA4 - Fetch Page Data Daily", type: "main", index: 0 }]] },
    "GA4 - Fetch Page Data Daily": { main: [[{ node: "Build Daily Email", type: "main", index: 0 }]] },
    "Build Daily Email": { main: [[{ node: "Send Email Report", type: "main", index: 0 }]] }
  },
  settings: {
    executionOrder: "v1",
    timezone: "Asia/Jerusalem",
    callerPolicy: "workflowsFromSameOwner",
    availableInMCP: false
  }
};

async function patchWorkflow() {
  const res = await fetch(`${N8N_BASE}/api/v1/workflows/${WORKFLOW_ID}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text.slice(0, 500));

  if (res.ok) {
    console.log('\nSuccess! Workflow updated to send email.');
  } else {
    console.error('\nFailed to update workflow.');
  }
}

patchWorkflow();
