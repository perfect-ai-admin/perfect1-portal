// Migrated from Base44: approveLogo
// Approve/finalize a logo — marks generation as approved and project as completed

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { generation_id } = await req.json();
    if (!generation_id) return errorResponse('generation_id is required', 400);

    // Get generation and verify ownership via project
    const { data: generation, error: genErr } = await supabaseAdmin
      .from('logo_generations')
      .select('*, logo_projects!inner(id, customer_id)')
      .eq('id', generation_id)
      .single();

    if (genErr || !generation) {
      return errorResponse('Generation not found', 404);
    }

    if (generation.logo_projects.customer_id !== customer.id) {
      return errorResponse('Access denied', 403);
    }

    const projectId = generation.logo_projects.id;
    const now = new Date().toISOString();

    // Update generation: status = approved
    const { error: genUpdateErr } = await supabaseAdmin
      .from('logo_generations')
      .update({ status: 'approved', approved_at: now })
      .eq('id', generation_id);

    if (genUpdateErr) return errorResponse(genUpdateErr.message);

    // Update project: status = completed
    const { error: projUpdateErr } = await supabaseAdmin
      .from('logo_projects')
      .update({ status: 'completed', completed_at: now })
      .eq('id', projectId);

    if (projUpdateErr) return errorResponse(projUpdateErr.message);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('approveLogo error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
