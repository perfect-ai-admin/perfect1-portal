import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import SidePopup from './components/cro/SidePopup';
import StickyCTA from './components/cro/StickyCTA';
import CriticalCSS from './components/performance/CriticalCSS';
import ResourceHints from './components/performance/ResourceHints';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <CriticalCSS />
      <ResourceHints 
        priorityImages={['/logo.png']}
        prefetchPages={['/Services', '/Pricing', '/Contact']}
      />
      <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <WhatsAppButton message={getWhatsAppMessage()} />
        <SidePopup />
        <StickyCTA />
      </div>
    </HelmetProvider>
  );
}