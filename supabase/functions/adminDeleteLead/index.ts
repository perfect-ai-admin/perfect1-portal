// Migrated from Base44: adminDeleteLead

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const { leadId } = await req.json();
    if (!leadId) return errorResponse('leadId is required', 400, req);

    const admin = await requireAdmin(req);

    console.log('Admin', admin.email, 'deleting lead:', leadId);
    const { error } = await supabaseAdmin.from('leads').delete().eq('id', leadId).eq('source', 'sales_portal');

    if (error) return errorResponse(error.message, 500, req);
    return jsonResponse({ success: true }, 200, req);
  } catch (error) {
    return errorResponse((error as Error).message, 500, req);
  }
});
