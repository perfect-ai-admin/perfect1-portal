import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * אוטומציה: קובע יוזר חדש כ"מושהה" אוטומטית
 * רק ליוזרים חדשים מכאן והלאה
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { event, data } = body;

        if (event?.type !== 'create' || event?.entity_name !== 'User') {
            return Response.json({ message: 'Not a User create event' });
        }

        const userId = event.entity_id;
        console.log('👤 New user created:', userId);

        // עדכן ל-paused (רק אם הוא עדיין ללא סטטוס או active)
        const user = await base44.asServiceRole.entities.User.get(userId);
        
        if (!user.status || user.status === 'active') {
            await base44.asServiceRole.entities.User.update(userId, {
                status: 'paused'
            });
            console.log('✅ User set to paused:', user.email);
        }

        return Response.json({ success: true, user_id: userId, status: 'paused' });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});