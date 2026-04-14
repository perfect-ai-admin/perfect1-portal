// crmCreateAgreement — Save agreement record internally (no external API calls)
// This is step 1 of the agreement flow: save → generate link → send
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, template_key, fillfaster_form_id, template_label, extra_fields } = await req.json();

    if (!lead_id || !template_key || !fillfaster_form_id) {
      return errorResponse('lead_id, template_key, and fillfaster_form_id are required', 400, req);
    }

    // Fetch lead to validate it exists
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id, name')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Build prefill_data from frontend fields
    const prefill_data: Record<string, string> = {};
    if (extra_fields && typeof extra_fields === 'object') {
      for (const [k, v] of Object.entries(extra_fields)) {
        if (v !== undefined && v !== null && v !== '') prefill_data[k] = String(v);
      }
    }

    const user_data = { lead_id, agent_id: user.id, template_key, crm_user_id: user.id };

    // Save agreement — purely internal, no external API
    const insertData: Record<string, unknown> = {
      lead_id,
      template_key,
      template_label: template_label || template_key,
      fillfaster_form_id,
      status: 'draft',
      prefilled_data: prefill_data,
      user_data,
      agent_id: user.id,
    };

    const { data: agreement, error: agErr } = await supabaseAdmin
      .from('agreements')
      .insert(insertData)
      .select('id, status')
      .single();

    if (agErr || !agreement) {
      console.error('[crmCreateAgreement] DB insert failed:', agErr);
      return errorResponse('Failed to save agreement', 500, req);
    }

    // Update lead
    await supabaseAdmin.from('leads').update({
      agreement_status: 'draft',
      agreement_id: agreement.id,
      updated_at: new Date().toISOString(),
    }).eq('id', lead_id);

    // Log
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      new_status: 'agreement_draft',
      change_reason: 'agreement_created',
      source: 'sales_portal',
      metadata: { agreement_id: agreement.id, template_key, created_by: user.id },
    });

    console.log('[crmCreateAgreement] Saved | agreement:', agreement.id);

    return jsonResponse({
      success: true,
      agreement_id: agreement.id,
      status: 'draft',
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] crmCreateAgreement:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
