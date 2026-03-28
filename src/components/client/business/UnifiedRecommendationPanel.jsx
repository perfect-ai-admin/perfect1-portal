import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function UnifiedRecommendationPanel({ businessState }) {
  const rec = businessState?.unified_recommendation || {};
  const stage = businessState?.stage || 'early_revenue';
  const challenge = businessState?.primary_challenge || 'no_leads';

  // זה יתחבר ל-backend Decision Engine
  const getRecommendationColor = () => {
    const challenges = {
      no_leads: 'from-orange-500 to-orange-600',
      low_conversion: 'from-red-500 to-red-600',
      overload: 'from-purple-500 to-purple-600',
      cash_flow: 'from-yellow-500 to-yellow-600',
      retention: 'from-pink-500 to-pink-600',
      focus: 'from-blue-500 to-blue-600'
    };
    return challenges[challenge] || 'from-blue-500 to-blue-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Recommendation Card */}
      <div className={`bg-gradient-to-r ${getRecommendationColor()} rounded-2xl p-8 text-white shadow-lg`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Target className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white/80 mb-2">
              הפעולה הבאה שלך:
            </div>
            <h3 className="text-2xl font-bold mb-3">
              {rec.single_next_action || 'לא עדיין קיימת המלצה - עדכן את הנתונים שלך'}
            </h3>
            <p className="text-white/90 leading-relaxed">
              {rec.why_this_matters}
            </p>
          </div>
        </div>
      </div>

      {/* What NOT to Do */}
      {rec.what_not_doing_now && rec.what_not_doing_now.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <div className="font-semibold mb-2">מה שאתה לא עושה עכשיו:</div>
            <ul className="space-y-1 text-sm">
              {rec.what_not_doing_now.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Context Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-blue-600 font-medium">שלב עסקי</div>
          <div className="text-lg font-bold text-blue-900 mt-1">
            {stage === 'pre_revenue' && 'טרום הכנסות'}
            {stage === 'early_revenue' && 'הכנסות ראשוניות'}
            {stage === 'growing' && 'בגדילה'}
            {stage === 'stable' && 'יציב'}
            {stage === 'declining' && 'יורד'}
            {stage === 'crisis' && 'משבר'}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-xs text-red-600 font-medium">הבעיה העיקרית</div>
          <div className="text-lg font-bold text-red-900 mt-1">
            {challenge === 'no_leads' && 'אין ליד'}
            {challenge === 'low_conversion' && 'מכירות נמוכות'}
            {challenge === 'overload' && 'עומס'}
            {challenge === 'cash_flow' && 'מזומנים'}
            {challenge === 'retention' && 'שמירה על לקוחות'}
            {challenge === 'focus' && 'פיזור'}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 text-blue-900 font-medium mb-2">
          <Clock className="w-4 h-4" />
          צעד ראשון:
        </div>
        <p className="text-sm text-blue-800 mb-3">
          בואו נתחיל עם הפעולה הקטנה הזו היום. זה לוקח שעה, וזה יוביל אותך לשלב הבא.
        </p>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
          <TrendingUp className="w-4 h-4" />
          בואו נתחיל
        </Button>
      </div>
    </motion.div>
  );
}