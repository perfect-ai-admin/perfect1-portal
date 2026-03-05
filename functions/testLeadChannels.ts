import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pageId } = await req.json();
        if (!pageId) {
            return Response.json({ error: 'pageId is required' }, { status: 400 });
        }

        // Fetch landing page
        const landingPages = await base44.asServiceRole.entities.LandingPage.filter({ id: pageId });
        if (!landingPages || landingPages.length === 0) {
            return Response.json({ error: 'Landing page not found' }, { status: 404 });
        }
        const page = landingPages[0];

        let channels = page.lead_channels || [];
        if (channels.length === 0 && page.lead_destination) {
            channels = [page.lead_destination];
        }
        if (channels.length === 0) {
            channels = ['n8n'];
        }

        const destPhone = page.destination_phone || '';
        const destEmail = page.destination_email || '';
        const businessName = page.business_name || 'דף נחיתה';

        const testName = '🧪 ליד מבחן';
        const testPhone = '050-0000000';
        const testEmail = 'test@example.com';
        const testMessage = 'זהו ליד מבחן לבדיקת הערוצים. ניתן להתעלם.';

        const results = {};

        // Test each channel
        for (const channel of channels) {
            try {
                if (channel === 'n8n') {
                    const N8N_URL = Deno.env.get('N8N_WEBHOOK_URL');
                    if (N8N_URL) {
                        const resp = await fetch(N8N_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: testName, phone: testPhone, email: testEmail,
                                message: testMessage, businessName,
                                timestamp: new Date().toISOString(), source: 'test', status: 'test'
                            })
                        });
                        results.n8n = { success: resp.ok, status: resp.status };
                    } else {
                        results.n8n = { success: false, error: 'N8N URL not configured' };
                    }
                }

                if (channel === 'webhook') {
                    const webhookUrl = page.webhook_url;
                    if (webhookUrl) {
                        const webhookHeaders = page.webhook_headers || {};
                        const resp = await fetch(webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', ...webhookHeaders },
                            body: JSON.stringify({
                                name: testName, phone: testPhone, email: testEmail,
                                message: testMessage, source: businessName,
                                timestamp: new Date().toISOString(), test: true
                            })
                        });
                        results.webhook = { success: resp.ok, status: resp.status };
                    } else {
                        results.webhook = { success: false, error: 'Webhook URL not configured' };
                    }
                }

                if (channel === 'whatsapp' || channel === 'phone') {
                    if (destPhone) {
                        const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
                        const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');
                        if (greenApiToken && greenApiInstance) {
                            const cleanPhone = destPhone.replace(/[^0-9]/g, '');
                            const fullPhone = cleanPhone.startsWith('972') ? cleanPhone :
                                cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;
                            const msg = channel === 'phone'
                                ? `🧪 ליד מבחן! ${testName} - ${testPhone} - מ${businessName}`
                                : `🧪 *ליד מבחן - בדיקת ערוצים*\n\n👤 שם: ${testName}\n📱 טלפון: ${testPhone}\n📧 מייל: ${testEmail}\n💬 הודעה: ${testMessage}\n🏢 מקור: ${businessName}\n⏰ ${new Date().toLocaleString('he-IL')}`;

                            const resp = await fetch(`https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: msg })
                            });
                            results[channel] = { success: resp.ok, status: resp.status };
                        } else {
                            results[channel] = { success: false, error: 'Green API credentials missing' };
                        }
                    } else {
                        results[channel] = { success: false, error: 'Phone number not configured' };
                    }
                }

                if (channel === 'email') {
                    if (destEmail) {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            from_name: businessName,
                            to: destEmail,
                            subject: `🧪 ליד מבחן - בדיקת חיבור ערוצים`,
                            body: `
                                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 12px;">
                                    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 16px;">
                                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #92400e;">🧪 זהו ליד מבחן</p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #a16207;">נשלח כדי לוודא שהערוץ עובד כראוי</p>
                                    </div>
                                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                                        <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">שם:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${testName}</td></tr>
                                        <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">טלפון:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${testPhone}</td></tr>
                                        <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">מייל:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${testEmail}</td></tr>
                                        <tr><td style="padding: 10px; font-weight: bold;">הודעה:</td><td style="padding: 10px;">${testMessage}</td></tr>
                                    </table>
                                    <p style="text-align: center; margin-top: 16px; font-size: 11px; color: #9ca3af;">אם קיבלת מייל זה — ערוץ המייל מוגדר ועובד! ✅</p>
                                </div>
                            `
                        });
                        results.email = { success: true };
                    } else {
                        results.email = { success: false, error: 'Email not configured' };
                    }
                }
            } catch (err) {
                results[channel] = { success: false, error: err.message };
            }
        }

        return Response.json({ success: true, channels, results });
    } catch (error) {
        console.error('testLeadChannels error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});