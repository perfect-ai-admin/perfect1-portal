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

    // Try multiple phone formats - search across all statuses
    let lead = null;
    
    // Get all leads with this phone (any status)
    let allLeads = [];
    
    // Try exact match
    try {
      allLeads = await base44.asServiceRole.entities.Lead.list(undefined, 1000);
      allLeads = allLeads.filter(l => l.phone && l.phone.replace(/[^0-9]/g, '') === cleanPhone);
      console.log(`Search 1 - cleanPhone: ${cleanPhone}, found: ${allLeads.length}`);
    } catch (e) {
      console.log('Error in list:', e.message);
    }
    
    if (allLeads.length > 0) {
      lead = allLeads[0];
    }
    
    // Try with leading 0
    if (!lead && !cleanPhone.startsWith('0')) {
      const withZero = '0' + cleanPhone;
      allLeads = await base44.asServiceRole.entities.Lead.list(undefined, 1000);
      allLeads = allLeads.filter(l => l.phone === withZero);
      console.log(`Search 2 - withZero: ${withZero}, found: ${allLeads.length}`);
      if (allLeads.length > 0) {
        lead = allLeads[0];
      }
    }
    
    // Try without leading 0
    if (!lead && cleanPhone.startsWith('0')) {
      const withoutZero = cleanPhone.substring(1);
      allLeads = await base44.asServiceRole.entities.Lead.list(undefined, 1000);
      allLeads = allLeads.filter(l => l.phone === withoutZero);
      console.log(`Search 3 - withoutZero: ${withoutZero}, found: ${allLeads.length}`);
      if (allLeads.length > 0) {
        lead = allLeads[0];
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
    const expectedPassword = (lead.client_password || '123456').trim();
    const providedPassword = (password || '').trim();

    console.log('Password check:', {
     provided: providedPassword,
     expected: expectedPassword,
     match: providedPassword === expectedPassword,
     providedLength: providedPassword.length,
     expectedLength: expectedPassword.length
    });

    if (providedPassword !== expectedPassword) {
     return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
    }

    // Verify status allows login
    const allowedStatuses = ['new', 'contacted', 'no_answer', 'in_progress', 'qualified', 'converted', 'closed'];
    if (!allowedStatuses.includes(lead.status)) {
     console.log(`Lead status not allowed for login: ${lead.status}`);
     return Response.json({ error: 'משתמש זה לא יכול להיכנס למערכת' }, { status: 403 });
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