import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Initialize journey for a new user
 * This is a legacy function - the main journey creation is done by analyzeBusinessJourney
 * This function now just creates a basic BusinessJourney record if one doesn't exist
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

    // Check if user already has an active journey
    const existingJourneys = await base44.entities.BusinessJourney.filter({ 
      user_id: user.id, 
      status: 'active' 
    });

    if (existingJourneys.length > 0) {
      return Response.json({
        success: true,
        journey_id: existingJourneys[0].id,
        message: 'Journey already exists'
      });
    }

    // Create a basic BusinessJourney record
    const journey = await base44.entities.BusinessJourney.create({
      user_id: user.id,
      status: 'active',
      stage: 'idea',
      journey_progress_percent: 0,
      completed_goals: []
    });

    return Response.json({
      success: true,
      journey_id: journey.id,
      message: 'Journey initialized - complete questionnaire for personalized plan'
    });

  } catch (error) {
    console.error('Error initializing journey:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});