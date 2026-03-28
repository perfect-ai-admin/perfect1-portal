// Migrated from Base44: invokeLLM
// Proxy to OpenAI — replaces base44.integrations.Core.InvokeLLM

import { getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Auth is optional — some callers may not have auth
    await getCustomer(req);

    const payload = await req.json();
    const { instructions, prompt, response_json_schema, model } = payload;

    if (!prompt) return errorResponse('prompt is required', 400);

    const messages: { role: 'system' | 'user'; content: string }[] = [];
    if (instructions) {
      messages.push({ role: 'system', content: instructions });
    }
    messages.push({ role: 'user', content: prompt });

    const requestParams: Parameters<typeof openai.chat.completions.create>[0] = {
      model: model || 'gpt-4o-mini',
      messages,
    };

    if (response_json_schema) {
      requestParams.response_format = { type: 'json_object' };
    }

    const completion = await openai.chat.completions.create(requestParams);

    const content = completion.choices[0].message.content ?? '';

    if (response_json_schema) {
      try {
        const parsed = JSON.parse(content);
        return jsonResponse(parsed);
      } catch {
        return jsonResponse({ response: content });
      }
    }

    return jsonResponse({ response: content });
  } catch (error) {
    console.error('invokeLLM error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
