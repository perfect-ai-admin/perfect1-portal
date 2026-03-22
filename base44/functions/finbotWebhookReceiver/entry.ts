import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Finbot Webhook Receiver
 * Receives events from Finbot and enqueues sync jobs
 * Events: customer.updated, document.created/updated, expense.created/updated
 * TODO: Adjust event format based on actual Finbot webhook documentation
 */
Deno.serve(async (req) => {
    try {
        // Validate webhook signature
        const webhookSecret = Deno.env.get('FINBOT_WEBHOOK_SECRET');
        
        if (webhookSecret) {
            const signature = req.headers.get('x-finbot-signature') || req.headers.get('x-webhook-signature');
            
            if (!signature) {
                console.warn('Webhook received without signature');
                return Response.json({ error: 'Missing signature' }, { status: 401 });
            }

            // TODO: Implement proper HMAC validation based on Finbot's signature format
            // For now, basic check
            if (signature !== webhookSecret) {
                console.warn('Invalid webhook signature');
                return Response.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const body = await req.json();
        console.log('Webhook received:', JSON.stringify(body).substring(0, 500));

        const { event, data: eventData, account_id } = body;

        if (!event || !account_id) {
            return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
        }

        // Use service role since webhooks don't have user auth
        const base44 = createClientFromRequest(req);

        // Find connection by account_id
        const connections = await base44.asServiceRole.entities.FinbotConnection.filter({
            finbot_account_id: account_id,
            status: 'connected'
        });

        if (!connections || connections.length === 0) {
            console.warn('No connection found for account:', account_id);
            return Response.json({ status: 'ignored', reason: 'no_connection' });
        }

        const connection = connections[0];
        const userId = connection.user_id;

        // Map event to sync job type
        let jobType = null;
        if (event.startsWith('customer.')) jobType = 'pull_customers';
        else if (event.startsWith('document.')) jobType = 'pull_documents';
        else if (event.startsWith('expense.')) jobType = 'pull_expenses';

        if (jobType) {
            // Create sync job
            await base44.asServiceRole.entities.FinbotSyncJob.create({
                user_id: userId,
                job_type: jobType,
                status: 'queued',
                scheduled_at: new Date().toISOString()
            });
        }

        // Log webhook event
        await base44.asServiceRole.entities.FinbotAuditLog.create({
            user_id: userId,
            action: `finbot.webhook.${event}`,
            entity_type: event.split('.')[0],
            entity_id: eventData?.id,
            request_data: body,
            success: true
        });

        return Response.json({ status: 'ok', job_type: jobType });
    } catch (error) {
        console.error('Webhook error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});