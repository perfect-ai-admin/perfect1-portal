const fs = require('fs');
const path = require('path');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';

const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDRWLBeptRiQZKx\nJHka3iLA0+urEeBXT5dasiBwL10RAv1D/sguJmPIs1PR5AsjaBIUcWT1WIQAsi8U\nwIJkhBQLc8A0FuSeEtfE4/P84d6mnnKRtueGOuNPUXj8hf42h7AiXuuboUGT/Vha\nKa58Pa/D9q+kOR2K/UnHclw3jrao7I27ReL3T/NMFen4i2UAaO6lHlxRZ5Fl0G3H\nflLTb2T7FKttQn9PTXOFbEed7Phh0mMZH2moDKQ1SZWrh/RcUDsjYLnCGUZrsRSj\nvsB9hOpztgwrwiaLjk41w2iVnzp2CzDEhaJLVOeR6YqD6T8KC5EMMP1vsv3fHdQE\n7fhXy1RjAgMBAAECggEARTDPZhE0m975WVPpNPCbQukn+Iv5flH/f8nkv79fvpoi\n1ADW763fh/uBJht9dO/WHeyWhiKBymsZ9X1k+0zOBTT2HyE74WTv7JK81uVePeqb\nij6OCgbXjyUp3Ch7K1GwbMO7kl37OyreMzqYgVawC5AyYBBCi+gIJQPOp8wi4fRo\nIOZk41u8X0/28WRsbnDYpDG4SI46uKrcxi9GOXDBFFJf7AMhdie14/B9muPwGncb\nq77p1Fd73D8ngYXZ8PSLIgisw8bg/9A18Zt6Z6DXxUhzUaOzPxHliAZ/eLZSniSH\nGKRnjVWf43v4FXMCUA46WkH9dlzbbgYhH/TIY/mz3QKBgQDplyKPlx5pn3gTGQaV\nDMmg8YIbQlmN0Q9wFtubtPbTu30XRiZl/giYOD1TAn38o/feYDz9A7btVT8/Fowg\nNXSOxk7vLKhMvo+fKh43Q4oB7sqz6lOFCdcbPtIfqD0FX4HVnRBKXw0oMJZF6Psr\nSbiHlrXT8UasoVTxIole33fOdwKBgQDlbiKJTT2dI6Ie4WrTMQwEbkiBuk1mi+yd\nWtS3MXzSZ34kUzqAwHOqDQ5pe/Kn9y8P791COjLh0l8wHB73XjegxjwodGmAqW9S\n3DJF272KZi0XW5e84zZzSgEcNueSd+dRdfPcYPb1OB1uyw4JsVf3aW8KE0/atmf6\nB8VWd2vIdQKBgQDS99MZCI1JK+PQq8uMFm6MU1MEt5oWQXjF7X8OVBSRCkZiHNNV\nTmgIwtJwBFIxOQ4G47hxc0dldpaWrhCEjoLk6ComTZj7JyijwfBkTTV5pWehssMX\n5tlGHCi+ur3R+n5SpXYvFUXWxHsUTOV8JSrqGq3B66m/BD6pQl37N60G5QKBgFxQ\nvnDEtZ/+8ILAbP1hZNZ7kY0xa2dxsdl27NRxgyoeHnF7U7TuuxuXeU8UYoUXPsaI\n21yEkmiu/0IabpNWQ8fbO+WDQdhVVMfgdhIJ4vBHQKl/X0TPn98vzdaOeQtEV709\nWsw37+anl6A28AUSaLTSpa1GLAFzF89RRSQPlTzpAoGBAIIDEVooBV326kl5+0X2\nykQyI/fAgsiLM44+K7Dk/3SpEzYn3x2puE8alH3NLU4rfitKxYljOvqsJubF2A6U\n1uDtZtcxehVPs3N9cysqmLoafqP4AqKCf7NA7s3MGOxPb4ttU5zAhwdqy/sKlaFo\n6ZQ2nKt9D9mCqsdSl2YzPxc0\n-----END PRIVATE KEY-----';

// New JWT code using Web Crypto API (no require('crypto'))
const jwtLines = [
  "// Web Crypto API — no require('crypto') needed",
  "const CLIENT_EMAIL = 'perfect1-indexing@paorlnik.iam.gserviceaccount.com';",
  "const TOKEN_URI = 'https://oauth2.googleapis.com/token';",
  "const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';",
  "const PRIVATE_KEY_PEM = " + JSON.stringify(PRIVATE_KEY) + ";",
  "",
  "function b64url(str) {",
  "  return btoa(str).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');",
  "}",
  "function b64urlFromUint8(buf) {",
  "  let s = '';",
  "  const bytes = new Uint8Array(buf);",
  "  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);",
  "  return btoa(s).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');",
  "}",
  "",
  "const now = Math.floor(Date.now() / 1000);",
  "const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));",
  "const payload = b64url(JSON.stringify({ iss: CLIENT_EMAIL, scope: SCOPE, aud: TOKEN_URI, iat: now, exp: now + 3600 }));",
  "const sigInput = header + '.' + payload;",
  "",
  "const pemBody = PRIVATE_KEY_PEM.replace(/-----[^-]+-----/g, '').replace(/\\s+/g, '');",
  "const der = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));",
  "",
  "const cryptoKey = await crypto.subtle.importKey(",
  "  'pkcs8', der.buffer,",
  "  { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },",
  "  false, ['sign']",
  ");",
  "",
  "const enc = new TextEncoder();",
  "const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(sigInput));",
  "const signature = b64urlFromUint8(sigBuf);",
  "const jwt = sigInput + '.' + signature;",
  "",
  "return [{ json: { jwt } }];"
];
const jwtCode = jwtLines.join('\n');

// Read original workflow to preserve Build Daily Email code exactly
const scriptsDir = path.dirname(__filename);
const originalWf = JSON.parse(fs.readFileSync(path.join(scriptsDir, 'original_wf_temp.json'), 'utf8'));
const buildNode = originalWf.nodes.find(n => n.id === 'seo-daily-build');
const buildCode = buildNode.parameters.jsCode;

const workflow = {
  name: "SEO - Daily Email Summary",
  nodes: [
    {
      id: "seo-daily-trigger",
      name: "Schedule - 10:45 Daily",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.2,
      position: [200, 300],
      parameters: { rule: { interval: [{ field: "cronExpression", expression: "0 45 10 * * *" }] } }
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
        headerParameters: { parameters: [
          { name: "Authorization", value: "Bearer " + SUPABASE_KEY },
          { name: "apikey", value: SUPABASE_KEY },
          { name: "Content-Type", value: "application/json" }
        ]},
        sendBody: true, contentType: "json", specifyBody: "json", jsonBody: "{}", options: {}
      }
    },
    {
      id: "ga4-daily-jwt",
      name: "GA4 - Create JWT Daily",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [680, 300],
      parameters: { jsCode: jwtCode }
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
        sendHeaders: true, specifyHeaders: "keypair",
        headerParameters: { parameters: [{ name: "Content-Type", value: "application/x-www-form-urlencoded" }]},
        sendBody: true, contentType: "form-urlencoded", specifyBody: "keypair",
        bodyParameters: { parameters: [
          { name: "grant_type", value: "urn:ietf:params:oauth:grant-type:jwt-bearer" },
          { name: "assertion", value: "={{ $json.jwt }}" }
        ]},
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
        sendHeaders: true, specifyHeaders: "keypair",
        headerParameters: { parameters: [
          { name: "Authorization", value: "=Bearer {{ $json.access_token }}" },
          { name: "Content-Type", value: "application/json" }
        ]},
        sendBody: true, contentType: "json", specifyBody: "json",
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
      parameters: { jsCode: buildCode }
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
        sendHeaders: true, specifyHeaders: "keypair",
        headerParameters: { parameters: [
          { name: "Authorization", value: "Bearer " + SUPABASE_KEY },
          { name: "Content-Type", value: "application/json" }
        ]},
        sendBody: true, contentType: "json", specifyBody: "json",
        jsonBody: '={"to": "yosi5919@gmail.com", "subject": {{ JSON.stringify($json.subject) }}, "html": {{ JSON.stringify($json.email_html) }}, "from": "SEO Bot <no-reply@one-pai.com>"}',
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
  settings: { executionOrder: "v1", timezone: "Asia/Jerusalem", callerPolicy: "workflowsFromSameOwner", availableInMCP: false },
  staticData: { "node:Schedule - 10:45 Daily": { recurrenceRules: [] } }
};

fs.writeFileSync(path.join(scriptsDir, 'jwt_fix_payload.json'), JSON.stringify(workflow));
console.log('jwt_fix_payload.json written OK, size:', fs.statSync(path.join(scriptsDir, 'jwt_fix_payload.json')).size);
