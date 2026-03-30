// CRM: Bulk actions on multiple leads (change stage, assign agent, delete)

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const body = await req.json();
    const { lead_ids, action } = body;
    // Support both 'value' (generic) and specific field names from client
    const value = body.value || body.new_stage || body.agent_id || body.temperature;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return errorResponse('lead_ids array is required', 400, req);
    }
    if (!action) {
      return errorResponse('action is required', 400, req);
    }

    let affected = 0;

    switch (action) {
      case 'change_stage': {
        if (!value) return errorResponse('value (new stage) is required', 400, req);

        const closedStages = ['converted', 'not_interested', 'disqualified', 'duplicate', 'spam'];
        const updates: Record<string, unknown> = {
          pipeline_stage: value,
          pipeline_entered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: closedStages.includes(value) ? (value === 'converted' ? 'converted' : 'closed') : 'active',
        };

        const { data, error } = await supabaseAdmin
          .from('leads')
          .update(updates)
          .in('id', lead_ids)
          .eq('source', 'sales_portal')
          .select('id');

        if (error) return errorResponse(error.message, 500, req);
        affected = data?.length || 0;
        break;
      }

      case 'assign_agent': {
        const { data, error } = await supabaseAdmin
          .from('leads')
          .update({ agent_id: value || null, updated_at: new Date().toISOString() })
          .in('id', lead_ids)
          .eq('source', 'sales_portal')
          .select('id');

        if (error) return errorResponse(error.message, 500, req);
        affected = data?.length || 0;
        break;
      }

      case 'change_temperature': {
        if (!value) return errorResponse('value (temperature) is required', 400, req);

        const { data, error } = await supabaseAdmin
          .from('leads')
          .update({ temperature: value, updated_at: new Date().toISOString() })
          .in('id', lead_ids)
          .eq('source', 'sales_portal')
          .select('id');

        if (error) return errorResponse(error.message, 500, req);
        affected = data?.length || 0;
        break;
      }

      case 'delete': {
        const { data, error } = await supabaseAdmin
          .from('leads')
          .update({
            pipeline_stage: 'disqualified',
            status: 'closed',
            updated_at: new Date().toISOString(),
            sla_deadline: null,
          })
          .in('id', lead_ids)
          .eq('source', 'sales_portal')
          .select('id');

        if (error) return errorResponse(error.message, 500, req);
        affected = data?.length || 0;
        break;
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400, req);
    }

    return jsonResponse({ success: true, action, affected }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
