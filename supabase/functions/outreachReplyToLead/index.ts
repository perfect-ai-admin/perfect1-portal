import { supabaseAdmin, getCorsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Verify request has a valid non-anon JWT (admin dashboard calls only)
async function verifyAdminRequest(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  // Reject bare anon key — must be a real user session token
  if (!token || token === SUPABASE_ANON_KEY) return false;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  return !error && !!user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    const isAuthed = await verifyAdminRequest(req);
    if (!isAuthed) return errorResponse('Unauthorized — valid user session required', 401, req);

    const { reply_id, subject, body_text } = await req.json();
    if (!reply_id || !subject || !body_text) {
      return errorResponse('reply_id, subject, body_text required', 400, req);
    }

    // Fetch the inbound reply + contact email + original message
    const { data: reply, error: replyErr } = await supabaseAdmin
      .from('outreach_replies')
      .select('id, outreach_message_id, website_id, contact_id, subject, outreach_contacts(email, full_name), outreach_messages(id, subject)')
      .eq('id', reply_id)
      .single();

    if (replyErr || !reply) return errorResponse('Reply not found', 404, req);

    const contactEmail = (reply.outreach_contacts as any)?.email;
    if (!contactEmail) return errorResponse('Contact email not found', 400, req);

    const originalMessageId = reply.outreach_message_id;
    const body_html = `<div dir="rtl" style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.8; color: #333;">${body_text.replace(/\n/g, '<br>')}</div>`;

    // Send via Resend
    if (!RESEND_API_KEY) return errorResponse('RESEND_API_KEY not configured', 500, req);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'יוסי — פרפקט וואן <outreach@perfect1.co.il>',
        to: [contactEmail],
        subject,
        html: body_html,
        reply_to: originalMessageId ? `yosi5919+outreach-${originalMessageId}@gmail.com` : 'yosi5919@gmail.com',
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error('[outreachReplyToLead] Resend error:', JSON.stringify(resendData));
      return errorResponse(resendData?.message || 'Failed to send email', 500, req);
    }

    // Save outbound reply to DB
    const { data: saved, error: saveErr } = await supabaseAdmin
      .from('outreach_replies')
      .insert({
        outreach_message_id: originalMessageId,
        website_id: reply.website_id,
        contact_id: reply.contact_id,
        direction: 'outbound',
        subject,
        body: body_text,
        sentiment: 'positive',
        intent: 'interested',
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveErr) console.error('[outreachReplyToLead] DB insert error:', saveErr);

    console.log(`[outreachReplyToLead] Sent to ${contactEmail}, resend_id=${resendData.id}`);
    return jsonResponse({ ok: true, resend_message_id: resendData.id, saved_id: saved?.id }, 200, req);
  } catch (error) {
    console.error('outreachReplyToLead error:', error);
    return errorResponse((error as Error).message, 500, req);
  }
});
