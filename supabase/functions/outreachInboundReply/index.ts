import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Resend inbound email webhook — receives replies to outreach emails
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const event = await req.json();

    // Extract message ID from reply-to address: reply+{uuid}@domain
    const toAddresses = event.to || event.data?.to || [];
    const replyToMatch = (Array.isArray(toAddresses) ? toAddresses.join(',') : String(toAddresses))
      .match(/reply\+([a-f0-9-]{36})/);

    if (!replyToMatch) {
      return jsonResponse({ ok: true, skipped: 'no outreach message id in reply-to' }, 200, req);
    }

    const outreachMessageId = replyToMatch[1];

    // Look up original message
    const { data: originalMsg } = await supabaseAdmin
      .from('outreach_messages')
      .select('id, campaign_id, website_id, contact_id, subject')
      .eq('id', outreachMessageId)
      .single();

    if (!originalMsg) {
      return jsonResponse({ ok: true, skipped: 'original message not found' }, 200, req);
    }

    const replyBody = event.text || event.data?.text || event.html || event.data?.html || '';
    const replySubject = event.subject || event.data?.subject || `Re: ${originalMsg.subject}`;
    const fromEmail = event.from || event.data?.from || '';

    // Insert reply
    const { data: reply, error: replyErr } = await supabaseAdmin
      .from('outreach_replies')
      .insert({
        outreach_message_id: originalMsg.id,
        website_id: originalMsg.website_id,
        contact_id: originalMsg.contact_id,
        direction: 'inbound',
        subject: replySubject,
        body: replyBody,
        sentiment: 'needs_review',
        intent: 'unknown',
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (replyErr) {
      console.error('Failed to insert reply:', replyErr);
      return errorResponse(replyErr.message, 500, req);
    }

    // Update original message status
    await supabaseAdmin
      .from('outreach_messages')
      .update({
        status: 'replied',
        reply_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', outreachMessageId);

    // Update website status to 'replied'
    await supabaseAdmin
      .from('outreach_websites')
      .update({ status: 'replied', updated_at: new Date().toISOString() })
      .eq('id', originalMsg.website_id)
      .neq('status', 'won') // don't downgrade from won
      .neq('status', 'do_not_contact');

    // Stop any pending follow-ups for this website+campaign
    await supabaseAdmin
      .from('outreach_messages')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('website_id', originalMsg.website_id)
      .eq('campaign_id', originalMsg.campaign_id)
      .in('status', ['queued', 'approved'])
      .neq('id', outreachMessageId);

    // Create a task to review the reply
    await supabaseAdmin
      .from('outreach_tasks')
      .insert({
        website_id: originalMsg.website_id,
        contact_id: originalMsg.contact_id,
        reply_id: reply.id,
        type: 'review_reply',
        status: 'open',
        due_date: new Date().toISOString().slice(0, 10),
        notes: `תשובה חדשה מ-${fromEmail}: ${replySubject}`,
      });

    // Update domain health reply count
    const { data: campaign } = await supabaseAdmin
      .from('outreach_campaigns')
      .select('sending_email')
      .eq('id', originalMsg.campaign_id)
      .single();

    if (campaign?.sending_email) {
      const domain = campaign.sending_email.split('@')[1] || 'unknown';
      const { count: totalReplied } = await supabaseAdmin
        .from('outreach_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'replied');

      const { count: totalSent } = await supabaseAdmin
        .from('outreach_messages')
        .select('id', { count: 'exact', head: true })
        .in('status', ['sent', 'delivered', 'opened', 'replied', 'bounced']);

      const total = (totalSent || 0);
      const replyRate = total > 0 ? (totalReplied || 0) / total : 0;

      await supabaseAdmin
        .from('outreach_domain_health')
        .update({
          total_replied: totalReplied || 0,
          reply_rate: replyRate,
          updated_at: new Date().toISOString(),
        })
        .eq('sending_domain', domain);
    }

    // Mark contact email as likely valid since they replied
    await supabaseAdmin
      .from('outreach_contacts')
      .update({ verified_email_status: 'likely_valid', updated_at: new Date().toISOString() })
      .eq('id', originalMsg.contact_id);

    return jsonResponse({ ok: true, reply_id: reply.id }, 200, req);
  } catch (error) {
    console.error('outreachInboundReply error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
