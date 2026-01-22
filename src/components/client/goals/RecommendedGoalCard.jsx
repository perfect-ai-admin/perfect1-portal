import React from 'react';
import { Sparkles, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecommendedGoalCard({ recommendedGoal, onStart, onNavigate }) {
  if (!recommendedGoal) return null;

  return (
    <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 border border-purple-100 shadow-lg relative overflow-hidden group hover:border-purple-200 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0 pointer-events-none"></div>
      
      {/* Badge */}
      <div className="absolute top-5 left-5 bg-white text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full border border-purple-100 shadow-sm flex items-center gap-1.5 z-10">
         <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
         מומלץ עבורך
      </div>

      <div className="flex flex-col gap-6 relative z-10">
         {/* Header */}
         <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                <Sparkles className="w-6 h-6 text-white" />
             </div>
             <div>
               <h3 className="text-xl font-black text-gray-900 mb-1">📍 נקודת ההתחלה שלך</h3>
               <p className="text-gray-600 leading-relaxed text-sm">
                 לפי מה שסיפרת לנו, זה השלב שהכי נכון להתחיל ממנו.
               </p>
             </div>
         </div>

         {/* Content */}
         <div className="flex flex-col sm:flex-row gap-6">
             <div className="flex-shrink-0 mt-2 hidden sm:block">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200 transform group-hover:scale-105 transition-transform duration-300">
                   <Target className="w-8 h-8 text-white" />
                </div>
             </div>

             <div className="flex-1">
                <div className="flex items-center gap-3 sm:hidden mb-2">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Target className="w-5 h-5 text-white" />
                   </div>
                   <h3 className="text-xl font-black text-gray-900 leading-tight">
                      {recommendedGoal.title}
                   </h3>
                </div>
                
                <h3 className="hidden sm:block text-2xl font-black text-gray-900 mb-2 leading-tight">
                   {recommendedGoal.title}
                </h3>
                
                <p className="text-gray-600 text-base mb-5 leading-relaxed max-w-xl">
                   {recommendedGoal.description}
                </p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100 mb-6 inline-block w-full sm:w-auto">
                   <p className="text-sm text-purple-800 font-medium flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-bold ml-1">למה דווקא עכשיו?</span>
                        {recommendedGoal.reason}
                      </span>
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={onStart}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-200 hover:-translate-y-0.5 transition-all h-12 px-8 rounded-xl font-bold text-base w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5 ml-2 fill-current" />
                    יאללה, בוא נתחיל!
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => onNavigate('goals')}
                    className="text-gray-500 hover:text-gray-900 hover:bg-purple-50 text-sm font-normal"
                  >
                    רוצה לבחור מטרה אחרת?
                  </Button>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}