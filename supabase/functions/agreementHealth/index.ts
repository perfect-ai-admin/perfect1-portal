// agreementHealth — Health check for FillFaster agreement system
// Checks: FillFaster API, WhatsApp API, Storage bucket, recent webhook activity
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

const FILLFASTER_TOKEN = Deno.env.get('FILLFASTER_API_TOKEN');
const FILLFASTER_BASE = Deno.env.get('FILLFASTER_BASE_URL') || 'https://api.fillfaster.com';
const GREEN_API_TOKEN = Deno.env.get('GREENAPI_API_TOKEN');
const GREEN_API_INSTANCE = Deno.env.get('GREENAPI_INSTANCE_ID');

const CHECK_TIMEOUT_MS = 5_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const checks: Record<string, { ok: boolean; detail?: string }> = {};

    // 1. FillFaster API reachable
    checks.fillfaster_api = await checkEndpoint(
      `${FILLFASTER_BASE}/v1/submission`,
      { 'Authorization': `Bearer ${FILLFASTER_TOKEN || ''}` },
      !FILLFASTER_TOKEN ? 'Token not configured' : undefined,
    );

    // 2. WhatsApp (GreenAPI) reachable
    if (GREEN_API_INSTANCE && GREEN_API_TOKEN) {
      checks.whatsapp_api = await checkEndpoint(
        `https://api.green-api.com/waInstance${GREEN_API_INSTANCE}/getStateInstance/${GREEN_API_TOKEN}`,
      );
    } else {
      checks.whatsapp_api = { ok: false, detail: 'GreenAPI credentials not configured' };
    }

    // 3. Storage bucket exists
    try {
      const { data, error } = await supabaseAdmin.storage.getBucket('agreements');
      checks.storage_bucket = { ok: !error && !!data, detail: error?.message };
    } catch (e) {
      checks.storage_bucket = { ok: false, detail: (e as Error).message };
    }

    // 4. Webhook activity in last 24h
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabaseAdmin
        .from('agreement_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since);
      checks.webhook_activity = {
        ok: !error,
        detail: error ? error.message : `${count || 0} events in last 24h`,
      };
    } catch (e) {
      checks.webhook_activity = { ok: false, detail: (e as Error).message };
    }

    // 5. Feature flag status
    try {
      const { data: flag } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'agreements_enabled')
        .single();
      const flagOn = flag?.value === true || flag?.value === 'true';
      checks.feature_flag = { ok: true, detail: flagOn ? 'enabled' : 'disabled' };
    } catch (e) {
      checks.feature_flag = { ok: false, detail: (e as Error).message };
    }

    // Determine overall status
    const allOk = Object.values(checks).every(c => c.ok);
    const anyFailed = Object.values(checks).some(c => !c.ok);
    const status = allOk ? 'healthy' : anyFailed ? 'degraded' : 'degraded';

    return jsonResponse({ status, checks, timestamp: new Date().toISOString() }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] agreementHealth:', error);
    return jsonResponse({
      status: 'failed',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, 500, req);
  }
});

async function checkEndpoint(
  url: string,
  headers?: Record<string, string>,
  skipReason?: string,
): Promise<{ ok: boolean; detail?: string }> {
  if (skipReason) return { ok: false, detail: skipReason };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'HEAD',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    // Any response (even 4xx) means the API is reachable
    return { ok: true, detail: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}
