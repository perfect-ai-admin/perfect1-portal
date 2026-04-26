// triggerManualFollowup — Fire a followup rule on-demand from the CRM UI.
// Authenticated: requires logged-in agent. Calls followupDispatch directly
// (server-to-server, via service-role). followupDispatch handles all guards.

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DISPATCH_URL = `${SUPABASE_URL}/functions/v1/followupDispatch`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    const { lead_id, rule_name } = await req.json();
    if (!lead_id || !rule_name) {
      return errorResponse('lead_id and rule_name are required', 400, req);
    }

    // Validate rule exists and is active
    const { data: rule, error: ruleErr } = await supabaseAdmin
      .from('automation_rules')
      .select('id, name, is_active')
      .eq('name', rule_name)
      .single();

    if (ruleErr || !rule) return errorResponse(`Rule not found: ${rule_name}`, 404, req);
    if (!rule.is_active) return errorResponse(`Rule is inactive: ${rule_name}`, 400, req);

    // Validate lead exists
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Call followupDispatch directly with service role
    const resp = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        event_type: 'manual',
        lead_id,
        rule_name,
        rule_id: rule.id,
        triggered_by: user.id,
        triggered_at: new Date().toISOString(),
      }),
    });

    const dispatchBody = await resp.text();
    if (!resp.ok) {
      return errorResponse(`Dispatch failed (${resp.status}): ${dispatchBody}`, 502, req);
    }

    return jsonResponse({
      success: true,
      dispatch: JSON.parse(dispatchBody),
    }, 200, req);

  } catch (error) {
    console.error('triggerManualFollowup error:', error);
    return errorResponse((error as Error).message || 'Internal error', 500, req);
  }
});
