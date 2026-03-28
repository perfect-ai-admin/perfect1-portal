// Migrated from Base44: completeGoal
// Marks a goal code as completed in the customer's business journey and returns next goal

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const customer = await getCustomer(req);
    if (!customer) {
      return errorResponse('Unauthorized', 401);
    }

    const { goalCode, pointsEarned = 100 } = await req.json();

    // Get customer's journey (business_journey table or similar)
    const { data: journeys, error: journeyErr } = await supabaseAdmin
      .from('business_journeys')
      .select('*')
      .eq('customer_id', customer.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (journeyErr) throw new Error(journeyErr.message);
    if (!journeys || journeys.length === 0) {
      return errorResponse('No journey found', 404);
    }

    const journey = journeys[0];
    const completedGoals: string[] = journey.completed_goals || [];

    if (!completedGoals.includes(goalCode)) {
      completedGoals.push(goalCode);
    }

    // Calculate progress
    const totalGoals = 7;
    const newProgress = Math.round((completedGoals.length / totalGoals) * 100);

    // Update journey
    const { error: updateErr } = await supabaseAdmin
      .from('business_journeys')
      .update({
        completed_goals: completedGoals,
        journey_progress_percent: newProgress,
        current_goal_code: null,
        last_webhook_sync: new Date().toISOString()
      })
      .eq('id', journey.id);

    if (updateErr) throw new Error(updateErr.message);

    // Get next goal
    const { data: allGoals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .order('display_order', { ascending: true })
      .limit(7);

    const nextGoal = (allGoals || []).find(g => !completedGoals.includes(g.goal_code));

    return jsonResponse({
      success: true,
      journey: {
        completedGoalsCount: completedGoals.length,
        progressPercent: newProgress,
        nextGoalCode: nextGoal?.goal_code || null,
        nextGoalName: nextGoal?.name || null
      },
      pointsEarned
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    return errorResponse((error as Error).message);
  }
});
