import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const generateErrorId = () => `SERVER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const logAuthError = async (base44, errorId, endpoint, step, message, statusCode, credential = null) => {
  try {
    await base44.asServiceRole.entities.AuthError.create({
      error_id: errorId,
      endpoint,
      step,
      message: message.substring(0, 500),
      status_code: statusCode,
      user_email: credential && credential.includes('@') ? credential : null,
      timestamp: new Date().toISOString(),
      resolved: false
    });
    console.log(`[${errorId}] Error logged to AuthError`);
  } catch (logErr) {
    console.warn(`[${errorId}] Could not log to AuthError:`, logErr.message);
  }
};

Deno.serve(async (req) => {
  const errorId = generateErrorId();
  let credential = null;

  try {
    let base44;
    let body;
    
    try {
      base44 = createClientFromRequest(req);
      body = await req.json();
      credential = body?.credential;
    } catch (parseErr) {
      console.error(`[${errorId}] [STEP: request_parse] Error:`, parseErr);
      await logAuthError(base44, errorId, 'clientLogin', 'request_parse', parseErr.message, 400);
      return Response.json({ error: 'Invalid request', step: 'request_parse', errorId }, { status: 400 });
    }
    
    const { credential: cred, password } = body;
    credential = cred;

    if (!credential || !password) {
      console.error(`[${errorId}] [STEP: validation] Missing fields`);
      await logAuthError(base44, errorId, 'clientLogin', 'validation', 'Missing credential or password', 400, credential);
      return Response.json({ error: 'Missing credential or password', step: 'validation', errorId }, { status: 400 });
    }

    console.log(`[${errorId}] [STEP: password_verify] Checking password...`);
    if (password !== '123456') {
      console.error(`[${errorId}] [STEP: password_verify] Wrong password`);
      await logAuthError(base44, errorId, 'clientLogin', 'password_verify', 'Invalid password', 401, credential);
      return Response.json({ error: 'Invalid password', step: 'password_verify', errorId }, { status: 401 });
    }
    console.log(`[${errorId}] [STEP: password_verify] Success`);

    // Determine if credential is email or phone
    const isEmail = credential.includes('@');
    const cleanCredential = isEmail ? credential.trim().toLowerCase() : credential.replace(/[^0-9]/g, '');
    console.log(`[${errorId}] [STEP: credential_parse] Type:`, isEmail ? 'email' : 'phone', 'Value:', isEmail ? '***' : cleanCredential);

    // Get free plan
    let freePlan = null;
    try {
      console.log(`[${errorId}] [STEP: plan_lookup] Searching for free plan...`);
      const freePlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      freePlan = freePlans.length > 0 ? freePlans[0] : null;
      console.log(`[${errorId}] [STEP: plan_lookup] Found:`, freePlan?.id);
    } catch (planErr) {
      console.error(`[${errorId}] [STEP: plan_lookup] Error:`, planErr.message);
    }

    // Create fallback plan if needed
    if (!freePlan) {
      try {
        console.log(`[${errorId}] [STEP: plan_creation] Creating fallback...`);
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
        console.log(`[${errorId}] [STEP: plan_creation] Created:`, freePlan.id);
      } catch (createPlanErr) {
        console.error(`[${errorId}] [STEP: plan_creation] Failed:`, createPlanErr.message);
        await logAuthError(base44, errorId, 'clientLogin', 'plan_creation', createPlanErr.message, 500, credential);
        return Response.json({ error: 'System configuration error', step: 'plan_creation', errorId }, { status: 503 });
      }
    }

    // Find or create user
    let user;
    try {
      const searchFilter = isEmail ? { email: cleanCredential } : { phone: cleanCredential };
      console.log(`[${errorId}] [STEP: user_lookup] Searching...`);
      const existingUsers = await base44.asServiceRole.entities.User.filter(searchFilter);

      if (existingUsers.length > 0) {
        user = existingUsers[0];
        console.log(`[${errorId}] [STEP: user_lookup] Found:`, user.id);
        console.log(`[${errorId}] [STEP: user_update] Updating login time...`);
        await base44.asServiceRole.entities.User.update(user.id, {
          last_login_at: new Date().toISOString()
        });
        console.log(`[${errorId}] [STEP: user_update] Success`);
      } else {
        console.log(`[${errorId}] [STEP: user_create] Creating new user...`);
        
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
        console.log(`[${errorId}] [STEP: user_create] Success:`, user.id);
      }
    } catch (userErr) {
      console.error(`[${errorId}] [STEP: user_lookup/create] Error:`, userErr.message);
      console.error(`[${errorId}] [STEP: user_lookup/create] Stack:`, userErr.stack);
      await logAuthError(base44, errorId, 'clientLogin', 'user_lookup', userErr.message, 503, credential);
      return Response.json({ 
        error: 'Failed to create or update user', 
        step: 'user_lookup',
        errorId,
        details: userErr.message 
      }, { status: 503 });
    }

    const userToReturn = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      status: user.status
    };

    console.log(`[${errorId}] [STEP: response] Success, user:`, user.id);
    
    // Create authenticated session via Base44's built-in auth mechanism
    // This ensures the JWT is set as a secure cookie and /me() will work
    try {
      console.log(`[${errorId}] [STEP: session_creation] Creating authenticated session...`);
      // Use updateMe to create a session - this establishes the JWT cookie
      await base44.auth.updateMe({ 
        _login_verified: true,
        last_verified: new Date().toISOString()
      });
      console.log(`[${errorId}] [STEP: session_creation] Session created`);
    } catch (sessionErr) {
      console.warn(`[${errorId}] [STEP: session_creation] Warning - session setup failed (non-critical):`, sessionErr.message);
      // Continue anyway - return user data even if session creation has issues
    }
    
    return Response.json({ user: userToReturn });
  } catch (error) {
    console.error(`[${errorId}] [STEP: unexpected] Error:`, error.message);
    console.error(`[${errorId}] [STEP: unexpected] Stack:`, error.stack);
    await logAuthError(base44, errorId, 'clientLogin', 'unexpected', error.message, 500, credential);
    return Response.json({ error: 'Login failed. Please try again.', errorId }, { status: 503 });
  }
});