import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Called by pg_cron daily — creates follow-up messages for unanswered outreach
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const now = new Date();
    let totalCreated = 0;

    // Get active campaigns with follow-up templates
    const { data: campaigns } = await supabaseAdmin
      .from('outreach_campaigns')
      .select('id, followup1_template_id, followup2_template_id, followup1_delay_days, followup2_delay_days')
      .eq('status', 'active');

    if (!campaigns?.length) {
      return jsonResponse({ created: 0, message: 'No active campaigns' }, 200, req);
    }

    for (const campaign of campaigns) {
      // === Follow-up 1: initial messages sent > X days ago without reply ===
      if (campaign.followup1_template_id) {
        const cutoff1 = new Date(now);
        cutoff1.setDate(cutoff1.getDate() - (campaign.followup1_delay_days || 4));

        // Find initial messages that were sent, not replied, and no followup_1 exists
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

          // Check for replies on these websites
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

          // Check for negative sentiment replies
          const { data: negReplies } = await supabaseAdmin
            .from('outreach_replies')
            .select('website_id')
            .in('website_id', websiteIds)
            .eq('sentiment', 'negative');
          const negSet = new Set((negReplies || []).map(r => r.website_id));

          // Get follow-up template
          const { data: template } = await supabaseAdmin
            .from('outreach_email_templates')
            .select('subject_template, body_template')
            .eq('id', campaign.followup1_template_id)
            .single();

          if (template) {
            const drafts = [];
            for (const msg of needsFollowup1) {
              if (f1Set.has(msg.website_id)) continue;
              if (repliedSet.has(msg.website_id)) continue;
              if (blockedSet.has(msg.website_id)) continue;
              if (negSet.has(msg.website_id)) continue;

              // Get contact info for personalization
              const { data: contact } = await supabaseAdmin
                .from('outreach_contacts')
                .select('full_name')
                .eq('id', msg.contact_id)
                .single();

              const personalization = {
                name: contact?.full_name || '',
                signature: 'יוסי, פרפקט וואן',
              };

              let subject = template.subject_template;
              let body = template.body_template;
              Object.entries(personalization).forEach(([key, val]) => {
                subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
                body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
              });

              drafts.push({
                campaign_id: campaign.id,
                website_id: msg.website_id,
                contact_id: msg.contact_id,
                subject,
                body_html: body.replace(/\n/g, '<br>'),
                body_text: body,
                personalization_json: personalization,
                sequence_step: 'followup_1',
                status: 'queued', // requires manual approval
              });
            }

            if (drafts.length > 0) {
              await supabaseAdmin.from('outreach_messages').insert(drafts);
              totalCreated += drafts.length;
            }
          }
        }
      }

      // === Follow-up 2: followup_1 messages sent > X days ago without reply ===
      if (campaign.followup2_template_id) {
        const cutoff2 = new Date(now);
        cutoff2.setDate(cutoff2.getDate() - (campaign.followup2_delay_days || 8));

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

          const { data: negReplies } = await supabaseAdmin
            .from('outreach_replies')
            .select('website_id')
            .in('website_id', websiteIds)
            .eq('sentiment', 'negative');
          const negSet = new Set((negReplies || []).map(r => r.website_id));

          const { data: template } = await supabaseAdmin
            .from('outreach_email_templates')
            .select('subject_template, body_template')
            .eq('id', campaign.followup2_template_id)
            .single();

          if (template) {
            const drafts = [];
            for (const msg of needsFollowup2) {
              if (f2Set.has(msg.website_id)) continue;
              if (repliedSet.has(msg.website_id)) continue;
              if (blockedSet.has(msg.website_id)) continue;
              if (negSet.has(msg.website_id)) continue;

              const { data: contact } = await supabaseAdmin
                .from('outreach_contacts')
                .select('full_name')
                .eq('id', msg.contact_id)
                .single();

              const personalization = {
                name: contact?.full_name || '',
                signature: 'יוסי, פרפקט וואן',
              };

              let subject = template.subject_template;
              let body = template.body_template;
              Object.entries(personalization).forEach(([key, val]) => {
                subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
                body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
              });

              drafts.push({
                campaign_id: campaign.id,
                website_id: msg.website_id,
                contact_id: msg.contact_id,
                subject,
                body_html: body.replace(/\n/g, '<br>'),
                body_text: body,
                personalization_json: personalization,
                sequence_step: 'followup_2',
                status: 'queued',
              });
            }

            if (drafts.length > 0) {
              await supabaseAdmin.from('outreach_messages').insert(drafts);
              totalCreated += drafts.length;
            }
          }
        }
      }
    }

    return jsonResponse({ created: totalCreated, message: `${totalCreated} follow-up drafts created` }, 200, req);
  } catch (error) {
    console.error('outreachFollowupDispatch error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
