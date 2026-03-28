// Migrated from Base44: adminListLandingPages
// Lists all landing pages ordered by created_at desc — admin only

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { data: landingPages, error } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);

    return jsonResponse({ landingPages });

  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
