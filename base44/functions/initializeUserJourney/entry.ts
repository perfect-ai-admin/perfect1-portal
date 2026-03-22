import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Initialize journey and assign goals for a new user
 * Called after onboarding questionnaire completion
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create BusinessJourney record
    const journey = await base44.entities.BusinessJourney.create({
      user_id: user.id,
      status: 'active',
      stage: 'idea',
      journey_progress_percent: 0,
      completed_goals: []
    });

    // Create 7 initial goals
    const goalCodes = [
      'business_status',
      'idea_development',
      'first_customer',
      'open_business',
      'product_portfolio',
      'marketing_campaign',
      'weekly_target'
    ];

    const createdGoals = [];
    for (let i = 0; i < goalCodes.length; i++) {
      const status = i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'not_started';
      
      const goal = await base44.entities.Goal.create({
        goal_code: goalCodes[i],
        status,
        progress_percent: status === 'completed' ? 100 : 0,
        current_step: status === 'in_progress' ? 1 : 0
      });
      
      createdGoals.push(goal);
    }

    // Update journey with first goal
    await base44.entities.BusinessJourney.update(journey.id, {
      current_goal_code: goalCodes[1],
      journey_progress_percent: 14
    });

    return Response.json({
      success: true,
      journey_id: journey.id,
      goals_created: createdGoals.length,
      current_goal: goalCodes[1]
    });

  } catch (error) {
    console.error('Error initializing journey:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});