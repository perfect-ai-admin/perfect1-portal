import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Check if this is an update event
    if (event.type !== 'update') {
      return Response.json({ success: true, reason: 'not_an_update' });
    }

    // Check if status field changed
    if (!old_data || !data || old_data.status === data.status) {
      return Response.json({ success: true, reason: 'status_not_changed' });
    }

    const lead = data;
    const oldStatus = old_data.status;
    const newStatus = data.status;
    const phone = lead.phone?.replace(/[^0-9+]/g, '') || '';

    if (!phone) {
      return Response.json({ error: 'No phone number found', status: 400 }, { status: 400 });
    }

    // Build WhatsApp message based on status
    const statusMessages = {
      'new': `שלום ${lead.name}, קיבלנו את פרטיך. צוות שלנו יחזור אליך בקרוב.`,
      'contacted': `שלום ${lead.name}, אנחנו כבר בקשר איתך. תודה על התיעניינות!`,
      'qualified': `מזל טוב ${lead.name}! אתה זכאי לשירות שלנו. בואנו נתחיל!`,
      'closed': `תודה ${lead.name}, הטיפול שלך הסתיים. אנחנו כאן אם תצטרך שוב.`,
      'not_interested': `${lead.name}, אנחנו מכבדים את בחירתך. בהצלחה! 👋`,
    };

    const message = statusMessages[newStatus] || `${lead.name}, הסטטוס שלך עודכן ל-${newStatus}`;

    // Send to WhatsApp Cloud API
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      console.error('Missing WhatsApp credentials');
      return Response.json({ error: 'Missing WhatsApp credentials' }, { status: 400 });
    }

    const response = await fetch(`https://graph.instagram.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      return Response.json({ error: 'Failed to send WhatsApp message', details: error }, { status: response.status });
    }

    const result = await response.json();
    return Response.json({ 
      success: true, 
      message: `WhatsApp sent to ${phone}`,
      lead_name: lead.name,
      old_status: oldStatus,
      new_status: newStatus,
    });

  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});