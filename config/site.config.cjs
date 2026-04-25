/**
 * Single Source of Truth for SEO automation system.
 *
 * Used by scripts/* and lib/*. CommonJS (cjs scripts use require),
 * but exposes ESM-friendly named exports so it can be imported from .js too.
 *
 * NEVER add hardcoded values that belong here in scripts. If you discover one —
 * move it here and import.
 */

// --- Site identity ---
const SITE_HOST = 'www.perfect1.co.il';
const SITE_URL = `https://${SITE_HOST}`;
const SITE_PROPERTY = 'sc-domain:perfect1.co.il'; // GSC property identifier
const SITE_URL_OPTIONS = [SITE_PROPERTY, `${SITE_URL}/`]; // submit-sitemap-gsc fallback list

// --- Supabase ---
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://rtlpqjqdmomyptcdkmrq.supabase.co').trim();
// Note: SUPABASE_KEY is read at runtime from env, not stored here.

// --- IndexNow ---
const INDEXNOW_KEY = 'f192557dbb787a9c644cd9695b63976046d2eef1cd538d7a46318fc51a7e1aa8';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// --- Email alerting ---
const ALERT_EMAIL = (process.env.ALERT_EMAIL || 'yosi5919@gmail.com').trim();
const ALERT_AGE_HOURS = 48; // unindexed-after-N-hours triggers alert

// --- Quality gate ---
const QUALITY_THRESHOLD = 85;       // F33 score gate (0-100)
const MIN_WORD_COUNT = 1200;        // matches CLAUDE.md content rule
const MAX_ARTICLES_PER_DAY = 3;     // ceiling enforced by RPC

// --- Scheduling / waits ---
const WAIT_FOR_DEPLOY_MINUTES = 4;  // F33 wait between commit and indexing
const RATE_LIMIT_MS = {
  google: 350,    // ~170 req/min, under 200/min Google Indexing quota
  gsc: 1100,      // GSC URL Inspection — gentle pace
  anthropic: 500, // backfill jobs
};

// --- Repo + content ---
const GITHUB_REPO = 'perfect-ai-admin/perfect1-portal';
const CONTENT_DIR_REL = 'src/content/'; // git-relative
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// --- Category → URL prefix map (was duplicated in 3+ scripts) ---
const CATEGORY_URL_MAP = {
  'osek-patur': '/osek-patur',
  'osek-murshe': '/osek-murshe',
  'hevra-bam': '/hevra-bam',
  'sgirat-tikim': '/sgirat-tikim',
  'guides': '/guides',
  'comparisons': '/compare',
  'osek-zeir': '/osek-zeir',
  'misui': '/misui',
  'maam': '/maam',
  'hashbonaut': '/hashbonaut',
  'mishpati': '/mishpati',
  'shivuk': '/shivuk',
  'tech': '/tech',
  'mimun': '/mimun',
  'miktzoa': '/miktzoa',
  'cities': '/cities',
  'services': '/services',
  'amuta': '/amuta',
  'authors': '/authors',
};

// --- SEO priority hubs (from CLAUDE.md) ---
const PRIORITY_HUBS = [
  { category: 'osek-patur',  slug: 'how-to-open',     title: 'איך פותחים עוסק פטור — מדריך מלא' },
  { category: 'osek-murshe', slug: 'how-to-open',     title: 'פתיחת עוסק מורשה — מדריך מלא' },
  { category: 'hevra-bam',   slug: 'how-to-open',     title: 'פתיחת חברה בע"מ — מדריך' },
  { category: 'osek-patur',  slug: 'cost',            title: 'כמה עולה עוסק פטור' },
  { category: 'osek-patur',  slug: 'taxes',           title: 'מיסוי עוסק פטור' },
  { category: 'osek-patur',  slug: 'accountant',      title: 'רואה חשבון לעוסק פטור' },
  { category: 'osek-patur',  slug: 'income-ceiling',  title: 'תקרת הכנסות עוסק פטור' },
];

// --- AI providers ---
const AI_PROVIDERS = {
  primary: {
    name: 'anthropic',
    model: 'claude-opus-4-5-20250929',
    fallbackModel: 'claude-haiku-4-5-20251001',
  },
  fallback: {
    name: 'openai',
    model: 'gpt-4o-mini',
  },
};

module.exports = {
  SITE_HOST,
  SITE_URL,
  SITE_PROPERTY,
  SITE_URL_OPTIONS,
  SUPABASE_URL,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  ALERT_EMAIL,
  ALERT_AGE_HOURS,
  QUALITY_THRESHOLD,
  MIN_WORD_COUNT,
  MAX_ARTICLES_PER_DAY,
  WAIT_FOR_DEPLOY_MINUTES,
  RATE_LIMIT_MS,
  GITHUB_REPO,
  CONTENT_DIR_REL,
  SITEMAP_URL,
  CATEGORY_URL_MAP,
  PRIORITY_HUBS,
  AI_PROVIDERS,
};
