// Migrated from Base44: getDownloadCredits
// Get customer's download credits balance

import { getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) {
      return errorResponse('Unauthorized', 401);
    }

    return jsonResponse({ credits: customer.credits_balance || 0 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('getDownloadCredits error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
