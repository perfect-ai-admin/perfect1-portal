import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, MessageCircle } from 'lucide-react';

const ScrollCTAHandler = () => {
  const [showPopup65, setShowPopup65] = useState(false);
  const [hasShownPopup65, setHasShownPopup65] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percent = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;

      // Popup אחרי 25%
      if (percent >= 25 && !hasShownPopup65) {
        setShowPopup65(true);
        setHasShownPopup65(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShownPopup65]);

  const handlePopupSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('אנא מלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      // שלח ל-WhatsApp
      const message = `היי, שמי ${formData.name} ומספר הטלפון שלי ${formData.phone}. אני רוצה לסגור את עוסק הפטור שלי`;
      window.open(
        `https://wa.me/972502277087?text=${encodeURIComponent(message)}`,
        '_blank'
      );
      setShowPopup65(false);
      setFormData({ name: '', phone: '' });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Popup אחרי 65% גלילה */}
      <AnimatePresence>
        {showPopup65 && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup65(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-black text-gray-900 text-xl">
                    בואו נסגור את התיק
                  </h3>
                  <button
                    onClick={() => setShowPopup65(false)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-gray-700">
                  שם וטלפון בלבד - ואנחנו נטפל בהכל
                </p>

                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder="שמך"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11 text-base rounded-lg"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="מספר הטלפון"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-11 text-base rounded-lg"
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePopupSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-11 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'שולח...' : 'סגור עכשיו'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  לא נשלח ספאם • תשובה תוך 24 שעות
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScrollCTAHandler;