// generateSticker
// Generates a business sticker image using DALL-E based on questionnaire data.
// Frontend expects: { ok: true, image_url: string, ai_brief: string, used_prompt: string }

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { formData, width = 1024, height = 1024 } = body;

    if (!formData) return errorResponse('formData is required', 400);

    const {
      businessName,
      field,
      targetAudience,
      purposes,
      platforms,
      style,
      hasText,
      textType,
      language,
      vibe,
      hasLogo,
      colors,
      logoUrl,
      exampleSentence,
      excludeText,
    } = formData;

    // Step 1: Generate a Hebrew AI brief and English DALL-E prompt using GPT
    const briefSystemPrompt = `You are a creative director specializing in business sticker design.
Given business details, generate:
1. A short Hebrew creative brief describing the sticker concept (2-3 sentences)
2. A detailed English DALL-E image generation prompt for a professional business sticker

Return ONLY valid JSON:
{
  "hebrew_brief": "...",
  "dalle_prompt": "..."
}`;

    const briefUserContent = `
Business: ${businessName || 'לא צוין'}
Field: ${field || 'לא צוין'}
Target audience: ${targetAudience || 'לא צוין'}
Purpose: ${Array.isArray(purposes) ? purposes.join(', ') : purposes || ''}
Platforms: ${Array.isArray(platforms) ? platforms.join(', ') : platforms || ''}
Style: ${style || 'modern'}
Include text: ${hasText === 'yes' ? 'yes' : 'no'}
Text type: ${textType || ''}
Language for text: ${language || 'english'}
Vibe/mood: ${vibe || 'professional'}
Colors: ${colors || 'brand colors'}
Logo included: ${hasLogo === 'yes' ? 'yes, logo URL provided' : 'no'}
Example sentence: ${exampleSentence || ''}
Exclude: ${excludeText || ''}
`;

    const briefCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: briefSystemPrompt },
        { role: 'user', content: briefUserContent }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.8,
    });

    let briefData: { hebrew_brief?: string; dalle_prompt?: string } = {};
    try {
      briefData = JSON.parse(briefCompletion.choices[0].message.content || '{}');
    } catch {
      console.warn('generateSticker: failed to parse brief JSON');
    }

    const dallePrompt = briefData.dalle_prompt ||
      `Professional business sticker for ${businessName || 'a business'} in ${field || 'general'} industry. ${style || 'modern'} style, ${vibe || 'professional'} vibe. Clean, high-quality vector-like design suitable for digital use. White background with transparent feel.`;

    // Step 2: Generate image with DALL-E 3
    const imageSize = (width === 1024 && height === 1024) ? '1024x1024' :
      (width > height) ? '1792x1024' : '1024x1792';

    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: imageSize as '1024x1024' | '1792x1024' | '1024x1792',
      quality: 'standard',
      style: 'vivid',
    });

    const imageUrl = imageResponse.data[0].url;
    if (!imageUrl) return errorResponse('Image generation failed — no URL returned');

    // Save sticker record
    const { data: sticker, error: insertErr } = await supabaseAdmin
      .from('stickers')
      .insert({
        customer_id: customer.id,
        image_url: imageUrl,
        ai_brief: briefData.hebrew_brief || '',
        used_prompt: dallePrompt,
        form_data: formData,
        business_name: businessName || '',
        status: 'generated',
      })
      .select()
      .single();

    if (insertErr) {
      console.warn('stickers insert failed:', insertErr.message);
    }

    // Deduct 1 credit from customer
    if ((customer.credits_balance || 0) >= 1) {
      await supabaseAdmin
        .from('customers')
        .update({ credits_balance: (customer.credits_balance || 0) - 1 })
        .eq('id', customer.id)
        .catch((e: Error) => console.warn('credit deduction failed:', e.message));

      await supabaseAdmin.from('credit_ledger').insert({
        customer_id: customer.id,
        event_type: 'usage',
        amount: -1,
        reason: 'sticker_generation',
        reference_id: sticker?.id || null,
      }).catch((e: Error) => console.warn('credit_ledger insert failed:', e.message));
    }

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'sticker_generated',
      data: { sticker_id: sticker?.id, business_name: businessName }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({
      ok: true,
      image_url: imageUrl,
      ai_brief: briefData.hebrew_brief || '',
      used_prompt: dallePrompt,
      sticker_id: sticker?.id || null,
    });
  } catch (error) {
    console.error('generateSticker error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
