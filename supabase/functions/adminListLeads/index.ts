// Migrated from Base44: adminListLeads

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('source', 'sales_portal')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) return errorResponse(error.message, 500, req);
    return jsonResponse(leads, 200, req);
  } catch (error) {
    return errorResponse((error as Error).message, 500, req);
  }
});
