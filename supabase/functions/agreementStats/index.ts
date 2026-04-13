// agreementStats — Returns agreement conversion stats
// Uses DB function get_agreement_stats(days_back)
// Authenticated: requires logged-in user

import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse, getUser } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    let days = 30;
    try {
      const body = await req.json();
      if (body.days && Number.isInteger(body.days) && body.days > 0 && body.days <= 365) {
        days = body.days;
      }
    } catch { /* no body or invalid JSON — use default */ }

    const { data, error } = await supabaseAdmin.rpc('get_agreement_stats', { days_back: days });

    if (error) {
      console.error('[agreementStats] RPC error:', error);
      return errorResponse('Failed to fetch stats', 500, req);
    }

    // Add weekly breakdown
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekData } = await supabaseAdmin.rpc('get_agreement_stats', { days_back: 7 });

    return jsonResponse({
      ...data,
      weekly: weekData || {},
    }, 200, req);

  } catch (error) {
    console.error('[AGREEMENT_ERROR] agreementStats:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
