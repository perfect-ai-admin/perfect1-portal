import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goalCode, pointsEarned = 100 } = await req.json();

    // Get user's journey
    const journeys = await base44.entities.BusinessJourney.filter(
      { user_id: user.email },
      '-updated_date',
      1
    );

    if (!journeys || journeys.length === 0) {
      return Response.json({ error: 'No journey found' }, { status: 404 });
    }

    const journey = journeys[0];
    const completedGoals = journey.completed_goals || [];

    if (!completedGoals.includes(goalCode)) {
      completedGoals.push(goalCode);
    }

    // Calculate progress
    const totalGoals = 7;
    const newProgress = Math.round((completedGoals.length / totalGoals) * 100);

    // Update journey
    await base44.entities.BusinessJourney.update(journey.id, {
      completed_goals: completedGoals,
      journey_progress_percent: newProgress,
      current_goal_code: null, // Clear current goal
      last_webhook_sync: new Date().toISOString()
    });

    // Get next goal
    const allGoals = await base44.entities.Goal.list('-display_order', 7);
    const nextGoal = allGoals.find(g => !completedGoals.includes(g.goal_code));

    return Response.json({
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});