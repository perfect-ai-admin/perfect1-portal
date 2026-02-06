import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return Response.json({ error: 'Missing slug' }, { status: 400 });
    }

    // Use service role to read cards (both draft for preview and published for public)
    const cards = await base44.asServiceRole.entities.DigitalCard.filter({ slug });

    if (!cards || cards.length === 0) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    const card = cards[0];

    return Response.json({
      success: true,
      card: {
        id: card.id,
        full_name: card.full_name,
        profession: card.profession,
        presentation_style: card.presentation_style,
        services: card.services,
        phone: card.phone,
        whatsapp: card.whatsapp,
        email: card.email,
        social_networks: card.social_networks,
        logo_url: card.logo_url,
        preferred_style: card.preferred_style,
        primary_color: card.primary_color,
        slug: card.slug,
        public_url: card.public_url,
        qr_image_url: card.qr_image_url,
        vcf_url: card.vcf_url,
      }
    });
  } catch (error) {
    console.error('getPublicCard error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});