import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cookie_consent';

/** Check if user already gave consent */
export function hasConsent() {
  try { return localStorage.getItem(CONSENT_KEY) === 'all'; } catch { return false; }
}

/** Activate deferred tracking scripts (GTM, FB Pixel, Google Ads) */
function activateTrackingScripts() {
  document.querySelectorAll('script[data-cookie-consent]').forEach((el) => {
    const script = document.createElement('script');
    // Copy attributes
    for (const attr of el.attributes) {
      if (attr.name !== 'data-cookie-consent' && attr.name !== 'type') {
        script.setAttribute(attr.name, attr.value);
      }
    }
    script.textContent = el.textContent;
    el.parentNode.replaceChild(script, el);
  });

  // Activate noscript pixel images that were hidden
  document.querySelectorAll('img[data-cookie-consent]').forEach((img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-cookie-consent');
    }
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasConsent()) {
      activateTrackingScripts();
    } else {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, 'all'); } catch {}
    setVisible(false);
    activateTrackingScripts();
  };

  const decline = () => {
    try { localStorage.setItem(CONSENT_KEY, 'essential'); } catch {}
    setVisible(false);
    // Don't activate tracking scripts
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="הסכמה לעוגיות"
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-[9999] p-4 animate-slide-up"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-800 mb-1">האתר משתמש בעוגיות</p>
          <p>
            אנו משתמשים בעוגיות לצורך שיפור חוויית השימוש, ניתוח תנועה ושיווק.
            למידע נוסף ראו את{' '}
            <a href="/Privacy" className="underline text-blue-600 hover:text-blue-800">מדיניות הפרטיות</a>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            רק הכרחיות
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#2C5282] rounded-xl transition-colors"
          >
            אישור הכל
          </button>
        </div>
      </div>
    </div>
  );
}
