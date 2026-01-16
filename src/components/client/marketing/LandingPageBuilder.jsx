import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function LandingPageBuilder() {
  const features = [
    'כותרות שיווקיות',
    'התאמה למומחה',
    'טופס לליידים'
  ];

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

          <a href={createPageUrl('OsekPaturLanding')}>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              התחל עכשיו
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}