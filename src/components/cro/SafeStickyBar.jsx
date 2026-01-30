import React, { useState } from 'react';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import SafeModalOnClick from './SafeModalOnClick';

/**
 * SafeStickyBar - Google-Safe Sticky Bar (מובייל/דסקטופ)
 * בלוק קבוע בתחתית/צד העמוד ללא auto-popups
 * כולל כפתור לפתיחת modal בקליק בלבד
 */
export default function SafeStickyBar({ 
  variant = "bottom",  // bottom, side
  dismissed = false,
  onDismiss = () => {}
}) {
  const [isHidden, setIsHidden] = useState(dismissed);
  const [modalOpen, setModalOpen] = useState(false);

  if (isHidden) return null;

  const handleDismiss = () => {
    setIsHidden(true);
    onDismiss();
    sessionStorage.setItem('safeStickyBarDismissed', 'true');
  };

  // Bottom bar (mobile-friendly)
  if (variant === "bottom") {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-lg z-40 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm md:text-base">
              רוצה לדעת אם אתה זכאי?
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              בדיקה מהירה ללא התחייבות
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SafeModalOnClick
              triggerButtonText="בדיקה"
              variant="primary"
              fields={["name", "phone"]}
            />
            <button
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Side bar (desktop)
  return (
    <div className="hidden lg:flex fixed right-6 bottom-6 z-40">
      <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 p-4 max-w-xs">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-gray-900">בדיקה אישית</p>
            <p className="text-xs text-gray-600">תוך 24 שעות</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <SafeModalOnClick
          triggerButtonText="קבל בדיקה"
          variant="primary"
          fields={["name", "phone"]}
        />

        <p className="text-xs text-gray-500 text-center mt-2">
          שירות פרטי ובטוח
        </p>
      </div>
    </div>
  );
}