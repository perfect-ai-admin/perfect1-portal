import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Persist UTM params & referrer on first arrival so lead forms can use them later
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search);
            const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
            const hasUtm = utmKeys.some(k => params.get(k));
            if (hasUtm) {
                utmKeys.forEach(k => {
                    const v = params.get(k);
                    if (v) sessionStorage.setItem(k, v);
                });
            }
            // Save first referrer (external site) once per session
            if (document.referrer && !sessionStorage.getItem('landing_referrer')) {
                sessionStorage.setItem('landing_referrer', document.referrer);
            }
            // Save the first landing page URL
            if (!sessionStorage.getItem('landing_page_url')) {
                sessionStorage.setItem('landing_page_url', window.location.href);
            }
        } catch (_) { /* sessionStorage may be blocked */ }
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
            base44.appLogs.logUserInApp(pageName).catch(() => {
                // Silently fail - logging shouldn't break the app
            });
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}