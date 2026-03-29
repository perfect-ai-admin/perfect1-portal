// CRM: Export leads as CSV

import { supabaseAdmin, requireAdmin, getCorsHeaders, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const { pipeline_stage, agent_id, temperature } = body;

    let query = supabaseAdmin
      .from('leads')
      .select('name, phone, email, city, service_type, pipeline_stage, temperature, contact_attempts, created_at, updated_at, source_page, utm_source, utm_campaign, notes')
      .eq('source', 'sales_portal')
      .order('created_at', { ascending: false });

    if (pipeline_stage && pipeline_stage !== 'all') {
      query = query.eq('pipeline_stage', pipeline_stage);
    }
    if (agent_id && agent_id !== 'all') {
      query = query.eq('agent_id', agent_id);
    }
    if (temperature && temperature !== 'all') {
      query = query.eq('temperature', temperature);
    }

    const { data: leads, error } = await query.limit(5000);
    if (error) return errorResponse(error.message, 500, req);

    // Build CSV
    const headers = ['שם', 'טלפון', 'אימייל', 'עיר', 'שירות', 'שלב', 'טמפרטורה', 'ניסיונות קשר', 'תאריך יצירה', 'עדכון אחרון', 'מקור', 'UTM Source', 'קמפיין', 'הערות'];
    const rows = (leads || []).map((l: Record<string, unknown>) => [
      l.name || '', l.phone || '', l.email || '', l.city || '',
      l.service_type || '', l.pipeline_stage || '', l.temperature || '',
      l.contact_attempts || 0, l.created_at || '', l.updated_at || '',
      l.source_page || '', l.utm_source || '', l.utm_campaign || '', (l.notes || '').toString().replace(/\n/g, ' '),
    ]);

    const BOM = '\uFEFF'; // UTF-8 BOM for Excel Hebrew support
    const csv = BOM + [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    const corsHeaders = getCorsHeaders(req);
    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse((error as Error).message, 500, req);
  }
});
