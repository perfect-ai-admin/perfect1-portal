#!/usr/bin/env node
/**
 * FollowUp Bot — End-to-end pilot runner.
 *
 * Uses Supabase Management API (access token from .mcp.json) to:
 *   1. Discover project ref
 *   2. Apply 3 migrations via /database/query
 *   3. Configure app.* DB settings
 *   4. Deploy edge functions
 *   5. Run smoke tests (create lead, status change, inbound, dedup)
 *
 * No secrets in arguments. No CLI needed. No user interaction.
 *
 * Usage: node scripts/followup-pilot.cjs <command>
 *   commands: all | discover | migrate | deploy | health | smoke
 */

const fs = require('fs');
const path = require('path');

// ----------------------------------------------------------------------
// Load config from .mcp.json
// ----------------------------------------------------------------------
const mcpPath = path.join(__dirname, '..', '.mcp.json');
const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));

// Supabase Management API access token
const SBP_ACCESS_TOKEN = (() => {
  const args = mcp.mcpServers.supabase.args;
  const idx = args.indexOf('--access-token');
  return idx >= 0 ? args[idx + 1] : null;
})();
if (!SBP_ACCESS_TOKEN) die('Supabase access token not found in .mcp.json');

const N8N_API_URL = mcp.mcpServers['n8n-mcp']?.env?.N8N_API_URL || null;
const N8N_API_KEY = mcp.mcpServers['n8n-mcp']?.env?.N8N_API_KEY || null;

const MGMT = 'https://api.supabase.com/v1';

// ----------------------------------------------------------------------
// HTTP helpers
// ----------------------------------------------------------------------
async function mgmt(path, { method = 'GET', body } = {}) {
  const resp = await fetch(MGMT + path, {
    method,
    headers: {
      Authorization: `Bearer ${SBP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await resp.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    const err = new Error(`Mgmt API ${method} ${path} → ${resp.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function sqlQuery(projectRef, sql) {
  return mgmt(`/projects/${projectRef}/database/query`, {
    method: 'POST',
    body: { query: sql },
  });
}

// ----------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------
function die(msg) { console.error('\n❌', msg); process.exit(1); }
function ok(msg) { console.log('✅', msg); }
function info(msg) { console.log('ℹ️ ', msg); }
function warn(msg) { console.log('⚠️ ', msg); }
function banner(msg) { console.log('\n' + '='.repeat(64) + '\n' + msg + '\n' + '='.repeat(64)); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function trunc(v, n = 120) {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ----------------------------------------------------------------------
// 1. Discover project
// ----------------------------------------------------------------------
async function discover() {
  banner('STEP 1: Discover Supabase project');
  const projects = await mgmt('/projects');
  if (!Array.isArray(projects) || projects.length === 0) die('no projects visible with this access token');
  console.log('Visible projects:');
  for (const p of projects) {
    console.log(`  • ${p.name}  ref=${p.id}  status=${p.status}  region=${p.region}`);
  }

  // Try to find the right one — look for "perfect" in name, else first active
  const found =
    projects.find((p) => /perfect/i.test(p.name) && p.status === 'ACTIVE_HEALTHY') ||
    projects.find((p) => p.status === 'ACTIVE_HEALTHY') ||
    projects[0];
  ok(`Selected project: ${found.name} (ref=${found.id})`);
  return found;
}

// ----------------------------------------------------------------------
// 2. Apply migrations
// ----------------------------------------------------------------------
async function applyMigrations(projectRef) {
  banner('STEP 2: Apply migrations');
  const dir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = [
    '20260411110000_followup_bot.sql',
    '20260411120000_followup_bot_hardening.sql',
    '20260411130000_followup_bot_memory_and_statuses.sql',
    '20260411140000_followup_config_table.sql',
  ];
  for (const f of files) {
    const full = path.join(dir, f);
    if (!fs.existsSync(full)) die(`Missing migration file: ${f}`);
    const sql = fs.readFileSync(full, 'utf8');
    info(`Applying ${f} (${sql.length} bytes)`);
    try {
      await sqlQuery(projectRef, sql);
      ok(`Applied ${f}`);
    } catch (err) {
      console.error(`\n---- FAILED: ${f} ----`);
      console.error(err.message);
      throw err;
    }
  }
}

// ----------------------------------------------------------------------
// 3. Configure DB settings
// ----------------------------------------------------------------------
async function configureDbSettings(projectRef) {
  banner('STEP 3: Configure followup_config (table-based, no ALTER DATABASE)');
  const keys = await mgmt(`/projects/${projectRef}/api-keys?reveal=true`);
  const serviceRole = (keys || []).find((k) => k.name === 'service_role');
  if (!serviceRole || !serviceRole.api_key) die('could not fetch service_role key via Management API');

  const dispatchUrl = `https://${projectRef}.supabase.co/functions/v1/followupDispatch`;
  const esc = (s) => s.replace(/'/g, "''");
  const sql = `
    INSERT INTO followup_config (key, value)
    VALUES ('dispatch_url', '${esc(dispatchUrl)}')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

    INSERT INTO followup_config (key, value)
    VALUES ('service_role', '${esc(serviceRole.api_key)}')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  `;
  await sqlQuery(projectRef, sql);
  ok(`Set dispatch_url = ${dispatchUrl}`);
  ok(`Set service_role (${serviceRole.api_key.slice(0, 20)}...)`);

  const verify = await sqlQuery(projectRef, `
    SELECT followup_dispatch_url() AS url, followup_service_role() <> '' AS token_set;
  `);
  console.log('Verify:', JSON.stringify(verify));
  return { serviceRole: serviceRole.api_key, dispatchUrl };
}

// ----------------------------------------------------------------------
// 4. Deploy edge functions
// ----------------------------------------------------------------------
async function deployEdgeFunction(projectRef, slug, sourceDir, verifyJwt) {
  info(`Deploying edge function: ${slug}`);
  // Collect files
  const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.ts'));
  const fileBodies = {};
  for (const f of files) {
    fileBodies[f] = fs.readFileSync(path.join(sourceDir, f), 'utf8');
  }
  // Shared helpers — followupDispatch imports from ../_shared/
  const sharedDir = path.join(__dirname, '..', 'supabase', 'functions', '_shared');
  const sharedFiles = fs.readdirSync(sharedDir).filter((f) => f.endsWith('.ts'));

  // Build the multipart body — the Management API expects form-data with
  // `metadata` JSON + file parts.
  // ref: https://api.supabase.com/api/v1#tag/edge-functions
  const boundary = '----pilot' + Date.now();
  const parts = [];
  const meta = {
    name: slug,
    entrypoint_path: 'index.ts',
    verify_jwt: !!verifyJwt,
  };
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n`);
  // Main file(s)
  for (const [f, body] of Object.entries(fileBodies)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${f}"\r\nContent-Type: application/typescript\r\n\r\n${body}\r\n`,
    );
  }
  // Shared files — but the bundler on Supabase expects them under _shared/
  // Simpler: inline-bundle via a single file write. Actually the Management API
  // deploy endpoint accepts folder structure through separate file entries.
  // We'll pass them with a relative path header.
  for (const f of sharedFiles) {
    const body = fs.readFileSync(path.join(sharedDir, f), 'utf8');
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="../_shared/${f}"\r\nContent-Type: application/typescript\r\n\r\n${body}\r\n`,
    );
  }
  parts.push(`--${boundary}--\r\n`);
  const bodyBuf = Buffer.from(parts.join(''), 'utf8');

  const resp = await fetch(`${MGMT}/projects/${projectRef}/functions/deploy?slug=${slug}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SBP_ACCESS_TOKEN}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyBuf,
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`deploy ${slug} → ${resp.status}: ${text}`);
  }
  ok(`Deployed ${slug}`);
  return JSON.parse(text);
}

async function deployFunctions(projectRef) {
  banner('STEP 4: Deploy edge functions');
  const fnDir = path.join(__dirname, '..', 'supabase', 'functions');
  await deployEdgeFunction(projectRef, 'followupDispatch', path.join(fnDir, 'followupDispatch'), false);
  await deployEdgeFunction(projectRef, 'triggerManualFollowup', path.join(fnDir, 'triggerManualFollowup'), true);
}

// ----------------------------------------------------------------------
// 5. Health check
// ----------------------------------------------------------------------
async function healthCheck(projectRef) {
  banner('STEP 5: Health check');
  const activeRules = await sqlQuery(projectRef, `SELECT count(*)::int AS n FROM automation_rules WHERE is_active = true;`);
  console.log('Active rules:', JSON.stringify(activeRules));

  const cron = await sqlQuery(projectRef, `SELECT followup_cron_health();`);
  console.log('Cron health:', JSON.stringify(cron));
  return cron;
}

// ----------------------------------------------------------------------
// 6. Scenarios
// ----------------------------------------------------------------------
const TEST_PHONE = '+972502277087';

async function scenarios(projectRef, dispatchUrl, serviceRoleKey) {
  banner('STEP 6: Smoke test scenarios');

  // -------- Setup: disable all rules, clean up prior test leads --------
  info('Cleaning prior test leads');
  await sqlQuery(projectRef, `
    DELETE FROM status_history WHERE entity_type='lead' AND entity_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM automation_logs WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM tasks           WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM whatsapp_messages WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM leads WHERE name LIKE 'PILOT_TEST_%';
  `);

  info('Disabling all rules for dry run');
  await sqlQuery(projectRef, `UPDATE automation_rules SET is_active = false;`);

  // -------- SCENARIO A: Dry run (no message) --------
  banner('SCENARIO A: Dry run — status change with rules disabled');
  const leadA = await sqlQuery(projectRef, `
    INSERT INTO leads (name, phone, pipeline_stage, whatsapp_opt_in, do_not_contact, followup_paused)
    VALUES ('PILOT_TEST_A', '${TEST_PHONE}', 'attempted_contact', true, false, false)
    RETURNING id;
  `);
  const leadAId = leadA?.[0]?.id || leadA?.result?.[0]?.id || (Array.isArray(leadA) && leadA[0]?.id);
  info(`Created lead A: ${leadAId}`);

  await sqlQuery(projectRef, `UPDATE leads SET pipeline_stage = 'no_answer' WHERE id = '${leadAId}';`);
  await sleep(4000); // give pg_net + edge function time

  const logsA = await sqlQuery(projectRef, `
    SELECT rule_name, result, trigger_type
    FROM automation_logs
    WHERE lead_id = '${leadAId}'
    ORDER BY created_at DESC;
  `);
  const leadAState = await sqlQuery(projectRef, `
    SELECT pipeline_stage, previous_status, lead_summary
    FROM leads WHERE id = '${leadAId}';
  `);
  const historyA = await sqlQuery(projectRef, `
    SELECT old_status, new_status, created_at
    FROM status_history
    WHERE entity_type='lead' AND entity_id = '${leadAId}'
    ORDER BY created_at;
  `);
  console.log('Scenario A — logs:', JSON.stringify(logsA));
  console.log('Scenario A — lead state:', JSON.stringify(leadAState));
  console.log('Scenario A — status_history:', JSON.stringify(historyA));

  // Expected: logs empty (rules disabled), previous_status = 'attempted_contact', history has 2 rows
  const resultA = {
    logs_empty: Array.isArray(logsA) && logsA.length === 0,
    previous_status_correct: leadAState?.[0]?.previous_status === 'attempted_contact',
    status_history_rows: Array.isArray(historyA) ? historyA.length : 0,
  };
  console.log('Scenario A result:', resultA);

  // -------- SCENARIO B: single rule activation + real send --------
  banner('SCENARIO B: Activate no_answer_day0 + real WhatsApp');
  await sqlQuery(projectRef, `UPDATE automation_rules SET is_active = true WHERE name = 'no_answer_day0';`);

  const leadB = await sqlQuery(projectRef, `
    INSERT INTO leads (name, phone, pipeline_stage, whatsapp_opt_in, do_not_contact, followup_paused)
    VALUES ('PILOT_TEST_B', '${TEST_PHONE}', 'contacted', true, false, false)
    RETURNING id;
  `);
  const leadBId = leadB?.[0]?.id;
  info(`Created lead B: ${leadBId}`);

  await sqlQuery(projectRef, `UPDATE leads SET pipeline_stage = 'no_answer' WHERE id = '${leadBId}';`);
  info('Waiting 10s for pg_net + edge function + GreenAPI...');
  await sleep(10000);

  const logsB = await sqlQuery(projectRef, `
    SELECT rule_name, result, error, trigger_type, created_at
    FROM automation_logs WHERE lead_id = '${leadBId}' ORDER BY created_at DESC;
  `);
  const leadBState = await sqlQuery(projectRef, `
    SELECT pipeline_stage, previous_status, followup_sequence_name, followup_sequence_step,
           no_answer_attempts, last_outbound_message, last_outbound_at, lead_summary, next_action
    FROM leads WHERE id = '${leadBId}';
  `);
  const wamsgB = await sqlQuery(projectRef, `
    SELECT direction, message_text, delivery_status, greenapi_message_id, created_at
    FROM whatsapp_messages WHERE lead_id = '${leadBId}' ORDER BY created_at DESC;
  `);
  console.log('Scenario B — logs:', JSON.stringify(logsB));
  console.log('Scenario B — lead state:', JSON.stringify(leadBState));
  console.log('Scenario B — whatsapp_messages:', JSON.stringify(wamsgB));

  const resultB = {
    log_exists: Array.isArray(logsB) && logsB.length > 0,
    log_result: logsB?.[0]?.result,
    log_error: logsB?.[0]?.error,
    followup_sequence: leadBState?.[0]?.followup_sequence_name,
    no_answer_attempts: leadBState?.[0]?.no_answer_attempts,
    last_outbound_present: !!leadBState?.[0]?.last_outbound_message,
    wa_sent: wamsgB?.[0]?.delivery_status === 'sent',
    greenapi_id: wamsgB?.[0]?.greenapi_message_id,
  };
  console.log('Scenario B result:', resultB);

  // -------- SCENARIO C: Inbound stop --------
  banner('SCENARIO C: Inbound reply stops sequence');
  await sqlQuery(projectRef, `
    INSERT INTO whatsapp_messages (lead_id, phone, direction, sender_type, message_text, message_type)
    VALUES ('${leadBId}', '${TEST_PHONE}', 'inbound', 'user', 'כן מעוניין בבקשה תתקשרו אליי', 'text');
  `);
  info('Waiting 6s for inbound trigger → edge function...');
  await sleep(6000);

  const leadBStateAfter = await sqlQuery(projectRef, `
    SELECT followup_paused, needs_human, sub_status, last_inbound_message, last_inbound_at, lead_summary, next_action
    FROM leads WHERE id = '${leadBId}';
  `);
  const inboundLogs = await sqlQuery(projectRef, `
    SELECT rule_name, result, action_payload->>'classification' AS classification
    FROM automation_logs
    WHERE lead_id = '${leadBId}' AND trigger_type = 'inbound_message'
    ORDER BY created_at DESC;
  `);
  const tasksC = await sqlQuery(projectRef, `
    SELECT task_type, priority, status, title, description FROM tasks
    WHERE lead_id = '${leadBId}' AND is_automated = true ORDER BY created_at DESC;
  `);
  console.log('Scenario C — lead state after inbound:', JSON.stringify(leadBStateAfter));
  console.log('Scenario C — inbound logs:', JSON.stringify(inboundLogs));
  console.log('Scenario C — tasks:', JSON.stringify(tasksC));

  const resultC = {
    paused: leadBStateAfter?.[0]?.followup_paused === true,
    needs_human: leadBStateAfter?.[0]?.needs_human === true,
    sub_status: leadBStateAfter?.[0]?.sub_status,
    last_inbound_present: !!leadBStateAfter?.[0]?.last_inbound_message,
    inbound_log_exists: Array.isArray(inboundLogs) && inboundLogs.length > 0,
    task_created: Array.isArray(tasksC) && tasksC.length > 0,
  };
  console.log('Scenario C result:', resultC);

  // -------- SCENARIO D: Duplicate protection (direct HTTP with same payload) --------
  banner('SCENARIO D: Duplicate event protection');
  const dupPayload = {
    event_type: 'status_change',
    lead_id: leadBId,
    from_status: 'contacted',
    to_status: 'no_answer',
    changed_at: '2026-04-11T12:00:00Z',
  };
  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  // First call
  const r1 = await fetch(dispatchUrl, { method: 'POST', headers: h, body: JSON.stringify(dupPayload) });
  const b1 = await r1.text();
  console.log('Dedup call #1:', r1.status, trunc(b1, 300));

  // Second call — identical
  const r2 = await fetch(dispatchUrl, { method: 'POST', headers: h, body: JSON.stringify(dupPayload) });
  const b2 = await r2.text();
  console.log('Dedup call #2:', r2.status, trunc(b2, 300));

  let dedupSeen = false;
  try {
    const parsed2 = JSON.parse(b2);
    dedupSeen =
      Array.isArray(parsed2.results) &&
      parsed2.results.some((r) => r.result === 'dedup');
  } catch {}

  const resultD = {
    call1_status: r1.status,
    call2_status: r2.status,
    dedup_seen_in_second: dedupSeen,
  };
  console.log('Scenario D result:', resultD);

  return { A: resultA, B: resultB, C: resultC, D: resultD, leadAId, leadBId };
}

// ----------------------------------------------------------------------
// 7. Cleanup
// ----------------------------------------------------------------------
async function cleanup(projectRef) {
  banner('STEP 7: Cleanup test leads');
  await sqlQuery(projectRef, `
    DELETE FROM automation_logs WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM tasks           WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM whatsapp_messages WHERE lead_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM status_history WHERE entity_type='lead' AND entity_id IN (SELECT id FROM leads WHERE name LIKE 'PILOT_TEST_%');
    DELETE FROM leads WHERE name LIKE 'PILOT_TEST_%';
    UPDATE automation_rules SET is_active = false;
  `);
  ok('Cleanup done');
}

// ----------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------
(async () => {
  const cmd = process.argv[2] || 'all';
  try {
    const project = await discover();
    const projectRef = project.id;

    if (cmd === 'discover') return;
    if (cmd === 'all' || cmd === 'migrate') await applyMigrations(projectRef);

    let dbCfg = null;
    if (cmd === 'all' || cmd === 'migrate' || cmd === 'config') {
      dbCfg = await configureDbSettings(projectRef);
    }
    if (cmd === 'all' || cmd === 'deploy') await deployFunctions(projectRef);
    if (cmd === 'all' || cmd === 'health') await healthCheck(projectRef);

    if (cmd === 'all' || cmd === 'smoke') {
      if (!dbCfg) {
        const keys = await mgmt(`/projects/${projectRef}/api-keys`);
        const sr = (keys || []).find((k) => k.name === 'service_role');
        dbCfg = {
          serviceRole: sr.api_key,
          dispatchUrl: `https://${projectRef}.supabase.co/functions/v1/followupDispatch`,
        };
      }
      const results = await scenarios(projectRef, dbCfg.dispatchUrl, dbCfg.serviceRole);
      console.log('\n' + JSON.stringify({ pilot_results: results }, null, 2));
    }

    if (cmd === 'cleanup') await cleanup(projectRef);
    ok('Done');
  } catch (err) {
    console.error('\n❌ PILOT FAILED');
    console.error(err.message);
    if (err.data) console.error('data:', JSON.stringify(err.data, null, 2));
    process.exit(1);
  }
})();
