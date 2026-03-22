import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * WhatsApp Middleware - בודק סטטוס משתמש לפני שליחת הודעות
 * מונע שליחת הודעות WhatsApp ממנטורים למשתמשים שאינם במצב 'active'
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { phone, userId, message, agentName } = await req.json();

        // 1. אימות פרמטרים
        if (!phone && !userId) {
            return Response.json({ 
                error: 'Missing phone or userId',
                canSend: false 
            }, { status: 400 });
        }

        // 2. מצא את המשתמש
        let user;
        if (userId) {
            try {
                const users = await base44.asServiceRole.entities.User.filter({ id: userId });
                user = users[0];
            } catch (error) {
                console.error('Error fetching user by ID:', error);
            }
        }

        if (!user && phone) {
            try {
                const users = await base44.asServiceRole.entities.User.filter({ 
                    phone: phone.replace(/[^0-9+]/g, '') 
                });
                user = users[0];
            } catch (error) {
                console.error('Error fetching user by phone:', error);
            }
        }

        if (!user) {
            return Response.json({ 
                error: 'User not found',
                canSend: false,
                reason: 'user_not_found'
            }, { status: 404 });
        }

        // 3. בדוק סטטוס המשתמש
        const userStatus = user.status || 'active'; // ברירת מחדל: active

        if (userStatus === 'blocked') {
            return Response.json({
                canSend: false,
                reason: 'user_blocked',
                message: 'המשתמש חסום - לא ניתן לשלוח הודעות WhatsApp',
                userStatus: userStatus
            });
        }

        if (userStatus === 'paused') {
            return Response.json({
                canSend: false,
                reason: 'user_paused',
                message: 'המשתמש מושהה - לא מקבל הודעות WhatsApp ממנטורים',
                userStatus: userStatus,
                note: 'המשתמש עדיין יכול לגשת למערכת אך לא מקבל הודעות WhatsApp'
            });
        }

        // 4. משתמש פעיל - אפשר לשלוח
        return Response.json({
            canSend: true,
            userStatus: userStatus,
            userId: user.id,
            userName: user.full_name,
            message: 'ניתן לשלוח הודעת WhatsApp'
        });

    } catch (error) {
        console.error('WhatsApp Middleware error:', error);
        return Response.json({ 
            error: error.message,
            canSend: false 
        }, { status: 500 });
    }
});