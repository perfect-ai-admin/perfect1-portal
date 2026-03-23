import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StickyMobileCta({ onCtaClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t-2 border-[#27AE60] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <Button
        onClick={onCtaClick}
        className="w-full h-12 text-base font-black rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white shadow-lg"
      >
        פתח עוסק פטור עכשיו
        <ArrowLeft className="w-5 h-5 mr-1" />
      </Button>
    </div>
  );
}