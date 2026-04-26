/**
 * setup-unified-daily-report.cjs
 *
 * 1. מנתק "Send Publish Notification Email" מ-F33 (לא נמחק, רק מנותק)
 * 2. מחליף את Daily Email Workflow בקריאה ל-dailyOperationsReport Edge Function
 * 3. מגדיר cron ל-11:45 ישראל (08:45 UTC)
 *
 * Run: N8N_API_KEY=xxx SUPABASE_SERVICE_KEY=xxx node scripts/setup-unified-daily-report.cjs
 */

const N8N_BASE = 'https://n8n.perfect-1.one';
const N8N_KEY = process.env.N8N_API_KEY || '';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg2NzQ2MywiZXhwIjoyMDkwNDQzNDYzfQ.nKtIxxVr2xQgAVMJkCaipzEIaO5LFT3ChU2mAIyxOzo';
const SUPA_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const F33_WF_ID = 'F33CbVflx4aApT71';
const DAILY_WF_ID = 'pP0LzSvFURy3BCBd';

if (!N8N_KEY) { console.error('Set N8N_API_KEY'); process.exit(1); }

async function n8n(method, path, body) {
  const res = await fetch(N8N_BASE + '/api/v1' + path, {
    method,
    headers: { 'X-N8N-API-KEY': N8N_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// ===== PART 1: Disconnect "Send Publish Notification Email" from F33 =====
async function patchF33() {
  console.log('\n=== Part 1: Disconnecting email node from F33 ===');
  const wf = await n8n('GET', `/workflows/${F33_WF_ID}`);
  if (!wf.nodes) { console.error('Failed to load F33:', JSON.stringify(wf).slice(0, 200)); return false; }

  let changed = false;
  for (const [nodeName, conns] of Object.entries(wf.connections || {})) {
    if (conns.main) {
      conns.main = conns.main.map(outputs =>
        (outputs || []).filter(c => c.node !== 'Send Publish Notification Email')
      );
    }
  }
  delete wf.connections['Send Publish Notification Email'];
  changed = true;
  console.log('Disconnected Send Publish Notification Email from F33 connections');

  const result = await n8n('PUT', `/workflows/${F33_WF_ID}`, {
    name: wf.name,
    nodes: wf.nodes,
    connections: wf.connections,
    settings: wf.settings || {},
    staticData: wf.staticData || null,
  });
  if (result.id) {
    console.log('F33 updated, versionId:', result.versionId);
    return true;
  } else {
    console.error('F33 update failed:', JSON.stringify(result).slice(0, 300));
    return false;
  }
}

// ===== PART 2: Replace Daily Email Workflow content =====
async function patchDailyEmail() {
  console.log('\n=== Part 2: Replacing Daily Email Workflow ===');

  // Build the new minimal workflow: Cron -> HTTP Request -> Done
  const newNodes = [
    {
      id: 'daily-ops-trigger',
      name: 'Schedule - 11:45 Daily',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [240, 300],
      parameters: {
        rule: {
          interval: [{ field: 'cronExpression', expression: '0 45 8 * * *' }]
        }
      }
    },
    {
      id: 'daily-ops-call',
      name: 'Call dailyOperationsReport',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [500, 300],
      parameters: {
        method: 'POST',
        url: `${SUPA_URL}/functions/v1/dailyOperationsReport`,
        authentication: 'none',
        sendHeaders: true,
        specifyHeaders: 'keypair',
        headerParameters: {
          parameters: [
            { name: 'Authorization', value: `Bearer ${SUPA_KEY}` },
            { name: 'Content-Type', value: 'application/json' }
          ]
        },
        sendBody: false,
        options: { response: { response: { responseFormat: 'json' } } }
      }
    },
    {
      id: 'daily-ops-log',
      name: 'Log Result',
      type: 'n8n-nodes-base.noOp',
      typeVersion: 1,
      position: [760, 300],
      parameters: {}
    }
  ];

  const newConnections = {
    'Schedule - 11:45 Daily': { main: [[{ node: 'Call dailyOperationsReport', type: 'main', index: 0 }]] },
    'Call dailyOperationsReport': { main: [[{ node: 'Log Result', type: 'main', index: 0 }]] }
  };

  // Try to update existing workflow; fall back to creating a new one
  const existing = await n8n('GET', `/workflows/${DAILY_WF_ID}`);
  if (existing.id) {
    const result = await n8n('PUT', `/workflows/${DAILY_WF_ID}`, {
      name: 'SEO - Daily Operations Report',
      nodes: newNodes,
      connections: newConnections,
      settings: { executionOrder: 'v1' },
      staticData: null,
    });
    if (result.id) {
      console.log('Daily workflow updated, versionId:', result.versionId);
      return result.id;
    } else {
      console.error('Update failed:', JSON.stringify(result).slice(0, 300));
    }
  }

  // Create new workflow
  console.log('Creating new workflow...');
  const created = await n8n('POST', '/workflows', {
    name: 'SEO - Daily Operations Report',
    nodes: newNodes,
    connections: newConnections,
    settings: { executionOrder: 'v1' },
  });
  if (created.id) {
    console.log('New workflow created, id:', created.id);
    // Activate it
    await n8n('POST', `/workflows/${created.id}/activate`);
    console.log('Activated');
    return created.id;
  } else {
    console.error('Creation failed:', JSON.stringify(created).slice(0, 300));
    return null;
  }
}

// ===== PART 3: Send today's report immediately =====
async function sendNow() {
  console.log('\n=== Part 3: Sending today\'s report now ===');
  const today = new Date();
  today.setHours(today.getHours() + 3); // Israel time
  const date = today.toISOString().split('T')[0];
  console.log('Triggering report for date:', date);

  const res = await fetch(`${SUPA_URL}/functions/v1/dailyOperationsReport?date=${date}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await res.json();
  if (data.success) {
    console.log('Email sent! message_id:', data.message_id);
    console.log('Article today:', data.todayArticle || 'none');
    console.log('Issues:', data.issues?.length > 0 ? data.issues.join(', ') : 'none');
  } else {
    console.error('Email send failed:', JSON.stringify(data));
  }
  return data;
}

async function main() {
  const f33Ok = await patchF33();
  const wfId = await patchDailyEmail();
  const emailResult = await sendNow();

  console.log('\n=== SUMMARY ===');
  console.log('F33 email node disconnected:', f33Ok ? 'YES' : 'FAILED');
  console.log('Daily workflow updated (id):', wfId || 'FAILED');
  console.log('Test email message_id:', emailResult?.message_id || 'FAILED');
  console.log('Cron schedule: 0 45 8 * * * (11:45 Israel = 08:45 UTC)');
  console.log('\nEmails CANCELLED: Send Publish Notification Email (F33)');
  console.log('Emails ACTIVE: dailyOperationsReport at 11:45 | outreach-reply (unchanged)');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
