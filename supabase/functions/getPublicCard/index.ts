// Migrated from Base44: getPublicCard
// Public endpoint — get a digital card by slug (no auth required)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { slug } = payload;

    if (!slug) return errorResponse('Missing slug', 400);

    const { data: card, error } = await supabaseAdmin
      .from('digital_cards')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !card) return errorResponse('Card not found', 404);

    return jsonResponse({ success: true, card });
  } catch (error) {
    console.error('getPublicCard error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
