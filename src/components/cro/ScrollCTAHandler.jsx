/**
 * ScrollCTAHandler - DEPRECATED
 * This component has been deprecated to comply with Google Ads policies.
 * Scroll-trigger popups trigger "Compromised site / Abusing the ad network" violations.
 * 
 * Additionally, auto-opening WhatsApp violates policy.
 * Replace with SafeLeadInline or SafeModalOnClick instead.
 */

export default function ScrollCTAHandler() {
  console.warn('ScrollCTAHandler is deprecated. Use SafeLeadInline or SafeModalOnClick instead.');
  return null;
}