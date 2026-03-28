// Migrated from Base44: adminListLeads

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);

    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) return errorResponse(error.message);
    return jsonResponse(leads);
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
