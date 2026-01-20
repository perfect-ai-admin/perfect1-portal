import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return Response.json({ error: 'חסרים פרטי התחברות' }, { status: 400 });
    }

    // Check if there's a Lead with this phone and status "converted" or "closed"
    const leads = await base44.asServiceRole.entities.Lead.filter({ 
      phone: phone,
      status: 'converted'
    });

    if (!leads || leads.length === 0) {
      return Response.json({ error: 'לא נמצא לקוח עם מספר זה' }, { status: 404 });
    }

    const lead = leads[0];

    // Check if user exists with this email
    const users = await base44.asServiceRole.entities.User.filter({ 
      email: lead.email 
    });

    let userEmail = lead.email;

    // If user doesn't exist and password is 123456, create a temporary user
    if (users.length === 0) {
      if (password !== '123456') {
        return Response.json({ error: 'סיסמה שגויה' }, { status: 401 });
      }

      // Invite user to create account
      try {
        await base44.asServiceRole.users.inviteUser(lead.email, 'user');
      } catch (err) {
        // User might already be invited
        console.log('User might already be invited:', err);
      }
    }

    return Response.json({ 
      success: true,
      email: userEmail,
      name: lead.name
    });

  } catch (error) {
    console.error('Phone login error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});