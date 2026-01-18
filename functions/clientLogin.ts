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

    // Get free plan - MUST exist or create placeholder
    let freePlan = null;
    try {
      const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      freePlan = freePlans.length > 0 ? freePlans[0] : null;
      console.log('Free plan found:', freePlan?.id);
    } catch (planErr) {
      console.error('Plan filter error:', planErr);
    }

    // If no free plan exists, create one as fallback
    if (!freePlan) {
      try {
        console.log('Creating fallback free plan...');
        freePlan = await base44.asServiceRole.entities.Plan.create({
          name: 'חינמי',
          name_en: 'Free',
          price: 0,
          billing_type: 'monthly',
          marketing_enabled: false,
          mentor_enabled: true,
          finance_enabled: false,
          goals_limit: 1,
          max_active_goals: 1,
          is_active: true,
          display_order: 0
        });
        console.log('Fallback plan created:', freePlan.id);
      } catch (createPlanErr) {
        console.error('Failed to create fallback plan:', createPlanErr.message);
        return Response.json({ error: 'System configuration error', step: 'plan_creation' }, { status: 500 });
      }
    }

    // Find or create user by email or phone
    let user;
    try {
      const searchFilter = isEmail ? { email: cleanCredential } : { phone: cleanCredential };
      console.log('Searching for user with filter:', JSON.stringify(searchFilter));
      const existingUsers = await base44.asServiceRole.entities.User.filter(searchFilter);

      if (existingUsers.length > 0) {
        // User exists - update last login
        user = existingUsers[0];
        console.log('User exists, updating login time:', user.id);
        await base44.asServiceRole.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
        console.log('Existing user logged in:', user.id);
      } else {
        // New user - create with required fields guaranteed
        console.log('Creating new user for:', cleanCredential);
        
        const newUserData = {
          full_name: 'משתמש חדש',
          email: isEmail ? cleanCredential : `phone_${cleanCredential}@bizpilot.local`,
          phone: isEmail ? '0000000000' : cleanCredential,
          status: 'active',
          login_provider: 'password',
          last_login_at: new Date().toISOString(),
          current_plan_id: freePlan.id,
          plan_start_date: new Date().toISOString(),
          marketing_enabled: false,
          mentor_enabled: true,
          finance_enabled: false,
          goals_limit: 1,
          max_active_goals: 1
        };
        
        console.log('Creating user with data:', JSON.stringify({...newUserData, email: '***'}));
        user = await base44.asServiceRole.entities.User.create(newUserData);
        console.log('New user created:', user.id);
      }
    } catch (userErr) {
      console.error('User operation failed - step: db_insert', userErr.message, userErr.stack);
      return Response.json({ 
        error: 'Failed to create or update user', 
        step: 'db_insert',
        details: userErr.message 
      }, { status: 500 });
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