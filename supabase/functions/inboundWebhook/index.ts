// Webhook endpoint for receiving leads from Google Ads Lead Form Extensions
// Google sends: { google_key, lead_id, user_column_data[], campaign_id, gcl_id, is_test, ... }

import { supabaseAdmin, sanitizeString } from '../_shared/supabaseAdmin.ts';

const WEBHOOK_SECRET = Deno.env.get('INBOUND_WEBHOOK_KEY');

// Extract field value from Google's user_column_data array
function getColumnValue(columns: Array<{ column_id: string; string_value: string }>, columnId: string): string {
  return columns?.find(c => c.column_id === columnId)?.string_value || '';
}

// Clean phone — accept any format (Israeli or international)
function cleanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Israeli format: convert 05x to 972
  if (/^0[2-9]\d{7,8}$/.test(cleaned)) {
    return '972' + cleaned.substring(1);
  }
  // International with +
  if (/^\+?\d{8,15}$/.test(cleaned)) {
    return cleaned.replace(/^\+/, '');
  }
  return cleaned;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    const body = await req.json();

    // --- Auth: Google sends google_key in the body ---
    const providedKey = body.google_key
      || new URL(req.url).searchParams.get('key')
      || req.headers.get('x-webhook-key');

    if (!WEBHOOK_SECRET || providedKey !== WEBHOOK_SECRET) {
      console.error('Auth failed. key:', providedKey?.substring(0, 8) + '...');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse Google Lead Form format
    const columns = body.user_column_data || [];
    const name = sanitizeString(
      getColumnValue(columns, 'FULL_NAME')
      || getColumnValue(columns, 'FIRST_NAME')
      || getColumnValue(columns, 'LAST_NAME')
      || '', 100
    );
    const phone = getColumnValue(columns, 'PHONE_NUMBER');
    const email = getColumnValue(columns, 'EMAIL');
    const company = getColumnValue(columns, 'COMPANY_NAME');
    const city = getColumnValue(columns, 'CITY');

    // For test leads — save but skip strict validation
    const isTest = body.is_test === true;

    if (!phone && !isTest) {
      return new Response(JSON.stringify({ error: 'Phone required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanedPhone = phone ? cleanPhone(phone) : 'test';

    // Build notes
    const noteParts: string[] = [];
    if (company) noteParts.push(`חברה: ${company}`);
    if (body.campaign_id) noteParts.push(`campaign: ${body.campaign_id}`);
    if (body.adgroup_id) noteParts.push(`adgroup: ${body.adgroup_id}`);
    if (body.gcl_id) noteParts.push(`gclid: ${body.gcl_id}`);
    if (isTest) noteParts.push('⚠️ TEST LEAD');

    // Save lead
    const leadData: Record<string, any> = {
      name: name || 'Google Lead',
      phone: cleanedPhone,
      email: email || '',
      notes: noteParts.join(' | '),
      source_page: body.form_id ? `google-form-${body.form_id}` : 'google-ads',
      source: 'sales_portal',
      interaction_type: 'google_lead_form',
      status: 'new',
      pipeline_stage: 'new_lead',
      temperature: 'hot',
      contact_attempts: 0,
      sla_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      priority: 'high',
      ...(body.gcl_id && { gclid: body.gcl_id }),
      ...(city && { city }),
    };

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    console.log(`Google lead saved: ${lead.id}${isTest ? ' (TEST)' : ''}`);

    // Trigger botStartFlow — FIRE AND FORGET (no await)
    // Skip for test leads to avoid spam.
    if (cleanedPhone && cleanedPhone !== 'test' && !isTest) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      fetch(`${supabaseUrl}/functions/v1/botStartFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
        },
        body: JSON.stringify({
          lead_id: lead.id,
          lead_name: name || 'Google Lead',
          phone: cleanedPhone,
          email: email || '',
          page_slug: leadData.source_page,
          page_title: company || '',
        }),
      }).then(r => console.log('botStartFlow triggered:', lead.id, r.status))
        .catch(e => console.warn('botStartFlow fire-and-forget failed:', e.message));
    }

    // Return simple 200 — Google expects this
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('inboundWebhook error:', (err as Error).message);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
