/**
 * Outreach Scraper V2 — Goal: 1000+ websites with emails
 * Expanded queries + deeper email extraction + Google Maps businesses
 */

const fs = require('fs');
const path = require('path');

const SERPAPI_KEY = '0aed25d71e5c7ff6b33747f6d3851000f288cfd22a632b798478c5844cedb79c';
const OUT_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Load existing websites to avoid duplicates
const existingFile = path.join(OUT_DIR, 'outreach-websites.json');
const existingDomains = new Set();
if (fs.existsSync(existingFile)) {
  JSON.parse(fs.readFileSync(existingFile, 'utf8')).forEach(w => existingDomains.add(w.domain));
}
console.log(`Loaded ${existingDomains.size} existing domains to skip\n`);

const SKIP_DOMAINS = new Set([
  'perfect1.co.il', 'www.perfect1.co.il',
  'google.com', 'google.co.il', 'facebook.com', 'instagram.com', 'twitter.com',
  'youtube.com', 'linkedin.com', 'tiktok.com', 'pinterest.com',
  'wikipedia.org', 'he.wikipedia.org',
  'ynet.co.il', 'walla.co.il', 'mako.co.il', 'haaretz.co.il',
  'calcalist.co.il', 'globes.co.il', 'themarker.com', 'ice.co.il',
  'amazon.com', 'ebay.com', 'aliexpress.com',
  'reddit.com', 'quora.com', 'medium.com',
  'fiverr.com', 'upwork.com',
]);

// === MASSIVE QUERY LIST ===
const QUERIES = [
  // --- רואי חשבון בערים ---
  { q: 'רואה חשבון תל אביב', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון ירושלים', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון חיפה', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון באר שבע', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון ראשון לציון', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון פתח תקווה', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון נתניה', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון הרצליה', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון רמת גן', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון אשדוד', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון רחובות', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון כפר סבא', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון הוד השרון', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון רעננה', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון מודיעין', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואי חשבון קטנים ישראל', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון אונליין ישראל', niche: 'רואי חשבון', rel: 5 },
  { q: 'רואה חשבון זול', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון לסטארטאפ', niche: 'רואי חשבון', rel: 4 },
  { q: 'רואה חשבון לאיקומרס', niche: 'רואי חשבון', rel: 4 },

  // --- יועצי מס בערים ---
  { q: 'יועץ מס תל אביב', niche: 'ייעוץ מס', rel: 5 },
  { q: 'יועץ מס ירושלים', niche: 'ייעוץ מס', rel: 5 },
  { q: 'יועץ מס חיפה', niche: 'ייעוץ מס', rel: 5 },
  { q: 'יועץ מס מרכז', niche: 'ייעוץ מס', rel: 5 },
  { q: 'יועץ מס לחברות', niche: 'ייעוץ מס', rel: 4 },
  { q: 'החזר מס לשכירים ועצמאים', niche: 'ייעוץ מס', rel: 4 },
  { q: 'תכנון מס חברה בעמ', niche: 'ייעוץ מס', rel: 4 },
  { q: 'ייעוץ מס בינלאומי ישראל', niche: 'ייעוץ מס', rel: 3 },

  // --- עורכי דין ---
  { q: 'עורך דין מסחרי תל אביב', niche: 'עורכי דין', rel: 4 },
  { q: 'עורך דין חברות תל אביב', niche: 'עורכי דין', rel: 4 },
  { q: 'עורך דין קניין רוחני ישראל', niche: 'עורכי דין', rel: 3 },
  { q: 'עורך דין דיני עבודה', niche: 'עורכי דין', rel: 4 },
  { q: 'עורך דין הסכם שותפות', niche: 'עורכי דין', rel: 4 },
  { q: 'עורך דין נדלן מסחרי', niche: 'עורכי דין', rel: 3 },
  { q: 'עורך דין מיסוי ישראל', niche: 'עורכי דין', rel: 5 },
  { q: 'עורך דין פשיטת רגל עסק', niche: 'עורכי דין', rel: 3 },

  // --- שיווק דיגיטלי מורחב ---
  { q: 'חברת SEO ישראל', niche: 'שיווק דיגיטלי', rel: 4 },
  { q: 'קידום אורגני ישראל', niche: 'שיווק דיגיטלי', rel: 4 },
  { q: 'פרסום בגוגל לעסקים קטנים', niche: 'שיווק דיגיטלי', rel: 4 },
  { q: 'שיווק תוכן ישראל', niche: 'שיווק דיגיטלי', rel: 4 },
  { q: 'ניהול רשתות חברתיות לעסקים', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'פרסום בפייסבוק לעסקים', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'שיווק באינסטגרם עסקי', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'digital marketing agency israel', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'SEO company israel', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'בניית אתרים וורדפרס ישראל', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'בניית אתר לעסק קטן', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'עיצוב אתרים ישראל', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'סוכנות דיגיטלית תל אביב', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'סוכנות דיגיטלית ירושלים', niche: 'שיווק דיגיטלי', rel: 3 },
  { q: 'סוכנות דיגיטלית חיפה', niche: 'שיווק דיגיטלי', rel: 3 },

  // --- תוכנות עסקיות מורחב ---
  { q: 'תוכנה לניהול פרויקטים ישראל', niche: 'תוכנות עסקיות', rel: 3 },
  { q: 'תוכנת ניהול לקוחות ישראל', niche: 'תוכנות עסקיות', rel: 4 },
  { q: 'תוכנה לניהול משימות עסק', niche: 'תוכנות עסקיות', rel: 3 },
  { q: 'מערכת ERP לעסקים קטנים', niche: 'תוכנות עסקיות', rel: 3 },
  { q: 'תוכנת שכר לעסקים קטנים', niche: 'תוכנות עסקיות', rel: 4 },
  { q: 'תוכנה להפקת חשבוניות ירוקות', niche: 'תוכנות עסקיות', rel: 5 },
  { q: 'אפליקציית חשבוניות ישראל', niche: 'תוכנות עסקיות', rel: 5 },
  { q: 'accounting software israel small business', niche: 'תוכנות עסקיות', rel: 4 },

  // --- ביטוח מורחב ---
  { q: 'ביטוח מקצועי עורכי דין', niche: 'ביטוח', rel: 3 },
  { q: 'ביטוח מקצועי רואי חשבון', niche: 'ביטוח', rel: 4 },
  { q: 'ביטוח חיים לעצמאים', niche: 'ביטוח', rel: 4 },
  { q: 'ביטוח בריאות פרטי עצמאים', niche: 'ביטוח', rel: 3 },
  { q: 'ביטוח אובדן כושר עבודה עצמאי', niche: 'ביטוח', rel: 4 },
  { q: 'סוכן ביטוח תל אביב', niche: 'ביטוח', rel: 3 },
  { q: 'סוכן ביטוח חיפה', niche: 'ביטוח', rel: 3 },

  // --- מימון מורחב ---
  { q: 'הלוואות לעסקים ישראל', niche: 'מימון', rel: 4 },
  { q: 'מימון המונים ישראל', niche: 'מימון', rel: 3 },
  { q: 'מענקים ממשלתיים לעסקים', niche: 'מימון', rel: 4 },
  { q: 'הלוואה בערבות מדינה', niche: 'מימון', rel: 4 },
  { q: 'קרנות השקעה לעסקים קטנים', niche: 'מימון', rel: 3 },
  { q: 'ליסינג לעסקים קטנים', niche: 'מימון', rel: 3 },
  { q: 'פקטורינג ישראל', niche: 'מימון', rel: 3 },

  // --- סליקה מורחב ---
  { q: 'חברת סליקה ישראל', niche: 'סליקה', rel: 4 },
  { q: 'סליקת אשראי באינטרנט', niche: 'סליקה', rel: 4 },
  { q: 'סליקה לחנויות אונליין', niche: 'סליקה', rel: 4 },
  { q: 'מסוף סליקה לעסק קטן', niche: 'סליקה', rel: 4 },
  { q: 'payment gateway israel', niche: 'סליקה', rel: 3 },
  { q: 'bit pay ישראל עסקים', niche: 'סליקה', rel: 3 },

  // --- בלוגים ומגזינים עסקיים ---
  { q: 'בלוג עסקי ישראלי טיפים', niche: 'מדיה עסקית', rel: 5 },
  { q: 'אתר מדריכים לעסקים ישראל', niche: 'מדיה עסקית', rel: 5 },
  { q: 'מגזין יזמות ישראלי', niche: 'מדיה עסקית', rel: 4 },
  { q: 'מגזין עסקים קטנים ובינוניים', niche: 'מדיה עסקית', rel: 4 },
  { q: 'פודקאסט עסקי ישראלי', niche: 'מדיה עסקית', rel: 3 },
  { q: 'ערוץ יוטיוב עסקים ישראל', niche: 'מדיה עסקית', rel: 3 },
  { q: 'פורום עצמאים ישראל תפוז', niche: 'מדיה עסקית', rel: 4 },
  { q: 'קבוצת פייסבוק עצמאים אתר', niche: 'מדיה עסקית', rel: 3 },
  { q: 'small business blog israel english', niche: 'מדיה עסקית', rel: 3 },
  { q: 'israeli startup blog', niche: 'מדיה עסקית', rel: 3 },

  // --- ייעוץ עסקי מורחב ---
  { q: 'יועץ עסקי תל אביב', niche: 'ייעוץ עסקי', rel: 4 },
  { q: 'ייעוץ עסקי לסטארטאפים', niche: 'ייעוץ עסקי', rel: 3 },
  { q: 'ליווי עסקי למתחילים', niche: 'ייעוץ עסקי', rel: 5 },
  { q: 'ייעוץ אסטרטגי לעסקים', niche: 'ייעוץ עסקי', rel: 3 },
  { q: 'קואצ\'ינג עסקי ישראל', niche: 'ייעוץ עסקי', rel: 3 },
  { q: 'מנטור עסקי ישראל', niche: 'ייעוץ עסקי', rel: 3 },
  { q: 'business consulting israel', niche: 'ייעוץ עסקי', rel: 3 },

  // --- הכשרות וקורסים ---
  { q: 'קורס עסקים אונליין ישראל', niche: 'הכשרות', rel: 4 },
  { q: 'קורס ניהול עסק', niche: 'הכשרות', rel: 4 },
  { q: 'קורס דיגיטל מרקטינג ישראל', niche: 'הכשרות', rel: 3 },
  { q: 'לימודי שיווק דיגיטלי', niche: 'הכשרות', rel: 3 },
  { q: 'קורס ניהול חשבונות', niche: 'הכשרות', rel: 4 },
  { q: 'סדנה לפתיחת עסק', niche: 'הכשרות', rel: 4 },
  { q: 'קורסים לעצמאים מכללה', niche: 'הכשרות', rel: 4 },

  // --- פרילנס ועבודה מרחוק ---
  { q: 'פלטפורמת פרילנס ישראלית', niche: 'פרילנס', rel: 5 },
  { q: 'אתר משרות פרילנס ישראל', niche: 'פרילנס', rel: 4 },
  { q: 'עבודה מרחוק ישראל אתר', niche: 'פרילנס', rel: 3 },
  { q: 'פרילנסרים ישראליים פורטפוליו', niche: 'פרילנס', rel: 3 },
  { q: 'freelance platform israel', niche: 'פרילנס', rel: 3 },

  // --- חללי עבודה מורחב ---
  { q: 'חלל עבודה תל אביב', niche: 'חללי עבודה', rel: 3 },
  { q: 'חלל עבודה ירושלים', niche: 'חללי עבודה', rel: 3 },
  { q: 'חלל עבודה חיפה', niche: 'חללי עבודה', rel: 3 },
  { q: 'חלל עבודה באר שבע', niche: 'חללי עבודה', rel: 3 },
  { q: 'coworking space israel', niche: 'חללי עבודה', rel: 3 },
  { q: 'משרדים להשכרה לעסקים קטנים', niche: 'חללי עבודה', rel: 2 },

  // --- מקצועות ספציפיים ---
  { q: 'מעצב גרפי פרילנסר ישראל אתר', niche: 'מקצועות', rel: 3 },
  { q: 'צלם עסקי ישראל', niche: 'מקצועות', rel: 3 },
  { q: 'קופירייטר ישראל', niche: 'מקצועות', rel: 3 },
  { q: 'מתרגם פרילנסר ישראל', niche: 'מקצועות', rel: 3 },
  { q: 'יועצת תדמית עצמאית', niche: 'מקצועות', rel: 2 },
  { q: 'מאמן כושר עצמאי אתר', niche: 'מקצועות', rel: 3 },
  { q: 'דיאטנית עצמאית אתר', niche: 'מקצועות', rel: 2 },
  { q: 'שף פרטי עצמאי ישראל', niche: 'מקצועות', rel: 2 },
  { q: 'מנהל מדיה חברתית פרילנס', niche: 'מקצועות', rel: 3 },
  { q: 'עוזרת וירטואלית ישראל', niche: 'מקצועות', rel: 3 },
  { q: 'מפתח אתרים פרילנס ישראל', niche: 'מקצועות', rel: 3 },
  { q: 'מעצב UX UI פרילנס ישראל', niche: 'מקצועות', rel: 3 },

  // --- אי-קומרס ---
  { q: 'חנות אונליין ישראל בניה', niche: 'אי-קומרס', rel: 3 },
  { q: 'דרופשיפינג ישראל מדריך', niche: 'אי-קומרס', rel: 3 },
  { q: 'מכירה באמזון מישראל', niche: 'אי-קומרס', rel: 3 },
  { q: 'חנות אטסי ישראל', niche: 'אי-קומרס', rel: 3 },
  { q: 'ecommerce israel blog', niche: 'אי-קומרס', rel: 3 },
  { q: 'שיווק שותפים ישראל', niche: 'אי-קומרס', rel: 3 },

  // --- פיננסים אישיים ---
  { q: 'קרן פנסיה לעצמאים ישראל', niche: 'פיננסים', rel: 4 },
  { q: 'קרן השתלמות לעצמאים', niche: 'פיננסים', rel: 4 },
  { q: 'תכנון פיננסי לעצמאים', niche: 'פיננסים', rel: 4 },
  { q: 'חיסכון והשקעות לעצמאים', niche: 'פיננסים', rel: 3 },
  { q: 'יועץ פנסיוני ישראל', niche: 'פיננסים', rel: 3 },
  { q: 'סוכן פנסיה לעצמאים', niche: 'פיננסים', rel: 3 },
  { q: 'בלוג פיננסים אישיים ישראל', niche: 'פיננסים', rel: 3 },

  // --- HR ומשאבי אנוש ---
  { q: 'חברת כח אדם ישראל', niche: 'משאבי אנוש', rel: 3 },
  { q: 'חברת גיוס עובדים', niche: 'משאבי אנוש', rel: 3 },
  { q: 'תוכנת שכר ישראל', niche: 'משאבי אנוש', rel: 4 },
  { q: 'תוכנת HR לעסקים קטנים', niche: 'משאבי אנוש', rel: 3 },
  { q: 'ייעוץ דיני עבודה מעסיקים', niche: 'משאבי אנוש', rel: 4 },

  // --- נישות נוספות ---
  { q: 'רישום סימן מסחרי ישראל', niche: 'משפטי', rel: 4 },
  { q: 'רישום פטנט ישראל', niche: 'משפטי', rel: 3 },
  { q: 'GDPR תאימות ישראל', niche: 'משפטי', rel: 3 },
  { q: 'הגנת פרטיות עסקים ישראל', niche: 'משפטי', rel: 3 },
  { q: 'רישיון עסק ישראל מדריך', niche: 'משפטי', rel: 5 },
  { q: 'פתיחת עמותה ישראל', niche: 'משפטי', rel: 3 },
  { q: 'שירותי מזכירות לעסקים', niche: 'שירותים עסקיים', rel: 2 },
  { q: 'שירותי תרגום לעסקים', niche: 'שירותים עסקיים', rel: 2 },
  { q: 'שירותי דפוס לעסקים', niche: 'שירותים עסקיים', rel: 2 },
  { q: 'שירותי IT לעסקים קטנים', niche: 'שירותים עסקיים', rel: 3 },
  { q: 'אבטחת מידע לעסקים', niche: 'שירותים עסקיים', rel: 3 },
  { q: 'גיבוי ענן לעסקים', niche: 'שירותים עסקיים', rel: 3 },

  // --- דפי זהב / מדריכים ---
  { q: 'site:b144.co.il רואה חשבון', niche: 'רואי חשבון', rel: 4 },
  { q: 'site:b144.co.il יועץ מס', niche: 'ייעוץ מס', rel: 4 },
  { q: 'site:b144.co.il עורך דין עסקים', niche: 'עורכי דין', rel: 3 },
  { q: 'אינדקס עסקים ישראל', niche: 'אינדקס', rel: 3 },
  { q: 'מדריך עסקים ישראלי', niche: 'אינדקס', rel: 3 },
];

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

function shouldSkip(domain) {
  if (!domain) return true;
  if (SKIP_DOMAINS.has(domain)) return true;
  if (existingDomains.has(domain)) return true;
  if (domain.endsWith('.google.com') || domain.endsWith('.facebook.com')) return true;
  if (domain.endsWith('.gov.il')) return true;
  if (domain.endsWith('.ac.il')) return true; // universities
  return false;
}

async function searchGoogle(query, start = 0) {
  const params = new URLSearchParams({
    q: query, engine: 'google', gl: 'il', hl: 'he', num: '20', start: String(start), api_key: SERPAPI_KEY,
  });
  try {
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic_results || []).map(r => ({
      url: r.link, title: r.title, snippet: r.snippet, domain: extractDomain(r.link),
    })).filter(r => r.domain && !shouldSkip(r.domain));
  } catch { return []; }
}

// Enhanced email extraction — try more paths
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

async function extractEmails(domain) {
  const paths = [
    '', '/contact', '/contact-us', '/about', '/about-us',
    '/צור-קשר', '/יצירת-קשר', '/contactus', '/connect',
    '/team', '/our-team', '/הצוות-שלנו',
    '/advertise', '/write-for-us', '/partners',
    '/footer', '/sitemap.xml',
  ];

  const emails = new Set();
  const BAD_SUFFIXES = ['.png', '.jpg', '.gif', '.svg', '.webp', '.css', '.js', '.woff'];
  const BAD_CONTAINS = ['example.com', 'sentry.io', 'wixpress', 'wordpress.org', 'w3.org', 'schema.org', 'googleapis'];

  for (const p of paths) {
    if (emails.size >= 3) break;
    for (const prefix of [`https://${domain}`, `https://www.${domain}`]) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${prefix}${p}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          redirect: 'follow',
        });
        clearTimeout(timeout);
        if (!res.ok) continue;
        const html = await res.text();
        const found = html.match(EMAIL_RE) || [];
        for (const e of found) {
          const lower = e.toLowerCase();
          if (BAD_SUFFIXES.some(s => lower.endsWith(s))) continue;
          if (BAD_CONTAINS.some(s => lower.includes(s))) continue;
          if (lower.length > 60) continue;
          emails.add(lower);
        }
        if (emails.size > 0) break; // found emails, skip www variant
      } catch { continue; }
    }
  }
  return [...emails].slice(0, 3);
}

function scoreRelevance(queryRel, result) {
  let score = queryRel * 20;
  const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
  const highKW = ['עוסק פטור', 'עוסק מורשה', 'עצמאי', 'עצמאים', 'עסק קטן', 'פרילנס'];
  const medKW = ['חשבון', 'מס', 'חשבונית', 'ביטוח לאומי', 'הנהלת חשבונות'];
  highKW.forEach(k => { if (text.includes(k)) score += 8; });
  medKW.forEach(k => { if (text.includes(k)) score += 4; });
  if (result.domain?.endsWith('.co.il') || result.domain?.endsWith('.org.il')) score += 5;
  return Math.min(Math.max(Math.round(score), 10), 100);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`=== Outreach Scraper V2 — ${QUERIES.length} queries ===\n`);

  const domainMap = new Map();

  // Phase 1: Collect domains
  for (let i = 0; i < QUERIES.length; i++) {
    const sq = QUERIES[i];
    process.stdout.write(`[${i + 1}/${QUERIES.length}] "${sq.q}" `);

    const page1 = await searchGoogle(sq.q, 0);
    await sleep(1200);
    const page2 = await searchGoogle(sq.q, 20);
    await sleep(1200);

    let newCount = 0;
    for (const r of [...page1, ...page2]) {
      if (domainMap.has(r.domain)) {
        const ex = domainMap.get(r.domain);
        const ns = scoreRelevance(sq.rel, r);
        if (ns > ex.relevance_score) { ex.relevance_score = ns; ex.niche = sq.niche; }
        continue;
      }
      domainMap.set(r.domain, {
        domain: r.domain, name: (r.title || '').slice(0, 200), niche: sq.niche,
        relevance_score: scoreRelevance(sq.rel, r), country: 'IL', language: 'he',
        notes: (r.snippet || '').slice(0, 300),
      });
      newCount++;
    }
    console.log(`→ +${newCount} (total: ${domainMap.size})`);
  }

  const allDomains = [...domainMap.values()].sort((a, b) => b.relevance_score - a.relevance_score);
  console.log(`\n=== Phase 1 complete: ${allDomains.length} NEW domains ===\n`);

  // Phase 2: Extract emails from ALL domains
  console.log(`=== Phase 2: Extracting emails from all ${allDomains.length} domains ===\n`);

  const contacts = [];
  let found = 0, failed = 0;

  for (let i = 0; i < allDomains.length; i++) {
    const w = allDomains[i];
    process.stdout.write(`[${i + 1}/${allDomains.length}] ${w.domain} ... `);

    const emails = await extractEmails(w.domain);
    if (emails.length > 0) {
      emails.forEach((email, idx) => {
        contacts.push({ domain: w.domain, email, contact_source: 'public_contact_page', is_primary: idx === 0 });
      });
      console.log(`✓ ${emails.join(', ')}`);
      found += emails.length;
    } else {
      console.log('✗');
      failed++;
    }
    await sleep(800);
  }

  // Save
  fs.writeFileSync(path.join(OUT_DIR, 'outreach-websites-v2.json'), JSON.stringify(allDomains, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'outreach-contacts-v2.json'), JSON.stringify(contacts, null, 2));

  // Generate SQL
  const esc = s => (s || '').replace(/'/g, "''").replace(/\\/g, '').replace(/\0/g, '').slice(0, 400);
  const CHUNK = 50;
  let sqlFiles = 0;

  for (let c = 0; c < Math.ceil(allDomains.length / CHUNK); c++) {
    const batch = allDomains.slice(c * CHUNK, (c + 1) * CHUNK);
    let sql = 'INSERT INTO outreach_websites (domain, name, niche, relevance_score, country, language, notes, status) VALUES\n';
    sql += batch.map(w => `('${esc(w.domain)}', '${esc(w.name)}', '${esc(w.niche)}', ${w.relevance_score}, '${w.country}', '${w.language}', '${esc(w.notes)}', 'new')`).join(',\n');
    sql += '\nON CONFLICT (domain) DO UPDATE SET relevance_score = GREATEST(outreach_websites.relevance_score, EXCLUDED.relevance_score), updated_at = NOW();';
    fs.writeFileSync(path.join(OUT_DIR, `v2-w-${c + 1}.sql`), sql);
    sqlFiles++;
  }

  const CB = 30;
  for (let c = 0; c < Math.ceil(contacts.length / CB); c++) {
    const batch = contacts.slice(c * CB, (c + 1) * CB);
    const stmts = batch.map(ct =>
      `INSERT INTO outreach_contacts (website_id, email, contact_source, is_primary, verified_email_status)\nSELECT w.id, '${esc(ct.email)}', '${esc(ct.contact_source)}', ${ct.is_primary}, 'unknown'\nFROM outreach_websites w WHERE w.domain = '${esc(ct.domain)}'\nAND NOT EXISTS (SELECT 1 FROM outreach_contacts c2 WHERE c2.website_id = w.id AND c2.email = '${esc(ct.email)}');`
    );
    fs.writeFileSync(path.join(OUT_DIR, `v2-c-${c + 1}.sql`), stmts.join('\n'));
  }

  console.log(`\n=== DONE ===`);
  console.log(`New websites: ${allDomains.length}`);
  console.log(`Emails found: ${found}`);
  console.log(`Sites without email: ${failed}`);
  console.log(`SQL files: ${sqlFiles} website chunks + ${Math.ceil(contacts.length / CB)} contact chunks`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
