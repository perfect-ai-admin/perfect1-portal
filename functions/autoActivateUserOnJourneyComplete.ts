import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * נרמול מספר טלפון לפורמט בינלאומי (ישראלי)
 */
function normalizePhoneNumber(phone) {
    if (!phone) return null;
    
    // הסר רווחים, מקפים, סוגריים, ופלוס
    let cleaned = phone.toString().replace(/[\s\-\(\)\+]/g, '');
    
    // אם מתחיל ב-0, החלף ב-972
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    }
    
    // אם לא מתחיל ב-972, הוסף
    if (!cleaned.startsWith('972')) {
        cleaned = '972' + cleaned;
    }
    
    return cleaned;
}

/**
 * אוטומציה: כשיוזר משלים מסע עסק + ממלא טלפון -> עובר לפעיל
 * רק ליוזרים שסטטוס שלהם paused (לא נוגע בפעילים קיימים)
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { event, data, old_data } = body;

        if (event?.type !== 'update' || event?.entity_name !== 'User') {
            return Response.json({ message: 'Not a User update event' });
        }

        const userId = event.entity_id;
        const user = data || await base44.asServiceRole.entities.User.get(userId);

        console.log('🔄 User updated:', user.email, 'status:', user.status);

        // תנאים להפעלה:
        // 1. יוזר במצב "paused" (לא נוגעים בפעילים קיימים!)
        // 2. השלים את מסע העסק
        // 3. יש לו טלפון
        if (user.status === 'paused' && 
            user.business_journey_completed && 
            user.phone) {
            
            const normalizedPhone = normalizePhoneNumber(user.phone);
            
            await base44.asServiceRole.entities.User.update(userId, {
                status: 'active',
                phone: normalizedPhone
            });

            console.log('✅ User activated:', user.email, 'phone normalized:', normalizedPhone);
            
            return Response.json({ 
                success: true, 
                user_id: userId, 
                status: 'active',
                phone: normalizedPhone 
            });
        }

        return Response.json({ message: 'No action needed', user_status: user.status });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});