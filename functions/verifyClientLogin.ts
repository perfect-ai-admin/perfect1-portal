import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { phone, password } = await req.json();
    const base44 = createClientFromRequest(req);

    // Clean phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length < 9) {
      return Response.json({ error: 'מספר טלפון לא תקין' }, { status: 400 });
    }

    // Try multiple phone formats
    let lead = null;
    
    // Try exact match
    let leads = await base44.asServiceRole.entities.Lead.filter({ phone: cleanPhone });
    if (leads.length > 0) {
      lead = leads[0];
    }
    
    // Try with leading 0
    if (!lead && !cleanPhone.startsWith('0')) {
      leads = await base44.asServiceRole.entities.Lead.filter({ phone: '0' + cleanPhone });
      if (leads.length > 0) {
        lead = leads[0];
      }
    }
    
    // Try without leading 0
    if (!lead && cleanPhone.startsWith('0')) {
      leads = await base44.asServiceRole.entities.Lead.filter({ phone: cleanPhone.substring(1) });
      if (leads.length > 0) {
        lead = leads[0];
      }
    }

    if (!lead) {
      return Response.json({ error: 'מספר טלפון לא נמצא במערכת' }, { status: 404 });
    }

    // Verify password
    if (lead.client_password !== password) {
      return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
    }

    return Response.json({
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status
      }
    });
  } catch (error) {
    console.error('Login verification error:', error);
    return Response.json({ error: 'שגיאה בתהליך הכניסה' }, { status: 500 });
  }
});