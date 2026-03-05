import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { name, phone, email, message, pageSlug, businessName } = await req.json();

        if (!phone) {
            return Response.json({ error: 'Phone is required' }, { status: 400 });
        }

        // 1. Find the landing page by slug to get lead destination settings
        let landingPage = null;
        if (pageSlug) {
            try {
                const pages = await base44.asServiceRole.entities.LandingPage.filter({ slug: pageSlug });
                if (pages && pages.length > 0) {
                    landingPage = pages[0];
                }
            } catch (e) {
                console.warn('Could not find landing page by slug:', e.message);
            }
        }

        const leadDestination = landingPage?.lead_destination || 'n8n';
        const destPhone = landingPage?.destination_phone || '';
        const destEmail = landingPage?.destination_email || '';

        console.log(`Lead destination: ${leadDestination}, phone: ${destPhone}, email: ${destEmail}`);

        // 2. Always save to CRM (Lead entity)
        const leadData = {
            name: name || 'אתר',
            phone: phone.trim(),
            email: email || '',
            notes: message || '',
            source_page: businessName || pageSlug || 'landing-page',
            interaction_type: 'form',
            status: 'new',
            priority: 'medium'
        };

        const leadResult = await base44.asServiceRole.entities.Lead.create(leadData);
        console.log('Lead saved to CRM:', leadResult.id);

        // 3. Also save to CRMLead for per-user CRM view
        try {
            const crmLeadData = {
                full_name: name || 'אתר',
                phone: phone.trim(),
                email: email || '',
                source: businessName || 'Landing Page',
                page_url: pageSlug ? `https://one-pai.com/LP?s=${pageSlug}` : '',
                status: 'new',
                journey_stage: 'lead_new'
            };
            // If landing page has a created_by (owner), link to their user_id
            if (landingPage?.created_by) {
                // Find the user by email to get their id
                try {
                    const users = await base44.asServiceRole.entities.User.filter({ email: landingPage.created_by });
                    if (users && users.length > 0) {
                        crmLeadData.user_id = users[0].id;
                    }
                } catch (e) {
                    console.warn('Could not find user for CRMLead:', e.message);
                }
            }
            await base44.asServiceRole.entities.CRMLead.create(crmLeadData);
            console.log('CRMLead created');
        } catch (crmErr) {
            console.warn('CRMLead creation failed (non-critical):', crmErr.message);
        }

        // 4. Send to external CRM webhook if configured
        if (leadDestination === 'webhook') {
            const webhookUrl = landingPage?.webhook_url;
            const webhookHeaders = landingPage?.webhook_headers || {};
            if (webhookUrl) {
                try {
                    const webhookPayload = {
                        name: name || '',
                        phone: phone.trim(),
                        email: email || '',
                        message: message || '',
                        source: businessName || pageSlug || 'landing-page',
                        page_url: pageSlug ? `https://one-pai.com/LP?s=${pageSlug}` : '',
                        timestamp: new Date().toISOString(),
                        lead_id: leadResult.id
                    };
                    const webhookResp = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...webhookHeaders },
                        body: JSON.stringify(webhookPayload)
                    });
                    console.log('External webhook status:', webhookResp.status);
                } catch (whErr) {
                    console.warn('External webhook failed:', whErr.message);
                }
            } else {
                console.warn('Webhook destination selected but no URL configured');
            }
        }

        // 5. Send notifications based on lead_destination setting
        const notifications = [];

        // Always try N8N if destination is n8n
        if (leadDestination === 'n8n') {
            const N8N_URL = Deno.env.get('N8N_WEBHOOK_URL');
            if (N8N_URL) {
                notifications.push(
                    fetch(N8N_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: name || 'אתר', phone, email: email || '',
                            message: message || '', pageSlug, businessName,
                            timestamp: new Date().toISOString(), source: 'landing-page', status: 'new'
                        })
                    }).then(r => console.log('N8N status:', r.status)).catch(e => console.warn('N8N failed:', e.message))
                );
            }
        }

        // WhatsApp notification
        if ((leadDestination === 'whatsapp' || leadDestination === 'n8n') && destPhone) {
            const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
            const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');
            if (greenApiToken && greenApiInstance) {
                const cleanPhone = destPhone.replace(/[^0-9]/g, '');
                const fullPhone = cleanPhone.startsWith('972') ? cleanPhone : 
                                  cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;
                const waMessage = `🎯 *ליד חדש מדף הנחיתה!*\n\n👤 שם: ${name || 'לא צוין'}\n📱 טלפון: ${phone}\n📧 מייל: ${email || 'לא צוין'}\n💬 הודעה: ${message || 'אין'}\n🏢 מקור: ${businessName || pageSlug || 'דף נחיתה'}\n⏰ ${new Date().toLocaleString('he-IL')}`;

                notifications.push(
                    fetch(`https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chatId: `${fullPhone}@c.us`,
                            message: waMessage
                        })
                    }).then(r => console.log('WhatsApp status:', r.status)).catch(e => console.warn('WhatsApp failed:', e.message))
                );
            } else {
                console.warn('WhatsApp configured but GREEN API credentials missing');
            }
        }

        // Email notification
        if ((leadDestination === 'email' || leadDestination === 'n8n') && destEmail) {
            notifications.push(
                base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: businessName || 'Lead.im',
                    to: destEmail,
                    subject: `🎯 ליד חדש מדף הנחיתה - ${name || 'ללא שם'}`,
                    body: `
                        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0; font-size: 22px;">🎯 ליד חדש התקבל!</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">${businessName || 'דף הנחיתה שלך'}</p>
                            </div>
                            <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F; width: 100px;">שם:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${name || 'לא צוין'}</td></tr>
                                    <tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">טלפון:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="tel:${phone}" style="color: #27AE60; font-weight: bold;">${phone}</a></td></tr>
                                    ${email ? `<tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">מייל:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}">${email}</a></td></tr>` : ''}
                                    ${message ? `<tr><td style="padding: 10px; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #1E3A5F;">הודעה:</td><td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${message}</td></tr>` : ''}
                                </table>
                                <div style="margin-top: 20px; text-align: center;">
                                    <a href="tel:${phone}" style="display: inline-block; background: #27AE60; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">☎️ התקשר עכשיו</a>
                                </div>
                            </div>
                        </div>
                    `
                }).then(() => console.log('Email sent to:', destEmail)).catch(e => console.warn('Email failed:', e.message))
            );
        }

        // SMS notification (phone destination)
        if (leadDestination === 'phone' && destPhone) {
            // For SMS, send via email as fallback (no SMS provider configured)
            // At minimum, send WhatsApp
            const greenApiToken = Deno.env.get('GREENAPI_API_TOKEN');
            const greenApiInstance = Deno.env.get('GREENAPI_INSTANCE_ID');
            if (greenApiToken && greenApiInstance) {
                const cleanPhone = destPhone.replace(/[^0-9]/g, '');
                const fullPhone = cleanPhone.startsWith('972') ? cleanPhone : 
                                  cleanPhone.startsWith('0') ? '972' + cleanPhone.substring(1) : '972' + cleanPhone;
                const smsMessage = `ליד חדש! ${name || ''} - ${phone} - מ${businessName || 'דף נחיתה'}`;
                notifications.push(
                    fetch(`https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chatId: `${fullPhone}@c.us`, message: smsMessage })
                    }).then(r => console.log('SMS/WA status:', r.status)).catch(e => console.warn('SMS/WA failed:', e.message))
                );
            }
        }

        // Wait for all notifications (non-blocking - don't fail if any notification fails)
        if (notifications.length > 0) {
            await Promise.allSettled(notifications);
        }

        return Response.json({
            success: true,
            message: 'Lead saved and notifications sent',
            leadId: leadResult.id,
            destination: leadDestination
        });

    } catch (error) {
        console.error('submitLeadToN8N error:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to process lead'
        }, { status: 500 });
    }
});