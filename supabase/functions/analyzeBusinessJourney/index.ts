// analyzeBusinessJourney
// Analyzes business journey questionnaire answers using OpenAI,
// creates a business_state summary and updates the customer record.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return errorResponse('answers object is required', 400);
    }

    // Build a readable summary for OpenAI
    const answersText = Object.entries(answers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const systemPrompt = `You are a business coach AI. Analyze the user's business journey questionnaire answers and return a JSON object with the following fields:
- stage: one of "idea" | "new" | "active" | "stable" | "scaling"
- summary: a short Hebrew description (2-3 sentences) of the business state
- main_challenge: the primary challenge the business owner faces (in Hebrew)
- recommended_focus: what they should focus on next (in Hebrew)
- business_type: best guess at the type of business (e.g. service, product, digital, tech)

Return ONLY valid JSON, no markdown or explanation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Business journey answers:\n${answersText}` }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.3,
    });

    let businessState: Record<string, unknown> = {};
    try {
      businessState = JSON.parse(completion.choices[0].message.content || '{}');
    } catch {
      console.warn('analyzeBusinessJourney: failed to parse OpenAI JSON response');
    }

    // Update customer with answers and analysis
    const { error: updateErr } = await supabaseAdmin
      .from('customers')
      .update({
        business_journey_answers: answers,
        business_journey_completed_at: new Date().toISOString(),
        business_state: businessState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customer.id);

    if (updateErr) return errorResponse(updateErr.message);

    // Log activity
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'business_journey_completed',
      data: { stage: businessState.stage, completed_at: new Date().toISOString() }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ success: true, business_state: businessState });
  } catch (error) {
    console.error('analyzeBusinessJourney error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
