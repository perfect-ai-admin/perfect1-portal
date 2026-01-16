import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

// GTM Scripts injected directly
const gtmScriptId = 'gtm-script';
const noscriptId = 'gtm-noscript';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';


import CriticalCSS from './components/performance/CriticalCSS';
import ResourceHints from './components/performance/ResourceHints';
import WebVitalsMonitor from './components/performance/WebVitalsMonitor';
import QAChecker from './components/QAChecker';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();

    // SystemLogicMap עמוד עצמאי - אל תציג Header/Footer
    if (currentPageName === 'SystemLogicMap') {
      return children;
    }

    // ClientDashboard במובייל - אל תציג Header רגיל
    if (currentPageName === 'ClientDashboard') {
      return (
        <HelmetProvider>
          <CriticalCSS />
          <ResourceHints 
            priorityImages={['/logo.png']}
            prefetchPages={['/Services', '/Pricing', '/Contact']}
          />
          <WebVitalsMonitor />
          <QAChecker />
          <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
            <main>
              {children}
            </main>
            <div className="hidden md:block">
              <Footer />
            </div>
          </div>
        </HelmetProvider>
      );
    }

    useEffect(() => {
      // Inject GTM script to HEAD if not already there
      if (!document.getElementById(gtmScriptId)) {
        const script = document.createElement('script');
        script.id = gtmScriptId;
        script.async = true;
        script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PNK9CCRQ');`;
        document.head.appendChild(script);
      }

      // Inject GTM noscript to BODY if not already there
      if (!document.getElementById(noscriptId)) {
        const noscript = document.createElement('noscript');
        noscript.id = noscriptId;
        noscript.innerHTML = '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PNK9CCRQ" height="0" width="0" style="display:none;visibility:hidden"></iframe>';
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          
          {/* Google Ads Conversion Tracking */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=AW-10811556085" />
          <script dangerouslySetInnerHTML={{__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-10811556085');
          `}} />
          
          {/* Facebook Pixel */}
          <script async dangerouslySetInnerHTML={{__html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');if(typeof fbq !== 'undefined'){fbq('init','1234567890');fbq('track','PageView');}`}} />
        </Helmet>
      <CriticalCSS />
      <ResourceHints 
        priorityImages={['/logo.png']}
        prefetchPages={['/Services', '/Pricing', '/Contact', '/OsekPaturLanding', '/Blog']}
      />
      <WebVitalsMonitor />
      <QAChecker />
      <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
                <Header />
                <main>
                  {children}
                </main>
                <div className="hidden md:block">
                  <Footer />
                </div>
      </div>
    </HelmetProvider>
  );
}