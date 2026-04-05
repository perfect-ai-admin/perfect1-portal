/**
 * Page Intent Classifier
 * Maps page slugs/URLs to intent and service_type for bot flow routing.
 */

const PAGE_INTENT_MAP = {
  // Landing pages
  'open-osek-patur': { intent: 'service', service_type: 'open_osek_patur' },
  'osek-patur-landing': { intent: 'service', service_type: 'open_osek_patur' },
  'osek-patur-steps': { intent: 'service', service_type: 'open_osek_patur' },
  'accountant-osek-patur': { intent: 'accounting_service', service_type: 'accountant_osek_patur' },
  'patur-vs-murshe': { intent: 'comparison', service_type: 'patur_vs_murshe' },
  'patur-vs-murshe-quiz': { intent: 'comparison', service_type: 'patur_vs_murshe' },

  // Articles — osek patur
  'osek-patur/how-to-open': { intent: 'guide', service_type: 'open_osek_patur' },
  'osek-patur/management': { intent: 'guide', service_type: 'manage_osek_patur' },
  'osek-patur/taxes': { intent: 'guide', service_type: 'taxes_osek_patur' },
  'osek-patur/tax-reporting': { intent: 'guide', service_type: 'reporting_osek_patur' },
  'osek-patur/income-ceiling': { intent: 'guide', service_type: 'ceiling_osek_patur' },
  'osek-patur/rights': { intent: 'guide', service_type: 'rights_osek_patur' },
  'osek-patur/status-change': { intent: 'service', service_type: 'status_change' },
  'osek-patur/cost': { intent: 'pricing', service_type: 'cost_osek_patur' },
  'osek-patur/accountant': { intent: 'accounting_service', service_type: 'accountant_osek_patur' },
  'osek-patur/faq': { intent: 'guide', service_type: 'faq_osek_patur' },

  // Articles — osek murshe
  'osek-murshe/how-to-open': { intent: 'guide', service_type: 'open_osek_murshe' },
  'osek-murshe/management': { intent: 'guide', service_type: 'manage_osek_murshe' },
  'osek-murshe/taxes': { intent: 'guide', service_type: 'taxes_osek_murshe' },
  'osek-murshe/vat-guide': { intent: 'guide', service_type: 'vat_osek_murshe' },
  'osek-murshe/reports': { intent: 'guide', service_type: 'reports_osek_murshe' },
  'osek-murshe/cost': { intent: 'pricing', service_type: 'cost_osek_murshe' },
  'osek-murshe/status-change': { intent: 'service', service_type: 'status_change' },
  'osek-murshe/faq': { intent: 'guide', service_type: 'faq_osek_murshe' },

  // Articles — hevra
  'hevra-bam/how-to-open': { intent: 'guide', service_type: 'open_hevra' },
  'hevra-bam/management': { intent: 'guide', service_type: 'manage_hevra' },
  'hevra-bam/reports': { intent: 'guide', service_type: 'reports_hevra' },
  'hevra-bam/shareholders': { intent: 'guide', service_type: 'shareholders_hevra' },
  'hevra-bam/transition': { intent: 'service', service_type: 'transition_hevra' },
  'hevra-bam/cost': { intent: 'pricing', service_type: 'cost_hevra' },
  'hevra-bam/faq': { intent: 'guide', service_type: 'faq_hevra' },

  // Articles — sgirat tikim
  'sgirat-tikim/close-osek-patur': { intent: 'service', service_type: 'close_osek_patur' },
  'sgirat-tikim/close-osek-murshe': { intent: 'service', service_type: 'close_osek_murshe' },
  'sgirat-tikim/close-company': { intent: 'service', service_type: 'close_company' },
  'sgirat-tikim/authorities': { intent: 'guide', service_type: 'close_authorities' },
  'sgirat-tikim/consequences': { intent: 'guide', service_type: 'close_consequences' },
  'sgirat-tikim/faq': { intent: 'guide', service_type: 'faq_sgirat_tikim' },

  // Guides
  'guides/opening-business': { intent: 'guide', service_type: 'opening_business' },
  'guides/which-business-type': { intent: 'comparison', service_type: 'business_type_selection' },
  'guides/comparisons': { intent: 'comparison', service_type: 'comparisons' },
  'guides/taxation': { intent: 'guide', service_type: 'taxation' },
  'guides/freelancers': { intent: 'guide', service_type: 'freelancers' },
  'guides/tools': { intent: 'guide', service_type: 'tools' },
  'guides/faq': { intent: 'guide', service_type: 'faq_general' },

  // Compare
  'compare/osek-patur-vs-murshe': { intent: 'comparison', service_type: 'patur_vs_murshe' },

  // Hubs
  'osek-patur': { intent: 'guide', service_type: 'osek_patur_general' },
  'osek-murshe': { intent: 'guide', service_type: 'osek_murshe_general' },
  'hevra-bam': { intent: 'guide', service_type: 'hevra_general' },
  'sgirat-tikim': { intent: 'service', service_type: 'sgirat_tikim_general' },
  'guides': { intent: 'guide', service_type: 'guides_general' },
};

/**
 * Classifies page intent from current URL path.
 * Returns { intent, service_type } or defaults.
 */
export function classifyPageIntent(sourcePage) {
  // Try source_page first (landing pages pass custom source_page)
  const slug = extractSlug(sourcePage);

  // Direct match
  if (PAGE_INTENT_MAP[slug]) {
    return PAGE_INTENT_MAP[slug];
  }

  // Pattern matching fallback
  const path = window.location.pathname.replace(/^\//, '');

  if (PAGE_INTENT_MAP[path]) {
    return PAGE_INTENT_MAP[path];
  }

  // Heuristic fallbacks
  if (path.includes('compare') || path.includes('vs')) {
    return { intent: 'comparison', service_type: path };
  }
  if (path.includes('cost') || path.includes('pricing')) {
    return { intent: 'pricing', service_type: path };
  }
  if (path.includes('accountant')) {
    return { intent: 'accounting_service', service_type: path };
  }
  if (path.startsWith('open-') || path.includes('close-')) {
    return { intent: 'service', service_type: path };
  }

  return { intent: 'guide', service_type: 'general' };
}

function extractSlug(sourcePage) {
  if (!sourcePage) return '';
  // Strip common prefixes like "פורטל עסקי - ", "landing-", etc.
  return sourcePage
    .replace(/^פורטל עסקי - /, '')
    .replace(/^landing-/, '')
    .replace(/-(hero|mid|final|compact)$/, '')
    .trim();
}
