import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingDown, MessageSquare, Calendar } from 'lucide-react';

const prompts = [
  {
    icon: MessageCircle,
    text: 'מה הצעד הבא שלי?',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: TrendingDown,
    text: 'תנתח לי למה לא נסגר',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: MessageSquare,
    text: 'תן לי הודעת פולואפ',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Calendar,
    text: 'תעשה לי סדר ליום',
    color: 'from-purple-500 to-purple-600'
  }
];

export default function QuickPrompts({ onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600 mb-3">בחר נושא:</p>
      <div className="grid grid-cols-1 gap-2">
        {prompts.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => onSelect(prompt.text)}
              className={`w-full text-right px-3 py-2.5 bg-gradient-to-r ${prompt.color} rounded-lg text-white text-sm font-medium hover:shadow-md transition-all flex items-center gap-2`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{prompt.text}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}