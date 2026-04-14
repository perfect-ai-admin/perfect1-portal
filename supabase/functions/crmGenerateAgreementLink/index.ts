// crmGenerateAgreementLink — Generate FillFaster submission link for an existing agreement
// Strategy: Try n8n bridge first. If unavailable, generate direct FillFaster URL.
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

const BRIDGE_WEBHOOK_URL = Deno.env.get('N8N_FILLFASTER_WEBHOOK_URL');
const BRIDGE_TIMEOUT_MS = 15_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { agreement_id } = await req.json();
    if (!agreement_id) return errorResponse('agreement_id is required', 400, req);

    // Fetch agreement
    const { data: ag, error: agErr } = await supabaseAdmin
      .from('agreements')
      .select('id, lead_id, fillfaster_form_id, template_key, template_label, prefilled_data, user_data, status, submission_link')
      .eq('id', agreement_id)
      .single();

    if (agErr || !ag) return errorResponse('Agreement not found', 404, req);

    // Already has a link — return it
    if (ag.submission_link) {
      return jsonResponse({ success: true, agreement_id: ag.id, submission_link: ag.submission_link, status: ag.status }, 200, req);
    }

    console.log('[crmGenerateLink] Start | agreement:', ag.id, '| form:', ag.fillfaster_form_id);

    let submission_id = '';
    let submission_link = '';

    // --- Strategy 1: Try n8n bridge ---
    if (BRIDGE_WEBHOOK_URL) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), BRIDGE_TIMEOUT_MS);

        const bridgeRes = await fetch(BRIDGE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fid: ag.fillfaster_form_id,
            prefill_data: ag.prefilled_data || {},
            user_data: ag.user_data || {},
            template_key: ag.template_key,
            template_label: ag.template_label,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const bridgeText = await bridgeRes.text();
        console.log('[crmGenerateLink] Bridge response:', bridgeRes.status, bridgeText);

        if (bridgeText) {
          try {
            const result = JSON.parse(bridgeText);
            submission_id = String(result.submission_id || result.id || '');
            submission_link = String(result.submission_link || result.link || result.url || '');
          } catch {}
        }
      } catch (e) {
        console.warn('[crmGenerateLink] Bridge failed:', (e as Error).message);
      }
    }

    // --- Strategy 2: Build direct FillFaster URL ---
    if (!submission_link && ag.fillfaster_form_id) {
      // FillFaster submission URLs follow pattern: https://app.fillfaster.com/s/{form_id}
      // Prefill data can be passed as query params
      const baseUrl = `https://app.fillfaster.com/s/${ag.fillfaster_form_id}`;
      const params = new URLSearchParams();

      // Add prefill data as query params
      const prefill = ag.prefilled_data || {};
      for (const [key, value] of Object.entries(prefill)) {
        if (value) params.set(key, String(value));
      }

      // Add internal tracking
      if (ag.user_data) {
        params.set('_ud', btoa(JSON.stringify(ag.user_data)));
      }

      submission_link = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      submission_id = `direct-${ag.fillfaster_form_id}-${Date.now()}`;

      console.log('[crmGenerateLink] Using direct URL:', submission_link);
    }

    if (!submission_link) {
      return errorResponse('Could not generate signing link', 502, req);
    }

    // Save link to agreement
    const now = new Date().toISOString();
    await supabaseAdmin.from('agreements').update({
      fillfaster_submission_id: submission_id || null,
      submission_link,
      status: 'sent',
      sent_at: now,
      updated_at: now,
    }).eq('id', ag.id);

    if (ag.lead_id) {
      await supabaseAdmin.from('leads').update({
        agreement_status: 'sent',
        updated_at: now,
      }).eq('id', ag.lead_id);
    }

    // Log
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: ag.lead_id,
      new_status: 'agreement_link_ready',
      change_reason: 'link_generated',
      source: 'sales_portal',
      metadata: { agreement_id: ag.id, has_bridge: !!BRIDGE_WEBHOOK_URL, direct_url: !BRIDGE_WEBHOOK_URL || !submission_id.startsWith('direct') },
    });

    console.log('[crmGenerateLink] Done | link saved for agreement:', ag.id);

    return jsonResponse({
      success: true,
      agreement_id: ag.id,
      submission_id,
      submission_link,
      status: 'sent',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmGenerateLink:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
