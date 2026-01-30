import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';
import { Button } from '@/components/ui/button';

/**
 * SafeModalOnClick - Modal שנפתח רק אחרי קליק יזום
 * לא אוטומטי, לא Exit Intent
 * כולל Trigger Button בתוך הקומפוננטה
 */
export default function SafeModalOnClick({
  buttonText = "בדיקה אישית",
  buttonVariant = "default", // "default" | "outline" | "ghost" | "green"
  modalTitle = "בדיקה אישית ללא התחייבות",
  modalSubtitle = "שם + טלפון בלבד",
  fields = ["name", "phone"],
  sourcePage = "SafeModalOnClick",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonClasses = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-blue-600 hover:bg-blue-50",
    green: "bg-green-600 hover:bg-green-700 text-white"
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={buttonClasses[buttonVariant] || buttonClasses.default}
      >
        {buttonText}
      </Button>

      {/* Modal - Only on Click */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
                  {modalSubtitle && (
                    <p className="text-sm text-gray-600 mt-2">{modalSubtitle}</p>
                  )}
                </div>

                <UnifiedLeadForm
                  variant="inline"
                  title=""
                  subtitle=""
                  ctaText="בדיקה"
                  fields={fields}
                  sourcePage={sourcePage}
                  showSubtitle={false}
                  onSuccess={() => {
                    setTimeout(() => setIsOpen(false), 1500);
                  }}
                />

                <p className="text-xs text-gray-500 text-center mt-4">
                  ✓ שירות פרטי • תשובה תוך 24 שעות
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}