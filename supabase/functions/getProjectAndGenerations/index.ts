// Migrated from Base44: getProjectAndGenerations
// Get a logo project and its generations

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { project_id } = await req.json();
    if (!project_id) return errorResponse('project_id is required', 400);

    // Get project — verify ownership via customer_id
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('logo_projects')
      .select('*')
      .eq('id', project_id)
      .eq('customer_id', customer.id)
      .single();

    if (projectErr || !project) {
      return errorResponse('Project not found or access denied', 404);
    }

    // Get all generations for this project
    const { data: generations, error: genErr } = await supabaseAdmin
      .from('logo_generations')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (genErr) return errorResponse(genErr.message);

    return jsonResponse({ project, generations: generations || [] });
  } catch (error) {
    console.error('getProjectAndGenerations error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
