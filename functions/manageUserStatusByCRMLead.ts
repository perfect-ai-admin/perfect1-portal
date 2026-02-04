import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * נרמול מספר טלפון לפורמט בינלאומי
 */
function normalizePhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    return cleaned;
}

/**
 * ניהול סטטוס משתמשים דרך CRMLead
 * כשיוזר משלים מסע עסק + ממלא טלפון -> הופך לפעיל
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { event, data } = body;

        if (event?.type !== 'update' || event?.entity_name !== 'CRMLead') {
            return Response.json({ message: 'Not a CRMLead update event' });
        }

        const lead = data || await base44.asServiceRole.entities.CRMLead.get(event.entity_id);
        
        if (!lead.email) {
            console.log('⏭️ Lead has no email, skipping');
            return Response.json({ message: 'No email' });
        }

        // מצא את היוזר המשויך
        const allUsers = await base44.asServiceRole.entities.User.list();
        const matchingUser = allUsers.find(u => u.email === lead.email);

        if (!matchingUser) {
            console.log('⏭️ No matching user found for:', lead.email);
            return Response.json({ message: 'No matching user' });
        }

        console.log('👤 Found user:', matchingUser.email, 'status:', matchingUser.status);

        // תנאי הפעלה החדשים: יוזר מושהה + יש מטרה פעילה + יש טלפון

        // בדיקת מטרות פעילות
        const activeGoals = await base44.asServiceRole.entities.UserGoal.filter({
            user_id: matchingUser.id,
            status: 'active'
        });

        // שימוש בטלפון מהליד או מהיוזר
        const phoneToUse = lead.phone || matchingUser.phone;

        if (matchingUser.status === 'paused' && 
            activeGoals.length > 0 && 
            phoneToUse) {
            
            const normalizedPhone = normalizePhoneNumber(phoneToUse);
            
            await base44.asServiceRole.entities.User.update(matchingUser.id, {
                status: 'active',
                phone: normalizedPhone
            });

            console.log('✅ User activated:', matchingUser.email, 'phone:', normalizedPhone);
            
            return Response.json({ 
                success: true, 
                user_email: matchingUser.email,
                status: 'active',
                phone: normalizedPhone 
            });
        }

        return Response.json({ message: 'No activation needed', user_status: matchingUser.status });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});