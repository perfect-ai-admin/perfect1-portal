// Migrated from Base44: getPublicLandingPage
// Public endpoint — get a landing page by slug (no auth required)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { slug } = payload;

    if (!slug) return errorResponse('Missing slug', 400);

    const { data: page, error } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !page) return errorResponse('Landing page not found', 404);

    return jsonResponse({ success: true, page });
  } catch (error) {
    console.error('getPublicLandingPage error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
