// CRM: Delete a lead (soft delete — marks as spam/disqualified, or hard delete)

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const { lead_id, hard_delete } = await req.json();

    if (!lead_id) {
      return errorResponse('lead_id is required', 400, req);
    }

    // Verify lead exists
    const { data: lead, error: getErr } = await supabaseAdmin
      .from('leads')
      .select('id, name, pipeline_stage')
      .eq('id', lead_id)
      .eq('source', 'sales_portal')
      .single();

    if (getErr || !lead) return errorResponse('Lead not found', 404, req);

    if (hard_delete) {
      // Delete related data first
      await Promise.all([
        supabaseAdmin.from('communications').delete().eq('lead_id', lead_id).eq('source', 'sales_portal'),
        supabaseAdmin.from('tasks').delete().eq('lead_id', lead_id).eq('source', 'sales_portal'),
        supabaseAdmin.from('status_history').delete().eq('entity_id', lead_id).eq('entity_type', 'lead').eq('source', 'sales_portal'),
        supabaseAdmin.from('documents').delete().eq('lead_id', lead_id).eq('source', 'sales_portal'),
      ]);

      // Delete the lead
      const { error: delErr } = await supabaseAdmin
        .from('leads')
        .delete()
        .eq('id', lead_id)
        .eq('source', 'sales_portal');

      if (delErr) return errorResponse(delErr.message, 500, req);
    } else {
      // Soft delete — mark as disqualified
      const { error: updateErr } = await supabaseAdmin
        .from('leads')
        .update({
          pipeline_stage: 'disqualified',
          status: 'closed',
          updated_at: new Date().toISOString(),
          sla_deadline: null,
        })
        .eq('id', lead_id)
        .eq('source', 'sales_portal');

      if (updateErr) return errorResponse(updateErr.message, 500, req);

      // Log
      await supabaseAdmin.from('status_history').insert({
        entity_type: 'lead',
        entity_id: lead_id,
        old_stage: lead.pipeline_stage,
        new_stage: 'disqualified',
        changed_by: admin.id,
        change_reason: 'נמחק מה-CRM',
        source: 'sales_portal',
      });
    }

    return jsonResponse({ success: true, deleted: lead_id }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
