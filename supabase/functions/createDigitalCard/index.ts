// createDigitalCard
// Creates a digital business card record in digital_cards table.
// Receives formData from BusinessCardQuestionnaire including contact info,
// social links, style preferences, and optional logo/cover data URLs.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Generate a short unique slug for the card
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05fe]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { formData } = body;

    if (!formData) return errorResponse('formData is required', 400);

    const {
      fullName,
      profession,
      presentationStyle,
      service1,
      service2,
      service3,
      phone,
      email,
      socialNetworks,
      website_url,
      instagram_url,
      facebook_url,
      waze_url,
      hasLogo,
      logoDataUrl,
      hasCover,
      coverDataUrl,
      preferredStyle,
      primaryUsage,
    } = formData;

    const slug = generateSlug(fullName || customer.full_name || 'card');

    const services = [service1, service2, service3].filter(Boolean);

    const { data: card, error: insertErr } = await supabaseAdmin
      .from('digital_cards')
      .insert({
        customer_id: customer.id,
        slug,
        name: fullName || customer.full_name || '',
        full_name: fullName || customer.full_name || '',
        profession: profession || '',
        presentation_style: presentationStyle || '',
        services,
        phone: phone || customer.phone || '',
        email: email || customer.email || '',
        social_networks: socialNetworks || [],
        website_url: website_url || '',
        instagram_url: instagram_url || '',
        facebook_url: facebook_url || '',
        waze_url: waze_url || '',
        logo_data_url: logoDataUrl || null,
        cover_data_url: coverDataUrl || null,
        preferred_style: preferredStyle || '',
        primary_usage: primaryUsage || '',
        status: 'active',
        views: 0,
        clicks: 0,
      })
      .select()
      .single();

    if (insertErr) return errorResponse(insertErr.message);

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'digital_card_created',
      data: { card_id: card.id, slug }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({
      success: true,
      card_id: card.id,
      slug: card.slug,
      card_url: `/card/${card.slug}`,
      card,
    });
  } catch (error) {
    console.error('createDigitalCard error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
