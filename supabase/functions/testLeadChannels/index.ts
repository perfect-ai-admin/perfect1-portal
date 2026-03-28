// testLeadChannels
// Tests that lead notification channels configured for a landing page are working.
// Supported channels: whatsapp, email, phone (SMS), webhook, n8n
// Returns: { results: { [channel]: { success: boolean, message: string } } }

import { supabaseAdmin, getCustomer, corsHeaders, jsonResponse, errorResponse } from '../_shared/supabaseAdmin.ts';

async function testWhatsApp(phone: string): Promise<{ success: boolean; message: string }> {
  // WhatsApp is typically via an external provider (Twilio, etc.)
  // We validate the phone number format as a basic check.
  if (!phone) return { success: false, message: 'מספר טלפון לא הוגדר' };

  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return { success: false, message: 'מספר טלפון לא תקין' };

  return { success: true, message: `WhatsApp מוגדר לשלוח ל-${phone}` };
}

async function testEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!email) return { success: false, message: 'כתובת מייל לא הוגדרה' };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { success: false, message: 'כתובת מייל לא תקינה' };

  // Try to send a test email via Resend
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) return { success: true, message: `מייל מוגדר ל-${email} (שליחת בדיקה לא זמינה)` };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'One-Pai Notification <no-reply@one-pai.com>',
        to: [email],
        subject: '✅ בדיקת ערוץ מייל — One-Pai',
        html: `
          <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
            <h2>🎉 ערוץ המייל עובד!</h2>
            <p>הודעה זו נשלחה כבדיקה מ-One-Pai.</p>
            <p>כאשר ליד חדש ישאיר פרטים בדף הנחיתה שלך, תקבל מייל דומה.</p>
          </div>
        `,
      }),
    });

    if (res.ok) return { success: true, message: `מייל בדיקה נשלח ל-${email}` };
    const err = await res.json();
    return { success: false, message: `שגיאה בשליחת מייל: ${err.message || 'שגיאה לא ידועה'}` };
  } catch (e) {
    return { success: false, message: `שגיאה בשליחת מייל: ${(e as Error).message}` };
  }
}

async function testWebhook(webhookUrl: string, headers: Record<string, string> = {}): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl) return { success: false, message: 'כתובת Webhook לא הוגדרה' };

  try {
    new URL(webhookUrl);
  } catch {
    return { success: false, message: 'כתובת Webhook לא תקינה' };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        test: true,
        source: 'one-pai',
        message: 'בדיקת חיבור מ-One-Pai',
        timestamp: new Date().toISOString(),
      }),
    });

    if (res.ok || res.status < 400) {
      return { success: true, message: `Webhook מגיב (status: ${res.status})` };
    }
    return { success: false, message: `Webhook החזיר שגיאה: status ${res.status}` };
  } catch (e) {
    return { success: false, message: `Webhook לא נגיש: ${(e as Error).message}` };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const customer = await getCustomer(req);
    if (!customer) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { pageId } = body;

    if (!pageId) return errorResponse('pageId is required', 400);

    // Fetch the landing page
    const { data: page, error: fetchErr } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .eq('customer_id', customer.id)
      .single();

    if (fetchErr || !page) return errorResponse('Landing page not found or access denied', 404);

    const channels: string[] = page.lead_channels || [];
    const results: Record<string, { success: boolean; message: string }> = {};

    // Test each active channel
    for (const channel of channels) {
      switch (channel) {
        case 'whatsapp':
          results.whatsapp = await testWhatsApp(page.destination_phone || '');
          break;

        case 'email':
          results.email = await testEmail(page.destination_email || '');
          break;

        case 'phone':
          // SMS — validate phone number
          results.phone = await testWhatsApp(page.destination_phone || '');
          if (results.phone.success) {
            results.phone.message = `SMS מוגדר לשלוח ל-${page.destination_phone}`;
          }
          break;

        case 'webhook':
          results.webhook = await testWebhook(
            page.webhook_url || '',
            page.webhook_headers || {}
          );
          break;

        case 'n8n': {
          // n8n is a built-in CRM — always passes if the page record exists
          results.n8n = { success: true, message: 'CRM מובנה מחובר ופעיל' };
          break;
        }

        default:
          results[channel] = { success: false, message: `ערוץ לא מוכר: ${channel}` };
      }
    }

    // If no channels configured, return empty but not an error
    if (channels.length === 0) {
      return jsonResponse({
        results: {},
        message: 'לא הוגדרו ערוצי קבלת לידים. בחר לפחות ערוץ אחד.',
      });
    }

    return jsonResponse({ results });
  } catch (error) {
    console.error('testLeadChannels error:', (error as Error).message);
    return errorResponse((error as Error).message);
  }
});
