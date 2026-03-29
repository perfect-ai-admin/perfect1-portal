// CRM: Create a new task

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const {
      title, description, task_type, lead_id, client_id,
      assigned_to, priority, due_date, sla_hours
    } = await req.json();

    if (!title || !task_type) {
      return errorResponse('title and task_type are required', 400, req);
    }

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description: description || null,
        task_type,
        lead_id: lead_id || null,
        client_id: client_id || null,
        assigned_to: assigned_to || admin.id,
        created_by: admin.id,
        priority: priority || 'medium',
        status: 'pending',
        due_date: due_date || null,
        sla_hours: sla_hours || null,
        source: 'sales_portal',
      })
      .select()
      .single();

    if (error) return errorResponse(error.message, 500, req);

    return jsonResponse(task, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
