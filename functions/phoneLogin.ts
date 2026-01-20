import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return Response.json({ error: 'חסרים פרטי התחברות' }, { status: 400 });
    }

    // Check if there's a Lead with this phone and status "converted" or "closed"
    const allLeads = await base44.asServiceRole.entities.Lead.filter({ 
      phone: phone
    });
    
    const leads = allLeads.filter(lead => 
      lead.status === 'converted' || lead.status === 'closed'
    );

    if (!leads || leads.length === 0) {
      return Response.json({ 
        success: false,
        error: 'לא נמצא לקוח עם מספר זה' 
      }, { status: 404 });
    }

    const lead = leads[0];

    if (!lead.email) {
      return Response.json({ 
        success: false,
        error: 'לא נמצא כתובת אימייל ללקוח. אנא פנה לתמיכה.' 
      }, { status: 400 });
    }

    // Check if password matches (either the lead's client_password or default 123456)
    const validPassword = lead.client_password || '123456';
    if (password !== validPassword) {
      return Response.json({ 
        success: false,
        error: 'סיסמה שגויה' 
      }, { status: 401 });
    }

    // Check if user exists with this email
    const users = await base44.asServiceRole.entities.User.filter({ 
      email: lead.email 
    });

    // If user doesn't exist, invite them
    if (users.length === 0) {
      try {
        await base44.asServiceRole.users.inviteUser(lead.email, 'user');
      } catch (err) {
        console.log('User invitation error:', err);
      }
    }

    return Response.json({ 
      success: true,
      email: lead.email,
      name: lead.name
    });

  } catch (error) {
    console.error('Phone login error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});