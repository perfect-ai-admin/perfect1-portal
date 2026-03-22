import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        if (req.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
        }

        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        // Validate required fields
        if (!payload.name || !payload.phone) {
            return Response.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        // Create lead using service role to bypass RLS (Row Level Security)
        const lead = await base44.asServiceRole.entities.Lead.create({
            name: payload.name,
            phone: payload.phone,
            email: payload.email,
            profession: payload.profession,
            source_page: payload.source_page || 'דף נחיתה - פתיחת עוסק פטור',
            status: 'new',
            interaction_type: payload.interaction_type || 'form',
            priority: 'medium',
            utm_source: payload.utm_source || '',
            utm_medium: payload.utm_medium || '',
            utm_campaign: payload.utm_campaign || '',
            utm_term: payload.utm_term || '',
            utm_content: payload.utm_content || '',
            referrer: payload.referrer || ''
        });

        // Handle Email Notification if needed
        try {
            // Try to find the landing page to get the destination email
            // We search by exact match on business_name or checking if source_page contains business_name or just assume source_page is the title
            // A better way would be passing landing_page_id, but for now we try to find by source_page matching headline or business_name
            // Or if passed landing_page_id directly
            
            let destinationEmail = null;
            
            if (payload.landing_page_id) {
                const lp = await base44.asServiceRole.entities.LandingPage.get(payload.landing_page_id);
                if (lp && lp.destination_email) {
                    destinationEmail = lp.destination_email;
                }
            } else if (payload.source_page) {
                // Try to find by business name or headline matching the source_page
                // This is a fallback and might be fuzzy
                const lps = await base44.asServiceRole.entities.LandingPage.list({
                     limit: 1,
                     filter: { business_name: payload.source_page } 
                });
                if (lps && lps.length > 0 && lps[0].destination_email) {
                    destinationEmail = lps[0].destination_email;
                }
            }

            if (destinationEmail) {
                const resendApiKey = Deno.env.get('RESEND_API_KEY');
                if (resendApiKey) {
                     await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${resendApiKey}`
                        },
                        body: JSON.stringify({
                            from: 'One-Pai Notification <no-reply@one-pai.com>',
                            to: [destinationEmail],
                            subject: `ליד חדש התקבל! - ${payload.name}`,
                            html: `
                                <div style="direction: rtl; font-family: Arial, sans-serif;">
                                    <h2>ליד חדש התקבל! 🎉</h2>
                                    <p><strong>שם:</strong> ${payload.name}</p>
                                    <p><strong>טלפון:</strong> ${payload.phone}</p>
                                    <p><strong>אימייל:</strong> ${payload.email || 'לא צוין'}</p>
                                    <p><strong>מקצוע:</strong> ${payload.profession || 'לא צוין'}</p>
                                    <p><strong>מקור:</strong> ${payload.source_page || 'דף נחיתה'}</p>
                                </div>
                            `
                        })
                    });
                } else {
                     // Fallback to internal email sender
                     await base44.integrations.Core.SendEmail({
                        to: destinationEmail,
                        subject: `ליד חדש התקבל! - ${payload.name}`,
                        body: `
                            <div style="direction: rtl; font-family: Arial, sans-serif;">
                                <h2>ליד חדש התקבל! 🎉</h2>
                                <p><strong>שם:</strong> ${payload.name}</p>
                                <p><strong>טלפון:</strong> ${payload.phone}</p>
                                <p><strong>אימייל:</strong> ${payload.email || 'לא צוין'}</p>
                                <p><strong>מקצוע:</strong> ${payload.profession || 'לא צוין'}</p>
                                <p><strong>מקור:</strong> ${payload.source_page || 'דף נחיתה'}</p>
                            </div>
                        `
                    });
                }
            } else {
                // If no destination email configured, send to default or log
                console.log('No destination email found for lead notification');
                 // Optional: Send to default admin email if needed
                 await base44.integrations.Core.SendEmail({
                    to: 'yosi5919@gmail.com', // Default admin
                    subject: `ליד חדש (Admin Copy) - ${payload.name}`,
                    body: `New lead from ${payload.source_page}: ${payload.name}, ${payload.phone}`
                });
            }

        } catch (emailError) {
            console.error('Error sending lead email:', emailError);
            // Don't fail the request if email fails, but log it
        }

        return Response.json({ success: true, lead });
    } catch (error) {
        console.error('Error submitting lead:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});