import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    let base44;
    let body;
    
    try {
      base44 = createClientFromRequest(req);
      body = await req.json();
    } catch (parseErr) {
      console.error('[STEP: request_parse] Error:', parseErr);
      return Response.json({ error: 'Invalid request', step: 'request_parse' }, { status: 400 });
    }
    
    const { credential, password } = body;

    if (!credential || !password) {
      return Response.json({ error: 'Missing credential or password', step: 'validation' }, { status: 400 });
    }

    console.log('[STEP: password_verify] Checking password...');
    if (password !== '123456') {
      return Response.json({ error: 'Invalid password', step: 'password_verify' }, { status: 401 });
    }
    console.log('[STEP: password_verify] Success');

    // Determine if credential is email or phone
    const isEmail = credential.includes('@');
    const cleanCredential = isEmail ? credential.trim().toLowerCase() : credential.replace(/[^0-9]/g, '');
    console.log('[STEP: credential_parse] Type:', isEmail ? 'email' : 'phone', 'Value:', isEmail ? '***' : cleanCredential);

    // Get free plan
    let freePlan = null;
    try {
      console.log('[STEP: plan_lookup] Searching for free plan...');
      const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      freePlan = freePlans.length > 0 ? freePlans[0] : null;
      console.log('[STEP: plan_lookup] Found:', freePlan?.id);
    } catch (planErr) {
      console.error('[STEP: plan_lookup] Error:', planErr.message);
    }

    // Create fallback plan if needed
    if (!freePlan) {
      try {
        console.log('[STEP: plan_creation] Creating fallback...');
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
        console.log('[STEP: plan_creation] Created:', freePlan.id);
      } catch (createPlanErr) {
        console.error('[STEP: plan_creation] Failed:', createPlanErr.message);
        return Response.json({ error: 'System configuration error', step: 'plan_creation' }, { status: 500 });
      }
    }

    // Find or create user
    let user;
    try {
      const searchFilter = isEmail ? { email: cleanCredential } : { phone: cleanCredential };
      console.log('[STEP: user_lookup] Searching...');
      const existingUsers = await base44.asServiceRole.entities.User.filter(searchFilter);

      if (existingUsers.length > 0) {
        user = existingUsers[0];
        console.log('[STEP: user_lookup] Found:', user.id);
        console.log('[STEP: user_update] Updating login time...');
        await base44.asServiceRole.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
        console.log('[STEP: user_update] Success');
      } else {
        console.log('[STEP: user_create] Creating new user...');
        
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
        
        user = await base44.asServiceRole.entities.User.create(newUserData);
        console.log('[STEP: user_create] Success:', user.id);
      }
    } catch (userErr) {
      console.error('[STEP: user_lookup/create] Error:', userErr.message);
      console.error('[STEP: user_lookup/create] Stack:', userErr.stack);
      return Response.json({ 
        error: 'Failed to create or update user', 
        step: 'user_lookup',
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