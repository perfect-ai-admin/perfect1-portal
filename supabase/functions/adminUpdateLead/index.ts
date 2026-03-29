// Migrated from Base44: adminUpdateLead

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    await requireAdmin(req);

    const { id, data } = await req.json();
    const { data: updated, error } = await supabaseAdmin
      .from('leads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('source', 'sales_portal')
      .select()
      .single();

    if (error) return errorResponse(error.message, 500, req);
    return jsonResponse(updated, 200, req);
  } catch (error) {
    return errorResponse((error as Error).message, 500, req);
  }
});
