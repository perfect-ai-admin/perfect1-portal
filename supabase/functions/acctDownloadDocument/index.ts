import { createClient } from 'npm:@supabase/supabase-js@2';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
function createUserClient(req: Request) { const ah = req.headers.get('Authorization') || ''; return createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: ah } } }); }
async function getUser(req: Request) { const uc = createUserClient(req); const { data: { user }, error } = await uc.auth.getUser(); if (error || !user) return null; return user; }
async function getCustomer(req: Request) { const user = await getUser(req); if (!user) return null; const { data } = await supabaseAdmin.from('customers').select('*').eq('email', user.email).limit(1).single(); return data; }
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
function jsonResponse(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
function errorResponse(message: string, status = 500) { return jsonResponse({ error: message }, status); }

/**
 * Unified download-document function.
 * Reads the user's active accounting connection, then delegates to the correct provider.
 * Input: { document_id }
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();

    const { data: connections } = await supabaseAdmin
      .from('accounting_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected')
      .limit(1);

    if (!connections?.length) {
      return errorResponse('אין חיבור פעיל למערכת חשבונות', 400);
    }
    const provider = connections[0].provider;

    const providerFnMap: Record<string, string> = {
      icount: 'icountDownloadDocument',
      finbot: 'finbotDownloadDocument',
      morning: 'morningDownloadDocument',
    };

    const downloadFn = providerFnMap[provider];
    if (!downloadFn) {
      return errorResponse(`הורדת מסמכים עדיין לא נתמכת עבור ${provider}`, 400);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const resp = await fetch(`${supabaseUrl}/functions/v1/${downloadFn}`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const respText = await resp.text();
    let respData: any;
    try { respData = JSON.parse(respText); } catch (_) { respData = respText; }

    return jsonResponse(respData, resp.status);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
});
