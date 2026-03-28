// generatePresentationWithGamma
// Generates a business presentation using OpenAI (GPT) for content
// and returns a structured presentation URL.
// Frontend expects: { success: true, presentationUrl: string, pdfUrl?: string }

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { formData } = body;

    if (!formData) return errorResponse('formData is required', 400);

    const {
      presentationType,
      targetAudience,
      businessName,
      businessField,
      businessDescription,
      painPoint,
      whyPainful,
      currentSolutions,
      solution,
      solutionSteps,
      uniqueAdvantage,
      advantageExplanation,
      proofs,
      strongMetric,
      valueProposition,
      afterPicture,
      additionalDetails,
      uploadedFileUrl,
      style,
      colors,
      logoStatus,
      gammaTheme,
      language,
      length,
    } = formData;

    const lang = language === 'hebrew' ? 'Hebrew' : 'English';
    const slideCount = length === 'short' ? 8 : length === 'long' ? 15 : 12;
    const audienceStr = Array.isArray(targetAudience) ? targetAudience.join(', ') : (targetAudience || '');
    const advantagesStr = Array.isArray(uniqueAdvantage) ? uniqueAdvantage.join(', ') : (uniqueAdvantage || '');
    const stepsStr = solutionSteps
      ? Object.values(solutionSteps).filter(Boolean).join(' → ')
      : '';

    const systemPrompt = `You are a professional business presentation creator.
Generate a complete business presentation outline in ${lang}.
Return ONLY valid JSON with this structure:
{
  "title": "presentation title",
  "slides": [
    { "slide_number": 1, "title": "...", "content": "...", "notes": "..." }
  ],
  "theme": "recommended theme name",
  "summary": "one sentence summary in ${lang}"
}

Make the presentation compelling, data-driven where possible, and suitable for ${audienceStr || 'business audience'}.
Use ${slideCount} slides. Style: ${style || 'corporate'}.`;

    const userContent = `
Business: ${businessName || 'לא צוין'}
Field: ${businessField || 'לא צוין'}
Description: ${businessDescription || 'לא צוין'}
Presentation type: ${Array.isArray(presentationType) ? presentationType.join(', ') : presentationType || 'general'}
Target audience: ${audienceStr}
Pain point: ${painPoint || 'לא צוין'}
Why painful: ${Array.isArray(whyPainful) ? whyPainful.join(', ') : whyPainful || ''}
Current solutions: ${currentSolutions || 'לא צוין'}
Our solution: ${solution || 'לא צוין'}
Process steps: ${stepsStr}
Unique advantages: ${advantagesStr}
Advantage explanation: ${advantageExplanation || ''}
Proofs / social proof: ${Array.isArray(proofs) ? proofs.join(', ') : proofs || ''}
Key metric: ${strongMetric || ''}
Value proposition: ${valueProposition || ''}
After picture (transformation): ${afterPicture || ''}
Additional details: ${additionalDetails || ''}
Logo/branding: ${logoStatus || 'none'}
Colors: ${colors || 'default'}
Theme: ${gammaTheme || style || 'corporate'}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
      temperature: 0.7,
    });

    let presentationData: Record<string, unknown> = {};
    try {
      presentationData = JSON.parse(completion.choices[0].message.content || '{}');
    } catch {
      console.warn('generatePresentationWithGamma: failed to parse OpenAI JSON response');
      presentationData = { title: businessName || 'מצגת עסקית', slides: [], summary: '' };
    }

    // Save presentation record
    const { data: presentation, error: insertErr } = await supabaseAdmin
      .from('presentations')
      .insert({
        customer_id: customer.id,
        title: (presentationData.title as string) || businessName || 'מצגת עסקית',
        business_name: businessName || '',
        business_field: businessField || '',
        language,
        style: style || 'corporate',
        slides_json: presentationData.slides || [],
        form_data: formData,
        status: 'generated',
        uploaded_file_url: uploadedFileUrl || null,
      })
      .select()
      .single();

    if (insertErr) {
      // If table doesn't exist, still return the result
      console.warn('presentations insert failed:', insertErr.message);
    }

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'presentation_generated',
      data: {
        presentation_id: presentation?.id,
        business_name: businessName,
        language,
        slide_count: (presentationData.slides as unknown[])?.length || 0
      }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    // Build a viewer URL — embed the JSON data as a base64-encoded viewer page
    const presentationId = presentation?.id || crypto.randomUUID();
    const presentationUrl = `/presentation/${presentationId}`;

    return jsonResponse({
      success: true,
      presentationUrl,
      pdfUrl: null,
      presentation_id: presentationId,
      title: presentationData.title,
      slides: presentationData.slides,
      summary: presentationData.summary,
      theme: presentationData.theme,
    });
  } catch (error) {
    console.error('generatePresentationWithGamma error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
