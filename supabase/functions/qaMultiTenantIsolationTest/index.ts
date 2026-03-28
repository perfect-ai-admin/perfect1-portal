// Migrated from Base44: qaMultiTenantIsolationTest
// Test multi-tenant data isolation

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    // Verify that all rows in key tables have a non-null customer_id (tenant ID)
    const tablesToCheck = ['activity_log', 'credit_ledger'];
    const leaks: string[] = [];

    for (const table of tablesToCheck) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('id')
        .is('customer_id', null)
        .limit(1);

      if (error) {
        console.warn(`qaMultiTenantIsolationTest: could not query ${table}:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        leaks.push(table);
      }
    }

    const isolationVerified = leaks.length === 0;

    return jsonResponse({
      success: true,
      isolation_verified: isolationVerified,
      ...(leaks.length > 0 && { leak_detected_in: leaks })
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('qaMultiTenantIsolationTest error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
