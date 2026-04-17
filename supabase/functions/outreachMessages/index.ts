import { supabaseAdmin, getUser, getCorsHeaders, jsonResponse, errorResponse, validateEmail } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const { action, ...payload } = await req.json();

    // send_approved is called by cron — no user auth needed
    if (action !== 'send_approved') {
      const user = await getUser(req);
      if (!user) return errorResponse('Unauthorized', 401, req);
    }

    switch (action) {
      case 'generate_drafts': {
        const { campaign_id } = payload;
        if (!campaign_id) return errorResponse('campaign_id required', 400, req);

        // Get campaign with template
        const { data: campaign, error: cErr } = await supabaseAdmin
          .from('outreach_campaigns')
          .select('*, outreach_email_templates!outreach_campaigns_initial_template_id_fkey(subject_template, body_template)')
          .eq('id', campaign_id)
          .single();
        if (cErr || !campaign) return errorResponse('Campaign not found', 404, req);

        const template = campaign.outreach_email_templates;
        if (!template) return errorResponse('No initial template configured for this campaign', 400, req);

        // Get approved websites with primary contacts
        const { data: websites } = await supabaseAdmin
          .from('outreach_websites')
          .select('id, domain, name, niche')
          .in('status', ['approved', 'reviewed'])
          .limit(200);

        if (!websites?.length) return jsonResponse({ message: 'No approved websites found', count: 0 }, 200, req);

        // Get contacts for these websites
        const websiteIds = websites.map(w => w.id);
        const { data: contacts } = await supabaseAdmin
          .from('outreach_contacts')
          .select('id, website_id, full_name, email, is_primary')
          .in('website_id', websiteIds)
          .order('is_primary', { ascending: false });

        // Map website_id → primary contact
        const contactMap: Record<string, typeof contacts[0]> = {};
        (contacts || []).forEach(c => {
          if (!contactMap[c.website_id]) contactMap[c.website_id] = c;
        });

        // Check existing messages for this campaign to avoid duplicates
        const { data: existing } = await supabaseAdmin
          .from('outreach_messages')
          .select('website_id')
          .eq('campaign_id', campaign_id)
          .eq('sequence_step', 'initial');
        const existingSet = new Set((existing || []).map(e => e.website_id));

        const drafts = [];
        for (const website of websites) {
          if (existingSet.has(website.id)) continue;
          const contact = contactMap[website.id];
          if (!contact) continue;

          const personalization = {
            name: contact.full_name || '',
            domain: website.domain,
            niche: website.niche || '',
            signature: 'יוסי, פרפקט וואן',
          };

          let subject = template.subject_template;
          let body = template.body_template;
          Object.entries(personalization).forEach(([key, val]) => {
            const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            subject = subject.replace(re, val);
            body = body.replace(re, val);
          });

          drafts.push({
            campaign_id,
            website_id: website.id,
            contact_id: contact.id,
            subject,
            body_html: body.replace(/\n/g, '<br>'),
            body_text: body,
            personalization_json: personalization,
            sequence_step: 'initial',
            status: 'queued',
          });
        }

        if (drafts.length > 0) {
          const { error: insertErr } = await supabaseAdmin
            .from('outreach_messages')
            .insert(drafts);
          if (insertErr) return errorResponse(insertErr.message, 500, req);
        }

        return jsonResponse({ message: `${drafts.length} drafts created`, count: drafts.length }, 200, req);
      }

      case 'send_approved': {
        // Called by cron — sends approved messages respecting daily limits
        const { data: campaigns } = await supabaseAdmin
          .from('outreach_campaigns')
          .select('id, daily_send_limit, sending_email')
          .eq('status', 'active');

        if (!campaigns?.length) return jsonResponse({ sent: 0 }, 200, req);

        // Check domain health — stop if bounce rate too high
        for (const campaign of campaigns) {
          const domain = campaign.sending_email.split('@')[1] || 'unknown';
          const { data: health } = await supabaseAdmin
            .from('outreach_domain_health')
            .select('bounce_rate, spam_warning_level')
            .eq('sending_domain', domain)
            .single();

          if (health && (Number(health.bounce_rate) > 0.05 || health.spam_warning_level === 'high')) {
            // Auto-pause campaign
            await supabaseAdmin
              .from('outreach_campaigns')
              .update({ status: 'paused', updated_at: new Date().toISOString() })
              .eq('id', campaign.id);
            continue;
          }

          // Count messages sent today for this campaign
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const { count: sentToday } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'sent')
            .gte('sent_at', todayStart.toISOString());

          const remaining = campaign.daily_send_limit - (sentToday || 0);
          if (remaining <= 0) continue;

          // Get approved messages to send
          const { data: toSend } = await supabaseAdmin
            .from('outreach_messages')
            .select('id, contact_id, subject, body_html, website_id')
            .eq('campaign_id', campaign.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true })
            .limit(remaining);

          if (!toSend?.length) continue;

          // Check do_not_contact guard
          const websiteIds = toSend.map(m => m.website_id);
          const { data: blockedSites } = await supabaseAdmin
            .from('outreach_websites')
            .select('id')
            .in('id', websiteIds)
            .eq('status', 'do_not_contact');
          const blockedSet = new Set((blockedSites || []).map(s => s.id));

          for (const msg of toSend) {
            if (blockedSet.has(msg.website_id)) {
              await supabaseAdmin.from('outreach_messages').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', msg.id);
              continue;
            }

            // Get contact email
            const { data: contact } = await supabaseAdmin
              .from('outreach_contacts')
              .select('email')
              .eq('id', msg.contact_id)
              .single();
            if (!contact?.email) continue;

            // Send via Resend
            try {
              const resendKey = Deno.env.get('RESEND_API_KEY');
              if (!resendKey) throw new Error('RESEND_API_KEY not configured');

              const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: `פרפקט וואן <${campaign.sending_email}>`,
                  to: [contact.email],
                  subject: msg.subject,
                  html: msg.body_html,
                  reply_to: `reply+${msg.id}@one-pai.com`,
                  headers: { 'X-Outreach-Message-Id': msg.id },
                }),
              });

              const resendData = await res.json();

              if (res.ok && resendData.id) {
                await supabaseAdmin
                  .from('outreach_messages')
                  .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    resend_message_id: resendData.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', msg.id);

                // Update website status
                await supabaseAdmin
                  .from('outreach_websites')
                  .update({ status: 'contacted', updated_at: new Date().toISOString() })
                  .eq('id', msg.website_id)
                  .in('status', ['approved', 'reviewed']);

                // Update domain health
                await supabaseAdmin.rpc('', {}).catch(() => {}); // noop
                await supabaseAdmin
                  .from('outreach_domain_health')
                  .update({
                    total_sent: supabaseAdmin.rpc ? undefined : undefined,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('sending_domain', domain);
                // Increment total_sent via raw SQL would be ideal, but for now just track
              } else {
                await supabaseAdmin
                  .from('outreach_messages')
                  .update({ status: 'failed', updated_at: new Date().toISOString() })
                  .eq('id', msg.id);
              }
            } catch (err) {
              console.error(`Failed to send message ${msg.id}:`, err);
              await supabaseAdmin
                .from('outreach_messages')
                .update({ status: 'failed', updated_at: new Date().toISOString() })
                .eq('id', msg.id);
            }

            // Random delay between sends (1-3 seconds)
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
          }
        }

        return jsonResponse({ success: true }, 200, req);
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400, req);
    }
  } catch (error) {
    console.error('outreachMessages error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
