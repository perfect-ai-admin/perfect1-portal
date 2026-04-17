import { supabaseAdmin, getUser, getCorsHeaders, jsonResponse, errorResponse, checkRateLimit } from '../_shared/supabaseAdmin.ts';

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callOpenAIJSON(systemPrompt: string, userPrompt: string): Promise<Record<string, unknown>> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    return { error: 'Failed to parse AI response' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const user = await getUser(req);
    if (!user) return errorResponse('Unauthorized', 401, req);

    if (!checkRateLimit(user.id, 20, 60000)) {
      return errorResponse('Rate limit exceeded', 429, req);
    }

    const { action, ...payload } = await req.json();

    switch (action) {
      case 'classify_reply': {
        const { reply_body, reply_id } = payload;
        if (!reply_body) return errorResponse('reply_body required', 400, req);

        const result = await callOpenAIJSON(
          `You are an email classification assistant for an Israeli business outreach system.
Classify the reply email below. Return JSON with:
- "sentiment": one of "positive", "neutral", "negative"
- "intent": one of "interested", "not_interested", "ask_price", "ask_details", "partnership", "unknown"
- "summary": a 1-2 sentence Hebrew summary of the reply`,
          `Reply email:\n${reply_body}`
        );

        // Update the reply if reply_id is provided
        if (reply_id && result.sentiment && result.intent) {
          await supabaseAdmin
            .from('outreach_replies')
            .update({
              sentiment: result.sentiment,
              intent: result.intent,
              ai_summary: result.summary || null,
            })
            .eq('id', reply_id);
        }

        return jsonResponse(result, 200, req);
      }

      case 'summarize': {
        const { reply_body, reply_id } = payload;
        if (!reply_body) return errorResponse('reply_body required', 400, req);

        const summary = await callOpenAI(
          'You are an assistant that summarizes business emails in Hebrew. Write a concise 1-2 sentence summary.',
          `Email:\n${reply_body}`
        );

        if (reply_id) {
          await supabaseAdmin
            .from('outreach_replies')
            .update({ ai_summary: summary })
            .eq('id', reply_id);
        }

        return jsonResponse({ summary }, 200, req);
      }

      case 'suggest_reply': {
        const { reply_body, original_subject, website_domain } = payload;
        if (!reply_body) return errorResponse('reply_body required', 400, req);

        const suggested = await callOpenAI(
          `You are a professional outreach assistant for an Israeli business portal (perfect1.co.il).
Write a professional, friendly Hebrew reply to the email below.
Keep it concise (3-5 sentences). Match the tone of the original reply.
The goal is to advance the collaboration/partnership discussion.
Sign as "יוסי, פרפקט וואן".`,
          `Website: ${website_domain || 'unknown'}
Original subject: ${original_subject || 'unknown'}
Their reply:\n${reply_body}`
        );

        return jsonResponse({ suggested_reply: suggested }, 200, req);
      }

      case 'suggest_subject': {
        const { campaign_type, niche } = payload;

        const result = await callOpenAIJSON(
          `You are an email marketing specialist for Israeli business outreach.
Generate 3 subject line variants for an outreach email.
Return JSON: { "subjects": ["subject1", "subject2", "subject3"] }
All subjects must be in Hebrew, professional, and not spammy.`,
          `Campaign type: ${campaign_type || 'collaboration'}
Target niche: ${niche || 'עסקים'}`
        );

        return jsonResponse(result, 200, req);
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400, req);
    }
  } catch (error) {
    console.error('outreachAI error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
