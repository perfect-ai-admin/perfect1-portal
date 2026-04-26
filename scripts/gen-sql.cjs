const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');

const websites = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'outreach-websites.json'), 'utf8'));

function esc(s) {
  if (!s) return '';
  return s.replace(/'/g, "''").replace(/\\/g, '').replace(/\0/g, '').slice(0, 400);
}

// Generate website INSERT chunks
const CHUNK = 50;
const totalChunks = Math.ceil(websites.length / CHUNK);

for (let c = 0; c < totalChunks; c++) {
  const batch = websites.slice(c * CHUNK, (c + 1) * CHUNK);
  let sql = 'INSERT INTO outreach_websites (domain, name, niche, relevance_score, country, language, notes, status) VALUES\n';
  const rows = batch.map(w =>
    `('${esc(w.domain)}', '${esc(w.name)}', '${esc(w.niche)}', ${w.relevance_score}, '${w.country}', '${w.language}', '${esc(w.notes)}', 'new')`
  );
  sql += rows.join(',\n');
  sql += '\nON CONFLICT (domain) DO UPDATE SET relevance_score = GREATEST(outreach_websites.relevance_score, EXCLUDED.relevance_score), updated_at = NOW();';
  fs.writeFileSync(path.join(DATA_DIR, `w-${c + 1}.sql`), sql);
}
console.log(`Generated ${totalChunks} website chunks`);

// Generate contacts INSERT
const contactsFile = path.join(DATA_DIR, 'outreach-contacts.json');
if (fs.existsSync(contactsFile)) {
  const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
  // Group by batches
  const CBATCH = 30;
  const cChunks = Math.ceil(contacts.length / CBATCH);
  for (let c = 0; c < cChunks; c++) {
    const batch = contacts.slice(c * CBATCH, (c + 1) * CBATCH);
    const stmts = batch.map(ct =>
      `INSERT INTO outreach_contacts (website_id, email, contact_source, is_primary, verified_email_status)\nSELECT w.id, '${esc(ct.email)}', '${esc(ct.contact_source)}', ${ct.is_primary}, 'unknown'\nFROM outreach_websites w WHERE w.domain = '${esc(ct.domain)}'\nAND NOT EXISTS (SELECT 1 FROM outreach_contacts c WHERE c.website_id = w.id AND c.email = '${esc(ct.email)}');`
    );
    fs.writeFileSync(path.join(DATA_DIR, `c-${c + 1}.sql`), stmts.join('\n'));
  }
  console.log(`Generated ${cChunks} contact chunks (${contacts.length} contacts)`);
}
