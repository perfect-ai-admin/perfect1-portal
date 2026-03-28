// createLandingPage
// Creates a new landing page using AI-generated content based on questionnaire data.
// Returns the full page object including sections_json so the frontend can render
// an immediate preview without waiting for DB replication.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

// Build a slug from business name
function buildSlug(name: string): string {
  const base = (name || 'page')
    .toLowerCase()
    .replace(/[\u0590-\u05fe]/g, '') // strip Hebrew letters
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30) || 'page';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { data: formData } = body;

    if (!formData) return errorResponse('data (formData) is required', 400);

    const {
      businessName,
      mainField,
      targetAudience,
      targetAudienceOther,
      painPoints,
      consequences,
      serviceOffered,
      whyChooseYou,
      whyChooseYouOther,
      experienceYears,
      processSteps,
      proofs,
      testimonialText,
      ctaTypes,
      ctaText,
      pageStyle,
      preferredColors,
      logoStatus,
      formFields,
      leadDestination,
      destinationPhone,
      destinationEmail,
    } = formData;

    // Compose prompt for OpenAI
    const targetAudienceStr = [
      ...(Array.isArray(targetAudience) ? targetAudience : []),
      targetAudienceOther,
    ].filter(Boolean).join(', ');

    const whyChooseStr = [
      ...(Array.isArray(whyChooseYou) ? whyChooseYou : []),
      whyChooseYouOther,
    ].filter(Boolean).join(', ');

    const systemPrompt = `You are an expert Israeli landing page copywriter.
Create a complete landing page JSON structure for a business.
Return ONLY a valid JSON object with this structure:
{
  "headline": "main headline in Hebrew",
  "sub_headline": "supporting headline in Hebrew",
  "sections_json": [
    { "type": "hero", "headline": "...", "sub": "...", "cta": "..." },
    { "type": "pain", "title": "...", "points": ["...", "...", "..."] },
    { "type": "solution", "title": "...", "description": "...", "steps": ["...", "...", "..."] },
    { "type": "benefits", "title": "...", "items": [{"title":"...","desc":"..."},{"title":"...","desc":"..."},{"title":"...","desc":"..."}] },
    { "type": "proof", "title": "...", "items": ["...", "..."] },
    { "type": "cta", "headline": "...", "sub": "...", "button_text": "..." }
  ]
}

Write all content in Hebrew (unless the business is clearly English-oriented).
Make the copy compelling and conversion-focused. Use the business details provided.`;

    const userContent = `
Business: ${businessName || 'לא צוין'}
Field: ${mainField || 'לא צוין'}
Target audience: ${targetAudienceStr || 'לא צוין'}
Pain points: ${painPoints || 'לא צוין'}
Pain consequences: ${consequences || 'לא צוין'}
Service offered: ${serviceOffered || 'לא צוין'}
Why choose us: ${whyChooseStr || 'לא צוין'}
Experience: ${experienceYears || 'לא צוין'} years
Process: ${processSteps || 'לא צוין'}
Proofs/testimonials: ${testimonialText || (Array.isArray(proofs) ? proofs.join(', ') : '') || 'אין'}
CTA button text: ${ctaText || 'צור קשר עכשיו'}
Style: ${pageStyle || 'modern'}
Colors: ${preferredColors || 'כחול ולבן'}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.6,
    });

    let aiContent: Record<string, unknown> = {};
    try {
      aiContent = JSON.parse(completion.choices[0].message.content || '{}');
    } catch {
      console.warn('createLandingPage: failed to parse OpenAI JSON response');
      aiContent = {
        headline: `ברוכים הבאים ל${businessName || 'העסק שלנו'}`,
        sub_headline: serviceOffered || '',
        sections_json: [],
      };
    }

    const slug = buildSlug(businessName || '');

    // Determine lead channel settings
    const leadChannels: string[] = Array.isArray(ctaTypes) ? ctaTypes : [];
    const destPhone = destinationPhone || customer.phone || null;
    const destEmail = destinationEmail || customer.email || null;

    const { data: page, error: insertErr } = await supabaseAdmin
      .from('landing_pages')
      .insert({
        customer_id: customer.id,
        slug,
        title: (aiContent.headline as string) || businessName || 'דף נחיתה',
        headline: (aiContent.headline as string) || '',
        sub_headline: (aiContent.sub_headline as string) || '',
        sections_json: aiContent.sections_json || [],
        business_name: businessName || '',
        main_field: mainField || '',
        target_audience: targetAudienceStr,
        service_offered: serviceOffered || '',
        cta_text: ctaText || 'צור קשר עכשיו',
        cta_types: leadChannels,
        page_style: pageStyle || 'modern',
        preferred_colors: preferredColors || '',
        logo_status: logoStatus || '',
        form_fields: Array.isArray(formFields) ? formFields : ['name', 'phone'],
        lead_channels: leadChannels,
        destination_phone: destPhone,
        destination_email: destEmail,
        lead_destination: leadDestination || '',
        is_published: false,
        status: 'draft',
      })
      .select()
      .single();

    if (insertErr) return errorResponse(insertErr.message);

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'landing_page_created',
      data: { page_id: page.id, slug, business_name: businessName }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    // Return the full page object (including sections_json) so frontend
    // can render preview immediately without a separate DB fetch
    return jsonResponse({ ...page });
  } catch (error) {
    console.error('createLandingPage error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
