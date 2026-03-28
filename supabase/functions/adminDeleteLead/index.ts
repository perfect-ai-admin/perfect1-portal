// Migrated from Base44: adminDeleteLead

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { leadId } = await req.json();
    if (!leadId) return errorResponse('leadId is required', 400);

    const admin = await requireAdmin(req);

    console.log('Admin', admin.email, 'deleting lead:', leadId);
    const { error } = await supabaseAdmin.from('leads').delete().eq('id', leadId);

    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
