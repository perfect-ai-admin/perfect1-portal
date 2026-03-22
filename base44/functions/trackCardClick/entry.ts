import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { card_id, action } = body;

    if (!card_id || !action) {
      return Response.json({ error: 'Missing card_id or action' }, { status: 400 });
    }

    await base44.asServiceRole.entities.CardClick.create({ card_id, action });

    return Response.json({ success: true });
  } catch (error) {
    console.error('trackCardClick error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});