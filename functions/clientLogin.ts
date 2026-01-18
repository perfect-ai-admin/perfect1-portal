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
    const cleanCredential = isEmail ? credential : credential.replace(/[^0-9]/g, '');

    // Get free plan for new users
    let freePlan = null;
    try {
      const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      freePlan = freePlans.length > 0 ? freePlans[0] : null;
    } catch (planErr) {
      console.error('Plan filter error:', planErr);
    }

    // Find or create user by email or phone
    let user;
    try {
      const searchFilter = isEmail ? { email: cleanCredential } : { phone: cleanCredential };
      const existingUsers = await base44.asServiceRole.entities.User.filter(searchFilter);

      if (existingUsers.length > 0) {
        // User exists - update last login
        user = existingUsers[0];
        await base44.asServiceRole.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
        console.log('Existing user logged in:', user.id);
      } else {
        // New user - create directly (don't require Lead)
        console.log('Creating new user for:', cleanCredential);
        
        user = await base44.asServiceRole.entities.User.create({
          full_name: 'משתמש חדש',
          email: isEmail ? cleanCredential : `phone_${cleanCredential}@bizpilot.local`,
          phone: isEmail ? '0000000000' : cleanCredential,
          status: 'active',
          login_provider: 'password',
          last_login_at: new Date().toISOString(),
          current_plan_id: freePlan?.id || null,
          plan_start_date: new Date().toISOString(),
          marketing_enabled: freePlan?.marketing_enabled || false,
          mentor_enabled: freePlan?.mentor_enabled !== false ? true : false,
          finance_enabled: freePlan?.finance_enabled || false,
          goals_limit: freePlan?.goals_limit || 1,
          max_active_goals: freePlan?.max_active_goals || 1
        });
        console.log('New user created:', user.id);
      }
    } catch (userErr) {
      console.error('User operation error:', userErr.message);
      return Response.json({ error: 'Failed to create or update user' }, { status: 500 });
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
    return Response.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
});