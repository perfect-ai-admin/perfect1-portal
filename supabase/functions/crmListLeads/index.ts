// CRM: List leads with agent names and service info

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const { pipeline_stage, agent_id, temperature, service_type, search, limit: reqLimit } = body;

    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .eq('source', 'sales_portal')
      .order('created_at', { ascending: false });

    // Filters
    if (pipeline_stage && pipeline_stage !== 'all') {
      query = query.eq('pipeline_stage', pipeline_stage);
    }
    if (agent_id && agent_id !== 'all') {
      query = query.eq('agent_id', agent_id);
    }
    if (temperature && temperature !== 'all') {
      query = query.eq('temperature', temperature);
    }
    if (service_type && service_type !== 'all') {
      query = query.eq('service_type', service_type);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.limit(reqLimit || 500);

    const { data: leads, error } = await query;
    if (error) return errorResponse(error.message, 500, req);

    // Fetch agents for joining
    const { data: agents } = await supabaseAdmin
      .from('ai_agents')
      .select('id, name')
      .eq('source', 'sales_portal');

    const agentMap: Record<string, string> = {};
    (agents || []).forEach((a: { id: string; name: string }) => {
      agentMap[a.id] = a.name;
    });

    // Fetch last note (communication of type 'note') for each lead
    const leadIds = (leads || []).map((l: Record<string, unknown>) => l.id as string);
    let noteMap: Record<string, string> = {};
    if (leadIds.length > 0) {
      const { data: notes } = await supabaseAdmin
        .from('communications')
        .select('lead_id, content')
        .in('lead_id', leadIds)
        .eq('channel', 'note')
        .eq('source', 'sales_portal')
        .order('created_at', { ascending: false });

      // Keep only first (latest) note per lead
      (notes || []).forEach((n: { lead_id: string; content: string }) => {
        if (!noteMap[n.lead_id] && n.content) {
          noteMap[n.lead_id] = n.content;
        }
      });
    }

    // Enrich leads with agent name + last note
    const enriched = (leads || []).map((lead: Record<string, unknown>) => ({
      ...lead,
      agent_name: lead.agent_id ? agentMap[lead.agent_id as string] || null : null,
      last_note: noteMap[lead.id as string] || null,
    }));

    return jsonResponse(enriched, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
