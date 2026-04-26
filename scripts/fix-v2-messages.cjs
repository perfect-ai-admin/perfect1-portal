/**
 * Fix V2 workflow — replace empty messages with real content.
 * Workflow ID: Yo18hwPWHGndxsZ3
 */
const https = require('https');
const fs = require('fs');

const N8N_KEY = 'ROTATED_KEY_PLACEHOLDER';
const WORKFLOW_ID = 'Yo18hwPWHGndxsZ3';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'n8n.perfect-1.one',
      path: '/api/v1' + path,
      method,
      headers: {
        'X-N8N-API-KEY': N8N_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// =============================================
// FIXED MESSAGES
// =============================================

const MESSAGES = {
  // S1: Send Action Buttons (after service details)
  'code-s1-buttons': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "יש לך שאלה לפני שמתחילים?\n\n1\uFE0F\u20E3 אני רוצה להתחיל - קח אותי לתשלום\n2\uFE0F\u20E3 יש לי שאלה"
  },

  // S1: Send Payment Link
  'http-s1-payment': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "מעולה! הנה קישור לתשלום \uD83D\uDC47\n\nhttps://perfect1.co.il/open-osek-patur-online\n\nאחרי התשלום נתחיל לטפל מיד! \uD83D\uDE80"
  },

  // S1: Ask Follow-up Question
  'http-s1-question': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "בטח! שאל את השאלה שלך ואחזור אליך עם תשובה \uD83D\uDE0A"
  },

  // S2: Send Initial Message
  'http-s2-init': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "תודה! \uD83D\uDE4F\n\nרואה חשבון מטעמנו יתקשר אליך בזמן הקרוב כדי להמשיך את הטיפול.\n\nבינתיים, אם יש לך שאלות — פשוט כתוב כאן ואשמח לעזור \uD83D\uDE0A"
  },

  // S2: Notify Admin (972559720244)
  'http-s2-admin': {
    chatId: "972559720244@c.us",
    message: "=\uD83D\uDCCB ליד חדש מבקש שיחה עם יועץ!\n\nשם: {{ $('Merge State').item.json.lead_name || 'לא צוין' }}\nטלפון: {{ $('Merge State').item.json.phone || $('Merge State').item.json.chat_id }}\n\nיש לחזור אליו בהקדם."
  },

  // S3: Send Question Mode
  'http-s3-mode': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "מצוין! \uD83D\uDCAC\n\nאני כאן לענות על כל שאלה בנושא פתיחת עסק, מיסוי, עוסק פטור, עוסק מורשה ועוד.\n\nשאל את השאלה שלך ואחזור עם תשובה:"
  },

  // S3: Send Answer (from AI)
  'http-s3-answer': {
    chatId: "={{ $('S3: Process AI Response').item.json.chat_id || $('Merge State').item.json.chat_id }}",
    message: "={{ $json.answer_text || $json.choices[0].message.content || $json.response || $json.answer || 'מצטער, לא הצלחתי לעבד את השאלה. נסה שוב או בחר אופציה אחרת.' }}"
  },

  // S3: Send Next Steps (after AI answer)
  'code-s3-next': {
    chatId: "={{ $('S3: Process AI Response').item.json.chat_id || $('Merge State').item.json.chat_id }}",
    message: "רוצה לשאול עוד שאלה?\n\n1\uFE0F\u20E3 כן, יש לי עוד שאלה\n2\uFE0F\u20E3 אני רוצה לפתוח עוסק פטור\n3\uFE0F\u20E3 אני רוצה לדבר עם יועץ"
  },

  // Send: לא הבנתי (fallback)
  'http-not-understood': {
    chatId: "={{ $('Merge State').item.json.chat_id }}",
    message: "לא הצלחתי להבין את הבחירה \uD83E\uDD14\n\nבחר אחת מהאופציות:\n1\uFE0F\u20E3 פתיחת עוסק פטור\n2\uFE0F\u20E3 שיחה עם יועץ\n3\uFE0F\u20E3 שאלה בוואטסאפ"
  }
};

async function main() {
  console.log('Fetching workflow...');
  const wf = await api('GET', `/workflows/${WORKFLOW_ID}`);

  if (!wf.nodes) {
    console.error('Failed to fetch workflow:', JSON.stringify(wf));
    process.exit(1);
  }

  console.log(`Got workflow with ${wf.nodes.length} nodes`);

  // Apply message fixes
  let fixCount = 0;
  for (const node of wf.nodes) {
    const fix = MESSAGES[node.id];
    if (!fix) continue;

    console.log(`  Fixing node: ${node.id} (${node.name})`);
    node.parameters.message = fix.message;
    node.parameters.chatId = fix.chatId;
    node.parameters.typingTime = 1;
    fixCount++;
  }

  console.log(`\nFixed ${fixCount} nodes. Saving...`);

  // Build update payload (only fields n8n accepts)
  const payload = {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings,
    staticData: wf.staticData || null
  };

  const result = await api('PUT', `/workflows/${WORKFLOW_ID}`, payload);

  if (result.id) {
    console.log('Workflow saved successfully! ID:', result.id);
    console.log('Version:', result.versionCounter);
  } else {
    console.error('Save failed:', JSON.stringify(result).slice(0, 500));
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
