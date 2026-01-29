import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generic webhook handler for triggering AI agents and managing goal mentor interactions
 * Implements the Perfect-1.one Webhook API Specification v1.0
 */
Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // Validate required fields
    if (!payload.customer?.phone || !payload.message) {
      return Response.json(
        { error: 'Missing required fields: customer.phone and message' },
        { status: 400 }
      );
    }

    const {
      source = 'webapp',
      event_type = 'user_interaction',
      customer,
      message,
      context = {},
      response_config = {}
    } = payload;

    // Get or create BusinessJourney for this user
    let journey = null;
    try {
      const journeys = await base44.entities.BusinessJourney.filter({ user_id: user.id });
      journey = journeys[0] || null;
    } catch (err) {
      console.log('No existing journey found, will create on next action');
    }

    // Route to N8N webhook
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!webhookUrl) {
      return Response.json({ error: 'N8N webhook not configured' }, { status: 500 });
    }

    // Build N8N payload
    const n8nPayload = {
      source,
      event_type,
      customer: {
        phone: customer.phone,
        name: customer.name || user.full_name,
        email: customer.email || user.email,
        external_id: user.id
      },
      message,
      context: {
        current_stage: context.current_stage || (journey?.stage ? 'goal_mentor' : 'lead_router'),
        current_goal_code: context.current_goal_code || journey?.current_goal_code || null,
        current_goal_step: context.current_goal_step || 1,
        goal_progress_percent: context.goal_progress_percent || 0,
        journey_progress_percent: journey?.journey_progress_percent || 0,
        completed_goals: journey?.completed_goals || [],
        session_id: journey?.session_id || `sess_${crypto.randomUUID()}`,
        ...context
      },
      response_config: {
        channel: 'webhook_response',
        language: 'he',
        ...response_config
      }
    };

    // Call N8N webhook
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8N webhook error:', n8nResponse.status, errorText);
      throw new Error(`N8N returned ${n8nResponse.status}`);
    }

    const n8nResult = await n8nResponse.json();

    // Update BusinessJourney if we got state updates
    if (n8nResult.goal_update && journey) {
      const updateData = {
        current_goal_code: n8nResult.goal_update.goal_code,
        journey_progress_percent: Math.floor((n8nResult.goal_update.progress_percent || 0)),
        last_webhook_sync: new Date().toISOString()
      };

      // Handle goal completion
      if (n8nResult.goal_update.complete_goal || n8nResult.goal_update.status === 'completed') {
        const completedGoals = journey.completed_goals || [];
        if (!completedGoals.includes(n8nResult.goal_update.goal_code)) {
          completedGoals.push(n8nResult.goal_update.goal_code);
        }
        updateData.completed_goals = completedGoals;
        updateData.current_goal_code = null;
        updateData.journey_progress_percent = Math.round((completedGoals.length / 7) * 100);
      }

      await base44.entities.BusinessJourney.update(journey.id, updateData);
    }

    return Response.json({
      success: true,
      request_id: payload.request_id || `req_${crypto.randomUUID()}`,
      response: n8nResult.response,
      goal_update: n8nResult.goal_update,
      ui_hints: n8nResult.ui_hints,
      memory_stored: n8nResult.memory_stored
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json(
      {
        success: false,
        error: {
          code: 'AGENT_ERROR',
          message: error.message
        }
      },
      { status: 500 }
    );
  }
});