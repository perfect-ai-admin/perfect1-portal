// billingHealthScanner — Daily scan for missing recurring charges
// Finds active subscriptions with no successful billing_transaction this month.
// Creates billing_alerts (deduped per subscription per month).
// Called by pg_cron at 02:30 Israel time (23:30 UTC).

import { supabaseAdmin, jsonResponse, errorResponse, getCorsHeaders } from '../_shared/supabaseAdmin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // Only run after the 15th (charges happen on 15th)
    const now = new Date();
    const dayOfMonth = now.getUTCDate();
    if (dayOfMonth < 16) {
      console.log('[billingHealthScanner] Skipping — before the 16th, charges not due yet');
      return jsonResponse({ skipped: true, reason: 'before_16th' }, 200, req);
    }

    // Get all active subscriptions
    const { data: activeSubs, error: subErr } = await supabaseAdmin
      .from('subscriptions')
      .select('id, lead_id, plan_name, monthly_price, last_charge_date, next_charge_date')
      .eq('status', 'active');

    if (subErr) throw new Error(subErr.message);
    if (!activeSubs || activeSubs.length === 0) {
      console.log('[billingHealthScanner] No active subscriptions');
      return jsonResponse({ scanned_subscriptions: 0, missing_charges: 0, alerts_created: 0 }, 200, req);
    }

    // Current month boundaries
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    let missingCharges = 0;
    let alertsCreated = 0;

    for (const sub of activeSubs) {
      // Check if there's a successful billing_transaction this month
      const { data: txThisMonth } = await supabaseAdmin
        .from('billing_transactions')
        .select('id')
        .eq('subscription_id', sub.id)
        .eq('status', 'success')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .limit(1);

      if (txThisMonth && txThisMonth.length > 0) continue; // Has charge — OK

      missingCharges++;

      // Check if alert already exists this month (dedup)
      const { data: existingAlert } = await supabaseAdmin
        .from('billing_alerts')
        .select('id')
        .eq('subscription_id', sub.id)
        .eq('alert_type', 'missing_monthly_charge')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth)
        .limit(1);

      if (existingAlert && existingAlert.length > 0) continue; // Already alerted

      // Create alert
      await supabaseAdmin.from('billing_alerts').insert({
        subscription_id: sub.id,
        alert_type: 'missing_monthly_charge',
        metadata: {
          lead_id: sub.lead_id,
          plan_name: sub.plan_name,
          monthly_price: sub.monthly_price,
          last_charge_date: sub.last_charge_date,
          next_charge_date: sub.next_charge_date,
          scanned_at: now.toISOString(),
        },
      });

      alertsCreated++;
      console.log(`[billingHealthScanner] Alert created: sub=${sub.id} plan=${sub.plan_name}`);
    }

    const summary = {
      scanned_subscriptions: activeSubs.length,
      missing_charges: missingCharges,
      alerts_created: alertsCreated,
    };

    console.log('[billingHealthScanner] Done:', JSON.stringify(summary));
    return jsonResponse(summary, 200, req);

  } catch (error) {
    console.error('[billingHealthScanner] Error:', (error as Error).message);
    return errorResponse((error as Error).message, 500, req);
  }
});
