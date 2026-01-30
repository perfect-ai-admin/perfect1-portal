import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';

/**
 * SafeModalOnClick - Google-Safe Modal (User-Triggered Only)
 * פותח רק בקליק יזום, לא באוטומט
 * תואם Google Ads Policy
 */
export default function SafeModalOnClick({ 
  triggerButtonText = "בדיקה אישית",
  title = "בדיקה אישית ללא התחייבות",
  subtitle = "קבל תשובה תוך 24 שעות",
  fields = ["name", "phone"],
  variant = "primary"  // primary, secondary, outline
}) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <>
      {/* Trigger Button - קליק יזום בלבד */}
      <button
        onClick={() => setIsOpen(true)}
        className={`px-6 py-3 rounded-lg font-bold transition-colors ${buttonClasses[variant] || buttonClasses.primary}`}
      >
        {triggerButtonText}
      </button>

      {/* Modal - יפתח רק בקליק */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-blue-700 mt-1">{subtitle}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6">
                  <UnifiedLeadForm
                    variant="modal"
                    title=""
                    subtitle=""
                    ctaText="קבלת בדיקה"
                    fields={fields}
                    sourcePage="modal-on-click"
                    onSuccess={() => setIsOpen(false)}
                    showDisclaimer={true}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}