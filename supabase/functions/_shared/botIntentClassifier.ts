// Bot Intent Classifier — classifies page_slug → intent + flow_type
// Based on docs/bot-flow-engine-spec.md section 4

export interface IntentResult {
  page_intent: string;
  service_type: string;
  flow_type: string;
  flow_variant: string;
  pricing?: { setup?: string; monthly?: string; includes?: string[] };
}

// Exact match map: page_slug → intent config
const PAGE_INTENT_MAP: Record<string, IntentResult> = {
  // Landing Pages
  'open-osek-patur': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי שוטף', 'אפליקציה להוצאת קבלות', 'מנהלת תיק'] } },
  'osek-patur-landing': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי שוטף', 'אפליקציה להוצאת קבלות', 'מנהלת תיק'] } },
  'osek-patur-steps': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur' },
  // Landing page variants (sent from OsekPaturLanding with variant suffix)
  'landing-osek-patur-hero': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי שוטף', 'אפליקציה להוצאת קבלות', 'מנהלת תיק'] } },
  'landing-osek-patur-mid': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי שוטף', 'אפליקציה להוצאת קבלות', 'מנהלת תיק'] } },
  'landing-osek-patur-final': { page_intent: 'service', service_type: 'open_osek_patur', flow_type: 'service_flow', flow_variant: 'open_osek_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי שוטף', 'אפליקציה להוצאת קבלות', 'מנהלת תיק'] } },
  'landing-accountant-osek-patur': { page_intent: 'accounting_service', service_type: 'accountant_osek_patur', flow_type: 'accounting_svc_flow', flow_variant: 'accountant_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי וייעוץ', 'התנהלות מול הרשויות', 'אפליקציה להוצאת קבלות', 'מנהלת תיק זמינה'] } },
  'accountant-osek-patur': { page_intent: 'accounting_service', service_type: 'accountant_osek_patur', flow_type: 'accounting_svc_flow', flow_variant: 'accountant_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי וייעוץ', 'התנהלות מול הרשויות', 'אפליקציה להוצאת קבלות', 'מנהלת תיק זמינה'] } },
  'patur-vs-murshe': { page_intent: 'comparison', service_type: 'patur_vs_murshe', flow_type: 'comparison_flow', flow_variant: 'patur_vs_murshe' },
  'patur-vs-murshe-quiz': { page_intent: 'comparison', service_type: 'patur_vs_murshe', flow_type: 'comparison_flow', flow_variant: 'patur_vs_murshe' },

  // Articles — osek patur
  'osek-patur/how-to-open': { page_intent: 'guide', service_type: 'open_osek_patur', flow_type: 'guide_flow', flow_variant: 'how_to_open_patur' },
  'osek-patur/management': { page_intent: 'guide', service_type: 'manage_osek_patur', flow_type: 'accounting_svc_flow', flow_variant: 'manage_patur' },
  'osek-patur/taxes': { page_intent: 'guide', service_type: 'taxes_osek_patur', flow_type: 'guide_flow', flow_variant: 'taxes_patur' },
  'osek-patur/tax-reporting': { page_intent: 'guide', service_type: 'reporting_osek_patur', flow_type: 'guide_flow', flow_variant: 'reporting_patur' },
  'osek-patur/income-ceiling': { page_intent: 'guide', service_type: 'ceiling_osek_patur', flow_type: 'guide_flow', flow_variant: 'ceiling_patur' },
  'osek-patur/rights': { page_intent: 'guide', service_type: 'rights_osek_patur', flow_type: 'guide_flow', flow_variant: 'rights_patur' },
  'osek-patur/status-change': { page_intent: 'service', service_type: 'status_change', flow_type: 'service_flow', flow_variant: 'status_change' },
  'osek-patur/cost': { page_intent: 'pricing', service_type: 'cost_osek_patur', flow_type: 'pricing_flow', flow_variant: 'cost_patur', pricing: { setup: '250 ₪ + מע״מ', monthly: '200 ₪ + מע״מ', includes: ['דוח שנתי', 'ליווי וייעוץ', 'התנהלות מול הרשויות', 'אפליקציה להוצאת קבלות', 'מנהלת תיק זמינה'] } },
  'osek-patur/accountant': { page_intent: 'accounting_service', service_type: 'accountant_osek_patur', flow_type: 'accounting_svc_flow', flow_variant: 'accountant_patur' },
  'osek-patur/faq': { page_intent: 'guide', service_type: 'faq_osek_patur', flow_type: 'guide_flow', flow_variant: 'faq_patur' },

  // Articles — osek murshe
  'osek-murshe/how-to-open': { page_intent: 'guide', service_type: 'open_osek_murshe', flow_type: 'guide_flow', flow_variant: 'how_to_open_murshe' },
  'osek-murshe/management': { page_intent: 'guide', service_type: 'manage_osek_murshe', flow_type: 'accounting_svc_flow', flow_variant: 'manage_murshe' },
  'osek-murshe/taxes': { page_intent: 'guide', service_type: 'taxes_osek_murshe', flow_type: 'guide_flow', flow_variant: 'taxes_murshe' },
  'osek-murshe/vat-guide': { page_intent: 'guide', service_type: 'vat_osek_murshe', flow_type: 'guide_flow', flow_variant: 'vat_murshe' },
  'osek-murshe/reports': { page_intent: 'guide', service_type: 'reports_osek_murshe', flow_type: 'guide_flow', flow_variant: 'reports_murshe' },
  'osek-murshe/cost': { page_intent: 'pricing', service_type: 'cost_osek_murshe', flow_type: 'pricing_flow', flow_variant: 'cost_murshe', pricing: { setup: '350 ₪ + מע״מ', monthly: '400-600 ₪ + מע״מ', includes: ['דיווח דו-חודשי', 'מע״מ', 'דוח שנתי', 'ייעוץ'] } },
  'osek-murshe/status-change': { page_intent: 'service', service_type: 'status_change', flow_type: 'service_flow', flow_variant: 'status_change_murshe' },
  'osek-murshe/faq': { page_intent: 'guide', service_type: 'faq_osek_murshe', flow_type: 'guide_flow', flow_variant: 'faq_murshe' },

  // Articles — hevra bam
  'hevra-bam/how-to-open': { page_intent: 'guide', service_type: 'open_hevra', flow_type: 'guide_flow', flow_variant: 'how_to_open_hevra' },
  'hevra-bam/management': { page_intent: 'guide', service_type: 'manage_hevra', flow_type: 'guide_flow', flow_variant: 'manage_hevra' },
  'hevra-bam/reports': { page_intent: 'guide', service_type: 'reports_hevra', flow_type: 'guide_flow', flow_variant: 'reports_hevra' },
  'hevra-bam/shareholders': { page_intent: 'guide', service_type: 'shareholders_hevra', flow_type: 'guide_flow', flow_variant: 'shareholders_hevra' },
  'hevra-bam/transition': { page_intent: 'service', service_type: 'transition_hevra', flow_type: 'service_flow', flow_variant: 'transition_hevra' },
  'hevra-bam/cost': { page_intent: 'pricing', service_type: 'cost_hevra', flow_type: 'pricing_flow', flow_variant: 'cost_hevra', pricing: { setup: 'החל מ-2,500 ₪ + מע״מ', monthly: 'החל מ-800 ₪ + מע״מ', includes: ['הנהלת חשבונות', 'דוחות', 'שכר', 'ייעוץ מס'] } },
  'hevra-bam/faq': { page_intent: 'guide', service_type: 'faq_hevra', flow_type: 'guide_flow', flow_variant: 'faq_hevra' },

  // Articles — sgirat tikim
  'sgirat-tikim/close-osek-patur': { page_intent: 'service', service_type: 'close_osek_patur', flow_type: 'service_flow', flow_variant: 'close_patur', pricing: { setup: '350 ₪ + מע״מ' } },
  'sgirat-tikim/close-osek-murshe': { page_intent: 'service', service_type: 'close_osek_murshe', flow_type: 'service_flow', flow_variant: 'close_murshe', pricing: { setup: '500 ₪ + מע״מ' } },
  'sgirat-tikim/close-company': { page_intent: 'service', service_type: 'close_company', flow_type: 'service_flow', flow_variant: 'close_company', pricing: { setup: 'החל מ-1,500 ₪ + מע״מ' } },
  'sgirat-tikim/authorities': { page_intent: 'guide', service_type: 'close_authorities', flow_type: 'guide_flow', flow_variant: 'close_authorities' },
  'sgirat-tikim/consequences': { page_intent: 'guide', service_type: 'close_consequences', flow_type: 'guide_flow', flow_variant: 'close_consequences' },
  'sgirat-tikim/faq': { page_intent: 'guide', service_type: 'faq_sgirat_tikim', flow_type: 'guide_flow', flow_variant: 'faq_sgirat' },

  // Guides
  'guides/opening-business': { page_intent: 'guide', service_type: 'opening_business', flow_type: 'guide_flow', flow_variant: 'opening_business' },
  'guides/which-business-type': { page_intent: 'comparison', service_type: 'business_type_selection', flow_type: 'comparison_flow', flow_variant: 'business_type' },
  'guides/comparisons': { page_intent: 'comparison', service_type: 'comparisons', flow_type: 'comparison_flow', flow_variant: 'comparisons' },
  'guides/taxation': { page_intent: 'guide', service_type: 'taxation', flow_type: 'guide_flow', flow_variant: 'taxation' },
  'guides/freelancers': { page_intent: 'guide', service_type: 'freelancers', flow_type: 'guide_flow', flow_variant: 'freelancers' },
  'guides/tools': { page_intent: 'guide', service_type: 'tools', flow_type: 'guide_flow', flow_variant: 'tools' },
  'guides/faq': { page_intent: 'guide', service_type: 'faq_general', flow_type: 'guide_flow', flow_variant: 'faq_general' },

  // Compare pages
  'compare/osek-patur-vs-murshe': { page_intent: 'comparison', service_type: 'patur_vs_murshe', flow_type: 'comparison_flow', flow_variant: 'patur_vs_murshe' },

  // Hub pages
  'osek-patur': { page_intent: 'guide', service_type: 'osek_patur_general', flow_type: 'guide_flow', flow_variant: 'hub_patur' },
  'osek-murshe': { page_intent: 'guide', service_type: 'osek_murshe_general', flow_type: 'guide_flow', flow_variant: 'hub_murshe' },
  'hevra-bam': { page_intent: 'guide', service_type: 'hevra_general', flow_type: 'guide_flow', flow_variant: 'hub_hevra' },
  'sgirat-tikim': { page_intent: 'service', service_type: 'sgirat_tikim_general', flow_type: 'service_flow', flow_variant: 'hub_sgirat' },
  'guides': { page_intent: 'guide', service_type: 'guides_general', flow_type: 'guide_flow', flow_variant: 'hub_guides' },

  // App pages
  'Pricing': { page_intent: 'pricing', service_type: 'app_pricing', flow_type: 'pricing_flow', flow_variant: 'app_pricing' },
  'Features': { page_intent: 'guide', service_type: 'app_features', flow_type: 'generic_flow', flow_variant: 'app_features' },
  'FAQ': { page_intent: 'guide', service_type: 'app_faq', flow_type: 'generic_flow', flow_variant: 'app_faq' },
  'SmartLogo': { page_intent: 'service', service_type: 'smart_logo', flow_type: 'service_flow', flow_variant: 'smart_logo' },
  'Branding': { page_intent: 'service', service_type: 'branding', flow_type: 'service_flow', flow_variant: 'branding' },
};

/**
 * Classify page intent from slug/url/title
 */
export function classifyIntent(pageSlug?: string, pageUrl?: string, pageTitle?: string): IntentResult {
  // Rule 1: Exact match by slug
  if (pageSlug && PAGE_INTENT_MAP[pageSlug]) {
    return PAGE_INTENT_MAP[pageSlug];
  }

  // Try slug variations (remove leading /)
  const cleanSlug = pageSlug?.replace(/^\//, '') || '';
  if (PAGE_INTENT_MAP[cleanSlug]) {
    return PAGE_INTENT_MAP[cleanSlug];
  }

  const url = pageUrl || '';
  const title = pageTitle || '';

  // Rule 2: URL/title pattern matching
  if (url.includes('/compare/')) {
    return { page_intent: 'comparison', service_type: 'comparison', flow_type: 'comparison_flow', flow_variant: 'generic_compare' };
  }

  if (url.includes('/cost') || title.includes('כמה עולה') || title.includes('מחיר') || title.includes('עלות')) {
    return { page_intent: 'pricing', service_type: 'pricing', flow_type: 'pricing_flow', flow_variant: 'generic_pricing' };
  }

  if (url.includes('/accountant') || title.includes('רואה חשבון')) {
    return { page_intent: 'accounting_service', service_type: 'accounting', flow_type: 'accounting_svc_flow', flow_variant: 'generic_accounting' };
  }

  if (cleanSlug.startsWith('open-') || cleanSlug.startsWith('close-') || title.includes('פתיחת') || title.includes('סגירת')) {
    return { page_intent: 'service', service_type: 'service', flow_type: 'service_flow', flow_variant: 'generic_service' };
  }

  if (url.includes('vs') || title.includes('או') || title.includes('הבדל') || title.includes('השוואה')) {
    return { page_intent: 'comparison', service_type: 'comparison', flow_type: 'comparison_flow', flow_variant: 'generic_compare' };
  }

  if (title.includes('איך') || title.includes('מדריך') || title.includes('שלבים')) {
    return { page_intent: 'guide', service_type: 'guide', flow_type: 'guide_flow', flow_variant: 'generic_guide' };
  }

  // Rule 3: Fallback — use osek_patur_universal_flow for all new leads
  return { page_intent: 'osek_patur_lead', service_type: 'osek_patur_universal', flow_type: 'osek_patur_universal_flow', flow_variant: 'universal_lead' };
}
