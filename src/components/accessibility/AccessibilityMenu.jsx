import React, { useState, useEffect } from 'react';
import { Accessibility, X, Type, Contrast, Eye, MousePointer, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * תפריט נגישות מלא תואם תיקון 13 לחוק הפרטיות
 * מספק כלים לשיפור נגישות האתר
 */
export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 100,
    highContrast: false,
    linksHighlight: false,
    stopAnimations: false,
    readableFont: false
  });

  // טעינת הגדרות מ-localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load accessibility settings');
      }
    }
  }, []);

  // שמירת הגדרות ל-localStorage והחלתן
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings();
  }, [settings]);

  const applySettings = () => {
    const html = document.documentElement;
    
    // גודל גופן
    html.style.fontSize = `${settings.fontSize}%`;
    
    // ניגודיות גבוהה
    if (settings.highContrast) {
      html.classList.add('accessibility-high-contrast');
    } else {
      html.classList.remove('accessibility-high-contrast');
    }
    
    // הדגשת קישורים
    if (settings.linksHighlight) {
      html.classList.add('accessibility-links-highlight');
    } else {
      html.classList.remove('accessibility-links-highlight');
    }
    
    // עצירת אנימציות
    if (settings.stopAnimations) {
      html.classList.add('accessibility-stop-animations');
    } else {
      html.classList.remove('accessibility-stop-animations');
    }
    
    // גופן קריא
    if (settings.readableFont) {
      html.classList.add('accessibility-readable-font');
    } else {
      html.classList.remove('accessibility-readable-font');
    }
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      highContrast: false,
      linksHighlight: false,
      stopAnimations: false,
      readableFont: false
    });
  };

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150)
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80)
    }));
  };

  return (
    <>
      {/* כפתור נגישות צף */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="fixed left-4 bottom-24 z-[60] bg-[#1E3A5F] text-white w-11 h-11 rounded-full shadow-lg hover:bg-[#2C5282] transition-all flex items-center justify-center"
        aria-label="פתח תפריט נגישות"
        title="נגישות"
      >
        <Accessibility className="w-5 h-5" />
      </button>

      {/* תפריט נגישות */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* תפריט */}
          <div className="fixed left-4 bottom-20 z-50 bg-white rounded-xl shadow-2xl w-80 p-6 max-h-[80vh] overflow-y-auto" dir="rtl">
            {/* כותרת */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Accessibility className="w-6 h-6 text-[#1E3A5F]" />
                <h2 className="text-xl font-bold text-[#1E3A5F]">הצהרת נגישות</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="סגור תפריט"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* הצהרת נגישות */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="mb-2">
                אנו מחויבים להנגשת האתר בהתאם לתיקון 13 לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998.
              </p>
              <p className="text-xs text-gray-600">
                האתר עומד בדרישות רמת AA של WCAG 2.1
              </p>
            </div>

            {/* פקדי נגישות */}
            <div className="space-y-4">
              {/* גודל גופן */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="font-semibold">גודל גופן</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize <= 80}
                    aria-label="הקטן טקסט"
                  >
                    א-
                  </Button>
                  <div className="flex-1 text-center text-sm font-medium">
                    {settings.fontSize}%
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize >= 150}
                    aria-label="הגדל טקסט"
                  >
                    א+
                  </Button>
                </div>
              </div>

              {/* ניגודיות גבוהה */}
              <div className="border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Contrast className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="flex-1 font-semibold">ניגודיות גבוהה</span>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => setSettings(prev => ({ ...prev, highContrast: e.target.checked }))}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {/* הדגשת קישורים */}
              <div className="border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <MousePointer className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="flex-1 font-semibold">הדגשת קישורים</span>
                  <input
                    type="checkbox"
                    checked={settings.linksHighlight}
                    onChange={(e) => setSettings(prev => ({ ...prev, linksHighlight: e.target.checked }))}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {/* עצירת אנימציות */}
              <div className="border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Zap className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="flex-1 font-semibold">עצירת אנימציות</span>
                  <input
                    type="checkbox"
                    checked={settings.stopAnimations}
                    onChange={(e) => setSettings(prev => ({ ...prev, stopAnimations: e.target.checked }))}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              {/* גופן קריא */}
              <div className="pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Eye className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="flex-1 font-semibold">גופן קריא יותר</span>
                  <input
                    type="checkbox"
                    checked={settings.readableFont}
                    onChange={(e) => setSettings(prev => ({ ...prev, readableFont: e.target.checked }))}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {/* כפתור איפוס */}
            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full mt-4"
            >
              אפס הגדרות
            </Button>

            {/* קישור להצהרת נגישות מלאה */}
            <div className="mt-4 pt-4 border-t text-center">
              <a
                href="/accessibility-statement"
                className="text-sm text-blue-600 hover:underline"
                target="_blank"
              >
                הצהרת נגישות מלאה
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}