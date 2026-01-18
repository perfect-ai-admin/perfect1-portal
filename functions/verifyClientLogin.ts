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
    console.log(`Search 1 - cleanPhone: ${cleanPhone}, found: ${leads.length}`);
    if (leads.length > 0) {
      lead = leads[0];
    }
    
    // Try with leading 0
    if (!lead && !cleanPhone.startsWith('0')) {
      const withZero = '0' + cleanPhone;
      leads = await base44.asServiceRole.entities.Lead.filter({ phone: withZero });
      console.log(`Search 2 - withZero: ${withZero}, found: ${leads.length}`);
      if (leads.length > 0) {
        lead = leads[0];
      }
    }
    
    // Try without leading 0
    if (!lead && cleanPhone.startsWith('0')) {
      const withoutZero = cleanPhone.substring(1);
      leads = await base44.asServiceRole.entities.Lead.filter({ phone: withoutZero });
      console.log(`Search 3 - withoutZero: ${withoutZero}, found: ${leads.length}`);
      if (leads.length > 0) {
        lead = leads[0];
      }
    }

    if (!lead) {
      console.log(`No lead found for phone: ${cleanPhone}`);
      return Response.json({ error: 'מספר טלפון לא נמצא במערכת' }, { status: 404 });
    }

    console.log(`Lead found:`, {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: lead.status,
      client_password: lead.client_password
    });

    // Verify password (use default password if not set)
    const expectedPassword = lead.client_password || '123456';
    console.log('Password check:', {
      provided: password,
      expected: expectedPassword,
      match: password === expectedPassword
    });
    if (password !== expectedPassword) {
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