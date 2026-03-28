// Migrated from Base44: qaCleanupRun
// Clean up QA test data

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const body = await req.json();
    const runId: string = body.runId;

    if (!runId) {
      return errorResponse('runId is required', 400);
    }

    // Delete test data from activity_log where metadata->run_id matches
    const { error } = await supabaseAdmin
      .from('activity_log')
      .delete()
      .eq('metadata->>run_id', runId);

    if (error) {
      console.warn('qaCleanupRun: delete error:', error.message);
      return errorResponse(error.message);
    }

    return jsonResponse({ success: true, cleaned: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('qaCleanupRun error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
