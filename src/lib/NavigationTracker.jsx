import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './SupabaseAuthContext';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Persist UTM params & referrer so lead forms can use them later.
    // Uses localStorage (not sessionStorage) because the login flow redirects
    // through an external domain which clears sessionStorage.
    useEffect(() => {
        try {
            // Expire old UTM data after 30 days
            const utmTs = localStorage.getItem('lead_utm_ts');
            if (utmTs && Date.now() - Number(utmTs) > 30 * 24 * 60 * 60 * 1000) {
                ['lead_utm_source','lead_utm_medium','lead_utm_campaign','lead_utm_term','lead_utm_content','lead_referrer','lead_landing_url','lead_utm_ts'].forEach(k => localStorage.removeItem(k));
            }
            const params = new URLSearchParams(location.search);
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            const hasUtm = utmKeys.some(k => params.get(k));
            if (hasUtm) {
                utmKeys.forEach(k => {
                    const v = params.get(k);
                    if (v) localStorage.setItem(`lead_${k}`, v);
                });
                // Mark the timestamp so we can expire after 30 days
                localStorage.setItem('lead_utm_ts', String(Date.now()));
            }
            // Save first referrer (external site) – only once per acquisition
            if (document.referrer && !localStorage.getItem('lead_referrer')) {
                // Only save if referrer is from a different domain (true external referrer)
                try {
                    const refHost = new URL(document.referrer).hostname;
                    const curHost = window.location.hostname;
                    if (refHost !== curHost) {
                        localStorage.setItem('lead_referrer', document.referrer);
                    }
                } catch (_) {
                    localStorage.setItem('lead_referrer', document.referrer);
                }
            }
            // Save the first landing page URL
            if (!localStorage.getItem('lead_landing_url')) {
                localStorage.setItem('lead_landing_url', window.location.href);
            }
        } catch (_) { /* storage may be blocked */ }
    }, [location.search]);

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];

            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            // Navigation tracking
            console.debug('[nav]', pageName);
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}