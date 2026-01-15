import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, BarChart3, Activity, Lightbulb } from 'lucide-react';
import MentorHeader from './shared/MentorHeader';
import ConfidenceTag from './shared/ConfidenceTag';
import ActionChip from './shared/ActionChip';

const insightTypes = {
  leads: { icon: TrendingDown, label: 'לידים', color: 'from-red-500 to-red-600' },
  sales: { icon: BarChart3, label: 'מכירות', color: 'from-green-500 to-green-600' },
  expenses: { icon: Activity, label: 'הוצאות', color: 'from-orange-500 to-orange-600' },
  consistency: { icon: Lightbulb, label: 'עקביות', color: 'from-blue-500 to-blue-600' }
};

const mockInsights = [
  {
    id: 1,
    type: 'leads',
    title: 'ירידה בלידים מגוגל',
    why: 'תקציב הקמפיין נגמר וקמפיין חדש עוד לא הופעל',
    action: 'הפעל קמפיין חדש או הגדל תקציב',
    metric: 'מטרה: 10+ לידים חדשים בשבוע',
    confidence: 'high'
  },
  {
    id: 2,
    type: 'sales',
    title: 'אתה לא שולח פולואפים',
    why: 'אחוז הסגירה נמוך מכיוון שאתה מתחבר אבל לא עוקב',
    action: 'שלח הודעת פולואפ ל-3 לידים שממתינים',
    metric: 'מטרה: 2 סגירות בשבוע',
    confidence: 'high'
  },
  {
    id: 3,
    type: 'expenses',
    title: 'הוצאות מעלות כל חודש',
    why: 'תקציב גוגל עלה בלי שהכנסות עלו',
    action: 'בדוק ROAS וקבע תקציב מקסימלי',
    metric: 'ROAS יעד: 3:1',
    confidence: 'medium'
  }
];

export default function Insights() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [archivedCount, setArchivedCount] = useState(0);

  return (
    <div className="flex flex-col h-full bg-white">
      <MentorHeader 
        title="ניתוחים"
        subtitle={`${mockInsights.length} תובנות השבוע`}
        icon={Zap}
      />

      {/* Period Filter */}
      <div className="border-b border-gray-100 p-4 flex gap-2">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedPeriod === 'week'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          שבוע
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedPeriod === 'month'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          חודש
        </button>
      </div>

      {/* Insights Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mockInsights.map((insight, idx) => {
          const config = insightTypes[insight.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${config.color} rounded flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                  <ConfidenceTag level={insight.confidence} />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-gray-600">למה זה חשוב:</p>
                  <p className="text-gray-900">{insight.why}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">מה לעשות:</p>
                  <p className="text-gray-900">{insight.action}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">מדד הצלחה:</p>
                  <p className="text-gray-900 font-medium">{insight.metric}</p>
                </div>
              </div>

              {/* CTA */}
              <ActionChip label="צור פעולה" variant="primary" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}