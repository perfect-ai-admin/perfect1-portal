// CRM: Get full lead card (lead + communications + tasks + status_history)

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const { lead_id } = await req.json();
    if (!lead_id) return errorResponse('lead_id is required', 400, req);

    // Fetch lead
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .eq('source', 'sales_portal')
      .single();

    if (leadErr || !lead) return errorResponse('Lead not found', 404, req);

    // Fetch related data in parallel
    const [commsResult, tasksResult, historyResult, agentResult, lostReasonResult] = await Promise.all([
      supabaseAdmin
        .from('communications')
        .select('*')
        .eq('lead_id', lead_id)
        .eq('source', 'sales_portal')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('lead_id', lead_id)
        .eq('source', 'sales_portal')
        .order('due_date', { ascending: true }),
      supabaseAdmin
        .from('status_history')
        .select('*')
        .eq('entity_type', 'lead')
        .eq('entity_id', lead_id)
        .eq('source', 'sales_portal')
        .order('created_at', { ascending: false }),
      lead.agent_id
        ? supabaseAdmin.from('ai_agents').select('id, name, phone, email').eq('id', lead.agent_id).single()
        : Promise.resolve({ data: null }),
      // lost_reason_id may be a UUID (old) or slug string (new) — try both
      lead.lost_reason_id
        ? supabaseAdmin.from('lost_reasons').select('*').eq('id', lead.lost_reason_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return jsonResponse({
      lead,
      agent: agentResult.data || null,
      lost_reason: lostReasonResult.data || null,
      communications: commsResult.data || [],
      tasks: tasksResult.data || [],
      status_history: historyResult.data || [],
    }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
