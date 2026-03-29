// Migrated from Base44: adminGetDashboardStats

import { supabaseAdmin, getCustomer, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    // Admin check via customers table
    const customer = await getCustomer(req);
    if (!customer || customer.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403, req);
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Parallel queries for performance — filtered by source='sales_portal' where applicable
    const [
      customersRes,
      newCustomersRes,
      activeCustomersRes,
      paymentsRes,
      monthPaymentsRes,
      landingPagesRes,
      publishedLPRes,
      recentActivityRes
    ] = await Promise.all([
      supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('source', 'sales_portal'),
      supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('source', 'sales_portal').gte('created_at', firstDayOfMonth),
      supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }).eq('source', 'sales_portal').eq('status', 'active'),
      supabaseAdmin.from('payments').select('amount, product_type, items, created_at').eq('source', 'sales_portal').eq('status', 'completed'),
      supabaseAdmin.from('payments').select('amount').eq('source', 'sales_portal').eq('status', 'completed').gte('created_at', firstDayOfMonth),
      supabaseAdmin.from('landing_pages').select('id', { count: 'exact', head: true }).eq('source', 'sales_portal'),
      supabaseAdmin.from('landing_pages').select('id', { count: 'exact', head: true }).eq('source', 'sales_portal').eq('is_published', true),
      supabaseAdmin.from('activity_log').select('*').eq('source', 'sales_portal').order('created_at', { ascending: false }).limit(10)
    ]);

    const payments = paymentsRes.data || [];
    const monthPayments = monthPaymentsRes.data || [];

    const stats = {
      users: {
        total: customersRes.count || 0,
        new_this_month: newCustomersRes.count || 0,
        active: activeCustomersRes.count || 0
      },
      revenue: {
        total: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        this_month: monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      },
      landingPages: {
        total: landingPagesRes.count || 0,
        published: publishedLPRes.count || 0
      },
      products: { logos: 0, presentations: 0, stickers: 0 }
    };

    // Count products
    payments.forEach((p: any) => {
      if (p.product_type === 'logo') stats.products.logos++;
      if (p.product_type === 'presentation') stats.products.presentations++;
      if (p.product_type === 'sticker') stats.products.stickers++;
      if (p.product_type === 'cart' && Array.isArray(p.items)) {
        p.items.forEach((item: any) => {
          if (item.type === 'logo') stats.products.logos++;
          if (item.type === 'presentation') stats.products.presentations++;
          if (item.type === 'sticker') stats.products.stickers++;
        });
      }
    });

    // Recent customers
    const { data: recentCustomers } = await supabaseAdmin
      .from('customers')
      .select('id, name, email, created_at, status, journey_stage')
      .eq('source', 'sales_portal')
      .order('created_at', { ascending: false })
      .limit(20);

    return jsonResponse({
      stats,
      recentActivity: recentActivityRes.data || [],
      recentUsers: recentCustomers || []
    }, 200, req);
  } catch (error) {
    return errorResponse((error as Error).message, 500, req);
  }
});
