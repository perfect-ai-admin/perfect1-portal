import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  if (isDismissed) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-30 md:bottom-auto md:right-4 md:top-1/2 md:-translate-y-1/2 md:w-80",
      "border-t md:border-t-0 md:border border-gray-200 bg-white shadow-lg md:rounded-2xl"
    )}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-bold text-sm md:text-base text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-gray-400 transition-transform",
              isExpanded ? "rotate-180" : ""
            )} 
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Form - מותנה בהרחבה */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 md:border-t-0">
          <UnifiedLeadForm
            variant="inline"
            title={title}
            subtitle={subtitle}
            ctaText="בדיקה"
            fields={["name", "phone"]}
            sourcePage={sourcePage}
            onSuccess={() => {
              setIsExpanded(false);
              setTimeout(() => setIsDismissed(true), 2000);
            }}
          />
        </div>
      )}
    </div>
  );
}