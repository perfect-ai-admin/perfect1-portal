// Migrated from Base44: acctSyncPull
// Pull data from accounting provider (iCount / Finbot / Morning)

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const ICOUNT_API_URL  = Deno.env.get('ICOUNT_API_URL')  ?? 'https://api.icount.co.il/api/v3.php';
const FINBOT_API_URL  = Deno.env.get('FINBOT_API_URL')  ?? 'https://api.finbot.co.il';
const MORNING_API_URL = Deno.env.get('MORNING_API_URL') ?? 'https://api.greeninvoice.co.il/api/v1';

type SyncResource = 'customers' | 'expenses' | 'documents' | 'all';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json().catch(() => ({}));
    const resource: SyncResource = body.resource ?? 'all';

    const validResources: SyncResource[] = ['customers', 'expenses', 'documents', 'all'];
    if (!validResources.includes(resource)) {
      return errorResponse(`resource חייב להיות אחד מ: ${validResources.join(', ')}`, 400);
    }

    // Get connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from('accounting_connections')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('status', 'connected')
      .maybeSingle();

    if (connError) {
      console.warn('acctSyncPull: connection fetch error:', connError.message);
      return errorResponse(connError.message);
    }
    if (!connection) return errorResponse('אין חיבור פעיל לספק הנהלת חשבונות', 404);

    const { provider } = connection;
    const now = new Date().toISOString();

    // Log the sync attempt
    supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      action: 'acct.sync_pull',
      entity_type: 'acct_connection',
      entity_id: connection.id,
      metadata: { provider, resource },
    }).then(({ error }) => {
      if (error) console.warn('acctSyncPull: activity_log insert failed:', error.message);
    });

    // Provider-specific stub — replace with real API calls when credentials are available
    if (provider === 'icount') {
      console.log(`acctSyncPull [iCount]: would call ${ICOUNT_API_URL} for resource=${resource}`);
    } else if (provider === 'finbot') {
      console.log(`acctSyncPull [Finbot]: would call ${FINBOT_API_URL} for resource=${resource}`);
    } else if (provider === 'morning') {
      console.log(`acctSyncPull [Morning]: would call ${MORNING_API_URL} for resource=${resource}`);
    } else {
      return errorResponse(`ספק לא מוכר: ${provider}`, 400);
    }

    // Update last_synced_at
    const { error: updateError } = await supabaseAdmin
      .from('accounting_connections')
      .update({ last_synced_at: now, updated_at: now })
      .eq('id', connection.id);

    if (updateError) {
      console.warn('acctSyncPull: failed to update last_synced_at:', updateError.message);
    }

    return jsonResponse({ success: true, resource, provider, message: 'Sync initiated' });
  } catch (error) {
    console.error('acctSyncPull error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
