import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * מנגנון Idempotency מרכזי
 * מונע עיבוד כפול של אותה הודעה/פעולה
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, key, operation_type, ttl_hours } = await req.json();

        if (action === 'check') {
            // בדוק אם המפתח כבר עובד
            const existing = await base44.asServiceRole.entities.IdempotencyKey.filter({ key }, '-created_date', 1);
            
            if (existing.length > 0) {
                const record = existing[0];
                const expiresAt = new Date(record.expires_at);
                
                if (expiresAt > new Date()) {
                    return Response.json({
                        already_processed: true,
                        processed_at: record.processed_at,
                        result: record.result
                    });
                } else {
                    // פג תוקף - מחק ותן לעבד מחדש
                    await base44.asServiceRole.entities.IdempotencyKey.delete(record.id);
                }
            }
            
            return Response.json({ already_processed: false });
        }

        if (action === 'mark_processed') {
            const { result } = await req.json();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + (ttl_hours || 24));
            
            await base44.asServiceRole.entities.IdempotencyKey.create({
                key,
                operation_type,
                processed_at: new Date().toISOString(),
                result: result || {},
                expires_at: expiresAt.toISOString()
            });
            
            return Response.json({ success: true });
        }

        if (action === 'cleanup_expired') {
            // ניקוי מפתחות שפג תוקפם
            const expired = await base44.asServiceRole.entities.IdempotencyKey.filter({
                expires_at: { $lt: new Date().toISOString() }
            });
            
            for (const record of expired) {
                await base44.asServiceRole.entities.IdempotencyKey.delete(record.id);
            }
            
            return Response.json({ cleaned: expired.length });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});