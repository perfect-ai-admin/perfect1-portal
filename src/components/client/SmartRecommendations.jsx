import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, TrendingUp, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SAMPLE_RECOMMENDATIONS = [
  {
    id: '1',
    type: 'financial',
    priority: 'high',
    title: 'הזדמנות לחיסכון במס',
    description: 'זוהו הוצאות עסקיות שניתן לנכות מהמס. הוספתן יכולה לחסוך לך כ-₪1,200.',
    action: 'צפה בהוצאות',
    actionTab: 'financial',
    estimatedImpact: '₪1,200 חיסכון',
    deadline: '2026-01-31'
  },
  {
    id: '2',
    type: 'marketing',
    priority: 'medium',
    title: 'זמן טוב להשקיע בשיווק',
    description: 'על סמך מגמת ההכנסות שלך והעונתיות בתחום, עכשיו זמן מצוין להשקיע ₪500-1,000 בפרסום.',
    action: 'בנה קמפיין',
    actionTab: 'marketing',
    estimatedImpact: 'עד 3 לקוחות חדשים'
  },
  {
    id: '3',
    type: 'compliance',
    priority: 'urgent',
    title: 'דיווח חודשי מתקרב',
    description: 'נותרו 7 ימים להגשת דיווח למס הכנסה. כל המסמכים שלך מוכנים.',
    action: 'הגש דיווח',
    actionTab: 'financial',
    estimatedImpact: 'הימנע מקנסות',
    deadline: '2026-01-20'
  },
  {
    id: '4',
    type: 'growth',
    priority: 'low',
    title: 'שקול להעלות מחירים',
    description: 'ניתוח השוק מראה שאתה יכול להעלות את המחירים ב-10-15% מבלי לפגוע בביקוש.',
    action: 'למד עוד',
    actionTab: 'business',
    estimatedImpact: '+15% רווחיות'
  }
];

export default function SmartRecommendations({ onNavigate, compact = false }) {
  const [recommendations, setRecommendations] = useState(SAMPLE_RECOMMENDATIONS);
  const [dismissed, setDismissed] = useState([]);

  const activeRecommendations = recommendations.filter(r => !dismissed.includes(r.id));

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'medium':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleDismiss = (id) => {
    setDismissed(prev => [...prev, id]);
  };

  const handleAction = (recommendation) => {
    if (onNavigate && recommendation.actionTab) {
      onNavigate(recommendation.actionTab);
    }
    handleDismiss(recommendation.id);
  };

  if (compact) {
    const topRecommendation = activeRecommendations[0];
    if (!topRecommendation) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border-2 p-4 ${getPriorityColor(topRecommendation.priority)}`}
      >
        <div className="flex items-start gap-3">
          {getPriorityIcon(topRecommendation.priority)}
          <div className="flex-1">
            <h4 className="font-bold mb-1">{topRecommendation.title}</h4>
            <p className="text-sm opacity-90">{topRecommendation.description}</p>
            {topRecommendation.estimatedImpact && (
              <Badge className="mt-2" variant="secondary">
                השפעה: {topRecommendation.estimatedImpact}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            onClick={() => handleAction(topRecommendation)}
            className="flex-1"
          >
            {topRecommendation.action}
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => handleDismiss(topRecommendation.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          המלצות חכמות בשבילך
        </h2>
        <Badge variant="secondary">
          {activeRecommendations.length} המלצות פעילות
        </Badge>
      </div>

      <AnimatePresence>
        {activeRecommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-8 text-center shadow-lg"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">כל כך טוב!</h3>
            <p className="text-gray-600">אין המלצות דחופות כרגע. תמשיך בעבודה המצוינת!</p>
          </motion.div>
        ) : (
          activeRecommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border-2 p-6 shadow-lg ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{rec.title}</h3>
                      {rec.deadline && (
                        <p className="text-xs opacity-75">תאריך יעד: {new Date(rec.deadline).toLocaleDateString('he-IL')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="p-1 hover:bg-white/50 rounded transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm leading-relaxed mb-4 opacity-90">
                    {rec.description}
                  </p>
                  
                  {rec.estimatedImpact && (
                    <div className="bg-white/50 rounded-lg p-3 mb-4">
                      <p className="text-sm">
                        <strong>השפעה משוערת:</strong> {rec.estimatedImpact}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(rec)}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {rec.action}
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDismiss(rec.id)}
                      className="hover:bg-white/50"
                    >
                      מאוחר יותר
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}