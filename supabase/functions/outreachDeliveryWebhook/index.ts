import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

// Resend webhook handler for delivery/bounce/open events
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const event = await req.json();
    const type = event.type;

    if (!type || !event.data) {
      return jsonResponse({ ok: true, skipped: 'no type or data' }, 200, req);
    }

    // Extract outreach message ID from headers or reply-to
    const messageId = event.data.headers?.['X-Outreach-Message-Id']
      || event.data.to?.[0]?.match(/reply\+([a-f0-9-]+)@/)?.[1];

    if (!messageId) {
      return jsonResponse({ ok: true, skipped: 'not an outreach email' }, 200, req);
    }

    // Verify message exists
    const { data: msg } = await supabaseAdmin
      .from('outreach_messages')
      .select('id, campaign_id, website_id')
      .eq('id', messageId)
      .single();

    if (!msg) {
      return jsonResponse({ ok: true, skipped: 'message not found' }, 200, req);
    }

    switch (type) {
      case 'email.delivered': {
        await supabaseAdmin
          .from('outreach_messages')
          .update({ status: 'delivered', updated_at: new Date().toISOString() })
          .eq('id', messageId)
          .in('status', ['sent']); // only upgrade from sent
        break;
      }

      case 'email.opened': {
        await supabaseAdmin
          .from('outreach_messages')
          .update({ status: 'opened', updated_at: new Date().toISOString() })
          .eq('id', messageId)
          .in('status', ['sent', 'delivered']); // only upgrade
        break;
      }

      case 'email.bounced':
      case 'email.complained': {
        await supabaseAdmin
          .from('outreach_messages')
          .update({ status: 'bounced', updated_at: new Date().toISOString() })
          .eq('id', messageId);

        // Mark contact email as bounced
        const { data: message } = await supabaseAdmin
          .from('outreach_messages')
          .select('contact_id')
          .eq('id', messageId)
          .single();

        if (message?.contact_id) {
          await supabaseAdmin
            .from('outreach_contacts')
            .update({ verified_email_status: 'bounced', updated_at: new Date().toISOString() })
            .eq('id', message.contact_id);
        }

        // Update domain health
        const { data: campaign } = await supabaseAdmin
          .from('outreach_campaigns')
          .select('sending_email')
          .eq('id', msg.campaign_id)
          .single();

        if (campaign?.sending_email) {
          const domain = campaign.sending_email.split('@')[1] || 'unknown';
          // Recalculate domain health
          const { data: stats } = await supabaseAdmin.rpc('', {}).catch(() => ({ data: null }));

          // Get fresh counts
          const { count: totalSent } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .in('status', ['sent', 'delivered', 'opened', 'replied', 'bounced']);

          const { count: totalBounced } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'bounced');

          const { count: totalReplied } = await supabaseAdmin
            .from('outreach_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'replied');

          const total = (totalSent || 0) + (totalBounced || 0);
          const bounceRate = total > 0 ? (totalBounced || 0) / total : 0;
          const replyRate = total > 0 ? (totalReplied || 0) / total : 0;
          const spamLevel = bounceRate > 0.05 ? 'high' : bounceRate > 0.03 ? 'medium' : 'low';

          await supabaseAdmin
            .from('outreach_domain_health')
            .upsert({
              sending_domain: domain,
              total_sent: totalSent || 0,
              total_bounced: totalBounced || 0,
              total_replied: totalReplied || 0,
              bounce_rate: bounceRate,
              reply_rate: replyRate,
              spam_warning_level: spamLevel,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'sending_domain' });

          // Auto-pause campaigns if bounce rate is high
          if (spamLevel === 'high') {
            await supabaseAdmin
              .from('outreach_campaigns')
              .update({ status: 'paused', updated_at: new Date().toISOString() })
              .eq('status', 'active');
            console.warn(`[OUTREACH] Auto-paused all campaigns — bounce rate ${(bounceRate * 100).toFixed(1)}%`);
          }
        }
        break;
      }

      default:
        // Unknown event type — ignore
        break;
    }

    return jsonResponse({ ok: true, type }, 200, req);
  } catch (error) {
    console.error('outreachDeliveryWebhook error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
