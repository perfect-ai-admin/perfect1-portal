import { useState, useEffect, useCallback } from 'react';

const PREFS_KEY = 'a11y_prefs';

const OPTIONS = [
  { id: 'highContrast', label: 'ניגודיות גבוהה', cssClass: 'accessibility-high-contrast' },
  { id: 'linksHighlight', label: 'הדגשת קישורים', cssClass: 'accessibility-links-highlight' },
  { id: 'stopAnimations', label: 'עצירת אנימציות', cssClass: 'accessibility-stop-animations' },
  { id: 'readableFont', label: 'גופן קריא', cssClass: 'accessibility-readable-font' },
];

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch { return {}; }
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);

  // Apply saved prefs on mount
  useEffect(() => {
    OPTIONS.forEach(({ id, cssClass }) => {
      document.body.classList.toggle(cssClass, !!prefs[id]);
    });
  }, [prefs]);

  const toggle = useCallback((id) => {
    setPrefs((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const empty = {};
    OPTIONS.forEach(({ cssClass }) => document.body.classList.remove(cssClass));
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(empty)); } catch {}
    setPrefs(empty);
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="תפריט נגישות"
        title="נגישות"
        className="fixed bottom-20 left-4 z-[9998] w-12 h-12 bg-[#1E3A5F] text-white rounded-full shadow-lg hover:bg-[#2C5282] transition-colors flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <circle cx="12" cy="4.5" r="2.5" fill="currentColor" stroke="none" />
          <path d="M12 7.5V14M12 14L8 20M12 14L16 20" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 10.5H17" strokeLinecap="round" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="הגדרות נגישות"
          dir="rtl"
          className="fixed bottom-[136px] left-4 z-[9998] w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up"
        >
          <div className="p-4 bg-[#1E3A5F] text-white flex items-center justify-between">
            <h3 className="font-bold text-sm">הגדרות נגישות</h3>
            <button onClick={() => setOpen(false)} aria-label="סגור" className="text-white/70 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="p-3 space-y-1">
            {OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`w-full text-right px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  prefs[id]
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {prefs[id] ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>

          <div className="px-3 pb-3 flex gap-2">
            <button
              onClick={resetAll}
              className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              איפוס
            </button>
            <a
              href="/Accessibility"
              className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              הצהרת נגישות
            </a>
          </div>
        </div>
      )}
    </>
  );
}
