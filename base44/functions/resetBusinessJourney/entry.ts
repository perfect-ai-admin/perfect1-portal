import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Archive the active business journey
        const existingJourneys = await base44.entities.BusinessJourney.filter({ user_id: user.id, status: 'active' });
        for (const journey of existingJourneys) {
            await base44.entities.BusinessJourney.update(journey.id, { status: 'archived' });
        }

        // Reset the business journey flags on user (for backward compatibility/UI flags)
        await base44.auth.updateMe({
            business_journey_completed: false,
            business_journey_answers: null,
            business_journey_completed_date: null,
            business_state: null,
            client_tasks: [],
            recommended_goal: null,
            active_journey_id: null
        });

        return Response.json({ 
            success: true, 
            message: 'Business journey has been reset successfully. You can now start fresh.' 
        });

    } catch (error) {
        console.error('Error resetting business journey:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});