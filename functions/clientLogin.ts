import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return Response.json({ error: 'Missing phone or password' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Search for Lead by phone
    const leads = await base44.asServiceRole.entities.Lead.filter({ phone: cleanPhone });

    if (leads.length === 0) {
      return Response.json({ error: 'Phone not found' }, { status: 404 });
    }

    const lead = leads[0];

    // Verify password
    if (password !== '123456') {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Find or create User for this Lead
    let user;
    const usersByPhone = await base44.asServiceRole.entities.User.filter({ phone: cleanPhone });

    if (usersByPhone.length > 0) {
      user = usersByPhone[0];
      await base44.asServiceRole.entities.User.update(user.id, {
        last_login_at: new Date().toISOString()
      });
    } else {
      // Create new User from Lead
      const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      const freePlan = freePlans.length > 0 ? freePlans[0] : null;

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