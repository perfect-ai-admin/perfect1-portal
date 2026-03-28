// Migrated from Base44: adminListUsers
// Lists all users (customers) with enriched payment and plan data — admin only

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Unauthorized', 401);
    }

    // Fetch all customers, payments and plans in parallel
    const [
      { data: customers, error: customersErr },
      { data: payments, error: paymentsErr },
      { data: plans, error: plansErr }
    ] = await Promise.all([
      supabaseAdmin.from('customers').select('*'),
      supabaseAdmin.from('payments').select('*'),
      supabaseAdmin.from('plans').select('*')
    ]);

    if (customersErr) throw new Error(customersErr.message);
    if (paymentsErr) throw new Error(paymentsErr.message);

    // Build plan lookup
    const planMap: Record<string, any> = {};
    for (const plan of (plans || [])) {
      planMap[plan.id] = plan;
    }

    // Build payment stats per customer
    const paymentsByCustomer: Record<string, { count: number; total: number; lastDate: string | null; completedCount: number }> = {};
    for (const payment of (payments || [])) {
      const cid = payment.customer_id;
      if (!cid) continue;
      if (!paymentsByCustomer[cid]) {
        paymentsByCustomer[cid] = { count: 0, total: 0, lastDate: null, completedCount: 0 };
      }
      const stats = paymentsByCustomer[cid];
      stats.count += 1;
      if (payment.status === 'completed') {
        stats.completedCount += 1;
        stats.total += (payment.amount || 0);
        const pDate = payment.completed_at || payment.created_at;
        if (pDate && (!stats.lastDate || new Date(pDate) > new Date(stats.lastDate))) {
          stats.lastDate = pDate;
        }
      }
    }

    // Enrich customers
    const enrichedUsers = (customers || []).map(c => {
      const hasStartedJourney = !!c.business_journey_completed && !!(c.phone && c.phone.trim() !== '');
      const pStats = paymentsByCustomer[c.id] || { count: 0, total: 0, lastDate: null, completedCount: 0 };
      const userPlan = c.current_plan_id ? planMap[c.current_plan_id] : null;

      return {
        ...c,
        has_started_journey: hasStartedJourney,
        journey_details: hasStartedJourney ? 'השלים שאלון מסע עסק' : null,
        plan_name: userPlan?.name || null,
        plan_price: userPlan?.price ?? null,
        payments_count: pStats.completedCount,
        payments_total: pStats.total,
        last_payment_date: pStats.lastDate
      };
    });

    return jsonResponse({ users: enrichedUsers });

  } catch (error) {
    console.error('Error listing users:', error);
    return errorResponse((error as Error).message);
  }
});
