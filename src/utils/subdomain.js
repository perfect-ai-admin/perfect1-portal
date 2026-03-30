/**
 * subdomain.js - Subdomain detection and slug resolution
 *
 * Detects if the current request comes from a subdomain of one-pai.com
 * and resolves it to the appropriate digital card or landing page slug.
 */

// Domains that host the app (not subdomains of clients)
const APP_DOMAINS = [
  'one-pai.com',
  'www.one-pai.com',
  'perfect-dashboard.com',
  'www.perfect-dashboard.com',
  'perfect1.co.il',
  'www.perfect1.co.il',
  'localhost',
];

// Known subdomains that are NOT client pages
const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'mail',
  'smtp',
  'ftp',
  'staging',
  'preview',
  'dev',
];

/**
 * Extract subdomain from hostname.
 * Returns null if no subdomain or if it's a reserved/app domain.
 *
 * Examples:
 *   "studio-dana.one-pai.com" -> "studio-dana"
 *   "yosi-levi.one-pai.com"  -> "yosi-levi"
 *   "one-pai.com"            -> null
 *   "www.one-pai.com"        -> null
 *   "localhost:5173"         -> null
 */
export function getSubdomain(hostname) {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Skip if it's an app domain or localhost
  if (APP_DOMAINS.includes(host)) return null;

  // Check if it's a subdomain of one-pai.com
  if (host.endsWith('.one-pai.com')) {
    const sub = host.replace('.one-pai.com', '');
    // Skip reserved subdomains
    if (RESERVED_SUBDOMAINS.includes(sub)) return null;
    // Skip multi-level subdomains (e.g., "a.b.one-pai.com")
    if (sub.includes('.')) return null;
    return sub;
  }

  // Check Vercel preview domains — skip them
  if (host.endsWith('.vercel.app')) return null;

  return null;
}

/**
 * Check if we're currently on a client subdomain.
 */
export function isClientSubdomain() {
  return getSubdomain(window.location.hostname) !== null;
}

/**
 * Convert a business name to a URL-safe subdomain slug.
 * Hebrew characters are transliterated to latin.
 * Spaces and special chars become hyphens.
 *
 * Examples:
 *   "Studio Dana"  -> "studio-dana"
 *   "Yosi Levi"    -> "yosi-levi"
 *   "My Business!" -> "my-business"
 */
export function nameToSubdomain(name) {
  if (!name) return '';

  // Hebrew to Latin transliteration map
  const hebrewMap = {
    '\u05D0': 'a',  // alef
    '\u05D1': 'b',  // bet
    '\u05D2': 'g',  // gimel
    '\u05D3': 'd',  // dalet
    '\u05D4': 'h',  // he
    '\u05D5': 'v',  // vav
    '\u05D6': 'z',  // zayin
    '\u05D7': 'ch', // chet
    '\u05D8': 't',  // tet
    '\u05D9': 'y',  // yod
    '\u05DA': 'k',  // kaf sofit
    '\u05DB': 'k',  // kaf
    '\u05DC': 'l',  // lamed
    '\u05DD': 'm',  // mem sofit
    '\u05DE': 'm',  // mem
    '\u05DF': 'n',  // nun sofit
    '\u05E0': 'n',  // nun
    '\u05E1': 's',  // samech
    '\u05E2': 'a',  // ayin
    '\u05E3': 'p',  // pe sofit
    '\u05E4': 'p',  // pe
    '\u05E5': 'tz', // tsadi sofit
    '\u05E6': 'tz', // tsadi
    '\u05E7': 'k',  // qof
    '\u05E8': 'r',  // resh
    '\u05E9': 'sh', // shin
    '\u05EA': 't',  // tav
  };

  let result = '';
  for (const char of name) {
    if (hebrewMap[char]) {
      result += hebrewMap[char];
    } else {
      result += char;
    }
  }

  return result
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')          // Collapse multiple hyphens
    .replace(/^-|-$/g, '')        // Trim leading/trailing hyphens
    .slice(0, 63);                // DNS label max length
}

/**
 * Generate the full subdomain URL for a business.
 */
export function getSubdomainUrl(subdomainSlug) {
  return `https://${subdomainSlug}.one-pai.com`;
}
