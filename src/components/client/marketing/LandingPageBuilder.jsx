import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight, X } from 'lucide-react';
import LandingPageQuestionnaire from './LandingPageQuestionnaire';

export default function LandingPageBuilder() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const features = [
    'כותרות שיווקיות',
    'התאמה למומחה',
    'טופס לליידים'
  ];

  const handleComplete = (formData) => {
    console.log('Landing page data:', formData);
    setShowQuestionnaire(false);
  };

  if (showQuestionnaire) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowQuestionnaire(false)}>
        <div className="bg-white rounded-xl w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setShowQuestionnaire(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-[10000]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="overflow-y-auto max-h-[90vh]">
            <LandingPageQuestionnaire onComplete={handleComplete} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Layers className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">דף נחיתה ממותג</h3>
          <p className="text-sm text-gray-700 mb-4">
            עמוד המרה שמונע כאב <ChevronRight className="w-3 h-3 inline mx-1" /> פתרון <ChevronRight className="w-3 h-3 inline mx-1" /> פעולה
          </p>
          
          <div className="space-y-2 mb-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-800">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                {feature}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowQuestionnaire(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            התחל עכשיו
          </button>
        </div>
      </div>
    </motion.div>
  );
}