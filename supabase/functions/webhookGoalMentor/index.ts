// Migrated from Base44: webhookGoalMentor
// Webhook endpoint for goal mentor events — logs activity and optionally triggers mentor response

import { supabaseAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const VALID_EVENT_TYPES = ['goal_started', 'task_completed', 'goal_completed', 'check_in'] as const;
type EventType = typeof VALID_EVENT_TYPES[number];

async function callMentorChat(customerId: string, message: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const res = await fetch(`${supabaseUrl}/functions/v1/smartMentorEngine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ customer_id: customerId, message, channel: 'web' })
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.response || null;
  } catch {
    return null;
  }
}

function getMentorMessage(eventType: EventType, data: Record<string, unknown>): string | null {
  switch (eventType) {
    case 'goal_started':
      return `התחלתי מטרה חדשה: ${data?.goal_title || 'מטרה'}. איך אני יכול לעזור לך להתחיל?`;
    case 'task_completed':
      return `סיימתי משימה: ${data?.task_title || 'משימה'}. מה הצעד הבא שאמליץ?`;
    case 'goal_completed':
      return `השגתי את המטרה שלי: ${data?.goal_title || 'מטרה'}! מה הלאה?`;
    case 'check_in':
      return `נקודת בקרה שבועית — איך התקדמות שלי?`;
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { event_type, customer_id, goal_id, data } = await req.json();

    if (!event_type || !customer_id) {
      return errorResponse('event_type and customer_id are required', 400);
    }

    if (!VALID_EVENT_TYPES.includes(event_type as EventType)) {
      return errorResponse(`Invalid event_type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`, 400);
    }

    // Enrich payload with real DB data before processing
    let customerProfile: Record<string, unknown> | null = null;
    let journeyData: Record<string, unknown> | null = null;
    let activeGoals: unknown[] = [];
    let goalDetails: Record<string, unknown> | null = null;

    // Fetch customer profile
    const { data: customerRow } = await supabaseAdmin
      .from('customers')
      .select('id, name, full_name, email, phone_e164')
      .eq('id', customer_id)
      .maybeSingle();
    customerProfile = customerRow;

    // Fetch latest business journey state
    const { data: journeyRow } = await supabaseAdmin
      .from('business_state')
      .select('*')
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    journeyData = journeyRow;

    // Fetch active goals
    const { data: goalsData } = await supabaseAdmin
      .from('customer_goals')
      .select('*, goals(*)')
      .eq('customer_id', customer_id)
      .in('status', ['active', 'selected']);
    activeGoals = goalsData || [];

    // Fetch specific goal details if goal_id provided
    if (goal_id) {
      const { data: goalRow } = await supabaseAdmin
        .from('goals')
        .select('title, description, status, progress')
        .eq('id', goal_id)
        .maybeSingle();
      goalDetails = goalRow;
    }

    const enrichedData = {
      ...(data || {}),
      customer: customerProfile,
      journey: journeyData,
      active_goals: activeGoals,
      goal_details: goalDetails
    };

    // Log event to activity_log
    const { error: logErr } = await supabaseAdmin.from('activity_log').insert({
      customer_id,
      event_type: `goal_mentor_${event_type}`,
      data: { goal_id, ...enrichedData }
    });

    if (logErr) {
      console.warn('webhookGoalMentor: activity_log insert failed:', logErr.message);
    }

    // Determine if this event should trigger a mentor response
    const mentorMessage = getMentorMessage(event_type as EventType, {
      ...(data || {}),
      goal_title: goalDetails?.title || (data as any)?.goal_title
    });
    let mentorResponse: string | null = null;

    if (mentorMessage) {
      mentorResponse = await callMentorChat(customer_id, mentorMessage);
    }

    return jsonResponse({
      success: true,
      mentor_response: mentorResponse,
      enriched_context: {
        has_journey: !!journeyData,
        active_goals_count: activeGoals.length,
        goal_title: goalDetails?.title || null
      }
    });
  } catch (error) {
    console.error('webhookGoalMentor error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
