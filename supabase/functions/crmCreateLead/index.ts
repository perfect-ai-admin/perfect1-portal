// CRM: Create a lead manually + duplicate detection

import { supabaseAdmin, requireAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const admin = await requireAdmin(req);

    const {
      name, phone, email, city, service_type,
      temperature, notes, agent_id, tags, estimated_value
    } = await req.json();

    if (!name || !phone) {
      return errorResponse('name and phone are required', 400, req);
    }

    // Duplicate detection by phone
    const cleanPhone = phone.replace(/\D/g, '');
    const { data: existing } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, pipeline_stage, created_at')
      .eq('source', 'sales_portal')
      .or(`phone.ilike.%${cleanPhone.slice(-7)}%`);

    if (existing && existing.length > 0) {
      return jsonResponse({
        warning: 'duplicate_found',
        duplicates: existing,
        message: `נמצאו ${existing.length} לידים עם טלפון דומה`,
      }, 200, req);
    }

    // Set SLA deadline (1 hour for new leads)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 1);

    const { data: lead, error: insertErr } = await supabaseAdmin
      .from('leads')
      .insert({
        name,
        phone,
        email: email || null,
        city: city || null,
        service_type: service_type || null,
        temperature: temperature || 'warm',
        agent_id: agent_id || null,
        tags: tags || [],
        estimated_value: estimated_value || null,
        notes: notes || null,
        pipeline_stage: 'new_lead',
        pipeline_entered_at: new Date().toISOString(),
        sla_deadline: slaDeadline.toISOString(),
        contact_attempts: 0,
        status: 'new',
        source: 'sales_portal',
        source_page: 'CRM - הוספה ידנית',
        interaction_type: 'manual',
      })
      .select()
      .single();

    if (insertErr) return errorResponse(insertErr.message, 500, req);

    // Log in status_history
    await supabaseAdmin.from('status_history').insert({
      entity_type: 'lead',
      entity_id: lead.id,
      old_stage: null,
      new_stage: 'new_lead',
      changed_by: admin.id,
      change_reason: 'הוספה ידנית מ-CRM',
      source: 'sales_portal',
    });

    return jsonResponse({ success: true, lead }, 200, req);
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
