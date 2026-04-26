/**
 * Outreach Website Scraper
 * Finds relevant Israeli business websites, scores them, extracts contacts.
 * Inserts into outreach_websites + outreach_contacts tables.
 *
 * Usage: node scripts/outreach-scraper.cjs
 */

const fs = require('fs');
const path = require('path');

// SerpAPI key extracted from MCP URL
const SERPAPI_KEY = '0aed25d71e5c7ff6b33747f6d3851000f288cfd22a632b798478c5844cedb79c';

// Output files — will be converted to SQL for insertion via supabase CLI
const OUT_DIR = path.join(__dirname, '..', 'data');
const WEBSITES_FILE = path.join(OUT_DIR, 'outreach-websites.json');
const CONTACTS_FILE = path.join(OUT_DIR, 'outreach-contacts.json');
const SQL_FILE = path.join(OUT_DIR, 'outreach-insert.sql');

// Ensure output dir exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ============================================
// SEARCH QUERIES — targeted by niche
// ============================================
const SEARCH_QUERIES = [
  // === רואי חשבון / הנהלת חשבונות ===
  { q: 'רואה חשבון לעצמאים ישראל', niche: 'רואי חשבון', relevance: 5 },
  { q: 'רואה חשבון לעוסק פטור', niche: 'רואי חשבון', relevance: 5 },
  { q: 'רואה חשבון לעוסק מורשה', niche: 'רואי חשבון', relevance: 5 },
  { q: 'משרד רואי חשבון ישראל', niche: 'רואי חשבון', relevance: 5 },
  { q: 'הנהלת חשבונות לעסקים קטנים', niche: 'הנהלת חשבונות', relevance: 5 },
  { q: 'שירותי הנהלת חשבונות אונליין', niche: 'הנהלת חשבונות', relevance: 5 },
  { q: 'הנהלת חשבונות לחברה בעמ', niche: 'הנהלת חשבונות', relevance: 5 },
  { q: 'accountant israel freelancers', niche: 'רואי חשבון', relevance: 4 },

  // === ייעוץ מס ===
  { q: 'יועץ מס לעצמאים', niche: 'ייעוץ מס', relevance: 5 },
  { q: 'ייעוץ מס לעסקים קטנים ישראל', niche: 'ייעוץ מס', relevance: 5 },
  { q: 'תכנון מס לעצמאים', niche: 'ייעוץ מס', relevance: 5 },
  { q: 'החזרי מס ישראל', niche: 'ייעוץ מס', relevance: 4 },
  { q: 'דוח שנתי מס הכנסה עצמאי', niche: 'ייעוץ מס', relevance: 4 },

  // === עורכי דין לעסקים ===
  { q: 'עורך דין לעסקים קטנים', niche: 'עורכי דין', relevance: 4 },
  { q: 'עורך דין מסחרי ישראל', niche: 'עורכי דין', relevance: 4 },
  { q: 'עורך דין הקמת חברה', niche: 'עורכי דין', relevance: 5 },
  { q: 'עורך דין חוזים לעסקים', niche: 'עורכי דין', relevance: 4 },
  { q: 'עורך דין סטארטאפ ישראל', niche: 'עורכי דין', relevance: 3 },

  // === תוכנות חשבוניות / ניהול עסקי ===
  { q: 'תוכנה להפקת חשבוניות ישראל', niche: 'תוכנות עסקיות', relevance: 5 },
  { q: 'תוכנת הנהלת חשבונות לעצמאים', niche: 'תוכנות עסקיות', relevance: 5 },
  { q: 'אפליקציה לניהול עסק קטן', niche: 'תוכנות עסקיות', relevance: 5 },
  { q: 'תוכנת חשבוניות אונליין', niche: 'תוכנות עסקיות', relevance: 5 },
  { q: 'מערכת CRM לעסקים קטנים ישראל', niche: 'תוכנות עסקיות', relevance: 4 },
  { q: 'invoice software israel', niche: 'תוכנות עסקיות', relevance: 4 },
  { q: 'best accounting software israel', niche: 'תוכנות עסקיות', relevance: 4 },

  // === שיווק דיגיטלי ===
  { q: 'שיווק דיגיטלי לעסקים קטנים', niche: 'שיווק דיגיטלי', relevance: 4 },
  { q: 'חברת קידום אתרים ישראל', niche: 'שיווק דיגיטלי', relevance: 4 },
  { q: 'SEO ישראל עברית', niche: 'שיווק דיגיטלי', relevance: 4 },
  { q: 'סוכנות שיווק דיגיטלי ישראל', niche: 'שיווק דיגיטלי', relevance: 3 },
  { q: 'שיווק ברשתות חברתיות לעסקים', niche: 'שיווק דיגיטלי', relevance: 3 },
  { q: 'בניית אתרים לעסקים קטנים', niche: 'שיווק דיגיטלי', relevance: 3 },

  // === ביטוח לעצמאים ===
  { q: 'ביטוח לעצמאים ישראל', niche: 'ביטוח', relevance: 4 },
  { q: 'ביטוח אחריות מקצועית', niche: 'ביטוח', relevance: 4 },
  { q: 'ביטוח עסק קטן', niche: 'ביטוח', relevance: 4 },
  { q: 'סוכן ביטוח לעצמאים', niche: 'ביטוח', relevance: 3 },

  // === מימון / הלוואות ===
  { q: 'הלוואה לעסק קטן ישראל', niche: 'מימון', relevance: 4 },
  { q: 'מענקים לעסקים קטנים', niche: 'מימון', relevance: 4 },
  { q: 'מימון לעצמאים', niche: 'מימון', relevance: 4 },
  { q: 'קרן מימון לעסקים', niche: 'מימון', relevance: 3 },

  // === חללי עבודה / קואורקינג ===
  { q: 'חלל עבודה משותף ישראל', niche: 'חללי עבודה', relevance: 3 },
  { q: 'קואורקינג תל אביב', niche: 'חללי עבודה', relevance: 3 },
  { q: 'משרד ליום עסקים קטנים', niche: 'חללי עבודה', relevance: 3 },

  // === סליקה / תשלומים ===
  { q: 'סליקת אשראי לעסקים קטנים', niche: 'סליקה', relevance: 4 },
  { q: 'סליקה לעוסק פטור', niche: 'סליקה', relevance: 5 },
  { q: 'תשלומים אונליין לעסקים ישראל', niche: 'סליקה', relevance: 4 },

  // === בלוגים / מגזינים עסקיים ===
  { q: 'בלוג עסקי ישראלי', niche: 'מדיה עסקית', relevance: 4 },
  { q: 'מגזין עסקים ישראל', niche: 'מדיה עסקית', relevance: 4 },
  { q: 'אתר תוכן לעצמאים', niche: 'מדיה עסקית', relevance: 5 },
  { q: 'טיפים לעסקים קטנים בלוג', niche: 'מדיה עסקית', relevance: 4 },
  { q: 'פורום עצמאים ישראל', niche: 'מדיה עסקית', relevance: 4 },
  { q: 'מדריך פתיחת עסק ישראל', niche: 'מדיה עסקית', relevance: 5 },
  { q: 'small business blog israel', niche: 'מדיה עסקית', relevance: 3 },

  // === ייעוץ עסקי ===
  { q: 'יועץ עסקי לעסקים קטנים', niche: 'ייעוץ עסקי', relevance: 4 },
  { q: 'ליווי עסקי לעצמאים', niche: 'ייעוץ עסקי', relevance: 5 },
  { q: 'אימון עסקי ישראל', niche: 'ייעוץ עסקי', relevance: 3 },
  { q: 'תוכנית עסקית ייעוץ', niche: 'ייעוץ עסקי', relevance: 4 },

  // === קורסים / הכשרות ===
  { q: 'קורס פתיחת עסק', niche: 'הכשרות', relevance: 4 },
  { q: 'קורס הנהלת חשבונות', niche: 'הכשרות', relevance: 4 },
  { q: 'קורס שיווק דיגיטלי לעצמאים', niche: 'הכשרות', relevance: 3 },
  { q: 'הכשרה מקצועית לעצמאים', niche: 'הכשרות', relevance: 3 },

  // === פרילנס / עבודה עצמאית ===
  { q: 'פרילנסרים ישראל אתר', niche: 'פרילנס', relevance: 5 },
  { q: 'עבודה עצמאית ישראל מדריך', niche: 'פרילנס', relevance: 5 },
  { q: 'freelance israel platform', niche: 'פרילנס', relevance: 4 },
  { q: 'פלטפורמה לפרילנסרים ישראל', niche: 'פרילנס', relevance: 4 },

  // === ביטוח לאומי / זכויות ===
  { q: 'ביטוח לאומי עצמאים מדריך', niche: 'ביטוח לאומי', relevance: 5 },
  { q: 'זכויות עצמאים ישראל', niche: 'ביטוח לאומי', relevance: 5 },
  { q: 'מדריך ביטוח לאומי עוסק פטור', niche: 'ביטוח לאומי', relevance: 5 },

  // === עמותות / ארגונים ===
  { q: 'ארגון עסקים קטנים ישראל', niche: 'ארגונים', relevance: 4 },
  { q: 'לשכת המסחר ישראל', niche: 'ארגונים', relevance: 3 },
  { q: 'עמותה לקידום עסקים קטנים', niche: 'ארגונים', relevance: 3 },

  // === מקצועות ספציפיים ===
  { q: 'מורים פרטיים עצמאים ישראל', niche: 'מקצועות', relevance: 4 },
  { q: 'מעצבים גרפיים פרילנס ישראל', niche: 'מקצועות', relevance: 3 },
  { q: 'צלמים עצמאים ישראל אתר', niche: 'מקצועות', relevance: 3 },
  { q: 'מאמנים אישיים עצמאים', niche: 'מקצועות', relevance: 3 },
  { q: 'יועצים עצמאים ישראל', niche: 'מקצועות', relevance: 3 },

  // === רשם החברות / ממשלתי ===
  { q: 'פתיחת עוסק מורשה מדריך', niche: 'מדריכים ממשלתיים', relevance: 5 },
  { q: 'רישום חברה בישראל', niche: 'מדריכים ממשלתיים', relevance: 5 },
  { q: 'מע\"מ עוסק מורשה מדריך', niche: 'מדריכים ממשלתיים', relevance: 5 },

  // === כלים דיגיטליים ===
  { q: 'כלים דיגיטליים לעסקים קטנים', niche: 'כלים דיגיטליים', relevance: 4 },
  { q: 'אוטומציה לעסקים קטנים', niche: 'כלים דיגיטליים', relevance: 4 },
  { q: 'AI לעסקים קטנים ישראל', niche: 'כלים דיגיטליים', relevance: 4 },

  // === נדלן / משרדים ===
  { q: 'השכרת משרדים לעסקים קטנים', niche: 'נדל\"ן עסקי', relevance: 2 },
  { q: 'משרד וירטואלי ישראל', niche: 'נדל\"ן עסקי', relevance: 3 },

  // === יבוא / יצוא ===
  { q: 'יבוא יצוא עסקים קטנים ישראל', niche: 'יבוא יצוא', relevance: 3 },
  { q: 'מכס ומע\"מ ביבוא', niche: 'יבוא יצוא', relevance: 3 },

  // === HR / גיוס ===
  { q: 'גיוס עובדים לעסקים קטנים', niche: 'משאבי אנוש', relevance: 3 },
  { q: 'חוקי עבודה מעסיקים ישראל', niche: 'משאבי אנוש', relevance: 4 },
  { q: 'שכר ותנאים עובדים ישראל', niche: 'משאבי אנוש', relevance: 3 },

  // === אקומרס ===
  { q: 'חנות אונליין ישראל הקמה', niche: 'אי-קומרס', relevance: 3 },
  { q: 'מכירות באינטרנט ישראל עצמאים', niche: 'אי-קומרס', relevance: 4 },
  { q: 'Shopify ישראל עברית', niche: 'אי-קומרס', relevance: 3 },

  // === השקעות / פיננסים אישיים ===
  { q: 'השקעות לעצמאים ישראל', niche: 'פיננסים', relevance: 3 },
  { q: 'קרן פנסיה לעצמאים', niche: 'פיננסים', relevance: 4 },
  { q: 'קרן השתלמות עצמאים', niche: 'פיננסים', relevance: 4 },
  { q: 'פיננסים אישיים ישראל בלוג', niche: 'פיננסים', relevance: 3 },
];

// Domains to always skip (our own + big generic sites)
const SKIP_DOMAINS = new Set([
  'perfect1.co.il', 'www.perfect1.co.il',
  'google.com', 'google.co.il', 'facebook.com', 'instagram.com', 'twitter.com',
  'youtube.com', 'linkedin.com', 'tiktok.com', 'pinterest.com',
  'wikipedia.org', 'he.wikipedia.org',
  'gov.il', 'taxes.gov.il', 'btl.gov.il', 'ica.justice.gov.il',
  'ynet.co.il', 'walla.co.il', 'mako.co.il', 'haaretz.co.il',
  'calcalist.co.il', 'globes.co.il', 'themarker.com',
  'amazon.com', 'ebay.com', 'aliexpress.com',
  'reddit.com', 'quora.com', 'medium.com',
]);

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch { return null; }
}

function shouldSkip(domain) {
  if (!domain) return true;
  if (SKIP_DOMAINS.has(domain)) return true;
  // Skip subdomains of big platforms
  if (domain.endsWith('.google.com') || domain.endsWith('.facebook.com')) return true;
  if (domain.endsWith('.gov.il')) return true; // government sites
  return false;
}

// ============================================
// SERPAPI SEARCH
// ============================================
async function searchGoogle(query, start = 0) {
  const params = new URLSearchParams({
    q: query,
    engine: 'google',
    gl: 'il',
    hl: 'he',
    num: '20',
    start: String(start),
    api_key: SERPAPI_KEY,
  });

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) {
      console.error(`  SerpAPI error ${res.status}: ${await res.text()}`);
      return [];
    }
    const data = await res.json();
    return (data.organic_results || []).map(r => ({
      url: r.link,
      title: r.title,
      snippet: r.snippet,
      domain: extractDomain(r.link),
    })).filter(r => r.domain && !shouldSkip(r.domain));
  } catch (err) {
    console.error(`  Search error: ${err.message}`);
    return [];
  }
}

// ============================================
// EMAIL EXTRACTION from a website
// ============================================
async function extractEmailsFromSite(domain) {
  const urls = [
    `https://${domain}`,
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/צור-קשר`,
    `https://www.${domain}`,
    `https://www.${domain}/contact`,
  ];

  const emails = new Set();
  const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PerfectOneBot/1.0; +https://perfect1.co.il)' },
        redirect: 'follow',
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const html = await res.text();

      // Extract emails
      const found = html.match(EMAIL_RE) || [];
      found.forEach(e => {
        const lower = e.toLowerCase();
        // Skip image/file emails
        if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.gif')) return;
        if (lower.endsWith('.svg') || lower.endsWith('.webp') || lower.endsWith('.css')) return;
        if (lower.includes('example.com') || lower.includes('sentry.io')) return;
        if (lower.includes('wixpress') || lower.includes('wordpress')) return;
        emails.add(lower);
      });

      // If we found emails, no need to try more URLs
      if (emails.size > 0) break;
    } catch {
      // timeout or network error — continue to next URL
      continue;
    }
  }

  return [...emails].slice(0, 3); // max 3 emails per site
}

// ============================================
// RELEVANCE SCORING
// ============================================
function scoreRelevance(queryRelevance, result) {
  let score = queryRelevance * 20; // base: 1-5 * 20 = 20-100

  const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();

  // Boost for highly relevant keywords
  const highKeywords = ['עוסק פטור', 'עוסק מורשה', 'עצמאי', 'עצמאים', 'עסק קטן', 'פרילנס'];
  const medKeywords = ['חשבון', 'מס', 'חשבונית', 'ביטוח לאומי', 'הנהלת חשבונות', 'רואה חשבון'];
  const lowKeywords = ['עסק', 'עסקים', 'יזמות', 'פיננסי'];

  highKeywords.forEach(k => { if (text.includes(k)) score += 8; });
  medKeywords.forEach(k => { if (text.includes(k)) score += 4; });
  lowKeywords.forEach(k => { if (text.includes(k)) score += 2; });

  // Israeli domain boost
  if (result.domain?.endsWith('.co.il') || result.domain?.endsWith('.org.il')) score += 5;

  return Math.min(Math.max(Math.round(score), 10), 100);
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('=== Outreach Scraper ===');
  console.log(`${SEARCH_QUERIES.length} search queries configured\n`);

  // Collect all unique domains
  const domainMap = new Map(); // domain -> { name, niche, relevance_score, ... }

  for (let i = 0; i < SEARCH_QUERIES.length; i++) {
    const sq = SEARCH_QUERIES[i];
    console.log(`[${i + 1}/${SEARCH_QUERIES.length}] "${sq.q}" (${sq.niche})`);

    // Get first 2 pages (40 results)
    const page1 = await searchGoogle(sq.q, 0);
    await sleep(1500); // rate limit
    const page2 = await searchGoogle(sq.q, 20);
    await sleep(1500);

    const results = [...page1, ...page2];
    let newCount = 0;

    for (const r of results) {
      if (domainMap.has(r.domain)) {
        // Update score if higher
        const existing = domainMap.get(r.domain);
        const newScore = scoreRelevance(sq.relevance, r);
        if (newScore > existing.relevance_score) {
          existing.relevance_score = newScore;
          existing.niche = sq.niche; // update niche to higher-relevance one
        }
        continue;
      }

      domainMap.set(r.domain, {
        domain: r.domain,
        name: r.title?.slice(0, 200) || r.domain,
        niche: sq.niche,
        relevance_score: scoreRelevance(sq.relevance, r),
        country: 'IL',
        language: 'he',
        notes: r.snippet?.slice(0, 300) || '',
      });
      newCount++;
    }

    console.log(`  → ${results.length} results, ${newCount} new domains (total: ${domainMap.size})`);
  }

  console.log(`\n=== Total unique domains: ${domainMap.size} ===\n`);

  // Sort by relevance score descending
  const allDomains = [...domainMap.values()].sort((a, b) => b.relevance_score - a.relevance_score);

  // Save to JSON
  fs.writeFileSync(WEBSITES_FILE, JSON.stringify(allDomains, null, 2));
  console.log(`Saved ${allDomains.length} websites to ${WEBSITES_FILE}\n`);

  // Phase 2: Extract emails from top websites
  console.log('=== Phase 2: Extracting emails from top 300 websites ===\n');

  const topSites = allDomains.slice(0, 300);
  const contactsList = [];
  let emailsFound = 0;
  let emailsFailed = 0;

  for (let i = 0; i < topSites.length; i++) {
    const w = topSites[i];
    process.stdout.write(`[${i + 1}/${topSites.length}] ${w.domain} ... `);

    const emails = await extractEmailsFromSite(w.domain);

    if (emails.length > 0) {
      emails.forEach((email, idx) => {
        contactsList.push({
          domain: w.domain,
          email,
          contact_source: 'public_contact_page',
          is_primary: idx === 0,
        });
      });
      console.log(`found ${emails.join(', ')}`);
      emailsFound += emails.length;
    } else {
      console.log('no email');
      emailsFailed++;
    }

    await sleep(1500);
  }

  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contactsList, null, 2));
  console.log(`\nSaved ${contactsList.length} contacts to ${CONTACTS_FILE}\n`);

  // Generate SQL for insertion
  console.log('Generating SQL...');
  let sql = '-- Auto-generated outreach data\nBEGIN;\n\n';

  for (const w of allDomains) {
    const esc = (s) => (s || '').replace(/'/g, "''").slice(0, 500);
    sql += `INSERT INTO outreach_websites (domain, name, niche, relevance_score, country, language, notes, status)
VALUES ('${esc(w.domain)}', '${esc(w.name)}', '${esc(w.niche)}', ${w.relevance_score}, '${w.country}', '${w.language}', '${esc(w.notes)}', 'new')
ON CONFLICT (domain) DO UPDATE SET relevance_score = GREATEST(outreach_websites.relevance_score, EXCLUDED.relevance_score), updated_at = NOW();\n\n`;
  }

  for (const c of contactsList) {
    const esc = (s) => (s || '').replace(/'/g, "''");
    sql += `INSERT INTO outreach_contacts (website_id, email, contact_source, is_primary, verified_email_status)
SELECT w.id, '${esc(c.email)}', '${esc(c.contact_source)}', ${c.is_primary}, 'unknown'
FROM outreach_websites w WHERE w.domain = '${esc(c.domain)}'
ON CONFLICT DO NOTHING;\n\n`;
  }

  sql += 'COMMIT;\n';
  fs.writeFileSync(SQL_FILE, sql);
  console.log(`Generated SQL: ${SQL_FILE} (${(sql.length / 1024).toFixed(0)} KB)\n`);

  console.log(`=== DONE ===`);
  console.log(`Websites collected: ${allDomains.length}`);
  console.log(`Emails found: ${emailsFound}`);
  console.log(`Sites without email: ${emailsFailed}`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
