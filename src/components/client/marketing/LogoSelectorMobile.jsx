import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Download, Palette, ChevronLeft, ChevronRight, Image, Code, FileJson, CheckCircle2, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LogoSelectorMobile({ logos, formData, onNext }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on body when open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLogo, setSelectedLogo] = useState(null);

  const saveLogo = (logoUrl, variant) => {
    const allSaved = JSON.parse(localStorage.getItem('saved_logos') || '{}');
    if (!allSaved[formData.businessName]) {
      allSaved[formData.businessName] = [];
    }
    allSaved[formData.businessName].push({
      url: logoUrl,
      variant: variant,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('saved_logos', JSON.stringify(allSaved));
    alert(`הלוגו נשמר בהצלחה! ✓`);
  };

  const currentLogo = logos[currentIndex];
  const progressPercent = ((currentIndex + 1) / logos.length) * 100;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] lg:hidden w-full bg-white flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* HEADER - Fixed Height */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm z-10 text-center">
        <h2 className="text-base font-bold text-gray-900 leading-tight">בחר את הלוגו המושלם 🎨</h2>
        <p className="text-xs text-gray-500 mt-0.5">{logos.length} וריאציות עוצבו עבורך</p>
      </div>

      {/* MAIN CONTENT - Flexible - Takes all remaining space */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center relative px-4 py-2">
        
        {/* Logo Container - Constrained to fit */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[320px] aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm flex items-center justify-center p-6"
          style={{ maxHeight: 'calc(100% - 60px)' }} // Leave space for the info below
        >
           <img 
             src={currentLogo.url} 
             alt={`Logo variant ${currentIndex + 1}`} 
             className="w-full h-full object-contain drop-shadow-sm"
           />
        </motion.div>

        {/* Info below logo */}
        <div className="mt-4 flex flex-col items-center w-full space-y-2 flex-none h-[50px]">
           <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{currentLogo.variant}</h3>
           
           {/* Progress */}
           <div className="flex items-center gap-3 w-32">
                <span className="text-[10px] text-gray-400 font-mono">{currentIndex + 1}</span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{logos.length}</span>
           </div>
        </div>
      </div>

      {/* FOOTER - Fixed Height */}
      <div className="flex-none p-4 bg-white border-t border-gray-100 space-y-3 pb-safe z-10">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setSelectedLogo(currentLogo)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-blue-100 shadow-lg active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            הורדה
          </button>
          <button 
            onClick={() => saveLogo(currentLogo.url, currentLogo.variant)}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all"
          >
            <Palette className="w-4 h-4" />
            שמור
          </button>
        </div>

        {/* Nav Arrows */}
        <div className="flex items-center justify-between px-2">
           <button
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="p-2 text-gray-400 disabled:opacity-20 hover:text-gray-900 transition-colors"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
           <span className="text-xs font-medium text-gray-400">דפדף בין האפשרויות</span>
           <button
             onClick={() => setCurrentIndex(Math.min(logos.length - 1, currentIndex + 1))}
             disabled={currentIndex === logos.length - 1}
             className="p-2 text-blue-600 disabled:opacity-20 hover:text-blue-700 transition-colors"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedLogo} onOpenChange={(open) => !open && setSelectedLogo(null)}>
        <DialogContent className="sm:max-w-sm w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-center">הלוגו שלך מוכן להורדה</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {[
              { label: 'PNG', icon: Image, color: 'text-blue-600' },
              { label: 'SVG', icon: Code, color: 'text-purple-600' },
              { label: 'PDF', icon: FileJson, color: 'text-red-600' }
            ].map((format, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <format.icon className={`w-5 h-5 ${format.color}`} />
                  <span className="font-bold text-gray-900 text-sm">{format.label}</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            ))}

            <button
              onClick={() => {
                setSelectedLogo(null);
                if (onNext) onNext();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all"
            >
              <span className="font-bold text-sm">המשך לרכישה</span>
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>,
    document.body
  );
}