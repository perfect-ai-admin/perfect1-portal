// Migrated from Base44: getCredits
// Returns logo credits for the authenticated customer, creating a user_account record if needed

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) {
      return errorResponse('Unauthorized', 401);
    }

    // Get or create user_account record
    const { data: accounts, error: accountsErr } = await supabaseAdmin
      .from('user_accounts')
      .select('*')
      .eq('customer_id', customer.id);

    if (accountsErr) throw new Error(accountsErr.message);

    let account = accounts && accounts.length > 0 ? accounts[0] : null;

    if (!account) {
      const { data: newAccount, error: createErr } = await supabaseAdmin
        .from('user_accounts')
        .insert({
          customer_id: customer.id,
          logo_credits: 0,
          total_logo_runs: 0
        })
        .select()
        .single();
      if (createErr) throw new Error(createErr.message);
      account = newAccount;
    }

    return jsonResponse({
      ok: true,
      logo_credits: account.logo_credits || 0,
      total_logo_runs: account.total_logo_runs || 0
    });

  } catch (error) {
    console.error('getCredits error:', error);
    return errorResponse((error as Error).message);
  }
});
