import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Download, Palette, ChevronLeft, ChevronRight, Image, Code, FileJson, CheckCircle2, Wand2, ShoppingCart, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LogoSelectorMobile({ logos, formData, onNext, onReset, onGenerateMore, isGenerating, onClose }) {
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
    
    // Trigger Cart Event
    window.dispatchEvent(new Event('cart-updated'));

    // Option B: Success Toast
    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-bold text-sm">הלוגו נוסף לסל בהצלחה!</span>
        <span className="text-xs opacity-90">הפריט ממתין לך להמשך רכישה</span>
      </div>,
      {
        action: {
          label: 'לסל הקניות',
          onClick: () => window.dispatchEvent(new Event('open-cart')),
        },
        duration: 4000,
        className: "bg-white border-blue-100 shadow-lg",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      }
    );
  };

  const currentLogo = logos[currentIndex];
  const progressPercent = ((currentIndex + 1) / logos.length) * 100;

  if (!mounted) return null;

  return (
    <div 
      className="flex flex-col h-full lg:hidden w-full bg-white overflow-hidden" 
    >
      {/* HEADER - Fixed Height */}
      <div className="flex-none px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm z-10 text-center relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base font-bold text-gray-900 leading-tight">עיצבנו עבורך {logos.length} לוגואים מדהימים! 🎉</h2>
        <p className="text-xs text-gray-500 mt-0.5">דפדף כדי לראות את כל האפשרויות</p>
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
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            הוסף לסל
          </button>
        </div>

        {/* Nav Arrows - Prominent */}
        <div className="flex items-center justify-between gap-4 px-1 mt-2">
           <button
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="flex-1 flex items-center justify-center py-3 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-30 disabled:bg-gray-50 transition-all active:scale-95"
           >
             <ChevronRight className="w-6 h-6" />
           </button>
           
           <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-900 whitespace-nowrap min-w-[60px] text-center">
               {currentIndex + 1} מתוך {logos.length}
             </span>
             <span className="text-[10px] text-gray-400">החלק או לחץ</span>
           </div>

           <button
             onClick={() => setCurrentIndex(Math.min(logos.length - 1, currentIndex + 1))}
             disabled={currentIndex === logos.length - 1}
             className="flex-1 flex items-center justify-center py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 disabled:opacity-30 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-95"
           >
             <ChevronLeft className="w-6 h-6" />
           </button>
        </div>
        
        {/* Additional Actions */}
        <div className="flex items-center justify-center gap-6 pt-2 pb-1 border-t border-gray-50">
          <button 
            onClick={onReset}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1.5 px-2 py-1"
          >
            <span>⚡</span>
            עיצוב חדש לגמרי
          </button>
          <div className="w-px h-4 bg-gray-200"></div>
          <button 
            onClick={onGenerateMore}
            disabled={isGenerating}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-2 py-1 disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <span>✨</span>
            )}
            צור לי עוד וריאציות
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
    </div>
  );
}