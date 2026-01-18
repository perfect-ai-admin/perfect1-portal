import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const COMMON_OBJECTIONS = [
  {
    id: 'price_high',
    category: 'מחיר',
    trigger: ['יקר', 'מחיר', 'עולה הרבה', 'אין תקציב'],
    question: "זה יקר לי מדי / אין לי תקציב כרגע",
    mindset: "הלקוח לא רואה את הערך מול המחיר, או באמת בבעיה תזרימית.",
    response_strategy: "Feel, Felt, Found + הוכחת החזר השקעה (ROI).",
    scripts: [
      {
        type: 'soft',
        text: "אני מבין לגמרי, הוצאה כזו דורשת מחשבה. אם נניח את המחיר בצד רגע - האם הפתרון עצמו נראה לך נכון לבעיה שדיברנו עליה?"
      },
      {
        type: 'direct',
        text: "יקר ביחס למה? בוא נסתכל על מה זה עולה לך *לא* לפתור את הבעיה הזו היום."
      }
    ]
  },
  {
    id: 'talk_to_partner',
    category: 'דחיינות',
    trigger: ['להתייעץ', 'אשתי', 'שותף', 'לחשוב'],
    question: "אני צריך להתייעץ עם אשתי/השותף",
    mindset: "הלקוח חושש לקחת אחריות לבד או משתמש בזה כתירוץ לדחייה.",
    response_strategy: "בודד את ההתנגדות + צייד אותו בכלים.",
    scripts: [
      {
        type: 'soft',
        text: "מצוין, חשוב מאוד ששניכם תהיו שלמים. מה לדעתך תהיה השאלה הראשונה שלהם כשתספר להם על זה?"
      },
      {
        type: 'action',
        text: "בטח. בוא נסכם את הנקודות העיקריות כדי שתוכל להציג להם את זה בצורה הכי טובה. מה לקחת מהשיחה שלנו שהכי אהבת?"
      }
    ]
  },
  {
    id: 'competitor',
    category: 'תחרות',
    trigger: ['מתחרה', 'הצעות אחרות', 'בודק'],
    question: "אני בודק עוד הצעות",
    mindset: "הלקוח עושה שופינג. הוא מחפש ביטחון שהוא לא 'יוצא פראייר'.",
    response_strategy: "אל תשמיץ. הדגש את הבידול שלך.",
    scripts: [
      {
        type: 'direct',
        text: "זה הדבר הכי חכם לעשות. מה הדברים שהכי חשוב לך להשוות בינינו לבין אחרים?"
      }
    ]
  }
];

export default function ObjectionMaster() {
  const [search, setSearch] = useState('');
  const [selectedObjection, setSelectedObjection] = useState(null);

  const filtered = COMMON_OBJECTIONS.filter(obj => 
    obj.question.includes(search) || 
    obj.trigger.some(t => t.includes(search)) ||
    obj.category.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input 
          placeholder="מה הלקוח אמר? (למשל: 'יקר', 'לחשוב'...)" 
          className="pl-4 pr-10 py-6 text-lg shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filtered.map(obj => (
          <motion.div 
            layout
            key={obj.id}
            className={`border rounded-xl p-4 bg-white transition-all cursor-pointer ${
                selectedObjection === obj.id ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:border-indigo-200 hover:shadow-sm'
            }`}
            onClick={() => setSelectedObjection(selectedObjection === obj.id ? null : obj.id)}
          >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedObjection === obj.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{obj.question}</h3>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{obj.category}</Badge>
                        </div>
                    </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${selectedObjection === obj.id ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {selectedObjection === obj.id && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-gray-100 mt-4 space-y-6">
                            
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="font-bold text-indigo-900 text-sm mb-1 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    מה עובר ללקוח בראש?
                                </h4>
                                <p className="text-indigo-800 text-sm">{obj.mindset}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 text-sm">תסריטי מענה מומלצים:</h4>
                                {obj.scripts.map((script, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                        <Badge className="mb-2 bg-gray-900 text-white hover:bg-gray-800">
                                            {script.type === 'soft' ? 'רך ומכיל' : script.type === 'direct' ? 'ישיר וענייני' : 'מניע לפעולה'}
                                        </Badge>
                                        <p className="text-gray-800 font-medium leading-relaxed">
                                            "{script.text}"
                                        </p>
                                        <Button variant="ghost" size="sm" className="mt-2 h-8 text-xs text-gray-500 hover:text-indigo-600">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            העתק תשובה
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}