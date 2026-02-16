import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        const sourcePage = payload.source_page || 'WhatsApp Lead';
        const ctaLocation = payload.cta_location || 'unknown';
        const category = payload.category || 'other';
        const notes = payload.notes || 'ליד מוואטסאפ - ' + sourcePage;

        const lead = await base44.asServiceRole.entities.Lead.create({
            name: 'ליד וואטסאפ - ' + sourcePage,
            phone: 'ממתין לוואטסאפ',
            source_page: sourcePage,
            category: category,
            status: 'new',
            priority: 'medium',
            interaction_type: 'whatsapp_click',
            notes: notes + ' | כפתור: ' + ctaLocation
        });

        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: 'yosi5919@gmail.com',
                subject: 'קליק וואטסאפ חדש - ' + sourcePage,
                body: '<div style="direction:rtl;font-family:Arial,sans-serif"><h2>קליק וואטסאפ חדש!</h2><p>מקור: ' + sourcePage + '</p><p>כפתור: ' + ctaLocation + '</p><p>הליד נוצר ב-CRM.</p></div>'
            });
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
        }

        return Response.json({ success: true, lead_id: lead.id });
    } catch (error) {
        console.error('Error tracking whatsapp lead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});