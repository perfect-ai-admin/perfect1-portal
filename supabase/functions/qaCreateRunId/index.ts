// Migrated from Base44: qaCreateRunId
// Create a QA run ID for test tracking

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const run_id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('activity_log')
      .insert({
        action: 'qa_run_created',
        entity_type: 'qa',
        metadata: { run_id },
        created_at
      });

    if (error) {
      console.warn('qaCreateRunId: insert error:', error.message);
      // Still return the run_id even if logging failed
    }

    return jsonResponse({ run_id, created_at });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('qaCreateRunId error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
