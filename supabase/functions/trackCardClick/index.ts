// Migrated from Base44: trackCardClick
// Public endpoint — track a click/action on a digital card (no auth required)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { card_id, action } = payload;

    if (!card_id) return errorResponse('Missing card_id', 400);
    if (!action) return errorResponse('Missing action', 400);

    const { error } = await supabaseAdmin
      .from('activity_log')
      .insert({
        entity_type: 'digital_card',
        entity_id: card_id,
        action,
        metadata: { action }
      });

    if (error) return errorResponse(error.message);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('trackCardClick error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
