// Migrated from Base44: sendInviteEmail
// Admin: send an invite email to a new user and optionally create a Supabase auth invitation

import { supabaseAdmin, requireAdmin, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireAdmin(req);

    const { email, role } = await req.json();
    if (!email) return errorResponse('email is required', 400);

    const effectiveRole = role || 'user';

    // Send invite email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) return errorResponse('RESEND_API_KEY not configured', 500);

    const appUrl = Deno.env.get('APP_URL') || 'https://app.one-pai.com';

    const html = `
      <div style="direction: rtl; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>הוזמנת להצטרף ל-One-Pai!</h2>
        <p>שלום,</p>
        <p>הוזמנת להצטרף לפלטפורמה שלנו בתפקיד: <strong>${effectiveRole}</strong></p>
        <p>לחץ על הכפתור למטה כדי לאשר את ההזמנה ולהגדיר סיסמה:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/signup?email=${encodeURIComponent(email)}&role=${effectiveRole}"
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            אישור הזמנה
          </a>
        </p>
        <p style="color: #6B7280; font-size: 14px;">אם לא ביקשת הזמנה זו, ניתן להתעלם מהודעה זו.</p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'One-Pai <no-reply@one-pai.com>',
        to: [email],
        subject: 'הזמנה להצטרף ל-One-Pai',
        html
      })
    });

    if (!resendRes.ok) {
      const body = await resendRes.text();
      return errorResponse(`Resend error: ${body}`);
    }

    // Optionally create Supabase auth invitation
    let inviteData = null;
    try {
      const { data, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { role: effectiveRole }
      });
      if (!inviteErr) inviteData = data;
    } catch (e) {
      console.warn('sendInviteEmail: Supabase invite failed (non-fatal):', (e as Error).message);
    }

    return jsonResponse({ success: true, invite: inviteData });
  } catch (error) {
    console.error('sendInviteEmail error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
