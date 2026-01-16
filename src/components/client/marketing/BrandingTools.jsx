import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Layers, 
  Presentation, 
  Shield, 
  Image, 
  Share2, 
  Mail, 
  FileText,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import LogoCreator from './LogoCreator';

const tools = [
  {
    id: 'logo',
    title: 'יצירת לוגו חכם',
    description: 'לוגו מותאם לתחום העיסוק עם צבעים וטיפוגרפיה',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    features: ['לוגו צבעוני', 'גרסה שחור-לבן', 'גרסה לאייקון']
  },
  {
    id: 'landing',
    title: 'דף נחיתה ממותג',
    description: 'עמוד המרה עם מבנה כאב → פתרון → פעולה',
    icon: Layers,
    color: 'from-blue-500 to-cyan-500',
    features: ['כותרת שיווקית', 'התאמה למובייל', 'חיבור ללידים']
  },
  {
    id: 'presentation',
    title: 'מצגת עסקית',
    description: 'מצגת להצגה ללקוחות או משקיעים',
    icon: Presentation,
    color: 'from-orange-500 to-red-500',
    features: ['סטוריה עסקית', 'שפה גרפית אחידה', 'עיצוב מקצועי']
  },
  {
    id: 'brand-kit',
    title: 'זהות מותג מלאה',
    description: 'Brand Kit עם סלוגן, צבעים, פונטים ושפה גרפית',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    features: ['סלוגן מותג', 'פלטת צבעים', 'קובץ Brand Kit']
  },
  {
    id: 'social',
    title: 'עיצובים לרשתות',
    description: 'פוסטים, סטוריז וקאברים להיילייטס',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    features: ['פוסטים אינסטגרם', 'סטוריז', 'קאברים קבועים']
  },
  {
    id: 'business-card',
    title: 'כרטיס ביקור דיגיטלי',
    description: 'עמוד אישי קצר עם כפתורי יצירת קשר',
    icon: Share2,
    color: 'from-indigo-500 to-purple-500',
    features: ['תמונה מקצועית', 'שירותים', 'קישורים']
  },
  {
    id: 'email-signature',
    title: 'חתימה מקצועית',
    description: 'חתימה ממותג למייל וואטסאפ',
    icon: Mail,
    color: 'from-teal-500 to-blue-500',
    features: ['לוגו משובץ', 'לינקים חברתיים', 'דיוק טיפוגרפי']
  },
  {
    id: 'proposal',
    title: 'הצעת מחיר ממותג',
    description: 'תבנית הצעת מחיר עם צבעים ולוגו',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    features: ['מבנה מכר', 'עיצוב מקצועי', 'ייצוא ל-PDF']
  }
];

export default function BrandingTools({ businessName = 'העסק שלי' }) {
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeFlowId, setActiveFlowId] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">כלים למיתוג ופיתוח מותג</h2>
        <p className="text-gray-600">בחר בכלי שישמור על זהות מותגך בכל מקום</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const isSelected = selectedTool?.id === tool.id;

          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTool(isSelected ? null : tool)}
              className="text-right"
            >
              <div className={`
                relative h-full rounded-lg border-2 p-4 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
              `}>
                {/* Icon Background */}
                <div className={`
                  w-12 h-12 rounded-lg mb-3 flex items-center justify-center
                  bg-gradient-to-br ${tool.color} text-white
                `}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-900 mb-1">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {tool.description}
                </p>

                {/* Features (shown when selected) */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 mb-3 pt-3 border-t border-gray-200"
                  >
                    {tool.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold text-xs">✓</span>
                        <span className="text-xs text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* CTA Button */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button 
                      className={`
                        w-full text-xs py-1.5 h-auto
                        bg-gradient-to-r ${tool.color} 
                        text-white hover:shadow-lg
                      `}
                    >
                      התחל עכשיו
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>טיפ:</strong> התחל עם לוגו חכם וזהות מותג, אחר כך בנה עליהם את שאר הכלים. זה יחסך לך זמן וישמור על עקביות בכל מקום.
        </p>
      </div>
    </div>
  );
}