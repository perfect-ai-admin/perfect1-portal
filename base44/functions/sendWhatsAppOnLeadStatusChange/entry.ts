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
    // Send to n8n webhook
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');

    if (!n8nWebhookUrl) {
      console.error('Missing N8N_WEBHOOK_URL');
      return Response.json({ error: 'Missing N8N_WEBHOOK_URL' }, { status: 400 });
    }

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'lead_status_changed',
        lead: {
          id: event.entity_id,
          name: lead.name,
          phone: phone,
          email: lead.email,
          oldStatus: oldStatus,
          newStatus: newStatus,
        },
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('n8n webhook error:', error);
      return Response.json({ error: 'Failed to send to n8n', details: error }, { status: response.status });
    }

    return Response.json({ 
      success: true, 
      message: 'Webhook sent to n8n',
      lead_name: lead.name,
      old_status: oldStatus,
      new_status: newStatus,
    });

  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});