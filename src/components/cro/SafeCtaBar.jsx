import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, X } from 'lucide-react';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';
import { cn } from '@/lib/utils';

/**
 * SafeCtaBar - Sticky Bar בתחתית הדף (מובייל) / צדדית (דסקטופ)
 * מופיע תמיד כחלק מה-UI, לא כפופאפ אוטומטי
 * Google-Safe: לא Exit Intent, לא Timer, לא Scroll Trigger
 */
export default function SafeCtaBar({ 
  title = "בדיקה אישית ללא התחייבות",
  subtitle = "שם + טלפון בלבד",
  sourcePage = "SafeCtaBar"
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const formRef = useRef(null);

  // כשנפתח, גלול לטופס כדי שיהיה נראה
  useEffect(() => {
    if (isExpanded && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [isExpanded]);

  if (isDismissed) return null;

  // במובייל - כשנפתח, מציגים כ-overlay מלמטה
  // בדסקטופ - נשאר בצד
  return (
    <>
      {/* Overlay רק במובייל כשפתוח */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <div className={cn(
        "fixed left-0 right-0 z-40 transition-all duration-300 ease-out",
        "md:left-auto md:right-4 md:top-2/3 md:-translate-y-1/2 md:w-80",
        "border-t md:border-t-0 md:border border-gray-200 bg-white shadow-xl md:rounded-2xl",
        isExpanded 
          ? "bottom-0 rounded-t-2xl md:rounded-2xl" 
          : "bottom-0"
      )}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
          dir="rtl"
        >
          <div className="text-right">
            <h3 className="font-bold text-sm md:text-base text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <div className="flex gap-2 items-center">
            <ChevronUp 
              className={cn(
                "w-5 h-5 text-gray-400 transition-transform duration-300",
                isExpanded ? "rotate-180" : ""
              )} 
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="סגור"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </button>

        {/* Form - מותנה בהרחבה */}
        {isExpanded && (
          <div ref={formRef} className="px-4 pb-6 border-t border-gray-100 md:border-t-0 max-h-[70vh] md:max-h-none overflow-y-auto">
            <UnifiedLeadForm
              variant="inline"
              title={title}
              subtitle={subtitle}
              ctaText="בדיקה"
              fields={["name", "phone"]}
              sourcePage={sourcePage}
              onSuccess={() => {
                window.location.href = '/ThankYou';
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}