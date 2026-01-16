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
     <div className="lg:hidden w-full flex flex-col bg-white overflow-hidden" style={{ height: '100dvh', maxHeight: '100dvh' }}>
       {/* HEADER - Compact Fixed Height */}
       <div className="flex-shrink-0 px-4 py-2">
         <h2 className="text-base font-bold text-gray-900 text-center">בחר את הלוגו המושלם שלך 🎨</h2>
         <p className="text-xs text-gray-500 text-center mt-0.5">4 וריאציות בעבורך</p>
       </div>

       {/* LOGO DISPLAY - Flexible, Takes Available Space */}
       <motion.div
         key={currentIndex}
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.2 }}
         className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden min-h-0 w-full"
       >
         <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-sm w-full max-w-[300px] aspect-square relative p-6">
           <img 
             src={currentLogo.url} 
             alt={`Logo variant ${currentIndex + 1}`} 
             className="w-full h-full object-contain drop-shadow-sm"
           />
         </div>

         <div className="mt-4 w-full flex flex-col items-center space-y-2">
           <h3 className="text-sm font-bold text-gray-900 text-center line-clamp-1 px-4">{currentLogo.variant}</h3>

           <div className="flex items-center justify-center gap-3 w-full max-w-[120px]">
             <span className="text-xs font-medium text-gray-400">{currentIndex + 1}</span>
             <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercent}%` }}
                 transition={{ duration: 0.3 }}
                 className="h-full bg-blue-600 rounded-full"
               />
             </div>
             <span className="text-xs font-medium text-gray-400">{logos.length}</span>
           </div>
         </div>
       </motion.div>

       {/* ACTION BUTTONS - Compact Fixed Height */}
       <div className="flex-shrink-0 px-3 pb-2 space-y-1">
         <div className="grid grid-cols-2 gap-1.5">
           <button 
             onClick={() => setSelectedLogo(currentLogo)}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
           >
             <Download className="w-3 h-3" />
             הורדה
           </button>

           <button 
             onClick={() => saveLogo(currentLogo.url, currentLogo.variant)}
             className="w-full border border-gray-300 text-gray-700 py-2 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
           >
             <Palette className="w-3 h-3" />
             שמור
           </button>
         </div>

         <div className="grid grid-cols-2 gap-1.5">
           <button
             onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
             disabled={currentIndex === 0}
             className="w-full py-1.5 px-1 rounded-lg border text-gray-700 text-xs font-semibold disabled:opacity-30 hover:bg-gray-50 flex items-center justify-center gap-0.5"
           >
             <ChevronRight className="w-3 h-3" />
             הקודם
           </button>
           <button
             onClick={() => setCurrentIndex(Math.min(logos.length - 1, currentIndex + 1))}
             disabled={currentIndex === logos.length - 1}
             className="w-full py-1.5 px-1 rounded-lg border border-blue-300 text-blue-700 text-xs font-semibold disabled:opacity-30 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-0.5"
           >
             הבא
             <ChevronLeft className="w-3 h-3" />
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
        );
        }