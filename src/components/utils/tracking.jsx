export const getSignupUrl = () => {
  const baseUrl = "https://perfect-dashboard.com/login";
  // After login, redirect to the app
  const targetAfterLogin = "https://perfect-dashboard.com/APP";
  
  const url = new URL(baseUrl);

  // Set the redirect URL after login
  url.searchParams.set("from_url", targetAfterLogin);

  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href);
    const currentParams = currentUrl.searchParams;
    
    // 1. Pass through existing UTM parameters from the current URL
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      if (currentParams.get(param)) {
        url.searchParams.set(param, currentParams.get(param));
      }
    });

    // 2. Track the specific page the user came from (Internal Referrer)
    // We use 'ref_page' to know which page on the site converted the user
    url.searchParams.set('ref_page', window.location.pathname);

    // 3. Set default UTM source if none exists (Internal Link tracking)
    if (!url.searchParams.get('utm_source')) {
      url.searchParams.set('utm_source', 'website_internal');
      url.searchParams.set('utm_medium', 'cta_button');
      // Set the campaign as the current page name (e.g., "SmartLogo")
      const pageName = window.location.pathname.substring(1) || 'home';
      url.searchParams.set('utm_campaign', pageName);
    }
  }
  
  return url.toString();
};