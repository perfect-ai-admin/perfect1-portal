/**
 * SidePopup - DEPRECATED
 * This component has been deprecated to comply with Google Ads policies.
 * Scroll-trigger popups trigger "Compromised site / Abusing the ad network" violations.
 * 
 * Replace with SafeCtaBar instead (persistent, no scroll triggers).
 */

export default function SidePopup() {
  console.warn('SidePopup is deprecated. Use SafeCtaBar instead.');
  return null;
}