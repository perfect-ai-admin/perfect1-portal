// Migrated from Base44: getPublicLandingPageById
// Public endpoint — get a landing page by ID (no auth required)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { pageId } = payload;

    if (!pageId) return errorResponse('Missing pageId', 400);

    const { data: page, error } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error || !page) return errorResponse('Landing page not found', 404);

    return jsonResponse({ success: true, page });
  } catch (error) {
    console.error('getPublicLandingPageById error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
