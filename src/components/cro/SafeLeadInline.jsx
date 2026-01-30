import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';
import { cn } from '@/lib/utils';

/**
 * SafeLeadInline - בלוק טופס עצמאי בתוך העמוד
 * גם בתחתית, גם באמצע - כחלק מהתוכן
 * לא פופאפ, לא אוטומטי
 */
export default function SafeLeadInline({
  title = "בדיקה אישית ללא התחייבות",
  subtitle = "מסלול מהיר - תשובה תוך 24 שעות",
  description = "שם + טלפון בלבד. אנחנו נחזור אליך בטלפון שהשארת.",
  ctaText = "בדיקה",
  fields = ["name", "phone"],
  sourcePage = "SafeLeadInline",
  className = "",
  variant = "default" // "default" | "minimal" | "highlight"
}) {
  return (
    <div className={cn(
      "rounded-2xl border border-gray-200 overflow-hidden",
      "bg-gradient-to-br from-white to-gray-50",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "px-6 py-8 sm:px-8",
        variant === "highlight" && "bg-gradient-to-r from-blue-50 to-blue-50/50",
        variant === "minimal" && "py-4 px-4"
      )}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 p-2 bg-green-100 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>

        {description && (
          <p className="text-sm text-gray-600 ml-9">{description}</p>
        )}
      </div>

      {/* Form */}
      <div className={cn(
        "px-6 py-6 sm:px-8",
        variant === "minimal" && "px-4 py-4"
      )}>
        <UnifiedLeadForm
          variant="inline"
          title=""
          subtitle=""
          ctaText={ctaText}
          fields={fields}
          sourcePage={sourcePage}
          showSubtitle={false}
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
        <p className="text-xs text-gray-500 text-center">
          ✓ שירות פרטי • אנחנו לא חברת ביטוח • תשובה תוך 24 שעות
        </p>
      </div>
    </div>
  );
}