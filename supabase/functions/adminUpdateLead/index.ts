// Migrated from Base44: adminUpdateLead

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const { id, data } = await req.json();
    const { data: updated, error } = await supabaseAdmin
      .from('leads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return jsonResponse(updated);
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
