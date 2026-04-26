/**
 * E2E Payment Flow Checker
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/e2e-payment-check.cjs 0522145498
 *
 * Or set the key inline:
 *   node scripts/e2e-payment-check.cjs 0522145498
 *   (will prompt you to set the env var if missing)
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY env var');
  console.error('Run: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/e2e-payment-check.cjs 0522145498');
  process.exit(1);
}

const phone = process.argv[2] || '0522145498';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Normalize phone variants for search
function phoneVariants(p) {
  const clean = p.replace(/\D/g, '');
  const variants = [clean];
  if (clean.startsWith('0')) variants.push('972' + clean.substring(1));
  if (clean.startsWith('972')) variants.push('0' + clean.substring(3));
  variants.push('+972' + clean.replace(/^0/, '').replace(/^972/, ''));
  return [...new Set(variants)];
}

const CHECK = '✅';
const FAIL = '❌';
const WARN = '⚠️';
const INFO = 'ℹ️';

async function run() {
  const variants = phoneVariants(phone);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  E2E Payment Check — ${phone}`);
  console.log(`  ${new Date().toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  // ── 1. FIND LEAD ──
  console.log('── 1. LEAD ──');
  const orFilter = variants.map(v => `phone.eq.${v}`).join(',');
  const { data: leads, error: leadsErr } = await supabase
    .from('leads')
    .select('*')
    .or(orFilter)
    .order('created_at', { ascending: false });

  if (leadsErr) {
    console.error(FAIL, 'Lead query failed:', leadsErr.message);
    process.exit(1);
  }
  if (!leads || leads.length === 0) {
    console.log(FAIL, 'No lead found for phone', phone);
    process.exit(1);
  }

  console.log(CHECK, `Found ${leads.length} lead(s)`);
  if (leads.length > 1) {
    console.log(WARN, `Multiple leads detected — possible duplicates!`);
  }

  const lead = leads[0]; // most recent
  console.log(INFO, `Lead ID: ${lead.id}`);
  console.log(INFO, `Name: ${lead.name}`);
  console.log(INFO, `Phone: ${lead.phone}`);
  console.log(INFO, `Email: ${lead.email || '(none)'}`);
  console.log(INFO, `Source: ${lead.source}`);
  console.log(INFO, `Service Type: ${lead.service_type || '(none)'}`);
  console.log(INFO, `Created: ${lead.created_at}`);

  // ── 2. CRM STATUS ──
  console.log('\n── 2. CRM STATUS ──');
  const pStatus = lead.payment_status;
  const pStage = lead.pipeline_stage;
  const status = lead.status;

  console.log(pStatus === 'paid' ? CHECK : FAIL, `payment_status: ${pStatus}`);
  console.log(pStage === 'paid_opening_file' ? CHECK : FAIL, `pipeline_stage: ${pStage}`);
  console.log(status === 'qualified' || status === 'converted' ? CHECK : WARN, `status: ${status}`);
  console.log(lead.paid_at ? CHECK : FAIL, `paid_at: ${lead.paid_at || '(null)'}`);
  console.log(INFO, `bot_state: ${lead.bot_state || '(none)'}`);
  console.log(INFO, `flow_type: ${lead.flow_type || '(none)'}`);

  // ── 3. PAYMENT RECORD ──
  console.log('\n── 3. PAYMENT RECORD ──');
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false });

  if (!payments || payments.length === 0) {
    // Try by payment_id on lead
    if (lead.payment_id) {
      const { data: payById } = await supabase
        .from('payments')
        .select('*')
        .eq('id', lead.payment_id)
        .single();
      if (payById) {
        payments?.push(payById) || console.log(INFO, 'Found via lead.payment_id');
        console.log(CHECK, `Payment found via lead.payment_id`);
        printPayment(payById);
      }
    } else {
      console.log(FAIL, 'No payment records found');
    }
  } else {
    console.log(CHECK, `Found ${payments.length} payment(s)`);
    if (payments.length > 1) {
      console.log(WARN, `Multiple payments — check for duplicates`);
    }
    payments.forEach((p, i) => {
      console.log(`\n  Payment ${i + 1}:`);
      printPayment(p);
    });
  }

  function printPayment(p) {
    console.log(p.status === 'completed' ? CHECK : FAIL, `  status: ${p.status}`);
    console.log(INFO, `  id: ${p.id}`);
    console.log(INFO, `  amount: ₪${p.amount}`);
    console.log(INFO, `  product_type: ${p.product_type}`);
    console.log(INFO, `  payment_method: ${p.payment_method}`);
    console.log(INFO, `  lead_id: ${p.lead_id}`);
    console.log(INFO, `  source: ${p.source}`);
    console.log(INFO, `  created: ${p.created_at}`);
    if (p.metadata) {
      console.log(INFO, `  transaction_id: ${p.metadata.transaction_id || '(none)'}`);
      console.log(INFO, `  confirmed_at: ${p.metadata.confirmed_at || '(none)'}`);
    }
  }

  // ── 4. CLIENT RECORD ──
  console.log('\n── 4. CLIENT RECORD ──');
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('lead_id', lead.id);

  if (!clients || clients.length === 0) {
    // Try by client_id on lead
    if (lead.client_id) {
      const { data: clientById } = await supabase
        .from('clients')
        .select('*')
        .eq('id', lead.client_id)
        .single();
      if (clientById) {
        console.log(CHECK, `Client found via lead.client_id`);
        printClient(clientById);
      } else {
        console.log(FAIL, 'lead.client_id set but client not found');
      }
    } else {
      console.log(FAIL, 'No client record found');
    }
  } else {
    console.log(CHECK, `Found ${clients.length} client(s)`);
    if (clients.length > 1) console.log(WARN, 'Multiple clients — duplicate?');
    clients.forEach(c => printClient(c));
  }

  function printClient(c) {
    console.log(INFO, `  id: ${c.id}`);
    console.log(INFO, `  name: ${c.name}`);
    console.log(INFO, `  phone: ${c.phone}`);
    console.log(INFO, `  service_type: ${c.service_type || '(none)'}`);
    console.log(INFO, `  onboarding_status: ${c.onboarding_status}`);
    console.log(INFO, `  status: ${c.status}`);
    console.log(INFO, `  monthly_fee: ₪${c.monthly_fee || 0}`);
    console.log(INFO, `  created: ${c.created_at}`);
  }

  // ── 5. WHATSAPP MESSAGES ──
  console.log('\n── 5. WHATSAPP MESSAGES ──');
  const { data: waMessages } = await supabase
    .from('whatsapp_messages')
    .select('id, direction, message_text, sender_type, message_type, delivery_status, created_at')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: true });

  if (!waMessages || waMessages.length === 0) {
    console.log(WARN, 'No WhatsApp messages found for this lead');
  } else {
    console.log(CHECK, `Found ${waMessages.length} message(s)`);

    // Check for post-payment thank you message
    const thanksMsg = waMessages.find(m =>
      m.direction === 'outbound' &&
      m.message_text &&
      m.message_text.includes('קיבלנו את התשלום')
    );
    console.log(thanksMsg ? CHECK : FAIL, `Post-payment thanks message: ${thanksMsg ? 'SENT' : 'NOT FOUND'}`);

    // Check for payment link message
    const payLinkMsg = waMessages.find(m => m.message_type === 'payment_link');
    console.log(payLinkMsg ? CHECK : INFO, `Payment link message: ${payLinkMsg ? 'SENT' : 'N/A'}`);

    // Check for duplicate messages
    const thanksMsgs = waMessages.filter(m =>
      m.message_text && m.message_text.includes('קיבלנו את התשלום')
    );
    if (thanksMsgs.length > 1) {
      console.log(WARN, `Duplicate thanks messages: ${thanksMsgs.length} found!`);
    } else if (thanksMsgs.length === 1) {
      console.log(CHECK, 'No duplicate thanks messages');
    }

    console.log('\n  Message Timeline:');
    waMessages.forEach((m, i) => {
      const dir = m.direction === 'outbound' ? '→ OUT' : '← IN ';
      const preview = (m.message_text || '').substring(0, 80).replace(/\n/g, ' ');
      console.log(`  ${i + 1}. [${new Date(m.created_at).toLocaleString('he-IL')}] ${dir} (${m.sender_type}) ${preview}...`);
    });
  }

  // ── 6. STATUS HISTORY ──
  console.log('\n── 6. STATUS HISTORY ──');
  const { data: history } = await supabase
    .from('status_history')
    .select('*')
    .eq('entity_id', lead.id)
    .eq('entity_type', 'lead')
    .order('created_at', { ascending: true });

  if (!history || history.length === 0) {
    console.log(WARN, 'No status history records');
  } else {
    console.log(CHECK, `Found ${history.length} status change(s)`);
    history.forEach((h, i) => {
      console.log(`  ${i + 1}. [${new Date(h.created_at).toLocaleString('he-IL')}] ${h.change_reason || h.new_status} → stage: ${h.new_stage || '-'}, status: ${h.new_status || '-'}`);
    });
  }

  // ── 7. ACTIVITY LOG ──
  console.log('\n── 7. ACTIVITY LOG ──');
  const { data: activity } = await supabase
    .from('activity_log')
    .select('*')
    .or(`metadata->>lead_id.eq.${lead.id},entity_id.eq.${lead.payment_id || 'none'}`)
    .order('created_at', { ascending: true });

  if (!activity || activity.length === 0) {
    console.log(WARN, 'No activity log entries found');
  } else {
    console.log(CHECK, `Found ${activity.length} activity log(s)`);
    activity.forEach((a, i) => {
      console.log(`  ${i + 1}. [${new Date(a.created_at).toLocaleString('he-IL')}] ${a.action} — ${a.entity_type}:${a.entity_id}`);
    });
  }

  // ── 8. BOT SESSIONS ──
  console.log('\n── 8. BOT SESSIONS ──');
  const { data: sessions } = await supabase
    .from('bot_sessions')
    .select('id, flow_type, current_step, temperature, outcome_state, completed_at, created_at, messages_count')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false });

  if (!sessions || sessions.length === 0) {
    console.log(INFO, 'No bot sessions');
  } else {
    console.log(CHECK, `Found ${sessions.length} session(s)`);
    sessions.forEach((s, i) => {
      const state = s.completed_at ? `completed (${s.outcome_state || '-'})` : 'active';
      console.log(`  ${i + 1}. [${s.flow_type || 'default'}] step: ${s.current_step || '-'}, temp: ${s.temperature || '-'}, state: ${state}, msgs: ${s.messages_count}`);
    });

    // Check for post-payment onboarding session
    const onboardingSession = sessions.find(s => s.flow_type === 'post_payment_onboarding_flow');
    console.log(onboardingSession ? CHECK : WARN, `Post-payment onboarding session: ${onboardingSession ? 'EXISTS' : 'NOT FOUND (may not have triggered yet)'}`);
  }

  // ── 9. LEAD EVENTS ──
  console.log('\n── 9. LEAD EVENTS ──');
  const { data: events } = await supabase
    .from('lead_events')
    .select('*')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: true });

  if (!events || events.length === 0) {
    console.log(INFO, 'No lead events');
  } else {
    console.log(CHECK, `Found ${events.length} event(s)`);
    events.forEach((e, i) => {
      console.log(`  ${i + 1}. [${new Date(e.created_at).toLocaleString('he-IL')}] ${e.event_type}`);
    });
  }

  // ── 10. DUPLICATES CHECK ──
  console.log('\n── 10. DUPLICATES CHECK ──');

  // Duplicate leads
  if (leads.length > 1) {
    console.log(WARN, `${leads.length} leads with this phone:`);
    leads.forEach((l, i) => {
      console.log(`  ${i + 1}. id=${l.id}, created=${l.created_at}, source=${l.source}, payment_status=${l.payment_status}`);
    });
  } else {
    console.log(CHECK, 'Single lead — no duplicates');
  }

  // Duplicate payments
  const allPayments = payments || [];
  const completedPayments = allPayments.filter(p => p.status === 'completed');
  if (completedPayments.length > 1) {
    console.log(WARN, `${completedPayments.length} completed payments!`);
  } else if (completedPayments.length === 1) {
    console.log(CHECK, 'Single completed payment — no duplicates');
  }

  // ── SUMMARY ──
  console.log(`\n${'='.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const checks = [
    ['Lead exists', leads.length > 0],
    ['payment_status = paid', lead.payment_status === 'paid'],
    ['pipeline_stage = paid_opening_file', lead.pipeline_stage === 'paid_opening_file'],
    ['paid_at set', !!lead.paid_at],
    ['Payment record exists & completed', allPayments.some(p => p.status === 'completed')],
    ['Client record created', (clients && clients.length > 0) || !!lead.client_id],
    ['WhatsApp thanks sent', waMessages && waMessages.some(m => m.message_text && m.message_text.includes('קיבלנו את התשלום'))],
    ['No duplicate leads', leads.length === 1],
    ['No duplicate payments', completedPayments.length <= 1],
    ['Status history logged', history && history.length > 0],
  ];

  let passed = 0;
  let failed = 0;
  checks.forEach(([label, ok]) => {
    console.log(ok ? CHECK : FAIL, label);
    if (ok) passed++; else failed++;
  });

  console.log(`\n${passed}/${checks.length} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
