/**
 * createTestFixture — Edge Function זמנית ליצירת fixture לטסט outreachInboundReply
 * DELETE AFTER TESTING
 */
import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Campaign
    const { data: campaign, error: ce } = await supabaseAdmin
      .from('outreach_campaigns')
      .insert({
        name: 'E2E Test Campaign ' + Date.now(),
        campaign_type: 'link_exchange',
        status: 'active',
        sending_email: 'outreach@perfect1.co.il',
      })
      .select()
      .single();
    if (ce) return errorResponse('campaign: ' + ce.message, 500, req);

    // Website — use unique domain to avoid UNIQUE constraint conflict
    const { data: website, error: we } = await supabaseAdmin
      .from('outreach_websites')
      .insert({
        domain: 'test-partner-' + Date.now() + '.co.il',
        status: 'contacted',
      })
      .select()
      .single();
    if (we) return errorResponse('website: ' + we.message, 500, req);

    // Contact (no campaign_id — not in schema)
    const { data: contact, error: coe } = await supabaseAdmin
      .from('outreach_contacts')
      .insert({
        website_id: website.id,
        email: 'danny@test-partner-site.co.il',
        full_name: 'דני כהן',
        verified_email_status: 'unknown',
      })
      .select()
      .single();
    if (coe) return errorResponse('contact: ' + coe.message, 500, req);

    // Message (status=sent, body_html required)
    const { data: message, error: me } = await supabaseAdmin
      .from('outreach_messages')
      .insert({
        campaign_id: campaign.id,
        website_id: website.id,
        contact_id: contact.id,
        subject: 'שיתוף פעולה בין האתרים שלנו',
        body_html: '<p>שלום, אני יוסי מ-perfect1.co.il. יש לנו 80+ מאמרים מדורגים בגוגל.</p>',
        body_text: 'שלום, אני יוסי מ-perfect1.co.il. יש לנו 80+ מאמרים מדורגים בגוגל.',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (me) return errorResponse('message: ' + me.message, 500, req);

    // If reply_id passed in body — fetch reply record for inspection
    const body = await req.json().catch(() => ({}));
    if (body.fetch_reply_id) {
      const { data: reply } = await supabaseAdmin
        .from('outreach_replies')
        .select('id,intent,sentiment,ai_summary,ai_suggested_reply,direction,received_at')
        .eq('id', body.fetch_reply_id)
        .single();
      return jsonResponse({ ok: true, reply }, 200, req);
    }

    return jsonResponse({
      ok: true,
      message_id: message.id,
      campaign_id: campaign.id,
      website_id: website.id,
      contact_id: contact.id,
      test_command: `node scripts/test-inbound-reply.cjs ${message.id}`,
    }, 200, req);
  } catch (err) {
    return errorResponse((err as Error).message, 500, req);
  }
});
