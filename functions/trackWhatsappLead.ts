import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Track WhatsApp button clicks - analytics only, NO lead creation.
 * Leads are created only when the user actually sends a WhatsApp message
 * (handled by greenApiWebhook).
 */
Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        const sourcePage = payload.source_page || 'WhatsApp Click';
        const ctaLocation = payload.cta_location || 'unknown';

        console.log('WhatsApp button clicked - source:', sourcePage, 'cta:', ctaLocation);

        // Analytics only - no lead creation
        // Lead will be created when the user actually sends a WhatsApp message

        return Response.json({ success: true, tracked: true });
    } catch (error) {
        console.error('Error tracking whatsapp click:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});