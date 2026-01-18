import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    let base44;
    let body;
    
    try {
      base44 = createClientFromRequest(req);
      body = await req.json();
    } catch (parseErr) {
      console.error('Request parse error:', parseErr);
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const { credential, password } = body;

    if (!credential || !password) {
      return Response.json({ error: 'Missing credential or password' }, { status: 400 });
    }

    // Verify password first
    if (password !== '123456') {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Determine if credential is email or phone
    const isEmail = credential.includes('@');
    const searchFilter = isEmail 
      ? { email: credential }
      : { phone: credential.replace(/[^0-9]/g, '') };

    // Search for Lead by email or phone
    let leads = [];
    try {
      leads = await base44.asServiceRole.entities.Lead.filter(searchFilter);
    } catch (err) {
      console.error('Lead filter error:', err);
    }

    if (leads.length === 0) {
      return Response.json({ error: isEmail ? 'Email not found' : 'Phone not found' }, { status: 404 });
    }

    const lead = leads[0];

    // Find or create User for this Lead
    let user;
    try {
      const usersByPhone = await base44.asServiceRole.entities.User.filter({ phone: cleanPhone });

      if (usersByPhone.length > 0) {
        user = usersByPhone[0];
        await base44.asServiceRole.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
      } else {
        // Create new User from Lead
        let freePlan = null;
        try {
          const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
          freePlan = freePlans.length > 0 ? freePlans[0] : null;
        } catch (planErr) {
          console.error('Plan filter error:', planErr);
        }

        user = await base44.asServiceRole.entities.User.create({
          full_name: lead.name || 'משתמש חדש',
          email: lead.email || `lead_${lead.phone}@bizpilot.local`,
          phone: cleanPhone,
          status: 'active',
          last_login_at: new Date().toISOString(),
          current_plan_id: freePlan?.id || null,
          plan_start_date: new Date().toISOString(),
          marketing_enabled: freePlan?.marketing_enabled || false,
          mentor_enabled: freePlan?.mentor_enabled || true,
          finance_enabled: freePlan?.finance_enabled || false,
          goals_limit: freePlan?.goals_limit || 1,
          max_active_goals: freePlan?.max_active_goals || 1
        });
      }
    } catch (userErr) {
      console.error('User operation error:', userErr);
      throw userErr;
    }

    const userToReturn = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      status: user.status
    };

    return Response.json({ user: userToReturn });
  } catch (error) {
    console.error('Client login error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});