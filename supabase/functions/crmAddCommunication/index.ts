// CRM: Add communication record + update lead contact info

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const {
      lead_id, client_id, channel, direction, subject, content, summary,
      duration_seconds, outcome, follow_up_needed, follow_up_date, next_step
    } = await req.json();

    // For notes, direction defaults to 'internal'
    const actualDirection = direction || (channel === 'note' ? 'internal' : null);
    const actualContent = content || summary || null;

    if (!channel || !actualDirection) {
      return errorResponse('channel and direction are required', 400, req);
    }
    if (!lead_id && !client_id) {
      return errorResponse('lead_id or client_id is required', 400, req);
    }

    // Insert communication
    const { data: comm, error: insertErr } = await supabaseAdmin
      .from('communications')
      .insert({
        lead_id: lead_id || null,
        client_id: client_id || null,
        agent_id: admin.id,
        channel,
        direction: actualDirection,
        subject: subject || null,
        content: actualContent,
        duration_seconds: duration_seconds || null,
        outcome: outcome || null,
        follow_up_needed: follow_up_needed || false,
        follow_up_date: follow_up_date || null,
        next_step: next_step || null,
        source: 'sales_portal',
      })
      .select()
      .single();

    if (insertErr) return errorResponse(insertErr.message, 500, req);

    // Update lead contact_attempts and last activity
    if (lead_id) {
      const updateFields: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Increment contact_attempts for outbound calls
      if (direction === 'outbound' && (channel === 'phone' || channel === 'whatsapp')) {
        const { data: lead } = await supabaseAdmin
          .from('leads')
          .select('contact_attempts')
          .eq('id', lead_id)
          .single();

        updateFields.contact_attempts = ((lead?.contact_attempts as number) || 0) + 1;
      }

      await supabaseAdmin
        .from('leads')
        .update(updateFields)
        .eq('id', lead_id)
        .eq('source', 'sales_portal');
    }

    // Create follow-up task if needed
    if (follow_up_needed && follow_up_date && lead_id) {
      await supabaseAdmin.from('tasks').insert({
        title: next_step || 'מעקב',
        task_type: 'follow_up',
        lead_id,
        assigned_to: admin.id,
        created_by: admin.id,
        priority: 'medium',
        status: 'pending',
        due_date: follow_up_date,
        source: 'sales_portal',
      });
    }

    return jsonResponse(comm, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
