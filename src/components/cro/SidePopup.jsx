import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UnifiedLeadForm from '../forms/UnifiedLeadForm';

/**
 * SidePopup - טופס לידים בפופאפ צדדי
 * משתמש ב-UnifiedLeadForm האחיד
 */
export default function SidePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('sidePopupDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 35 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('sidePopupDismissed', 'true');
  };

  const handleSuccess = () => {
    setTimeout(handleClose, 1500);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed right-4 bottom-20 z-50 w-80 max-w-[calc(100vw-2rem)]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 z-10 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-8 px-4 pb-4">
              <UnifiedLeadForm
                variant="popup"
                title="רוצה לפתוח עוסק פטור?"
                subtitle="השאר פרטים ונחזור אליך"
                ctaText="בדיקה ללא התחייבות"
                fields={["name", "phone"]}
                sourcePage={`פופאפ צדדי - ${window.location.pathname}`}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}