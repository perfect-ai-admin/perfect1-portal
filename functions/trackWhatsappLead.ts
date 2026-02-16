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
        const notes = payload.notes || `ליד מוואטסאפ - ${sourcePage}`;

        // Create a Lead record in LeadsAdmin CRM
        const lead = await base44.asServiceRole.entities.Lead.create({
            name: `ליד וואטסאפ - ${sourcePage}`,
            phone: 'ממתין לוואטסאפ',
            source_page: sourcePage,
            category: category,
            status: 'new',
            priority: 'medium',
            interaction_type: 'whatsapp_click',
            notes: `${notes} | כפתור: ${ctaLocation} | ${new Date().toLocaleString('he-IL')}`
        });

        // Send notification email
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: 'yosi5919@gmail.com',
                subject: `קליק וואטסאפ חדש - ${sourcePage}`,
                body: `
                    <div style="direction: rtl; font-family: Arial, sans-serif;">
                        <h2>קליק וואטסאפ חדש! 📱</h2>
                        <p><strong>מקור:</strong> ${sourcePage}</p>
                        <p><strong>כפתור:</strong> ${ctaLocation}</p>
                        <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
                        <p><strong>הערות:</strong> ${notes}</p>
                        <hr/>
                        <p style="color: gray;">הליד נוצר ב-CRM. כשהלקוח ישלח הודעה בוואטסאפ - עדכן את הטלפון שלו בליד.</p>
                    </div>
                `
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