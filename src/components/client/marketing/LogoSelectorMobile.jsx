import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, Code, FileJson, CheckCircle2 } from 'lucide-react';

export default function LogoSelectorMobile({ logos, formData }) {
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

   return (
     <div className="w-screen h-screen lg:h-full flex flex-col bg-white overflow-hidden lg:hidden fixed lg:static inset-0 lg:inset-auto">
       {/* Logo Display - Flexible Center */}
       <motion.div
         key={currentIndex}
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.2 }}
         className="flex-1 flex flex-col items-center justify-center px-4 min-h-0 py-2"
       >
         <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-sm w-48 h-48 sm:w-56 sm:h-56">
           <img 
             src={currentLogo.url} 
             alt={`Logo variant ${currentIndex + 1}`} 
             className="max-h-32 w-auto object-contain"
           />
         </div>

         {/* Variant Name */}
         <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-2 text-center line-clamp-1">{currentLogo.variant}</h3>

         {/* Progress Indicator */}
         <div className="flex items-center justify-center gap-1.5 mt-2">
           <span className="text-xs font-semibold text-gray-700">{currentIndex + 1}</span>
           <div className="w-16 h-0.5 bg-gray-200 rounded-full overflow-hidden">
             <motion.div
               initial={{ width: 0 }}
               animate={{ width: `${progressPercent}%` }}
               transition={{ duration: 0.3 }}
               className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
             />
           </div>
           <span className="text-xs font-semibold text-gray-700">{logos.length}</span>
         </div>
       </motion.div>

       {/* Action Buttons - Bottom Compact */}
       <div className="px-3 pb-3 space-y-2 flex-shrink-0">
         {/* Download & Save Row */}
         <div className="grid grid-cols-2 gap-2">
           <button 
             onClick={() => setSelectedLogo(currentLogo)}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs sm:text-sm font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
           >
             <Download className="w-3.5 h-3.5" />
             הורדה
           </button>

           <button 
             onClick={() => saveLogo(currentLogo.url, currentLogo.variant)}
             className="w-full border-2 border-gray-300 text-gray-700 py-2.5 text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
           >
             <Palette className="w-3.5 h-3.5" />
             שמור
           </button>
         </div>

         {/* Navigation Row */}
         <div className="grid grid-cols-2 gap-2">
           <button
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="w-full py-2.5 px-2 rounded-lg border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
           >
             <ChevronRight className="w-3.5 h-3.5" />
             הקודם
           </button>
           <button
             onClick={() => setCurrentIndex(Math.min(logos.length - 1, currentIndex + 1))}
             disabled={currentIndex === logos.length - 1}
             className="w-full py-2.5 px-2 rounded-lg border-2 border-blue-300 text-blue-700 text-xs sm:text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed bg-blue-50 hover:bg-blue-100 transition-all flex items-center justify-center gap-1"
           >
             הבא
             <ChevronLeft className="w-3.5 h-3.5" />
           </button>
         </div>
       </div>

       {/* Download Dialog */}
       <Dialog open={!!selectedLogo} onOpenChange={(open) => !open && setSelectedLogo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">הלוגו שלך מוכן להורדה</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">PNG</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">SVG</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileJson className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">PDF</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            <button
              onClick={() => setSelectedLogo(null)}
              className="w-full mt-3 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg hover:border-green-400 transition-all"
            >
              <span className="font-bold text-gray-900 text-sm">המשך לרכישה</span>
            </button>
          </div>
        </DialogContent>
       </Dialog>
       </div>
       <Dialog open={!!selectedLogo} onOpenChange={(open) => !open && setSelectedLogo(null)}>
       </Dialog>
  );
}