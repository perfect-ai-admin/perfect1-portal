import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Phone, ArrowRight, BookOpen, MessageCircle } from 'lucide-react';
import { PORTAL_CTA } from '@/portal/config/navigation';

// Source page display names
const SOURCE_LABELS = {
  'portal': 'הפורטל העסקי',
  'landing-osek-patur': 'פתיחת עוסק פטור',
  'steps-osek-patur': 'מדריך פתיחת עוסק פטור',
  'comparison': 'דף השוואה',
  'article': 'מאמר',
};

function getSourceLabel(source) {
  if (!source) return '';
  for (const [key, label] of Object.entries(SOURCE_LABELS)) {
    if (source.includes(key)) return label;
  }
  return '';
}

export default function ThankYou() {
  const location = useLocation();
  const source = location.state?.source || '';
  const name = location.state?.name || '';
  const hasFired = useRef(false);

  // Fire conversion events ONCE on page load
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Google Tag Manager — conversion event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'conversion',
        conversion_type: 'lead',
        source_page: source,
        page_path: '/ThankYou',
      });

      // Also push the standard lead_submitted for backward compatibility
      window.dataLayer.push({
        event: 'lead_submitted',
        source_page: source,
        page_path: '/ThankYou',
      });

      // Google Ads conversion tracking
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          send_to: 'AW-10811556085/PzlFCIrkg_gbEPWBraMo',
          value: 1.0,
          currency: 'ILS',
        });
      }
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: source || 'thank_you_page',
        content_category: 'lead_conversion',
      });
    }
  }, [source]);

  const sourceLabel = getSourceLabel(source);
  const displayName = name ? ` ${name}` : '';

  return (
    <HelmetProvider>
      <div dir="rtl" className="portal-root min-h-screen" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>תודה שהשארת פרטים | פרפקט וואן</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-portal-navy">פרפקט וואן</span>
              <span className="text-xs text-gray-400 hidden sm:inline">| ליווי עסקי מקצועי</span>
            </Link>
            <a
              href={`tel:${PORTAL_CTA.phone}`}
              className="flex items-center gap-2 text-portal-teal font-bold text-sm hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{PORTAL_CTA.phone}</span>
              <span className="sm:hidden">התקשרו</span>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce" style={{ animationIterationCount: 3, animationDuration: '0.6s' }}>
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            {/* Thank You Message */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-portal-navy mb-3">
              תודה{displayName}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              הפרטים שלך נקלטו בהצלחה
            </p>
            <p className="text-lg text-gray-500 mb-8">
              ניצור איתך קשר <strong className="text-portal-teal">תוך דקות ספורות</strong> בשעות הפעילות
            </p>

            {/* What Happens Next */}
            <div className="bg-portal-bg rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 text-right">
              <h2 className="font-bold text-lg text-portal-navy mb-4 text-center">מה קורה עכשיו?</h2>
              <div className="space-y-4">
                {[
                  { num: '1', text: 'נציג שלנו יתקשר אליך לשיחה קצרה', time: 'תוך דקות' },
                  { num: '2', text: 'נבין את המצב שלך ומה מתאים לך', time: '5 דקות' },
                  { num: '3', text: 'נכווין אותך לשלבים הבאים — בלי סיבוכים', time: 'מיידי' },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-portal-teal rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium">{step.text}</p>
                      <p className="text-xs text-gray-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <a
                href={`tel:${PORTAL_CTA.phone}`}
                className="flex items-center justify-center gap-2 h-14 bg-portal-teal hover:bg-portal-teal-dark text-white rounded-xl font-bold transition-colors"
              >
                <Phone className="w-5 h-5" />
                התקשרו עכשיו
              </a>
              <a
                href={`https://wa.me/972${PORTAL_CTA.phone.replace(/^0/, '').replace(/-/g, '')}?text=היי, השארתי פרטים באתר ורציתי לברר`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-14 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                שלחו הודעה בוואטסאפ
              </a>
            </div>

            {/* Suggested Content */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="font-bold text-portal-navy mb-4">בינתיים, אפשר לקרוא:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                {[
                  { title: 'מדריך פתיחת עוסק פטור', href: '/OsekPaturSteps', icon: BookOpen },
                  { title: 'עוסק פטור או מורשה?', href: '/compare/osek-patur-vs-murshe', icon: ArrowRight },
                  { title: 'מדריכים לעסקים', href: '/guides', icon: BookOpen },
                  { title: 'כל מה שצריך על עוסק פטור', href: '/osek-patur', icon: ArrowRight },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-portal-teal/40 hover:bg-portal-teal/5 transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-portal-teal flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-portal-navy text-white/60 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm">
            <p>© {new Date().getFullYear()} פרפקט וואן — ליווי עסקי מקצועי. כל הזכויות שמורות.</p>
          </div>
        </footer>
      </div>
    </HelmetProvider>
  );
}
