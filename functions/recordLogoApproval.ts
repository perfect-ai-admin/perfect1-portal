import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      project_id, 
      generation_id, 
      brand_name, 
      business_type, 
      style, 
      colors_used,
      prompt_used 
    } = await req.json();

    if (!project_id || !generation_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record this successful logo generation
    const learning = await base44.entities.LogoLearning.create({
      user_id: user.email,
      project_id,
      brand_name: brand_name || '',
      business_type: business_type || '',
      style: style || '',
      colors_used: colors_used || [],
      user_approved: true,
      approved_at: new Date().toISOString(),
      prompt_used: prompt_used || '',
      generated_at: new Date().toISOString(),
      notes: `User approved logo for ${brand_name}`
    });

    console.log('[RECORD_APPROVAL] Recorded approved logo for user:', user.email);

    return Response.json({ 
      ok: true, 
      learning_id: learning.id 
    });
  } catch (error) {
    console.error('[RECORD_APPROVAL] Error:', error.message);
    return Response.json({ 
      error: 'Failed to record approval',
      details: error.message 
    }, { status: 500 });
  }
});