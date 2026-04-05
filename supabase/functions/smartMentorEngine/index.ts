// Migrated from Base44: smartMentorEngine
// Smart mentor that can respond via web or trigger WhatsApp messages via GreenAPI

import { supabaseAdmin, findCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';
import OpenAI from 'npm:openai';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') });

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
  const token = Deno.env.get('GREENAPI_API_TOKEN');

  if (!instanceId || !token) {
    console.warn('smartMentorEngine: GreenAPI credentials not configured');
    return;
  }

  const chatId = phone.replace('+', '') + '@c.us';
  const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message })
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('smartMentorEngine: GreenAPI error:', body);
    throw new Error(`GreenAPI send failed: ${res.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { customer_id, message, channel, goal_id } = await req.json();

    if (!customer_id || !message) {
      return errorResponse('customer_id and message are required', 400);
    }

    // Resolve customer
    const customer = await findCustomer(customer_id);
    if (!customer) return errorResponse('Customer not found', 404);

    // Build context from conversation summaries
    const { data: summaries } = await supabaseAdmin
      .from('conversation_summaries')
      .select('key_facts, ai_memory, completed_tasks')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const context = summaries?.[0] || null;

    // Fetch business_state for full journey context
    const { data: journeyData } = await supabaseAdmin
      .from('business_state')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch active customer_goals with goal details
    const { data: activeGoalsData } = await supabaseAdmin
      .from('customer_goals')
      .select('*, goals(*)')
      .eq('customer_id', customer.id)
      .in('status', ['active', 'selected']);
    const activeGoals = activeGoalsData || [];

    // Fetch goal steps for active goals
    const activeGoalIds = activeGoals.map((g: any) => g.goal_id).filter(Boolean);
    let goalSteps: any[] = [];
    if (activeGoalIds.length > 0) {
      const { data: stepsData } = await supabaseAdmin
        .from('goal_steps')
        .select('*')
        .in('goal_id', activeGoalIds)
        .eq('customer_id', customer.id);
      goalSteps = stepsData || [];
    }

    // Get specific goal context if goal_id provided
    let goalContext = '';
    if (goal_id) {
      const { data: goal } = await supabaseAdmin
        .from('goals')
        .select('title, description, status, progress')
        .eq('id', goal_id)
        .maybeSingle();

      if (goal) {
        goalContext = `\nמטרה נוכחית: ${goal.title}\nתיאור: ${goal.description || ''}\nסטטוס: ${goal.status}, התקדמות: ${goal.progress || 0}%`;
      }
    }

    // Build business context block
    const businessContext = journeyData ? `
## מסע עסקי:
- שלב: ${journeyData.stage || 'לא ידוע'}
- ניתוח: ${journeyData.ai_analysis || ''}
- משימות: ${JSON.stringify(journeyData.tasks || [])}
- מטרה מומלצת: ${JSON.stringify(journeyData.recommended_goal || {})}
` : 'לא מילא שאלון מסע עסקי';

    const goalsContext = activeGoals.length > 0 ? `
## מטרות פעילות:
${activeGoals.map((g: any) => `- ${g.goals?.title || g.goal_id} (${g.status}, ${g.progress || 0}%)${g.flow_data ? ` | תשובות: ${JSON.stringify(g.flow_data)}` : ''}`).join('\n')}

## שלבי מטרות:
${goalSteps.map((s: any) => `- ${s.title}: ${s.status}${s.completed_at ? ' (הושלם)' : ''}`).join('\n') || 'אין שלבים'}
` : '\nאין מטרות פעילות';

    const systemPrompt = `אתה מנטור עסקי חכם לעוסקים עצמאיים.
שם הלקוח: ${customer.name || customer.full_name || 'לקוח'}
${context ? `זיכרון: ${JSON.stringify(context.key_facts || {})}` : ''}
${businessContext}
${goalsContext}
${goalContext}

תן תשובה מועילה, קצרה ומעשית בעברית.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });

    const response = completion.choices[0].message.content || '';

    // If channel is whatsapp — send via GreenAPI
    if (channel === 'whatsapp') {
      if (!customer.phone_e164) {
        return errorResponse('Customer has no phone_e164 for WhatsApp', 400);
      }
      await sendWhatsApp(customer.phone_e164, response);
    }

    // Log interaction
    await supabaseAdmin.from('activity_log').insert({
      customer_id: customer.id,
      event_type: 'smart_mentor_response',
      data: { channel: channel || 'web', goal_id, message, response }
    }).catch((e: Error) => console.warn('activity_log insert failed:', e.message));

    return jsonResponse({ response, sent_via: channel || 'web' });
  } catch (error) {
    console.error('smartMentorEngine error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
