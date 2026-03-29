// CRM: Complete a task

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const { task_id } = await req.json();
    if (!task_id) return errorResponse('task_id is required', 400, req);

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', task_id)
      .eq('source', 'sales_portal')
      .select()
      .single();

    if (error) return errorResponse(error.message, 500, req);

    return jsonResponse(task, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
