// CRM: Update lead pipeline stage + write status_history

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const {
      lead_id, new_stage, change_reason,
      lost_reason_id, lost_reason_note, follow_up_date,
      temperature, agent_id, estimated_value
    } = await req.json();

    if (!lead_id || !new_stage) {
      return errorResponse('lead_id and new_stage are required', 400, req);
    }

    // Get current lead
    const { data: lead, error: getErr } = await supabaseAdmin
      .from('leads')
      .select('pipeline_stage, status, agent_id')
      .eq('id', lead_id)
      .eq('source', 'sales_portal')
      .single();

    if (getErr || !lead) return errorResponse('Lead not found', 404, req);

    const old_stage = lead.pipeline_stage;

    // Build update
    const updates: Record<string, unknown> = {
      pipeline_stage: new_stage,
      pipeline_entered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Handle closed stages
    const closedLostStages = ['not_interested', 'disqualified'];
    const closedStages = [...closedLostStages, 'converted', 'duplicate', 'spam'];

    if (closedStages.includes(new_stage)) {
      updates.status = new_stage === 'converted' ? 'converted' : 'closed';
    } else {
      updates.status = 'active';
    }

    if (closedLostStages.includes(new_stage) && lost_reason_id) {
      updates.lost_reason_id = lost_reason_id;
      updates.lost_reason_note = lost_reason_note || null;
    }

    if (new_stage === 'converted') {
      updates.converted_at = new Date().toISOString();
    }

    if (new_stage === 'spam') {
      updates.is_spam = true;
    }

    if (new_stage === 'duplicate') {
      // duplicate_of should be set separately
    }

    if (temperature) updates.temperature = temperature;
    if (agent_id) updates.agent_id = agent_id;
    if (estimated_value !== undefined) updates.estimated_value = estimated_value;

    // Calculate SLA deadline for open stages
    const SLA_HOURS: Record<string, number> = {
      new_lead: 1, contacted: 24, no_answer: 4, qualifying: 48,
      qualified: 24, proposal_sent: 72, follow_up: 48, awaiting_docs: 120,
    };

    if (SLA_HOURS[new_stage]) {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + SLA_HOURS[new_stage]);
      updates.sla_deadline = deadline.toISOString();
    } else {
      updates.sla_deadline = null;
    }

    // Update lead
    const { error: updateErr } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', lead_id)
      .eq('source', 'sales_portal');

    if (updateErr) return errorResponse(updateErr.message, 500, req);

    // Write status_history
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead_id,
      old_stage,
      new_stage,
      old_status: lead.pipeline_stage,
      new_status: new_stage,
      changed_by: admin.id,
      change_reason: change_reason || null,
      metadata: {
        lost_reason_id: lost_reason_id || null,
        lost_reason_note: lost_reason_note || null,
        follow_up_date: follow_up_date || null,
      },
      source: 'sales_portal',
    });

    // If follow_up_date provided (recoverable lost lead), create a follow-up task
    if (follow_up_date && closedLostStages.includes(new_stage)) {
      await supabaseAdmin.from('tasks').insert({
        title: 'מעקב ליד שנפל',
        description: `ליד סומן כ-"${new_stage}". סיבה: ${lost_reason_note || 'לא צוינה'}`,
        task_type: 'follow_up',
        lead_id,
        assigned_to: lead.agent_id || agent_id || null,
        created_by: admin.id,
        priority: 'medium',
        status: 'pending',
        due_date: follow_up_date,
        source: 'sales_portal',
      });
    }

    return jsonResponse({ success: true, new_stage }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
