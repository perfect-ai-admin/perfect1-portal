// Migrated from Base44: adminGetUserFullDetails
// Returns full details for a specific customer including payments, landing pages, leads, and goals — admin only

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const admin = await getCustomer(req);
    if (!admin || admin.role !== 'admin') {
      return errorResponse('Forbidden', 403);
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return errorResponse('User ID is required', 400);
    }

    // Fetch the customer record
    const { data: user, error: userErr } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userErr || !user) {
      return errorResponse('User not found', 404);
    }

    // Fetch related data in parallel
    const [
      { data: payments },
      { data: landingPages },
      { data: leads },
      { data: customerGoals }
    ] = await Promise.all([
      supabaseAdmin
        .from('payments')
        .select('*')
        .eq('customer_id', user_id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('landing_pages')
        .select('*')
        .eq('created_by', user.email)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('leads')
        .select('*')
        .eq('created_by', user.email)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('customer_goals')
        .select('*')
        .eq('customer_id', user_id)
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    // Calculate LTV from completed payments
    const ltv = (payments || [])
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return jsonResponse({
      user,
      payments: payments || [],
      landingPages: landingPages || [],
      leads: leads || [],
      goals: customerGoals || [],
      userGoals: customerGoals || [],
      ltv
    });

  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
