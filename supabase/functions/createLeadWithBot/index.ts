import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const body = await req.json();
    const { name, phone, email = '', message = '', page_slug = 'osek-patur', business_name = 'sales-portal' } = body;

    // Validate inputs
    if (!name || !phone) {
      return new Response(
        JSON.stringify({ error: 'שם וטלפון חובה' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Call RPC function
    console.log(`[createLeadWithBot] Calling RPC with: name=${name}, phone=${phone}, page_slug=${page_slug}`);

    const { data, error } = await supabaseAdmin.rpc('create_lead_and_trigger_bot', {
      p_name: name,
      p_phone: phone,
      p_email: email,
      p_message: message,
      p_page_slug: page_slug,
      p_business_name: business_name,
    });

    if (error) {
      console.error('[createLeadWithBot] RPC Error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'שגיאה בעת יצירת הליד' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log('[createLeadWithBot] RPC Success:', data);

    // Return result
    const result = data && data.length > 0 ? data[0] : null;
    return new Response(
      JSON.stringify({
        success: result?.success || false,
        lead_id: result?.lead_id || null,
        page_intent: result?.page_intent || null,
        flow_type: result?.flow_type || null,
        message: result?.message || 'לא הצלחנו ליצור את הליד',
      }),
      {
        status: result?.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err) {
    console.error('[createLeadWithBot] Exception:', err);
    return new Response(
      JSON.stringify({ error: 'שגיאה פנימית' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
