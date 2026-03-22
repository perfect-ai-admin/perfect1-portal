import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// GTM Scripts injected directly
const gtmScriptId = 'gtm-script';
const noscriptId = 'gtm-noscript';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ClientFooter from './components/client/ClientFooter';


import CriticalCSS from './components/performance/CriticalCSS';
import ResourceHints from './components/performance/ResourceHints';
import WebVitalsMonitor from './components/performance/WebVitalsMonitor';

import { Toaster } from "@/components/ui/sonner";
import AccessibilityMenu from './components/accessibility/AccessibilityMenu';
import CookieConsent from './components/common/CookieConsent';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();

    // עמודים עצמאיים ללא Header/Footer
    if (['SystemLogicMap', 'LP', 'LandingPagePreview', 'DigitalCard'].includes(currentPageName)) {
      return children;
    }

    // Check if page requires authentication
    const publicPages = ['Home', 'Pricing', 'About', 'Contact', 'Professions', 'Services'];
    const isPublicPage = publicPages.includes(currentPageName);

    if (!isPublicPage && currentPageName !== 'ClientDashboard' && currentPageName !== 'AdminDashboard') {
      // Private pages - check auth
      const checkPrivatePageAuth = async () => {
        try {
          const isAuth = await base44.auth.isAuthenticated();
          if (!isAuth) {
            window.location.href = '/login?redirect=' + encodeURIComponent(location.pathname);
          }
        } catch (err) {
          console.log('Auth check failed');
        }
      };
      checkPrivatePageAuth();
    }

    // ClientDashboard / AdminDashboard / PricingPerfectBizAI / Summary - אל תציג Header רגיל (יש להם Header משלהם)
    if (currentPageName === 'ClientDashboard' || currentPageName === 'AdminDashboard' || currentPageName === 'PricingPerfectBizAI' || currentPageName === 'Summary' || currentPageName === 'MyProducts' || currentPageName === 'CloseOsekPaturCRM' || currentPageName === 'LandingPageManager') {
      return (
        <HelmetProvider>
          <CriticalCSS />
          <ResourceHints 
            priorityImages={['/logo.png']}
            prefetchPages={['/Services', '/Pricing', '/Contact']}
          />
          <WebVitalsMonitor />

          <div className="min-h-screen bg-[#F8F9FA] w-screen overflow-x-hidden" dir="rtl">
            <main className="w-full overflow-x-hidden">
              {children}
            </main>
            <div className="hidden md:block">
              <ClientFooter />
            </div>
          </div>
          <AccessibilityMenu />
          <Toaster />
          </HelmetProvider>
          );
          }

    useEffect(() => {
      // GTM - Load via standard script src (not innerHTML injection - Google policy safe)
      if (!document.getElementById(gtmScriptId)) {
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        
        // Load GTM script via src attribute (not innerHTML)
        const script = document.createElement('script');
        script.id = gtmScriptId;
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PNK9CCRQ';
        document.head.appendChild(script);
      }

      // GTM noscript fallback
      if (!document.getElementById(noscriptId)) {
        const noscript = document.createElement('noscript');
        noscript.id = noscriptId;
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-PNK9CCRQ';
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }, []);

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, [location.pathname, location.search]);
  // Define WhatsApp messages per page
  const getWhatsAppMessage = () => {
    const messages = {
      Home: 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור',
      Professions: 'היי, אני מחפש מידע על פתיחת עוסק פטור לפי מקצוע',
      ProfessionPage: 'היי, אני מעוניין לפתוח עוסק פטור. אשמח לייעוץ',
      Pricing: 'היי, הגעתי מעמוד המחירים ומעוניין לשמוע עוד על השירות',
      Services: 'היי, אני מעוניין לשמוע עוד על השירותים שלכם',
      ServicePage: 'היי, מעוניין לשמוע עוד על השירות',
      About: 'היי, הגעתי מדף האודות ואשמח לקבל מידע נוסף',
      Contact: 'היי, אני רוצה ליצור קשר לגבי פתיחת עוסק פטור'
    };
    return messages[currentPageName] || messages.Home;
  };

  return (
    <HelmetProvider>
        <Helmet>
          {/* Performance optimizations */}
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

          {/* Google Ads Conversion Tracking - loaded via GTM for policy compliance */}
          {/* Facebook Pixel - loaded via GTM for policy compliance */}
          {/* All tracking scripts should be managed through Google Tag Manager */}

          {/* Base44 Default Auth */}
        </Helmet>
      <CriticalCSS />
      <ResourceHints 
        priorityImages={['/logo.png']}
        prefetchPages={['/Services', '/Pricing', '/Contact', '/OsekPaturLanding', '/Blog']}
      />
      <WebVitalsMonitor />
      <div className="min-h-screen bg-[#F8F9FA] w-screen overflow-x-hidden" dir="rtl">
                <Header />
                <main className="w-full overflow-x-hidden">
                  {children}
                </main>
                <div className="hidden md:block">
                  <Footer />
                </div>
      </div>
      <AccessibilityMenu />
      <CookieConsent />
      <Toaster />
    </HelmetProvider>
  );
}