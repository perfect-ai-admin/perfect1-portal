import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton({ message = "היי, הגעתי מהאתר ואשמח לקבל ייעוץ לפתיחת עוסק פטור" }) {
  const [showTooltip, setShowTooltip] = useState(false);
  // Always visible - no auto-show timers (Google policy compliant)
  const isVisible = true;

  const whatsappUrl = `https://wa.me/972559700641?text=${encodeURIComponent(message)}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 left-6 z-50"
        >
          {/* Tooltip - only on hover, no auto-popup (Google policy compliant) */}

          {/* Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-full py-5 px-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse-glow"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="font-black text-lg hidden sm:inline">דברו איתנו</span>
          </a>

          {/* Ping animation */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366]"></span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}