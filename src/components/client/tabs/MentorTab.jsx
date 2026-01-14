import React from 'react';
import { motion } from 'framer-motion';
import MentorChat from '../mentor/MentorChat';
import { Lightbulb, Database, Lock, Sparkles } from 'lucide-react';

export default function MentorTab({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3">המנטור החכם שלך 🤖</h1>
            <p className="text-xl opacity-90 mb-4">
              קבל עצות עסקיות מותאמות אישית, מבוססות על הנתונים שלך
            </p>
            <div className="flex items-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>גישה לכל הנתונים שלך</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>פרטיות מלאה</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>עצות מותאמות אישית</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Database className="w-5 h-5" />
          המידע שהמנטור רואה עליך
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-blue-700 font-semibold mb-1">נתונים כספיים</p>
            <p className="text-gray-700">הכנסות, הוצאות, חשבוניות</p>
          </div>
          <div>
            <p className="text-blue-700 font-semibold mb-1">מטרות אישיות</p>
            <p className="text-gray-700">היעדים וההתקדמות שלך</p>
          </div>
          <div>
            <p className="text-blue-700 font-semibold mb-1">היסטוריה עסקית</p>
            <p className="text-gray-700">שלבים שעברת, החלטות שקיבלת</p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="h-[600px]">
        <MentorChat clientData={data} />
      </div>
    </motion.div>
  );
}