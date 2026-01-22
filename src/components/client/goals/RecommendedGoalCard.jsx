import React from 'react';
import { Sparkles, Target, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecommendedGoalCard({ recommendedGoal, onStart, onNavigate }) {
  if (!recommendedGoal) return null;

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full -ml-8 -mb-8 z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-1">📍 נקודת ההתחלה שלך</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              לפי מה שסיפרת לנו, זה השלב שהכי נכון להתחיל ממנו.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-5 border border-purple-100 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-purple-100">
               <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                {recommendedGoal.title}
              </h4>
              <p className="text-xs text-purple-600 font-medium">המטרה הראשונה שלך במסע</p>
            </div>
          </div>
          
          {recommendedGoal.description && (
            <p className="text-sm text-gray-600 mb-2">
              {recommendedGoal.description}
            </p>
          )}
          <p className="text-sm text-purple-700 bg-purple-50 rounded-lg p-2 border border-purple-100">
            <strong>למה זה מומלץ:</strong> {recommendedGoal.reason}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            size="lg"
            onClick={onStart}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg h-12 text-base"
          >
            <Play className="w-5 h-5 ml-2 fill-current" />
            להתחיל מהמטרה המומלצת
          </Button>
          <Button 
            variant="ghost"
            onClick={() => onNavigate('goals')}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-normal"
          >
            רוצה לבחור מטרה אחרת?
          </Button>
        </div>
      </div>
    </div>
  );
}