import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Called by pg_cron daily ~09:00 Israel time — creates and schedules follow-up messages
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const now = new Date();
    let totalCreated = 0;

    // Get active campaigns with follow-up templates
    const { data: campaigns } = await supabaseAdmin
      .from('outreach_campaigns')
      .select('id, followup1_template_id, followup2_template_id, followup1_delay_days, followup2_delay_days, daily_send_limit')
      .eq('status', 'active');

    if (!campaigns?.length) {
      return jsonResponse({ created: 0, message: 'No active campaigns' }, 200, req);
    }

    for (const campaign of campaigns) {
      const dailyLimit = campaign.daily_send_limit || 12;

      // === Follow-up 1: initial messages sent > X days ago without reply ===
      if (campaign.followup1_template_id) {
        const cutoff1 = new Date(now);
        cutoff1.setDate(cutoff1.getDate() - (campaign.followup1_delay_days || 5));

        // Find initial messages: sent, not replied, no followup_1 exists yet
        const { data: needsFollowup1 } = await supabaseAdmin
          .from('outreach_messages')
          .select('id, campaign_id, website_id, contact_id, subject')
          .eq('campaign_id', campaign.id)
          .eq('sequence_step', 'initial')
          .in('status', ['sent', 'delivered', 'opened'])
          .lt('sent_at', cutoff1.toISOString());

        if (needsFollowup1?.length) {
          // Check which already have followup_1
          const { data: existingF1 } = await supabaseAdmin
            .from('outreach_messages')
            .select('website_id')
            .eq('campaign_id', campaign.id)
            .eq('sequence_step', 'followup_1');
          const f1Set = new Set((existingF1 || []).map(m => m.website_id));

          // Check for any replies (positive or negative) on these websites
          const websiteIds = needsFollowup1.map(m => m.website_id);
          const { data: replied } = await supabaseAdmin
            .from('outreach_replies')
            .select('website_id')
            .in('website_id', websiteIds);
          const repliedSet = new Set((replied || []).map(r => r.website_id));

          // Check do_not_contact
          const { data: blocked } = await supabaseAdmin
            .from('outreach_websites')
            .select('id')
            .in('id', websiteIds)
            .eq('status', 'do_not_contact');
          const blockedSet = new Set((blocked || []).map(b => b.id));

          // Get follow-up template
          const { data: template } = await supabaseAdmin
            .from('outreach_email_templates')
            .select('subject_template, body_template')
            .eq('id', campaign.followup1_template_id)
            .single();

          if (template) {
            // Get website domain info
            const { data: websiteData } = await supabaseAdmin
              .from('outreach_websites')
              .select('id, domain')
              .in('id', websiteIds);
            const domainMap: Record<string, string> = {};
            (websiteData || []).forEach(w => { domainMap[w.id] = w.domain; });

            // Compute scheduled_for spread across today respecting daily limit
            const scheduledToday = await getAlreadyScheduledCount(campaign.id, now);
            let slotDate = new Date(now);
            slotDate.setUTCHours(6, 30, 0, 0); // 09:30 Israel
            if (now.getUTCHours() >= 14) {
              // Too late today — start tomorrow
              slotDate.setDate(slotDate.getDate() + 1);
              slotDate.setUTCHours(6, 0, 0, 0);
            }
            const slotMap: Record<string, number> = { [slotDate.toISOString().slice(0, 10)]: scheduledToday };

            const drafts = [];
            for (const msg of needsFollowup1) {
              if (f1Set.has(msg.website_id)) continue;
              if (repliedSet.has(msg.website_id)) continue;
              if (blockedSet.has(msg.website_id)) continue;

              // Get contact info for personalization
              const { data: contact } = await supabaseAdmin
                .from('outreach_contacts')
                .select('full_name')
                .eq('id', msg.contact_id)
                .single();

              const domain = domainMap[msg.website_id] || '';
              const personalization = {
                contact_name: contact?.full_name || '',
                name: contact?.full_name || '',
                domain,
                signature: 'יוסי, פרפקט וואן',
              };

              let subject = template.subject_template;
              let body = template.body_template;
              Object.entries(personalization).forEach(([key, val]) => {
                subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
                body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
              });

              // Find next available slot
              const slot = getNextSlot(slotMap, slotDate, dailyLimit);

              drafts.push({
                campaign_id: campaign.id,
                website_id: msg.website_id,
                contact_id: msg.contact_id,
                subject,
                body_html: body.replace(/\n/g, '<br>'),
                body_text: body,
                personalization_json: personalization,
                sequence_step: 'followup_1',
                status: 'approved', // auto-approve followups (they respect daily limit via scheduled_for)
                scheduled_for: slot,
              });
            }

            if (drafts.length > 0) {
              await supabaseAdmin.from('outreach_messages').insert(drafts);
              totalCreated += drafts.length;
              console.log(`[followup] Created ${drafts.length} followup_1 for campaign ${campaign.id}`);
            }
          }
        }
      }

      // === Follow-up 2: followup_1 messages sent > X days ago without reply ===
      if (campaign.followup2_template_id) {
        const cutoff2 = new Date(now);
        cutoff2.setDate(cutoff2.getDate() - (campaign.followup2_delay_days || 10));

        const { data: needsFollowup2 } = await supabaseAdmin
          .from('outreach_messages')
          .select('id, campaign_id, website_id, contact_id')
          .eq('campaign_id', campaign.id)
          .eq('sequence_step', 'followup_1')
          .in('status', ['sent', 'delivered', 'opened'])
          .lt('sent_at', cutoff2.toISOString());

        if (needsFollowup2?.length) {
          const { data: existingF2 } = await supabaseAdmin
            .from('outreach_messages')
            .select('website_id')
            .eq('campaign_id', campaign.id)
            .eq('sequence_step', 'followup_2');
          const f2Set = new Set((existingF2 || []).map(m => m.website_id));

          const websiteIds = needsFollowup2.map(m => m.website_id);
          const { data: replied } = await supabaseAdmin
            .from('outreach_replies')
            .select('website_id')
            .in('website_id', websiteIds);
          const repliedSet = new Set((replied || []).map(r => r.website_id));

          const { data: blocked } = await supabaseAdmin
            .from('outreach_websites')
            .select('id')
            .in('id', websiteIds)
            .eq('status', 'do_not_contact');
          const blockedSet = new Set((blocked || []).map(b => b.id));

          const { data: template } = await supabaseAdmin
            .from('outreach_email_templates')
            .select('subject_template, body_template')
            .eq('id', campaign.followup2_template_id)
            .single();

          if (template) {
            const { data: websiteData } = await supabaseAdmin
              .from('outreach_websites')
              .select('id, domain')
              .in('id', websiteIds);
            const domainMap: Record<string, string> = {};
            (websiteData || []).forEach(w => { domainMap[w.id] = w.domain; });

            const scheduledToday = await getAlreadyScheduledCount(campaign.id, now);
            let slotDate = new Date(now);
            slotDate.setUTCHours(7, 0, 0, 0); // 10:00 Israel
            if (now.getUTCHours() >= 14) {
              slotDate.setDate(slotDate.getDate() + 1);
              slotDate.setUTCHours(6, 0, 0, 0);
            }
            const slotMap: Record<string, number> = { [slotDate.toISOString().slice(0, 10)]: scheduledToday };

            const drafts = [];
            for (const msg of needsFollowup2) {
              if (f2Set.has(msg.website_id)) continue;
              if (repliedSet.has(msg.website_id)) continue;
              if (blockedSet.has(msg.website_id)) continue;

              const { data: contact } = await supabaseAdmin
                .from('outreach_contacts')
                .select('full_name')
                .eq('id', msg.contact_id)
                .single();

              const domain = domainMap[msg.website_id] || '';
              const personalization = {
                contact_name: contact?.full_name || '',
                name: contact?.full_name || '',
                domain,
                signature: 'יוסי, פרפקט וואן',
              };

              let subject = template.subject_template;
              let body = template.body_template;
              Object.entries(personalization).forEach(([key, val]) => {
                subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
                body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
              });

              const slot = getNextSlot(slotMap, slotDate, dailyLimit);

              drafts.push({
                campaign_id: campaign.id,
                website_id: msg.website_id,
                contact_id: msg.contact_id,
                subject,
                body_html: body.replace(/\n/g, '<br>'),
                body_text: body,
                personalization_json: personalization,
                sequence_step: 'followup_2',
                status: 'approved',
                scheduled_for: slot,
              });
            }

            if (drafts.length > 0) {
              await supabaseAdmin.from('outreach_messages').insert(drafts);
              totalCreated += drafts.length;
              console.log(`[followup] Created ${drafts.length} followup_2 for campaign ${campaign.id}`);
            }
          }
        }
      }
    }

    return jsonResponse({ created: totalCreated, message: `${totalCreated} follow-up messages scheduled` }, 200, req);
  } catch (error) {
    console.error('outreachFollowupDispatch error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});

// Count how many messages are already approved/queued for today for this campaign
async function getAlreadyScheduledCount(campaignId: string, now: Date): Promise<number> {
  const todayStr = now.toISOString().slice(0, 10);
  const { count } = await supabaseAdmin
    .from('outreach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .in('status', ['approved', 'sent'])
    .gte('scheduled_for', `${todayStr}T00:00:00.000Z`)
    .lte('scheduled_for', `${todayStr}T23:59:59.999Z`);
  return count || 0;
}

// Return next available ISO string slot, respecting daily limit
function getNextSlot(slotMap: Record<string, number>, baseDate: Date, dailyLimit: number): string {
  let d = new Date(baseDate.getTime());
  for (let attempt = 0; attempt < 365; attempt++) {
    const dayKey = d.toISOString().slice(0, 10);
    const used = slotMap[dayKey] || 0;
    if (used < dailyLimit) {
      slotMap[dayKey] = used + 1;
      // Spread within business hours: 09:00-15:00 Israel (06:00-12:00 UTC)
      const minuteOffset = used * 35; // ~35 min between sends
      const send = new Date(d);
      send.setUTCHours(6, minuteOffset % 60, 0, 0);
      if (minuteOffset >= 360) {
        // Would exceed 12:00 UTC — push to next day
        slotMap[dayKey]! -= 1;
        d.setDate(d.getDate() + 1);
        d.setUTCHours(6, 0, 0, 0);
        continue;
      }
      return send.toISOString();
    }
    d.setDate(d.getDate() + 1);
    d.setUTCHours(6, 0, 0, 0);
  }
  return d.toISOString();
}
