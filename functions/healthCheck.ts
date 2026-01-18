import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Health check endpoint - verifies system is ready for user logins.
 * Check:
 * 1. Database connectivity
 * 2. Free plan exists
 * 3. Service is operational
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const checks = {
      timestamp: new Date().toISOString(),
      version: 'v2026-01-18'
    };
    
    // Check: Free plan exists
    try {
      console.log('[healthCheck] Checking free plan...');
      const plans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
      checks.free_plan_exists = plans && plans.length > 0;
      checks.free_plan_id = plans?.[0]?.id || 'MISSING';
      if (!checks.free_plan_exists) {
        console.warn('[healthCheck] WARNING: Free plan not found!');
      }
    } catch (planErr) {
      console.error('[healthCheck] Plan check failed:', planErr.message);
      checks.free_plan_error = planErr.message;
    }
    
    // Check: Database connectivity
    checks.database_connected = !!checks.free_plan_id || checks.free_plan_id === 'MISSING';
    
    // Determine overall health
    checks.healthy = checks.free_plan_exists && checks.database_connected;
    checks.status = checks.healthy ? 'OK' : 'DEGRADED';
    
    console.log('[healthCheck] Status:', checks.status, JSON.stringify(checks));
    
    return Response.json(checks, {
      status: checks.healthy ? 200 : 503
    });
    
  } catch (error) {
    console.error('[healthCheck] CRITICAL ERROR:', error.message);
    return Response.json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
});