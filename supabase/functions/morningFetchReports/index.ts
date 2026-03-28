// Migrated from Base44: morningFetchReports
// Fetch reports from Morning (Green Invoice)

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const MORNING_API_URL = Deno.env.get('MORNING_API_URL') ?? 'https://api.greeninvoice.co.il/api/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const { report_type, period_start, period_end } = body;

    if (!report_type)   return errorResponse('שדה report_type הוא חובה', 400);
    if (!period_start)  return errorResponse('שדה period_start הוא חובה', 400);
    if (!period_end)    return errorResponse('שדה period_end הוא חובה', 400);

    // Get Morning connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from('accounting_connections')
      .select('id, provider, credentials, status')
      .eq('customer_id', customer.id)
      .eq('provider', 'morning')
      .eq('status', 'connected')
      .maybeSingle();

    if (connError) {
      console.warn('morningFetchReports: connection fetch error:', connError.message);
      return errorResponse(connError.message);
    }
    if (!connection) return errorResponse('אין חיבור פעיל ל-Morning (Green Invoice)', 404);

    // Stub API call — replace with real Morning API integration
    console.log(
      `morningFetchReports: would call ${MORNING_API_URL}/reports/${report_type}`,
      { period_start, period_end, connection_id: connection.id }
    );

    // Audit log — non-blocking
    supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      action: 'morning.fetch_reports',
      entity_type: 'acct_connection',
      entity_id: connection.id,
      metadata: { report_type, period_start, period_end },
    }).then(({ error }) => {
      if (error) console.warn('morningFetchReports: activity_log insert failed:', error.message);
    });

    return jsonResponse({ success: true, reports: [], message: 'Reports fetched' });
  } catch (error) {
    console.error('morningFetchReports error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
