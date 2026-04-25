/**
 * One-shot: append cross-category relatedArticles entries to authority pages,
 * pointing into the orphan categories (cities, services, maam, misui, amuta,
 * osek-zeir). Sitewide internal-linking signal to surface those URLs to Google.
 *
 * Idempotent — skips an entry if the same {category, slug} already exists in
 * the article's relatedArticles. Run once via: node scripts/add-cross-category-links.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');

// authority article  →  orphan-category links to inject
const PLAN = {
  'osek-patur/how-to-open': [
    { category: 'amuta',     slug: 'how-to-open',  title: 'פתיחת עמותה — מדריך מלא' },
    { category: 'osek-zeir', slug: 'how-to-open',  title: 'פתיחת עוסק זעיר — מדריך מלא' },
    { category: 'cities',    slug: 'tel-aviv',     title: 'פתיחת עסק בתל אביב — מדריך מקומי' },
  ],
  'osek-patur/cost': [
    { category: 'amuta',     slug: 'cost',         title: 'כמה עולה לפתוח עמותה' },
    { category: 'osek-zeir', slug: 'what-is',      title: 'מה זה עוסק זעיר?' },
    { category: 'misui',     slug: 'tax-20000',    title: 'מיסוי לעצמאי שמרוויח עד 20,000 ₪' },
  ],
  'osek-patur/accountant': [
    { category: 'amuta',    slug: 'accountant',           title: 'רואה חשבון לעמותה' },
    { category: 'services', slug: 'bookkeeping-service',  title: 'שירותי הנהלת חשבונות' },
  ],
  'osek-patur/taxes': [
    { category: 'misui', slug: 'tax-brackets',  title: 'מדרגות מס הכנסה לעצמאי 2026' },
    { category: 'misui', slug: 'tax-50000',     title: 'מיסוי לעצמאי שמרוויח 50,000 ₪' },
  ],
  'osek-patur/management': [
    { category: 'osek-zeir', slug: 'management', title: 'ניהול שוטף עוסק זעיר' },
    { category: 'misui',     slug: 'advance-payments', title: 'מקדמות מס הכנסה לעצמאי' },
  ],
  'osek-murshe/how-to-open': [
    { category: 'services', slug: 'open-company-service', title: 'שירותי פתיחת חברה' },
    { category: 'cities',   slug: 'tel-aviv',             title: 'פתיחת עסק בתל אביב' },
  ],
  'osek-murshe/vat-guide': [
    { category: 'maam', slug: 'what-is-vat', title: 'מה זה מע"מ — מדריך מלא' },
  ],
  'osek-murshe/tax-deductions': [
    { category: 'misui', slug: 'tax-50000',  title: 'מיסוי לעצמאי שמרוויח 50,000 ₪' },
    { category: 'misui', slug: 'tax-brackets', title: 'מדרגות מס הכנסה 2026' },
  ],
  'osek-murshe/cost': [
    { category: 'services', slug: 'open-company-service', title: 'שירותי פתיחת חברה' },
    { category: 'cities',   slug: 'jerusalem',            title: 'פתיחת עסק בירושלים' },
  ],
  'osek-murshe/taxes': [
    { category: 'maam',  slug: 'what-is-vat',      title: 'מע"מ — מדריך מלא' },
    { category: 'misui', slug: 'advance-payments', title: 'מקדמות מס הכנסה' },
  ],
  'hevra-bam/how-to-open': [
    { category: 'services', slug: 'open-company-service', title: 'שירותי הקמת חברה' },
    { category: 'cities',   slug: 'tel-aviv',             title: 'הקמת חברה בתל אביב' },
  ],
  'hevra-bam/cost': [
    { category: 'services', slug: 'open-company-service', title: 'שירותי הקמת חברה' },
  ],
  'guides/opening-business': [
    { category: 'amuta',     slug: 'how-to-open', title: 'פתיחת עמותה' },
    { category: 'osek-zeir', slug: 'how-to-open', title: 'פתיחת עוסק זעיר' },
    { category: 'cities',    slug: 'tel-aviv',    title: 'פתיחת עסק בתל אביב' },
  ],
  'guides/which-business-type': [
    { category: 'osek-zeir', slug: 'zeir-vs-patur', title: 'עוסק זעיר מול עוסק פטור' },
    { category: 'amuta',     slug: 'how-to-open',   title: 'פתיחת עמותה — מתי כדאי' },
  ],
  'guides/freelancers': [
    { category: 'misui',    slug: 'tax-30000',           title: 'מיסוי לעצמאי שמרוויח 30,000 ₪' },
    { category: 'services', slug: 'bookkeeping-service', title: 'שירותי הנהלת חשבונות' },
  ],
  'guides/taxation': [
    { category: 'misui', slug: 'tax-brackets',     title: 'מדרגות מס הכנסה 2026' },
    { category: 'misui', slug: 'advance-payments', title: 'מקדמות מס הכנסה' },
    { category: 'maam',  slug: 'what-is-vat',      title: 'מע"מ — מדריך מלא' },
  ],
};

let edited = 0, skippedEntries = 0, addedEntries = 0;

for (const [articleKey, newLinks] of Object.entries(PLAN)) {
  const filePath = path.join(CONTENT, articleKey + '.json');
  if (!fs.existsSync(filePath)) {
    console.log('SKIP (missing): ' + articleKey);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.relatedArticles = data.relatedArticles || [];

  let added = 0;
  for (const link of newLinks) {
    const targetPath = path.join(CONTENT, link.category, link.slug + '.json');
    if (!fs.existsSync(targetPath)) {
      console.log('  SKIP target missing: ' + link.category + '/' + link.slug);
      continue;
    }
    const dup = data.relatedArticles.some(
      (r) => r.category === link.category && r.slug === link.slug
    );
    if (dup) { skippedEntries++; continue; }
    data.relatedArticles.push(link);
    added++;
    addedEntries++;
  }

  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('+' + added + ' links → ' + articleKey);
    edited++;
  }
}

console.log('\n=== Done ===');
console.log('Articles edited: ' + edited);
console.log('Links added: ' + addedEntries);
console.log('Links already present (skipped): ' + skippedEntries);
