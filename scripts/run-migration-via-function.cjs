/**
 * Run the CRM migration by calling a temporary edge function approach.
 * Since we can't run SQL directly without service_role key,
 * this script invokes the migration SQL via Supabase's authenticated endpoint.
 *
 * Usage: Set SUPABASE_ACCESS_TOKEN env var, then run:
 *   SUPABASE_ACCESS_TOKEN=xxx node scripts/run-migration-via-function.cjs
 *
 * Or get the token from: https://supabase.com/dashboard/account/tokens
 */

const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'rtlpqjqdmomyptcdkmrq';
const MIGRATION_FILE = path.join(__dirname, '..', 'supabase', 'migrations', '20260409100000_crm_enhancements.sql');

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN. Get one from https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log('Running migration:', MIGRATION_FILE);
  console.log('SQL length:', sql.length, 'chars');

  // Use Supabase Management API to run SQL
  const resp = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    console.error('Migration FAILED:', resp.status, body);
    process.exit(1);
  }

  const result = await resp.json();
  console.log('Migration SUCCESS');
  console.log(JSON.stringify(result, null, 2));

  // Verify
  console.log('\n--- Verifying ---');

  const verifySQL = `
    SELECT tablename, policyname FROM pg_policies
    WHERE policyname LIKE '%_auth'
    ORDER BY tablename, policyname;
  `;
  const v1 = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: verifySQL }),
  });
  if (v1.ok) {
    const policies = await v1.json();
    console.log('\nRLS Policies (_auth):');
    console.log(JSON.stringify(policies, null, 2));
  }

  const v2 = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lead_notes' ORDER BY ordinal_position;" }),
  });
  if (v2.ok) {
    const cols = await v2.json();
    console.log('\nlead_notes columns:');
    console.log(JSON.stringify(cols, null, 2));
  }

  const v3 = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_followup_date';" }),
  });
  if (v3.ok) {
    const col = await v3.json();
    console.log('\nnext_followup_date:');
    console.log(JSON.stringify(col, null, 2));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
