/**
 * setup-outreach-fixture.mjs
 * יוצר נתוני דמה לטסט end-to-end של outreachInboundReply
 *
 * שימוש:
 *   SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/setup-outreach-fixture.mjs
 */

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';

if (!SERVICE_KEY) {
  console.error('ERROR: Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function insert(table, data) {
  const r = await fetch(`${BASE}/rest/v1/${table}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  const d = await r.json();
  if (r.status >= 300) throw new Error(`Insert ${table} failed: ${JSON.stringify(d)}`);
  return Array.isArray(d) ? d[0] : d;
}

async function main() {
  console.log('Creating outreach fixture...\n');

  // 1. Campaign
  const campaign = await insert('outreach_campaigns', {
    name: 'Test Campaign E2E',
    status: 'active',
    sending_email: 'outreach@perfect1.co.il',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('Campaign:', campaign.id);

  // 2. Website
  const website = await insert('outreach_websites', {
    domain: 'test-partner-site.co.il',
    status: 'contacted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('Website:', website.id);

  // 3. Contact
  const contact = await insert('outreach_contacts', {
    campaign_id: campaign.id,
    website_id: website.id,
    email: 'danny@test-partner-site.co.il',
    name: 'דני כהן',
    verified_email_status: 'unknown',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('Contact:', contact.id);

  // 4. Message (status=sent)
  const message = await insert('outreach_messages', {
    campaign_id: campaign.id,
    website_id: website.id,
    contact_id: contact.id,
    subject: 'שיתוף פעולה בין האתרים שלנו',
    body: 'שלום, אני יוסי מ-perfect1.co.il. יש לנו 80+ מאמרים מדורגים בגוגל ואנחנו מחפשים שיתוף פעולה לקישורים הדדיים.',
    status: 'sent',
    sent_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log('Message:', message.id);

  console.log('\n✓ Fixture created. Run:');
  console.log(`  node scripts/test-inbound-reply.cjs ${message.id}`);
  console.log('\nMessage ID to use:', message.id);
}

main().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
