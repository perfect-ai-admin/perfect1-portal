// Migrated from Base44: adminListPayments
// Lists all payments enriched with customer details — admin only

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

    // Fetch all payments ordered by created_at desc
    const { data: payments, error: paymentsErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (paymentsErr) throw new Error(paymentsErr.message);

    // Build customers map for enrichment
    const { data: allCustomers, error: customersErr } = await supabaseAdmin
      .from('customers')
      .select('id, full_name, email, phone, role');
    if (customersErr) throw new Error(customersErr.message);

    const usersMap: Record<string, any> = {};
    for (const c of (allCustomers || [])) {
      usersMap[c.id] = {
        full_name: c.full_name || '',
        email: c.email || '',
        phone: c.phone || '',
        role: c.role || 'user'
      };
    }

    const enriched = (payments || []).map(p => {
      const userData = usersMap[p.customer_id] || {};
      return {
        ...p,
        user_name: userData.full_name || p.customer_id || 'לא ידוע',
        user_email: userData.email || '',
        user_phone: userData.phone || ''
      };
    });

    return jsonResponse({ payments: enriched });

  } catch (error) {
    console.error('adminListPayments error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
