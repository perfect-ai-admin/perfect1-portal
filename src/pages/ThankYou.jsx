import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowLeft, Layers, Megaphone, DollarSign, Target } from 'lucide-react';
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
  const fromForm = location.state?.fromForm === true;
  const hasFired = useRef(false);

  // Fire conversion events ONCE — only if navigated from a real form submission
  useEffect(() => {
    if (hasFired.current) return;
    if (!fromForm) return; // Block false conversions from direct navigation / refresh

    // Deduplicate: prevent double-fire on same page load, but allow new form submissions
    const now = Date.now();
    const lastFired = parseInt(sessionStorage.getItem('last_conversion_ts') || '0', 10);
    if (now - lastFired < 5000) return; // Block if fired within last 5 seconds
    sessionStorage.setItem('last_conversion_ts', String(now));

    hasFired.current = true;

    // Google Ads conversion tracking (direct gtag — single source of truth)
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-10811556085/PzlFCIrkg_gbEPWBraMo',
        value: 1.0,
        currency: 'ILS',
      });
    }

    // GTM dataLayer — single event for GTM triggers
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_submitted',
        conversion_type: 'lead',
        source_page: source,
        page_path: '/ThankYou',
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: source || 'thank_you_page',
        content_category: 'lead_conversion',
      });
    }
  }, [source, fromForm]);

  const sourceLabel = getSourceLabel(source);
  const displayName = name ? ` ${name}` : '';

  return (
    <>
      <div dir="rtl" className="portal-root min-h-screen" style={{ fontFamily: "'Heebo', sans-serif" }}>
        <Helmet>
          <title>תודה שהשארת פרטים | פרפקט וואן</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        {/* Minimal brand bar — no navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4 text-center">
            <span className="text-xl font-bold text-portal-navy">פרפקט וואן</span>
          </div>
        </div>

        <main className="py-10 md:py-14 px-4">
          <div className="max-w-2xl mx-auto">
            {/* BLOCK 1 — Confirmation */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce" style={{ animationIterationCount: 3, animationDuration: '0.6s' }}>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-portal-navy mb-3">
                הבקשה שלך התקבלה{displayName} ✅
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                תודה שהשארת פרטים.
                <br />
                אחד מאנשי הצוות שלנו יחזור אליך בהקדם כדי לעזור לך להתחיל את הדרך כעצמאי.
              </p>
            </div>

            {/* BLOCK 2 — Complementary offer */}
            <div className="rounded-3xl p-6 md:p-10 mb-8 shadow-xl border border-white/10" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">הצעה מיוחדת ללקוחות שלנו</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                בינתיים — רוצה ללמוד איך להקים
                <br />
                <span style={{ color: '#F59E0B' }}>עסק חכם בעזרת AI?</span>
              </h2>

              <p className="text-white/85 text-base md:text-lg mb-5 leading-relaxed">
                בנינו תוכנית מיוחדת בשם <strong className="text-white">"עצמאים ברגע"</strong> —
                תוכנית קצרה של 4 מפגשים שמראה איך לבנות עסק חכם מההתחלה:
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  'בניית נכסים דיגיטליים לעסק',
                  'יצירת קמפיינים בעזרת AI',
                  'תמחור נכון לשירותים',
                  'בניית מערכת שמביאה לקוחות',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/90">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BLOCK 3 — What you get */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-8 shadow-sm">
              <h3 className="text-xl md:text-2xl font-extrabold text-portal-navy mb-5 text-center">מה מקבלים בתוכנית</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Target, text: '4 מפגשים אישיים' },
                  { icon: Layers, text: 'בניית נכסים דיגיטליים לעסק' },
                  { icon: Megaphone, text: 'כלים חכמים לשיווק בעזרת AI' },
                  { icon: DollarSign, text: 'איך להביא לקוחות ראשונים' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-portal-teal/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-portal-teal" />
                    </div>
                    <span className="text-portal-navy font-semibold text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCK 4 — CTA */}
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-extrabold text-portal-navy mb-5">
                רוצה לראות איך זה עובד?
              </h3>
              <Link
                to="/atzmaim-berega"
                className="inline-flex items-center justify-center gap-3 rounded-2xl font-extrabold shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#1E3A5F',
                  padding: '18px 32px',
                  fontSize: 'clamp(16px, 2.2vw, 20px)',
                  minHeight: '60px',
                  minWidth: '280px',
                }}
              >
                <Sparkles className="w-5 h-5" />
                למידע על תוכנית "עצמאים ברגע"
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>

            {/* BLOCK 5 — Trust */}
            <div className="text-center border-t border-gray-200 pt-8">
              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                התוכנית מיועדת לעצמאים בתחילת הדרך שרוצים להקים עסק בצורה חכמה ומסודרת,
                בעזרת כלים טכנולוגיים מתקדמים.
              </p>
            </div>
          </div>
        </main>

        <footer className="bg-portal-navy text-white/60 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs">
            <p>© {new Date().getFullYear()} פרפקט וואן · perfect1.co.il</p>
          </div>
        </footer>
      </div>
    </>
  );
}
