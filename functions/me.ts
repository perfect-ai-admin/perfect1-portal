import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get current user
    let user;
    try {
      user = await base44.auth.me();
    } catch (authErr) {
      console.log('[/me] Auth failed:', authErr.message);
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (!user || !user.id) {
      console.log('[/me] No authenticated user');
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    console.log('[/me] User authenticated:', user.id);
    
    // Try to fetch fresh user data from DB
    try {
      console.log('[/me] Fetching user from DB...');
      const users = await base44.asServiceRole.entities.User.filter({ id: user.id });
      
      if (users && users.length > 0) {
        const dbUser = users[0];
        console.log('[/me] User found in DB:', dbUser.id);
        return Response.json({
          status: 'ready',
          user: {
            id: dbUser.id,
            email: dbUser.email,
            full_name: dbUser.full_name,
            phone: dbUser.phone,
            status: dbUser.status,
            current_plan_id: dbUser.current_plan_id,
            marketing_enabled: dbUser.marketing_enabled,
            mentor_enabled: dbUser.mentor_enabled,
            finance_enabled: dbUser.finance_enabled
          }
        });
      } else {
        console.log('[/me] User not yet in DB (new user), returning pending');
        // New user - account still being created
        return Response.json({
          status: 'pending',
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name
          }
        });
      }
    } catch (dbErr) {
      console.error('[/me] DB fetch error:', dbErr.message);
      // If DB query fails, still return pending (don't crash)
      console.log('[/me] Returning pending due to DB error');
      return Response.json({
        status: 'pending',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }
      });
    }
    
  } catch (error) {
    console.error('[/me] Unexpected error:', error.message);
    // Never return 500 — always return a safe response
    return Response.json({
      status: 'error',
      message: 'Service temporarily unavailable'
    }, { status: 503 });
  }
});