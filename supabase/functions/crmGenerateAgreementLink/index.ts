// crmGenerateAgreementLink — Generate FillFaster submission link for an existing agreement
// Step 2: takes agreement_id, calls n8n bridge, saves submission_link
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

const BRIDGE_WEBHOOK_URL = Deno.env.get('N8N_FILLFASTER_WEBHOOK_URL');
const BRIDGE_TIMEOUT_MS = 30_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { agreement_id } = await req.json();
    if (!agreement_id) return errorResponse('agreement_id is required', 400, req);

    if (!BRIDGE_WEBHOOK_URL) {
      return errorResponse('FillFaster bridge webhook not configured (N8N_FILLFASTER_WEBHOOK_URL)', 500, req);
    }

    // Fetch agreement
    const { data: ag, error: agErr } = await supabaseAdmin
      .from('agreements')
      .select('id, lead_id, fillfaster_form_id, template_key, template_label, prefilled_data, user_data, status, submission_link')
      .eq('id', agreement_id)
      .single();

    if (agErr || !ag) return errorResponse('Agreement not found', 404, req);
    if (ag.submission_link) {
      // Already has a link — return it
      return jsonResponse({ success: true, agreement_id: ag.id, submission_link: ag.submission_link, status: ag.status }, 200, req);
    }

    console.log('[crmGenerateLink] Start | agreement:', ag.id, '| form:', ag.fillfaster_form_id);

    // Call n8n bridge
    const bridgePayload = {
      fid: ag.fillfaster_form_id,
      prefill_data: ag.prefilled_data || {},
      user_data: ag.user_data || {},
      template_key: ag.template_key,
      template_label: ag.template_label,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BRIDGE_TIMEOUT_MS);

    let bridgeResponse: Response;
    try {
      bridgeResponse = await fetch(BRIDGE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bridgePayload),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeout);
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[AGREEMENT_ERROR] Bridge unreachable:', msg);
      await supabaseAdmin.from('agreements').update({
        last_error: `Bridge unreachable: ${msg}`,
        last_error_at: new Date().toISOString(),
      }).eq('id', ag.id);
      return errorResponse(`Bridge unreachable: ${msg}`, 502, req);
    }
    clearTimeout(timeout);

    const bridgeText = await bridgeResponse.text();
    console.log('[crmGenerateLink] Bridge response:', bridgeResponse.status, bridgeText);

    let result: Record<string, unknown> = {};
    try { result = JSON.parse(bridgeText); } catch {}

    const submission_id = String(result.submission_id || result.id || '');
    const submission_link = String(result.submission_link || result.link || result.url || '');

    if (!submission_link) {
      const errMsg = String(result.error || `Bridge returned no link (HTTP ${bridgeResponse.status})`);
      console.error('[AGREEMENT_ERROR] No link from bridge:', errMsg);
      await supabaseAdmin.from('agreements').update({
        status: 'failed',
        last_error: errMsg,
        last_error_at: new Date().toISOString(),
      }).eq('id', ag.id);
      return errorResponse(errMsg, 502, req);
    }

    // Save link
    const now = new Date().toISOString();
    await supabaseAdmin.from('agreements').update({
      fillfaster_submission_id: submission_id || null,
      submission_link,
      status: 'link_ready',
      last_error: null,
      last_error_at: null,
      updated_at: now,
    }).eq('id', ag.id);

    if (ag.lead_id) {
      await supabaseAdmin.from('leads').update({
        agreement_status: 'link_ready',
        updated_at: now,
      }).eq('id', ag.lead_id);
    }

    console.log('[crmGenerateLink] Done | link saved for agreement:', ag.id);

    return jsonResponse({
      success: true,
      agreement_id: ag.id,
      submission_id: submission_id || null,
      submission_link,
      status: 'link_ready',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmGenerateLink:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
