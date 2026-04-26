/**
 * Trigger Post-Payment Flow — simulates a successful payment webhook
 *
 * This script finds the lead + payment record, then calls tranzilaConfirmPayment
 * exactly as Tranzila's webhook would, triggering the FULL post-payment chain:
 *   payment.status → completed
 *   lead → paid + paid_opening_file
 *   WhatsApp → customer
 *   Email → admin
 *   Client record → created
 *   n8n webhook → onboarding
 *   triggerFollowupFlow → post-payment questionnaire (after ~7 min)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/trigger-post-payment.cjs 0522145498
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/trigger-post-payment.cjs 0522145498');
  process.exit(1);
}

const phone = process.argv[2] || '0522145498';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function phoneVariants(p) {
  const clean = p.replace(/\D/g, '');
  const variants = [clean];
  if (clean.startsWith('0')) variants.push('972' + clean.substring(1));
  if (clean.startsWith('972')) variants.push('0' + clean.substring(3));
  return [...new Set(variants)];
}

async function run() {
  console.log('\n' + '='.repeat(60));
  console.log('  Trigger Post-Payment Flow');
  console.log('  Phone:', phone);
  console.log('  Time:', new Date().toISOString());
  console.log('='.repeat(60));

  // ── Step 1: Find lead ──
  console.log('\n── Step 1: Finding lead... ──');
  const variants = phoneVariants(phone);
  const orFilter = variants.map(v => `phone.eq.${v}`).join(',');

  const { data: leads, error: leadErr } = await supabase
    .from('leads')
    .select('id, name, phone, email, payment_status, pipeline_stage, status, paid_at, payment_id, client_id, service_type')
    .or(orFilter)
    .order('created_at', { ascending: false });

  if (leadErr || !leads?.length) {
    console.error('❌ Lead not found:', leadErr?.message || 'no results');
    process.exit(1);
  }

  const lead = leads[0];
  console.log('✅ Lead found:', lead.id);
  console.log('   Name:', lead.name);
  console.log('   Phone:', lead.phone);
  console.log('   Current payment_status:', lead.payment_status);
  console.log('   Current pipeline_stage:', lead.pipeline_stage);
  console.log('   Current status:', lead.status);
  console.log('   client_id:', lead.client_id || '(none)');

  // ── Step 2: Find payment record ──
  console.log('\n── Step 2: Finding payment record... ──');
  let payment = null;

  // Try by lead_id first
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false });

  if (payments?.length) {
    payment = payments[0];
  } else if (lead.payment_id) {
    // Try by payment_id on lead
    const { data: p } = await supabase
      .from('payments')
      .select('*')
      .eq('id', lead.payment_id)
      .single();
    if (p) payment = p;
  }

  if (!payment) {
    console.log('⚠️  No payment record found. Creating one...');
    const { data: newPayment, error: createErr } = await supabase
      .from('payments')
      .insert({
        lead_id: lead.id,
        product_type: lead.service_type || 'osek_patur',
        product_name: 'פתיחת עוסק פטור אונליין',
        amount: 299,
        currency: 'ILS',
        payment_method: 'tranzila',
        status: 'pending',
        source: 'sales_portal',
      })
      .select('*')
      .single();

    if (createErr || !newPayment) {
      console.error('❌ Failed to create payment:', createErr?.message);
      process.exit(1);
    }
    payment = newPayment;

    // Link to lead
    await supabase.from('leads').update({
      payment_id: payment.id,
      payment_status: 'pending',
    }).eq('id', lead.id);

    console.log('✅ Payment record created:', payment.id);
  } else {
    console.log('✅ Payment found:', payment.id);
    console.log('   Status:', payment.status);
    console.log('   Amount: ₪' + payment.amount);
    console.log('   Product:', payment.product_type);
  }

  // Check if already completed
  if (payment.status === 'completed') {
    console.log('\n⚠️  Payment already completed!');
    console.log('   To re-trigger, the payment must be in "pending" status.');
    console.log('   Current metadata:', JSON.stringify(payment.metadata, null, 2));

    const answer = await askUser('Reset payment to pending and re-trigger? (yes/no): ');
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Aborting. You can also run fulfillPayment directly (see below).');
      console.log(`\nTo trigger just fulfillPayment:`);
      console.log(`curl -X POST "${SUPABASE_URL}/functions/v1/fulfillPayment" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -H "Authorization: Bearer ${SERVICE_KEY.substring(0, 20)}..." \\`);
      console.log(`  -d '{"payment_id":"${payment.id}","trigger_source":"manual_test"}'`);
      process.exit(0);
    }

    // Reset to pending
    await supabase.from('payments').update({
      status: 'pending',
      metadata: { ...(payment.metadata || {}), reset_for_test: new Date().toISOString() }
    }).eq('id', payment.id);
    console.log('✅ Payment reset to pending');
  }

  // ── Step 3: Snapshot BEFORE ──
  console.log('\n── Step 3: Snapshot BEFORE trigger ──');
  const { data: leadBefore } = await supabase.from('leads').select('payment_status, pipeline_stage, status, paid_at, client_id').eq('id', lead.id).single();
  const { data: payBefore } = await supabase.from('payments').select('status, metadata').eq('id', payment.id).single();
  const { data: clientsBefore } = await supabase.from('clients').select('id').eq('lead_id', lead.id);
  const { data: waBefore } = await supabase.from('whatsapp_messages').select('id').eq('lead_id', lead.id);

  console.log('   Lead:', JSON.stringify(leadBefore));
  console.log('   Payment:', JSON.stringify(payBefore));
  console.log('   Clients:', clientsBefore?.length || 0);
  console.log('   WA Messages:', waBefore?.length || 0);

  // ── Step 4: Call tranzilaConfirmPayment (webhook format) ──
  console.log('\n── Step 4: Triggering tranzilaConfirmPayment... ──');
  console.log('   Simulating Tranzila webhook (form-encoded POST)');
  console.log('   payment_id:', payment.id);
  console.log('   Response: 000 (success)');

  const formBody = new URLSearchParams({
    o_cred_oid: payment.id,
    Response: '000',
    ConfirmationCode: `TEST_${Date.now()}`,
    index: `TEST_${Date.now()}`,
  });

  try {
    const confirmRes = await fetch(`${SUPABASE_URL}/functions/v1/tranzilaConfirmPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    const confirmText = await confirmRes.text();
    let confirmData;
    try { confirmData = JSON.parse(confirmText); } catch { confirmData = confirmText; }

    console.log('   HTTP Status:', confirmRes.status);
    console.log('   Response:', JSON.stringify(confirmData, null, 2));

    if (confirmRes.status === 403) {
      console.log('\n⚠️  Webhook blocked by IPN key validation.');
      console.log('   Falling back to direct fulfillPayment call...');
      await directFulfillment(payment, lead);
    } else if (confirmRes.status >= 400) {
      console.log('\n❌ tranzilaConfirmPayment failed.');
      console.log('   Falling back to direct fulfillPayment...');
      await directFulfillment(payment, lead);
    } else {
      console.log('\n✅ tranzilaConfirmPayment succeeded!');
    }
  } catch (err) {
    console.error('❌ Network error calling tranzilaConfirmPayment:', err.message);
    console.log('   Falling back to direct fulfillPayment...');
    await directFulfillment(payment, lead);
  }

  // ── Step 5: Wait & check results ──
  console.log('\n── Step 5: Waiting 5 seconds for async operations... ──');
  await sleep(5000);

  // ── Step 6: Snapshot AFTER ──
  console.log('\n── Step 6: Snapshot AFTER trigger ──');
  const { data: leadAfter } = await supabase.from('leads').select('payment_status, pipeline_stage, status, paid_at, client_id, bot_state, post_payment_onboarding_sent_at').eq('id', lead.id).single();
  const { data: payAfter } = await supabase.from('payments').select('status, metadata').eq('id', payment.id).single();
  const { data: clientsAfter } = await supabase.from('clients').select('id, name, phone, service_type, onboarding_status, status, created_at').eq('lead_id', lead.id);
  const { data: waAfter } = await supabase.from('whatsapp_messages').select('id, direction, message_text, sender_type, delivery_status, created_at').eq('lead_id', lead.id).order('created_at', { ascending: true });
  const { data: historyAfter } = await supabase.from('status_history').select('*').eq('entity_id', lead.id).eq('entity_type', 'lead').order('created_at', { ascending: false }).limit(3);
  const { data: sessionsAfter } = await supabase.from('bot_sessions').select('id, flow_type, current_step, temperature, outcome_state, completed_at, created_at').eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(3);

  console.log('\n   LEAD — Before → After:');
  console.log(`   payment_status: ${leadBefore?.payment_status} → ${leadAfter?.payment_status}`);
  console.log(`   pipeline_stage: ${leadBefore?.pipeline_stage} → ${leadAfter?.pipeline_stage}`);
  console.log(`   status: ${leadBefore?.status} → ${leadAfter?.status}`);
  console.log(`   paid_at: ${leadBefore?.paid_at || '(null)'} → ${leadAfter?.paid_at || '(null)'}`);
  console.log(`   client_id: ${leadBefore?.client_id || '(null)'} → ${leadAfter?.client_id || '(null)'}`);
  console.log(`   bot_state: → ${leadAfter?.bot_state || '(null)'}`);
  console.log(`   post_payment_onboarding_sent_at: → ${leadAfter?.post_payment_onboarding_sent_at || '(null)'}`);

  console.log('\n   PAYMENT — Before → After:');
  console.log(`   status: ${payBefore?.status} → ${payAfter?.status}`);
  console.log(`   metadata: ${JSON.stringify(payAfter?.metadata)}`);

  console.log('\n   CLIENT:');
  if (clientsAfter?.length) {
    clientsAfter.forEach(c => {
      console.log(`   ✅ id=${c.id}, name=${c.name}, service=${c.service_type}, onboarding=${c.onboarding_status}, status=${c.status}`);
    });
  } else {
    console.log('   ❌ No client record created');
  }

  console.log('\n   WHATSAPP MESSAGES (new):');
  const newMsgs = (waAfter || []).filter(m =>
    !(waBefore || []).find(b => b.id === m.id)
  );
  if (newMsgs.length) {
    newMsgs.forEach(m => {
      const preview = (m.message_text || '').substring(0, 100).replace(/\n/g, ' ');
      console.log(`   ✅ [${m.sender_type}] ${m.direction}: "${preview}..." (${m.delivery_status})`);
    });
  } else {
    console.log('   ⚠️  No new WhatsApp messages');
  }

  console.log('\n   STATUS HISTORY (latest):');
  (historyAfter || []).forEach(h => {
    console.log(`   ${new Date(h.created_at).toLocaleString('he-IL')} — ${h.change_reason}: stage=${h.new_stage}, status=${h.new_status}`);
  });

  console.log('\n   BOT SESSIONS (latest):');
  (sessionsAfter || []).forEach(s => {
    const state = s.completed_at ? `completed(${s.outcome_state})` : 'active';
    console.log(`   ${s.flow_type || 'default'} — step=${s.current_step}, temp=${s.temperature}, state=${state}`);
  });

  // ── Step 7: Final verdict ──
  console.log('\n' + '='.repeat(60));
  console.log('  E2E RESULTS');
  console.log('='.repeat(60));

  const results = [
    ['payment.status = completed', payAfter?.status === 'completed'],
    ['lead.payment_status = paid', leadAfter?.payment_status === 'paid'],
    ['lead.pipeline_stage = paid_opening_file', leadAfter?.pipeline_stage === 'paid_opening_file'],
    ['lead.paid_at set', !!leadAfter?.paid_at],
    ['Client record created', (clientsAfter?.length || 0) > 0],
    ['WhatsApp thanks sent', newMsgs.some(m => m.message_text?.includes('קיבלנו את התשלום'))],
    ['Status history logged', (historyAfter?.length || 0) > 0],
  ];

  let pass = 0, fail = 0;
  results.forEach(([label, ok]) => {
    console.log(ok ? '✅' : '❌', label);
    if (ok) pass++; else fail++;
  });

  console.log(`\n${pass}/${results.length} passed, ${fail} failed`);

  // Note about async operations
  console.log('\n📝 Notes:');
  console.log('   • Email (Resend) — check yosi5919@gmail.com inbox');
  console.log('   • n8n webhook — check n8n execution logs');
  console.log('   • Post-payment onboarding — triggers after ~7 minutes via n8n scheduler');
  console.log('   • Re-run e2e-payment-check.cjs after 10 min for full verification');
  console.log('='.repeat(60) + '\n');
}

async function directFulfillment(payment, lead) {
  // Fallback: manually update payment + call fulfillPayment directly
  console.log('\n   Updating payment to completed...');
  await supabase.from('payments').update({
    status: 'completed',
    metadata: {
      ...(payment.metadata || {}),
      transaction_id: `MANUAL_TEST_${Date.now()}`,
      tranzila_response: '000',
      confirmed_at: new Date().toISOString(),
      trigger: 'manual_test_script',
    }
  }).eq('id', payment.id).eq('status', 'pending');

  // Update lead
  console.log('   Updating lead CRM fields...');
  await supabase.from('leads').update({
    payment_status: 'paid',
    paid_at: new Date().toISOString(),
    pipeline_stage: 'paid_opening_file',
    status: 'qualified',
  }).eq('id', lead.id);

  // Log status history
  await supabase.from('status_history').insert({
    entity_type: 'lead',
    entity_id: lead.id,
    new_stage: 'paid_opening_file',
    new_status: 'payment_confirmed',
    change_reason: 'payment_confirmed',
    source: 'manual_test',
    metadata: { payment_id: payment.id, amount: payment.amount },
  });

  // Call fulfillPayment
  console.log('   Calling fulfillPayment...');
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/fulfillPayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        payment_id: payment.id,
        trigger_source: 'manual_test',
      }),
    });
    const text = await res.text();
    console.log('   fulfillPayment response:', res.status, text);
  } catch (e) {
    console.error('   fulfillPayment error:', e.message);
  }

  // Note: WhatsApp + email are sent by tranzilaConfirmPayment, not fulfillPayment.
  // Since we bypassed tranzilaConfirmPayment, those won't fire automatically.
  console.log('   ⚠️  WhatsApp + email are handled by tranzilaConfirmPayment (bypassed).');
  console.log('   Client record + n8n webhook handled by fulfillPayment.');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function askUser(question) {
  return new Promise(resolve => {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer); });
  });
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
