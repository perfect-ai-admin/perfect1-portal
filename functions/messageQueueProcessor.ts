import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * עיבוד תור הודעות WhatsApp
 * מבטיח delivery + retry + tracking
 */

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, queue_id, phone_normalized, message_content, agent_name, lead_id, priority } = await req.json();

        if (action === 'enqueue') {
            // הוסף להודעה לתור
            const queueItem = await base44.asServiceRole.entities.MessageQueue.create({
                lead_id: lead_id,
                phone_normalized: phone_normalized,
                message_content: message_content,
                priority: priority || 1,
                status: 'queued',
                agent_name: agent_name,
                scheduled_for: new Date().toISOString()
            });

            return Response.json({ 
                success: true, 
                queue_id: queueItem.id,
                message: 'Message queued for delivery'
            });
        }

        if (action === 'process_next') {
            // שלוף הודעה בעדיפות הכי גבוהה
            const pending = await base44.asServiceRole.entities.MessageQueue.filter(
                { status: 'queued' },
                '-priority,-created_date',
                1
            );

            if (pending.length === 0) {
                return Response.json({ message: 'Queue empty' });
            }

            const item = pending[0];

            // עדכן לsending
            await base44.asServiceRole.entities.MessageQueue.update(item.id, {
                status: 'sending'
            });

            // שלח דרך Green API
            const instanceId = Deno.env.get('GREENAPI_INSTANCE_ID');
            const apiToken = Deno.env.get('GREENAPI_API_TOKEN');

            if (!instanceId || !apiToken) {
                throw new Error('Green-API credentials missing');
            }

            const url = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
            const payload = {
                chatId: `${item.phone_normalized}@c.us`,
                message: item.message_content
            };

            try {
                const response = await Promise.race([
                    fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('TIMEOUT')), 20000)
                    )
                ]);

                const result = await response.json();

                if (response.ok && result.idMessage) {
                    // הצלחה
                    await base44.asServiceRole.entities.MessageQueue.update(item.id, {
                        status: 'sent',
                        sent_at: new Date().toISOString(),
                        green_api_message_id: result.idMessage
                    });

                    // עדכן CRMLead
                    if (item.lead_id) {
                        await base44.asServiceRole.entities.CRMLead.update(item.lead_id, {
                            last_outbound_at: new Date().toISOString(),
                            last_bot_message_id: result.idMessage
                        });
                    }

                    return Response.json({ 
                        success: true,
                        message_id: result.idMessage,
                        phone: item.phone_normalized
                    });
                } else {
                    throw new Error('Green-API returned error: ' + JSON.stringify(result));
                }

            } catch (sendErr) {
                // נכשל - retry או fail
                const retryCount = item.retry_count || 0;
                
                if (retryCount < 3) {
                    await base44.asServiceRole.entities.MessageQueue.update(item.id, {
                        status: 'queued',
                        retry_count: retryCount + 1,
                        last_error: sendErr.message
                    });
                    
                    return Response.json({ 
                        success: false,
                        retry_scheduled: true,
                        attempt: retryCount + 1
                    });
                } else {
                    await base44.asServiceRole.entities.MessageQueue.update(item.id, {
                        status: 'failed',
                        last_error: sendErr.message
                    });
                    
                    return Response.json({ 
                        success: false,
                        failed_permanently: true,
                        error: sendErr.message
                    });
                }
            }
        }

        if (action === 'get_stats') {
            const queued = await base44.asServiceRole.entities.MessageQueue.filter({ status: 'queued' });
            const failed = await base44.asServiceRole.entities.MessageQueue.filter({ status: 'failed' });
            
            return Response.json({
                queued_count: queued.length,
                failed_count: failed.length
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});