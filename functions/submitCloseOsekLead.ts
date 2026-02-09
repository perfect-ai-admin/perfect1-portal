import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        if (!payload.name || !payload.phone) {
            return Response.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        // Create record in CloseOsekPaturCRM using service role
        const record = await base44.asServiceRole.entities.CloseOsekPaturCRM.create({
            full_name: payload.name,
            phone: payload.phone,
            notes: payload.source_page ? `הגיע מדף: ${payload.source_page}` : 'הגיע מדף סגירת עוסק פטור',
            income_tax_status: 'not_started',
            vat_status: 'not_started',
            national_insurance_status: 'not_started'
        });

        // Also create a Lead record so it shows in LeadsAdmin CRM
        try {
            await base44.asServiceRole.entities.Lead.create({
                name: payload.name,
                phone: payload.phone,
                source_page: payload.source_page || 'סגירת עוסק פטור',
                category: 'other',
                status: 'new',
                priority: 'medium',
                interaction_type: 'form',
                notes: 'סגירת עוסק פטור'
            });
        } catch (leadErr) {
            console.error('Failed to create Lead record:', leadErr);
        }

        // Send notification email
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: 'yosi5919@gmail.com',
                subject: `ליד חדש לסגירת עוסק פטור - ${payload.name}`,
                body: `
                    <div style="direction: rtl; font-family: Arial, sans-serif;">
                        <h2>ליד חדש לסגירת עוסק פטור 🎉</h2>
                        <p><strong>שם:</strong> ${payload.name}</p>
                        <p><strong>טלפון:</strong> ${payload.phone}</p>
                        <p><strong>מקור:</strong> ${payload.source_page || 'דף סגירת עוסק פטור'}</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
        }

        return Response.json({ success: true, record });
    } catch (error) {
        console.error('Error submitting close osek lead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});