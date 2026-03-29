// resolveSubdomain
// Public endpoint — resolves a subdomain slug to a digital card or landing page.
// No auth required. Called from SubdomainPage when user visits {slug}.one-pai.com
//
// Lookup priority:
// 1. digital_cards.subdomain (exact match)
// 2. landing_pages.subdomain (exact match)
// 3. digital_cards.slug (partial match — slug starts with subdomain)
// 4. landing_pages.slug (partial match — slug starts with subdomain)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const { subdomain } = payload;

    if (!subdomain) return errorResponse('Missing subdomain', 400);

    // Sanitize: only allow lowercase alphanumeric and hyphens
    const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSub) return errorResponse('Invalid subdomain', 400);

    // 1. Try exact match on digital_cards.subdomain
    {
      const { data: card } = await supabaseAdmin
        .from('digital_cards')
        .select('*')
        .eq('subdomain', cleanSub)
        .in('status', ['active', 'published'])
        .limit(1)
        .maybeSingle();

      if (card) {
        // Increment views
        await supabaseAdmin.rpc('increment_card_views', { card_id: card.id }).catch(() => {});
        return jsonResponse({ success: true, type: 'card', data: card });
      }
    }

    // 2. Try exact match on landing_pages.subdomain
    {
      const { data: page } = await supabaseAdmin
        .from('landing_pages')
        .select('*')
        .eq('subdomain', cleanSub)
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();

      if (page) {
        return jsonResponse({ success: true, type: 'landing_page', data: page });
      }
    }

    // 3. Fallback: try matching digital_cards where slug starts with subdomain
    // This handles cases where slug = "studio-dana-abc12" and subdomain = "studio-dana"
    {
      const { data: cards } = await supabaseAdmin
        .from('digital_cards')
        .select('*')
        .ilike('slug', `${cleanSub}%`)
        .in('status', ['active', 'published'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (cards && cards.length > 0) {
        const card = cards[0];
        // Auto-assign subdomain for future fast lookups
        await supabaseAdmin
          .from('digital_cards')
          .update({ subdomain: cleanSub })
          .eq('id', card.id)
          .catch(() => {});
        // Increment views
        await supabaseAdmin.rpc('increment_card_views', { card_id: card.id }).catch(() => {});
        return jsonResponse({ success: true, type: 'card', data: card });
      }
    }

    // 4. Fallback: try matching landing_pages where slug starts with subdomain
    {
      const { data: pages } = await supabaseAdmin
        .from('landing_pages')
        .select('*')
        .ilike('slug', `${cleanSub}%`)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pages && pages.length > 0) {
        const page = pages[0];
        // Auto-assign subdomain
        await supabaseAdmin
          .from('landing_pages')
          .update({ subdomain: cleanSub })
          .eq('id', page.id)
          .catch(() => {});
        return jsonResponse({ success: true, type: 'landing_page', data: page });
      }
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('resolveSubdomain error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
