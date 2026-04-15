import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowLeft, AlertTriangle, XCircle, Briefcase, Users, TrendingUp, Wrench } from 'lucide-react';
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
                הפרטים שלך התקבלו{displayName} ✅
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                אחד מאנשי הצוות שלנו יחזור אליך בהקדם כדי לעזור לך להתחיל את הדרך כעצמאי.
              </p>
            </div>

            {/* BLOCK 2 — The Problem (urgency) */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-portal-navy leading-tight">
                  רגע חשוב לפני שמתחילים
                </h2>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-amber-900 mb-3">
                רוב העצמאים עושים את הטעות הזאת בתחילת הדרך
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                הרבה אנשים פותחים עוסק פטור — אבל אין להם:
              </p>
              <ul className="space-y-2.5 mb-4">
                {[
                  'נכסים דיגיטליים',
                  'שיטה להביא לקוחות',
                  'תמחור נכון',
                  'מערכת שמנהלת את העסק',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-800">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-amber-900 font-bold">
                בגלל זה הרבה עסקים נתקעים אחרי כמה חודשים.
              </p>
            </div>

            {/* BLOCK 3 — The Solution */}
            <div className="rounded-3xl p-6 md:p-10 mb-8 shadow-xl" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #152D4A 50%, #0F766E 100%)' }}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">הפתרון</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                בדיוק בשביל זה יצרנו את
                <br />
                <span style={{ color: '#F59E0B' }}>תוכנית "עצמאים ברגע"</span>
              </h2>

              <p className="text-white/85 text-base md:text-lg mb-6 leading-relaxed">
                תוכנית קצרה של 4 מפגשים שמראה איך להקים עסק חכם מההתחלה בעזרת כלים מתקדמים ו-AI.
              </p>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <p className="text-white font-bold mb-3">בתוכנית תלמד:</p>
                <ul className="space-y-2.5">
                  {[
                    'לבנות נכסים דיגיטליים לעסק',
                    'ליצור קמפיינים שמביאים לקוחות',
                    'לתמחר שירותים בצורה רווחית',
                    'להשתמש ב-AI כדי לנהל ולשווק את העסק',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/95">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BLOCK 4 — The Outcome */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 mb-10 shadow-sm">
              <h3 className="text-xl md:text-2xl font-extrabold text-portal-navy mb-2 text-center">המטרה של התוכנית</h3>
              <p className="text-center text-gray-500 mb-6">שתצא עם:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Briefcase, text: 'עסק ברור ומסודר' },
                  { icon: Users, text: 'מערכת להבאת לקוחות' },
                  { icon: TrendingUp, text: 'הצעת שירות ותמחור נכון' },
                  { icon: Wrench, text: 'כלים לניהול ושיווק העסק' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gradient-to-br from-portal-teal/5 to-portal-navy/5 rounded-xl p-4 border border-portal-teal/20">
                    <div className="w-11 h-11 rounded-full bg-portal-teal flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-portal-navy font-bold text-sm md:text-base">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCK 5 — CTA */}
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-extrabold text-portal-navy mb-6">
                רוצה לראות איך התוכנית עובדת?
              </h3>
              <Link
                to="/atzmaim-berega"
                className="inline-flex items-center justify-center gap-3 rounded-2xl font-extrabold shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#1E3A5F',
                  padding: '20px 40px',
                  fontSize: 'clamp(17px, 2.4vw, 22px)',
                  minHeight: '68px',
                  maxWidth: '100%',
                }}
              >
                <Sparkles className="w-6 h-6" />
                גלה איך להקים עסק חכם
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <p className="text-gray-400 text-xs mt-3">ללא התחייבות · כל המידע על התוכנית</p>
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
