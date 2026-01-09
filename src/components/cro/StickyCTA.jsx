import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

export default function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after 20% scroll on mobile only
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      // Hide if flow is active (modal open)
      const flowActive = document.body.classList.contains('flow-active');
      setIsVisible(scrollPercent > 20 && window.innerWidth < 768 && !flowActive);
    };

    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handlePhoneClick = () => {
    window.location.href = 'tel:0502277087';
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/972502277087?text=' + encodeURIComponent('היי, מעוניין לשמוע על פתיחת עוסק פטור'), '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        >
          <div className="bg-white border-t border-gray-200 shadow-lg px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={handlePhoneClick}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#2C5282] text-white rounded-xl font-medium transition-colors"
              >
                <Phone className="w-5 h-5" />
                התקשר עכשיו
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                וואטסאפ
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              ליווי אנושי • בלי התחייבות
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}