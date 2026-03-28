import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug } = await req.json();

    if (!slug) {
      return Response.json({ success: false, error: 'Missing slug' }, { status: 400 });
    }

    // Use service role to read public cards (no auth needed for public view)
    const cards = await base44.asServiceRole.entities.DigitalCard.filter({ slug, is_published: true });

    if (!cards || cards.length === 0) {
      return Response.json({ success: false, error: 'Card not found' }, { status: 404 });
    }

    return Response.json({ success: true, card: cards[0] });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});