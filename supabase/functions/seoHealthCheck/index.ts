// seoHealthCheck — debug/diagnostic API endpoint only.
// Returns JSON health report. Does NOT send emails.
// All alerting is now handled inside dailyOperationsReport (11:45 Israel time).
//
// Checks:
//   1. F33 published an article today
//   2. WF3 generated ideas in last 24h
//   3. WF1 GSC sync ran today
//   4. seo_content_ideas pending count >= 10
//   5. n8n last execution status per workflow
//
// GET /seoHealthCheck?notify=true — force-returns JSON, no email ever.

import { supabaseAdmin, jsonResponse } from '../_shared/supabaseAdmin.ts';

const N8N_API_KEY = Deno.env.get('N8N_API_KEY') || '';
const N8N_BASE = 'https://n8n.perfect-1.one';

const F33_WORKFLOW_ID = 'F33CbVflx4aApT71';
const WF3_WORKFLOW_ID = 'mcuHdVaje5WfjU1C';
const WF1_WORKFLOW_ID = 'dNUIrmd7OfKzU50B';

interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  detail: string;
  value?: unknown;
}

function israelTodayDate(): string {
  const now = new Date();
  now.setHours(now.getHours() + 3);
  return now.toISOString().split('T')[0];
}

function israelTodayStart(): string {
  const today = israelTodayDate();
  return `${today}T00:00:00+03:00`;
}

async function checkPublishedToday(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { data, error, count } = await supabaseAdmin
    .from('seo_published_articles')
    .select('id, slug, category, created_at', { count: 'exact' })
    .gte('created_at', startISO)
    .order('created_at', { ascending: false });
  if (error) return { name: 'F33 published today', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n === 0) return { name: 'F33 published today', status: 'warn', detail: 'No articles published today yet', value: 0 };
  return { name: 'F33 published today', status: 'ok', detail: `${n} article(s): ${(data || []).map((r) => `${r.category}/${r.slug}`).join(', ')}`, value: n };
}

async function checkIdeasPending(): Promise<CheckResult> {
  const { count, error } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');
  if (error) return { name: 'Ideas pending', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n < 10) return { name: 'Ideas pending', status: 'warn', detail: `Only ${n} ideas pending (need >= 10)`, value: n };
  return { name: 'Ideas pending', status: 'ok', detail: `${n} ideas in queue`, value: n };
}

async function checkIdeasGeneratedToday(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { count, error } = await supabaseAdmin
    .from('seo_content_ideas')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startISO);
  if (error) return { name: 'WF3 ideas today', status: 'fail', detail: `DB error: ${error.message}` };
  const n = count || 0;
  if (n === 0) return { name: 'WF3 ideas today', status: 'warn', detail: 'No new ideas generated today', value: 0 };
  return { name: 'WF3 ideas today', status: 'ok', detail: `${n} new idea(s) today`, value: n };
}

async function checkGSCSync(): Promise<CheckResult> {
  const startISO = israelTodayStart();
  const { data, error } = await supabaseAdmin
    .from('seo_runs')
    .select('id, status, started_at, finished_at')
    .eq('run_type', 'daily_sync')
    .gte('started_at', startISO)
    .order('started_at', { ascending: false })
    .limit(1);
  if (error) return { name: 'GSC sync today', status: 'fail', detail: `DB error: ${error.message}` };
  if (!data || data.length === 0) return { name: 'GSC sync today', status: 'warn', detail: 'No GSC sync run today yet' };
  const last = data[0];
  if (last.status === 'success') return { name: 'GSC sync today', status: 'ok', detail: `Last run #${last.id} success at ${last.finished_at}` };
  return { name: 'GSC sync today', status: 'fail', detail: `Last GSC run status='${last.status}'`, value: last };
}

async function checkN8NWorkflow(workflowId: string, label: string): Promise<CheckResult> {
  if (!N8N_API_KEY) return { name: `${label} executions`, status: 'warn', detail: 'N8N_API_KEY not set' };
  try {
    const res = await fetch(`${N8N_BASE}/api/v1/executions?workflowId=${workflowId}&limit=1`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    });
    if (!res.ok) return { name: `${label} executions`, status: 'fail', detail: `n8n API ${res.status}` };
    const body = await res.json();
    const last = body.data?.[0];
    if (!last) return { name: `${label} executions`, status: 'warn', detail: 'No executions found' };
    if (last.status === 'success') return { name: `${label} executions`, status: 'ok', detail: `Last #${last.id} success @ ${last.startedAt}` };
    return { name: `${label} executions`, status: 'fail', detail: `Last #${last.id} status='${last.status}' @ ${last.startedAt}` };
  } catch (e) {
    return { name: `${label} executions`, status: 'fail', detail: `fetch error: ${(e as Error).message}` };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

  const checks: CheckResult[] = [];
  checks.push(await checkPublishedToday());
  checks.push(await checkIdeasPending());
  checks.push(await checkIdeasGeneratedToday());
  checks.push(await checkGSCSync());
  checks.push(await checkN8NWorkflow(F33_WORKFLOW_ID, 'F33'));
  checks.push(await checkN8NWorkflow(WF3_WORKFLOW_ID, 'WF3'));
  checks.push(await checkN8NWorkflow(WF1_WORKFLOW_ID, 'WF1 GSC'));

  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');
  const overall = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'OK';

  // NOTE: No email is sent from this function.
  // All daily alerts are included in dailyOperationsReport (11:45 Israel time).
  return jsonResponse({
    ok: !hasFail,
    overall,
    timestamp: new Date().toISOString(),
    note: 'Email alerts removed — consolidated into dailyOperationsReport at 11:45',
    checks,
  }, hasFail ? 500 : 200);
});
