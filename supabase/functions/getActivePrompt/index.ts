// Edge Function: getActivePrompt
// Returns the latest active prompt from agent_prompt_templates for the authenticated customer.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const { data: prompt } = await supabaseAdmin
      .from('agent_prompt_templates')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return jsonResponse(prompt || null);
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
