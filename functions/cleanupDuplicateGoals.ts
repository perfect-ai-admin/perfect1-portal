import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const userId = '695d476170d43f37f05394cb'; 
        
        const goals = await base44.asServiceRole.entities.UserGoal.filter({ user_id: userId });
        
        const badId = '6971e7c51319948eb97414a4';
        
        if (goals.find(g => g.id === badId)) {
            await base44.asServiceRole.entities.UserGoal.delete(badId);
            return Response.json({ success: true, deleted: badId });
        }

        return Response.json({ success: true, message: "Goal not found or already deleted" });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});