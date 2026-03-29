// createDigitalCard
// Creates a digital business card record in digital_cards table.
// Receives formData from BusinessCardQuestionnaire including contact info,
// social links, style preferences, and optional logo/cover data URLs.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Hebrew to Latin transliteration map for DNS-safe subdomain generation
const hebrewMap: Record<string, string> = {
  '\u05D0': 'a', '\u05D1': 'b', '\u05D2': 'g', '\u05D3': 'd', '\u05D4': 'h',
  '\u05D5': 'v', '\u05D6': 'z', '\u05D7': 'ch', '\u05D8': 't', '\u05D9': 'y',
  '\u05DA': 'k', '\u05DB': 'k', '\u05DC': 'l', '\u05DD': 'm', '\u05DE': 'm',
  '\u05DF': 'n', '\u05E0': 'n', '\u05E1': 's', '\u05E2': 'a', '\u05E3': 'p',
  '\u05E4': 'p', '\u05E5': 'tz', '\u05E6': 'tz', '\u05E7': 'k', '\u05E8': 'r',
  '\u05E9': 'sh', '\u05EA': 't',
};

// Transliterate Hebrew to Latin characters
function transliterate(text: string): string {
  let result = '';
  for (const char of text) {
    result += hebrewMap[char] || char;
  }
  return result;
}

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

// Generate a DNS-safe subdomain from a name (transliterates Hebrew)
function generateSubdomain(name: string): string {
  const transliterated = transliterate(name);
  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63);
}

// Ensure subdomain is unique by appending a short suffix if needed
async function ensureUniqueSubdomain(base: string): Promise<string> {
  // Check if the base subdomain is already taken
  const { data: existingCard } = await supabaseAdmin
    .from('digital_cards')
    .select('id')
    .eq('subdomain', base)
    .maybeSingle();

  const { data: existingPage } = await supabaseAdmin
    .from('landing_pages')
    .select('id')
    .eq('subdomain', base)
    .maybeSingle();

  if (!existingCard && !existingPage) return base;

  // Add a short random suffix
  const suffix = Math.random().toString(36).slice(2, 5);
  return `${base}-${suffix}`.slice(0, 63);
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
    const subdomainBase = generateSubdomain(fullName || customer.full_name || 'card');
    const subdomain = await ensureUniqueSubdomain(subdomainBase);

    const services = [service1, service2, service3].filter(Boolean);

    const { data: card, error: insertErr } = await supabaseAdmin
      .from('digital_cards')
      .insert({
        customer_id: customer.id,
        slug,
        subdomain,
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

    const subdomainUrl = `https://${card.subdomain}.one-pai.com`;

    return jsonResponse({
      success: true,
      card_id: card.id,
      slug: card.slug,
      subdomain: card.subdomain,
      card_url: `/card/${card.slug}`,
      public_url: subdomainUrl,
      card,
    });
  } catch (error) {
    console.error('createDigitalCard error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
