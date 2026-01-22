import React from 'react';
import { Sparkles, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecommendedGoalCard({ recommendedGoal, onStart, onNavigate }) {
  if (!recommendedGoal) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      {/* Top Tag - Clean & Inline */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-3 py-1 rounded-full text-xs font-bold">
           <Sparkles className="w-3.5 h-3.5" />
           המלצה אישית עבורך
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5">
         {/* Icon */}
         <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center border border-purple-100">
               <Target className="w-7 h-7 text-purple-600" />
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
               {recommendedGoal.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
               {recommendedGoal.description}
            </p>
            
            {/* Why Section - simplified */}
            <div className="mb-5 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-purple-700 block mb-1">למה זה הצעד הבא?</span>
                {recommendedGoal.reason}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Button 
                onClick={onStart}
                className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white h-11 px-6 rounded-xl font-medium text-sm shadow-sm"
              >
                <Play className="w-4 h-4 ml-2 fill-current" />
                התחל את המטרה הזו
              </Button>
              
              <button 
                onClick={() => onNavigate('goals')}
                className="text-sm text-gray-400 hover:text-gray-600 underline decoration-gray-300 underline-offset-4 transition-colors"
              >
                בחר מטרה אחרת
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}