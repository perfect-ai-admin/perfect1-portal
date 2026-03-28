// Migrated from Base44: trackWhatsappLead
// Public endpoint — track a WhatsApp lead click (source, phone, page)

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { source, phone, page } = await req.json();

    // At least one identifier or source is required
    if (!source && !phone && !page) {
      return errorResponse('At least one of source, phone, or page is required', 400);
    }

    const now = new Date().toISOString();

    // If phone provided — upsert lead
    if (phone) {
      const { data: existingLeads } = await supabaseAdmin
        .from('leads')
        .select('id, interaction_count')
        .eq('phone', phone)
        .limit(1);

      if (existingLeads && existingLeads.length > 0) {
        // Increment interaction count
        const existing = existingLeads[0];
        await supabaseAdmin
          .from('leads')
          .update({
            interaction_count: (existing.interaction_count || 0) + 1,
            last_interaction_at: now
          })
          .eq('id', existing.id);
      } else {
        // Create new lead
        await supabaseAdmin.from('leads').insert({
          phone,
          source_page: page || source || 'WhatsApp Click',
          source: source || 'whatsapp',
          status: 'new',
          interaction_type: 'whatsapp_click',
          priority: 'medium',
          interaction_count: 1,
          last_interaction_at: now
        });
      }
    }

    // Always log to activity_log for analytics
    await supabaseAdmin.from('activity_log').insert({
      event_type: 'whatsapp_lead_click',
      data: {
        source: source || null,
        phone: phone || null,
        page: page || null,
        tracked_at: now
      }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('trackWhatsappLead error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
