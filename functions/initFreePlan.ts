import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CRITICAL: This function ensures the free plan ALWAYS exists in the database.
 * Must be called on first deployment or if free plan is missing.
 * 
 * Deploy as: backend function
 * Call as: base44.functions.invoke('initFreePlan', {})
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[initFreePlan] Checking if free plan exists...');
    
    // Check if free plan already exists
    const existingPlans = await base44.asServiceRole.entities.Plan.filter({ name: 'חינמי' });
    
    if (existingPlans && existingPlans.length > 0) {
      console.log('[initFreePlan] Free plan already exists:', existingPlans[0].id);
      return Response.json({
        success: true,
        message: 'Free plan already exists',
        plan_id: existingPlans[0].id
      });
    }
    
    console.log('[initFreePlan] Free plan not found, creating...');
    
    // Create the free plan
    const freePlan = await base44.asServiceRole.entities.Plan.create({
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
    
    console.log('[initFreePlan] ✓ Free plan created:', freePlan.id);
    
    return Response.json({
      success: true,
      message: 'Free plan created successfully',
      plan_id: freePlan.id
    });
    
  } catch (error) {
    console.error('[initFreePlan] ERROR:', error.message);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});