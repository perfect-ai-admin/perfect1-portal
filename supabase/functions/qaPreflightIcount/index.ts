// Migrated from Base44: qaPreflightIcount
// QA preflight check for iCount integration

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const { data, error } = await supabaseAdmin
      .from('accounting_connections')
      .select('*')
      .eq('provider', 'icount')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('qaPreflightIcount: query error:', error.message);
      return jsonResponse({
        ready: false,
        provider: 'icount',
        checks: { api_key: false, connection: false }
      });
    }

    const hasApiKey = !!(data?.api_key || data?.credentials?.api_key);
    const isConnected = data?.status === 'connected';

    return jsonResponse({
      ready: hasApiKey && isConnected,
      provider: 'icount',
      checks: {
        api_key: hasApiKey,
        connection: isConnected
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('qaPreflightIcount error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
