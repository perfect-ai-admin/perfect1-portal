import { supabaseAdmin, getUser, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Niches that are direct competitors — skip them in outreach
const COMPETITOR_NICHES = ['רואה חשבון', 'רו"ח', "רו''ח", 'accountant', 'accounting', 'bookkeeping', 'הנהלת חשבונות', 'רואי חשבון'];

function isCompetitor(niche: string): boolean {
  if (!niche) return false;
  const lower = niche.toLowerCase();
  return COMPETITOR_NICHES.some(n => lower.includes(n.toLowerCase()));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const { action, ...payload } = await req.json();

    // cron actions — no user auth needed
    const cronActions = ['send_approved', 'schedule_queued'];
    if (!cronActions.includes(action)) {
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

        // Get approved websites with primary contacts — exclude competitors
        const { data: websites } = await supabaseAdmin
          .from('outreach_websites')
          .select('id, domain, name, niche')
          .in('status', ['approved', 'reviewed'])
          .limit(300);

        if (!websites?.length) return jsonResponse({ message: 'No approved websites found', count: 0 }, 200, req);

        // Filter out competitors
        const filteredWebsites = websites.filter(w => !isCompetitor(w.niche || ''));
        const skippedCompetitors = websites.length - filteredWebsites.length;

        // Get contacts for these websites
        const websiteIds = filteredWebsites.map(w => w.id);
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
        for (const website of filteredWebsites) {
          if (existingSet.has(website.id)) continue;
          const contact = contactMap[website.id];
          if (!contact) continue;

          const personalization = {
            contact_name: contact.full_name || '',
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
            // scheduled_for is set by schedule_queued action
          });
        }

        if (drafts.length > 0) {
          const { error: insertErr } = await supabaseAdmin
            .from('outreach_messages')
            .insert(drafts);
          if (insertErr) return errorResponse(insertErr.message, 500, req);
        }

        return jsonResponse({
          message: `${drafts.length} drafts created`,
          count: drafts.length,
          skipped_competitors: skippedCompetitors,
        }, 200, req);
      }

      case 'schedule_queued': {
        // Called by cron after generate_drafts — assigns scheduled_for and moves queued → approved
        // Respects daily_send_limit per campaign. Default 12/day if NULL.
        const { data: campaigns } = await supabaseAdmin
          .from('outreach_campaigns')
          .select('id, daily_send_limit, sending_email')
          .eq('status', 'active');

        if (!campaigns?.length) return jsonResponse({ scheduled: 0 }, 200, req);

        let totalScheduled = 0;

        for (const campaign of campaigns) {
          const dailyLimit = campaign.daily_send_limit || 12;

          // Get all unscheduled queued messages for this campaign
          const { data: queued } = await supabaseAdmin
            .from('outreach_messages')
            .select('id, created_at')
            .eq('campaign_id', campaign.id)
            .eq('status', 'queued')
            .is('scheduled_for', null)
            .order('created_at', { ascending: true });

          if (!queued?.length) continue;

          // Count already-approved (but not yet sent) messages per day to calculate offset
          // Also count how many are already scheduled per day to fill slots fairly
          const { data: alreadyScheduled } = await supabaseAdmin
            .from('outreach_messages')
            .select('scheduled_for')
            .eq('campaign_id', campaign.id)
            .eq('status', 'approved')
            .not('scheduled_for', 'is', null)
            .gte('scheduled_for', new Date().toISOString());

          // Build a map of date → count already scheduled
          const scheduledPerDay: Record<string, number> = {};
          (alreadyScheduled || []).forEach(m => {
            const day = m.scheduled_for.slice(0, 10);
            scheduledPerDay[day] = (scheduledPerDay[day] || 0) + 1;
          });

          // Also count messages SENT today
          const todayStr = new Date().toISOString().slice(0, 10);
          const { count: sentToday } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'sent')
            .gte('sent_at', `${todayStr}T00:00:00.000Z`)
            .lte('sent_at', `${todayStr}T23:59:59.999Z`);

          scheduledPerDay[todayStr] = (scheduledPerDay[todayStr] || 0) + (sentToday || 0);

          // Assign scheduled_for dates respecting daily_limit
          const updates: Array<{ id: string; scheduled_for: string }> = [];
          let currentDate = new Date();
          // Start from tomorrow 09:00 Israel time (UTC+3)
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setUTCHours(6, 0, 0, 0); // 06:00 UTC = 09:00 Israel

          for (const msg of queued) {
            let assigned = false;
            // Try up to 365 days to find a slot
            for (let attempt = 0; attempt < 365; attempt++) {
              const dayKey = currentDate.toISOString().slice(0, 10);
              const usedToday = scheduledPerDay[dayKey] || 0;

              if (usedToday < dailyLimit) {
                scheduledPerDay[dayKey] = usedToday + 1;
                updates.push({
                  id: msg.id,
                  scheduled_for: currentDate.toISOString(),
                });
                // Advance send time within the day by ~30 min per message
                currentDate = new Date(currentDate.getTime() + 30 * 60 * 1000);
                if (currentDate.getUTCHours() > 14) {
                  // Past 17:00 Israel time — move to next day 09:00
                  currentDate.setDate(currentDate.getDate() + 1);
                  currentDate.setUTCHours(6, 0, 0, 0);
                }
                assigned = true;
                break;
              } else {
                // Day full — next day
                currentDate.setDate(currentDate.getDate() + 1);
                currentDate.setUTCHours(6, 0, 0, 0);
              }
            }
            if (!assigned) break; // Should never happen
          }

          // Batch update: set scheduled_for + status='approved'
          for (const u of updates) {
            await supabaseAdmin
              .from('outreach_messages')
              .update({ scheduled_for: u.scheduled_for, status: 'approved', updated_at: new Date().toISOString() })
              .eq('id', u.id)
              .eq('status', 'queued'); // safety: only queued
          }

          totalScheduled += updates.length;
          console.log(`[outreach] Scheduled ${updates.length} messages for campaign ${campaign.id} (${dailyLimit}/day)`);
        }

        return jsonResponse({ scheduled: totalScheduled }, 200, req);
      }

      case 'send_approved': {
        // Called by cron — sends approved messages where scheduled_for <= NOW()
        const { data: campaigns } = await supabaseAdmin
          .from('outreach_campaigns')
          .select('id, daily_send_limit, sending_email')
          .eq('status', 'active');

        if (!campaigns?.length) return jsonResponse({ sent: 0 }, 200, req);

        let totalSentThisRun = 0;

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
            console.warn(`[outreach] Auto-paused campaign ${campaign.id} — high bounce rate`);
            continue;
          }

          // Count messages sent today for this campaign
          const todayStart = new Date();
          todayStart.setUTCHours(0, 0, 0, 0);
          const { count: sentToday } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'sent')
            .gte('sent_at', todayStart.toISOString());

          const dailyLimit = campaign.daily_send_limit || 12;
          const remaining = dailyLimit - (sentToday || 0);
          if (remaining <= 0) {
            console.log(`[outreach] Daily limit reached for campaign ${campaign.id}`);
            continue;
          }

          // Get approved messages where scheduled_for <= NOW()
          const { data: toSend } = await supabaseAdmin
            .from('outreach_messages')
            .select('id, contact_id, subject, body_html, website_id')
            .eq('campaign_id', campaign.id)
            .eq('status', 'approved')
            .lte('scheduled_for', new Date().toISOString())
            .order('scheduled_for', { ascending: true })
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
              await supabaseAdmin.from('outreach_messages').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', msg.id);
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
                  from: `Perfect One <${campaign.sending_email}>`,
                  to: [contact.email],
                  subject: msg.subject,
                  html: msg.body_html,
                  reply_to: `yosi5919+outreach-${msg.id}@gmail.com`,
                  headers: { 'X-Outreach-Message-Id': msg.id },
                }),
              });

              const resendData = await res.json();
              console.log(`[outreach] Resend response for ${msg.id} to ${contact.email}: ${res.status}`, JSON.stringify(resendData));

              if (!res.ok) {
                await supabaseAdmin
                  .from('outreach_messages')
                  .update({
                    status: 'failed',
                    personalization_json: { _resend_error: resendData },
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', msg.id);
                continue;
              }

              if (resendData.id) {
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

                totalSentThisRun++;
                console.log(`[outreach] Sent to ${contact.email} (${msg.id})`);
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

        return jsonResponse({ success: true, sent: totalSentThisRun }, 200, req);
      }

      default:
        return errorResponse(`Unknown action: ${action}`, 400, req);
    }
  } catch (error) {
    console.error('outreachMessages error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
