import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Distributed Lock למניעת race conditions
 * משתמש ב-CRMLead.processing_lock + TTL
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, lead_id, ttl_seconds } = await req.json();

        if (action === 'acquire') {
            const MAX_ATTEMPTS = 5;
            
            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
                try {
                    const lead = await base44.asServiceRole.entities.CRMLead.get(lead_id);
                    
                    // בדוק אם יש נעילה פעילה
                    if (lead.processing_lock) {
                        const lockExpires = new Date(lead.lock_expires_at);
                        if (lockExpires > new Date()) {
                            // נעול - המתן
                            await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
                            continue;
                        }
                        // הנעילה פגה - נמשיך
                    }
                    
                    // נסה לקבל נעילה
                    const expiresAt = new Date();
                    expiresAt.setSeconds(expiresAt.getSeconds() + (ttl_seconds || 30));
                    
                    await base44.asServiceRole.entities.CRMLead.update(lead_id, {
                        processing_lock: true,
                        lock_expires_at: expiresAt.toISOString()
                    });
                    
                    return Response.json({ 
                        lock_acquired: true,
                        expires_at: expiresAt.toISOString() 
                    });
                    
                } catch (err) {
                    if (attempt === MAX_ATTEMPTS - 1) {
                        throw new Error('Could not acquire lock after ' + MAX_ATTEMPTS + ' attempts');
                    }
                }
            }
        }

        if (action === 'release') {
            await base44.asServiceRole.entities.CRMLead.update(lead_id, {
                processing_lock: false,
                lock_expires_at: null
            });
            
            return Response.json({ lock_released: true });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});