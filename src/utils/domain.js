/**
 * domain.js — Domain detection for separating Portal vs App
 *
 * Portal domain: perfect1.co.il (SEO articles, landing pages)
 * App domain:    perfect-dashboard.com (CRM, tools, authenticated app)
 */

const PORTAL_DOMAINS = [
  'perfect1.co.il',
  'www.perfect1.co.il',
];

const APP_DOMAINS = [
  'perfect-dashboard.com',
  'www.perfect-dashboard.com',
];

/**
 * Returns true if the current domain is the SEO portal (perfect1.co.il)
 */
export function isPortalDomain() {
  const host = window.location.hostname;
  return PORTAL_DOMAINS.includes(host);
}

/**
 * Returns true if the current domain is the app (perfect-dashboard.com)
 */
export function isAppDomain() {
  const host = window.location.hostname;
  return APP_DOMAINS.includes(host);
}

/**
 * Returns true if running locally (localhost / 127.0.0.1)
 * On localhost, both portal and app routes are available for development.
 */
export function isLocalDev() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * Get the correct base URL for the portal domain
 */
export function getPortalUrl() {
  return 'https://www.perfect1.co.il';
}

/**
 * Get the correct base URL for the app domain
 */
export function getAppUrl() {
  return 'https://perfect-dashboard.com';
}
