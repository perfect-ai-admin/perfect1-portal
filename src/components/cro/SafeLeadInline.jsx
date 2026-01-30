import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';

/**
 * SafeLeadInline - Google-Safe Inline Lead Form
 * משתמש בבלוק content בתוך העמוד, ללא popup
 * ממיר מבלי לעזוב דף או להפעיל פופאפ אוטומטי
 */
export default function SafeLeadInline({ 
  title = "בדיקה אישית ללא התחייבות",
  subtitle = "קבל ייעוץ ממומחה תוך 24 שעות",
  description = "אנחנו נבחן את המצב שלך בעקביות הדין ונציע פתרון מותאם",
  fields = ["name", "phone"],
  sourcePage = "inline-form"
}) {
  return (
    <div className="w-full max-w-2xl mx-auto my-12 px-4">
      {/* Container */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8 shadow-md">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-lg text-blue-700 font-semibold mb-2">{subtitle}</p>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-3 mb-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>שירות פרטי ומוגן</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>לא מטעם חברת ביטוח</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>תגובה תוך 24 שעות</span>
          </div>
        </div>

        {/* Form */}
        <UnifiedLeadForm
          variant="inline"
          title=""
          subtitle=""
          ctaText="בקשת בדיקה"
          fields={fields}
          sourcePage={sourcePage}
          showDisclaimer={false}
        />

        {/* Footer disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          שירות פרטי ועצמאי • אנחנו לא נציגי רשם העוסקים
        </p>
      </div>
    </div>
  );
}