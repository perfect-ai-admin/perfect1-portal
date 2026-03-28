// Edge Function: evolvePrompt
// Improves the customer's active prompt using AI and saves the new version.
// The client may pass { prompt_id, feedback, goal } or call with no body —
// in that case the function resolves the active prompt automatically.

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    // Parse body — tolerate empty body
    let body: { prompt_id?: string; feedback?: string; goal?: string } = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      // No body or invalid JSON — use defaults
    }

    const { feedback, goal } = body;
    let { prompt_id } = body;

    // If no prompt_id supplied, resolve the customer's current active prompt
    if (!prompt_id) {
      const { data: active } = await supabaseAdmin
        .from('agent_prompt_templates')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return errorResponse('No active prompt found for this customer', 404);
      prompt_id = active.id;
    }

    // Load the full prompt record
    const { data: currentPrompt } = await supabaseAdmin
      .from('agent_prompt_templates')
      .select('*')
      .eq('id', prompt_id)
      .single();

    if (!currentPrompt) return errorResponse('Prompt not found', 404);

    // Evolve with AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'אתה מומחה לשיפור prompts. שפר את ה-prompt הבא בהתבסס על הפידבק. החזר JSON עם שדות: new_version (הטקסט המשופר), changes_summary (סיכום שינויים בעברית), improvement_score (1-10).',
        },
        {
          role: 'user',
          content: `Prompt נוכחי:\n${currentPrompt.content}\n\nפידבק: ${feedback || 'שפר באופן כללי'}\nמטרה: ${goal || 'שיפור כללי'}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Deactivate old prompt
    await supabaseAdmin
      .from('agent_prompt_templates')
      .update({ is_active: false })
      .eq('id', prompt_id);

    // Insert new prompt version
    const { data: newPrompt } = await supabaseAdmin
      .from('agent_prompt_templates')
      .insert({
        customer_id: customer.id,
        content: result.new_version || currentPrompt.content,
        is_active: true,
        parent_id: prompt_id,
        version: (currentPrompt.version || 1) + 1,
        changes_summary: result.changes_summary,
        improvement_score: result.improvement_score,
      })
      .select()
      .single();

    return jsonResponse({
      new_version: newPrompt,
      changes_summary: result.changes_summary,
    });
  } catch (error) {
    return errorResponse((error as Error).message);
  }
});
