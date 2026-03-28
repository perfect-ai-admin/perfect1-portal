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

const MORNING_BASE = 'https://api.greeninvoice.co.il/api/v1';

const OUR_TO_MORNING_TYPE: Record<string, number> = {
  invoice: 305,
  invoice_receipt: 320,
  receipt: 400,
  quote: 10,
  credit_note: 330,
};

const MORNING_PAYMENT_MAP: Record<string, number> = {
  cash: 1,
  check: 2,
  cheque: 2,
  credit_card: 3,
  bank_transfer: 4,
  paypal: 5,
  bit: 10,
  paybox: 11,
  other: 0,
  none: -1,
};

async function getMorningJWT(userId: string) {
  const { data: connections } = await supabaseAdmin
    .from('accounting_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected')
    .eq('provider', 'morning')
    .limit(1);
  if (!connections?.length) throw new Error('אין חיבור פעיל ל-Morning');
  const conn = connections[0];

  const tokenResp = await fetch(`${MORNING_BASE}/account/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: conn.api_key_enc, secret: conn.api_secret_enc }),
  });
  if (!tokenResp.ok) throw new Error('שגיאה בהתחברות ל-Morning');
  const { token } = await tokenResp.json();
  return { jwt: token, connection: conn };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401);

    // Get active connection
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

    const authHeader = req.headers.get('Authorization') || '';

    if (provider === 'icount') {
      const body = await req.json();
      const resp = await fetch(`${supabaseUrl}/functions/v1/icountCreateDocument`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return new Response(await resp.text(), { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (provider === 'finbot') {
      const body = await req.json();
      const resp = await fetch(`${supabaseUrl}/functions/v1/finbotCreateDocument`, {
        method: 'POST',
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return new Response(await resp.text(), { status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (provider !== 'morning') {
      return errorResponse(`יצירת מסמכים עדיין לא נתמכת עבור ${provider}`, 400);
    }

    const body = await req.json();
    const { type, customer_id, items, payment_method, notes, issue_date } = body;

    if (!type || !items?.length) {
      return errorResponse('חסרים סוג מסמך ופריטים', 400);
    }

    const morningType = OUR_TO_MORNING_TYPE[type];
    if (!morningType) {
      return errorResponse(`סוג מסמך לא נתמך: ${type}`, 400);
    }

    const { jwt, connection } = await getMorningJWT(user.id);

    const vatType = connection.config?.is_vat_exempt ? 2 : 0;

    const income = items.map((item: any, idx: number) => ({
      catalogNum: item.catalogNum || '',
      description: item.description || `פריט ${idx + 1}`,
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
      currency: 'ILS',
      vatType,
    }));

    const payment: any[] = [];
    if (payment_method && payment_method !== 'none') {
      const pmType = MORNING_PAYMENT_MAP[payment_method] ?? 0;
      const totalAmount = income.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
      payment.push({
        type: pmType,
        price: totalAmount,
        currency: 'ILS',
        date: issue_date || new Date().toISOString().split('T')[0],
      });
    }

    let clientObj: any = undefined;
    if (customer_id) {
      const { data: custs } = await supabaseAdmin
        .from('accounting_customers')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'morning');
      const match = custs?.find((c: any) => c.id === customer_id || c.provider_customer_id === customer_id);
      if (match?.provider_customer_id) {
        clientObj = { id: match.provider_customer_id };
      }
    }

    const docPayload = {
      type: morningType,
      ...(clientObj ? { client: clientObj } : {}),
      income,
      ...(payment.length > 0 ? { payment } : {}),
      remarks: notes || '',
      date: issue_date || new Date().toISOString().split('T')[0],
      lang: 'he',
      currency: 'ILS',
    };

    console.log('Morning create document payload:', JSON.stringify(docPayload).substring(0, 500));

    const createResp = await fetch(`${MORNING_BASE}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(docPayload),
    });

    const resultText = await createResp.text();
    let result: any;
    try { result = JSON.parse(resultText); } catch (_) {
      console.log('Morning non-JSON response:', resultText.substring(0, 300));
      return errorResponse('תגובה לא תקינה מ-Morning', 500);
    }

    if (!createResp.ok) {
      console.log('Morning create doc error:', createResp.status, JSON.stringify(result));
      return jsonResponse({
        error: result.errorMessage || result.message || 'שגיאה ביצירת מסמך ב-Morning',
        details: result,
      }, 400);
    }

    const subtotal = result.amount || income.reduce((s: number, i: any) => s + i.quantity * i.price, 0);
    const vatAmount = result.vat || 0;
    const total = result.totalAmount || (subtotal + vatAmount);

    let pdfUrl = null;
    if (result.url) {
      pdfUrl = result.url.origin || result.url.he || result.url.en || null;
    }

    const { data: savedDoc } = await supabaseAdmin
      .from('accounting_documents')
      .insert({
        user_id: user.id,
        provider: 'morning',
        provider_document_id: String(result.id),
        doc_type: type,
        doc_number: result.number != null ? String(result.number) : null,
        status: result.status === 0 ? 'draft' : 'final',
        direction: 'outbound',
        customer_provider_id: clientObj?.id || null,
        customer_name: result.client?.name || null,
        currency: 'ILS',
        subtotal,
        vat_amount: vatAmount,
        total,
        amount_paid: result.totalPaid || 0,
        balance_due: Math.max(0, total - (result.totalPaid || 0)),
        issue_date: result.documentDate || issue_date,
        payment_method: payment_method || null,
        items: income.map((i: any) => ({
          description: i.description,
          quantity: i.quantity,
          unit_price: i.price,
          line_total: i.quantity * i.price,
        })),
        notes: notes || null,
        pdf_url: pdfUrl,
        raw: result,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    await supabaseAdmin
      .from('finbot_audit_log')
      .insert({
        user_id: user.id,
        provider: 'morning',
        action: 'document.create',
        entity_type: 'document',
        entity_id: savedDoc?.id,
        details: { doc_type: type, morning_id: result.id, doc_number: result.number },
        success: true,
      });

    return jsonResponse({
      status: 'success',
      document: savedDoc,
      morning_doc_id: result.id,
      doc_number: result.number,
      pdf_url: pdfUrl,
    });
  } catch (error: any) {
    console.log('acctCreateDocument error:', error.message);
    return errorResponse(error.message, 500);
  }
});
