import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, BookMarked, MessageCircle, Phone, VideoIcon, Plus, Wand2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SalesInteractionForm from '../sales/SalesInteractionForm';
import CreateScriptDialog from './sales/CreateScriptDialog';
import { entities } from '@/api/supabaseClient';

const DEFAULT_SCRIPTS = [
  {
    id: 'default_1',
    title: 'שיחת היכרות ופתיחה (Cold/Warm Call)',
    duration: '2-3 דקות',
    type: 'opening',
    scenario: 'לקוח חדש, או ליד שהשאיר פרטים',
    script: `שלום! אני [שמך] מ-[שם העסק].\n\nראיתי שהשארת פרטים לגבי [נושא] / אני פונה אליך כי [סיבה].\n\nלפני שאני מספר על מה שאנחנו עושים - חשוב לי להבין:\n1. מה הדבר העיקרי שגרם לך לחפש פתרון עכשיו?\n2. מה האתגר הכי גדול שלך כרגע בתחום הזה?\n\n[האזן בעיון - אל תקטע]\n\n"אני מבין לגמרי. זה הגיוני מאוד."\n\nיש לי כמה דקות עכשיו - זה זמן נוח להבין אם אנחנו יכולים לעזור?`,
    tips: [
      '🎯 המטרה: ליצור אמון ראשוני, לא למכור מיד',
      '👂 האזן 80% מהזמן - תן ללקוח לדבר',
      '❓ שאל שאלות פתוחות ("מה", "איך", "למה")',
      '🚫 הימנע מפירוט יתר על המוצר בשלב זה - זה מוקדם מדי'
    ],
    keywords: ['פתיחה', 'סינון', 'היכרות']
  },
  {
    id: 'default_2',
    title: 'בירור צרכים מעמיק',
    duration: '5-10 דקות',
    type: 'discovery',
    scenario: 'אחרי שהלקוח הביע עניין ראשוני',
    script: `"אוקיי, כדי שאוכל להתאים לך את הפתרון המדויק ביותר, ספר לי קצת יותר:\n\n1. כמה זמן אתה סובל מהבעיה הזו?\n2. מה ניסית לעשות עד היום כדי לפתור אותה?\n3. אם הייתה לך מטה קסמים, איך הפתרון האידיאלי היה נראה?\n\n[המתן לתשובות]\n\n"ומה יקרה אם לא תפתור את זה בחודש הקרוב? איזו השפעה תהיה לזה?"`,
    tips: [
      '🔍 חפש את ה"כאב" האמיתי מאחורי הבקשה',
      '💡 המטרה היא שהלקוח יבין בעצמו שהוא חייב פתרון',
      '📝 רשום את המילים המדויקות של הלקוח'
    ],
    keywords: ['צרכים', 'כאב', 'עומק']
  },
  {
    id: 'default_3',
    title: 'הצגת הפתרון (הפיץ\')',
    duration: '3-5 דקות',
    type: 'pitch',
    scenario: 'אחרי שהבנת את הצורך',
    script: `"בהתבסס על מה שסיפרת לי - שיש לך אתגר עם [הבעיה שלו] ושאתה מחפש [הפתרון שרצה]...\n\nיש לנו בדיוק את מה שאתה צריך.\n\nהתוכנית שלנו כוללת:\n1. [תועלת 1 שקשורה לכאב שלו]\n2. [תועלת 2]\n3. [תועלת 3]\n\nמה שמיוחד אצלנו זה שאנחנו לא רק נותנים [מוצר], אלא גם מוודאים ש-[תוצאה].\n\nאיך זה נשמע לך עד כה?"`,
    tips: [
      '🔗 קשר כל תכונה של המוצר לצורך ספציפי שעלה',
      '✅ וודא הבנה והסכמה אחרי כל נקודה חשובה',
      '🗣️ דבר בשפה של "תוצאות" ולא "פיצ׳רים"'
    ],
    keywords: ['הצעה', 'פתרון', 'ערך']
  },
  {
    id: 'default_4',
    title: 'טיפול בהתנגדות: "זה יקר לי"',
    duration: '2-3 דקות',
    type: 'objection',
    scenario: 'הלקוח נרתע מהמחיר',
    script: `"אני מבין לגמרי. זו השקעה לא קטנה.\n\nאבל בוא נסתכל על זה רגע מזווית אחרת:\nאמרת מקודם שהבעיה הזו עולה לך [סכום/זמן/כאב] כל חודש, נכון?\n\nאם הפתרון הזה יפתור את הבעיה אחת ולתמיד - האם זה עדיין נראה יקר לעומת המחיר של *לא* לפתור את זה?\n\nבנוסף, המחיר כולל [ערך נוסף], מה שהופך את זה למשתלם יותר בטווח הארוך."`,
    tips: [
      '🤝 אל תתווכח - תזדהה ("אני מבין")',
      '⚖️ החזר את הפוקוס לערך ולעלות של הבעיה',
      '🔄 הפוך את ההתנגדות לשאלה ("האם זה יקר, או שאתה לא בטוח שזה יעבוד?")'
    ],
    keywords: ['התנגדויות', 'מחיר', 'ערך']
  },
  {
    id: 'default_5',
    title: 'סגירת העסקה (Closing)',
    duration: '1-2 דקות',
    type: 'closing',
    scenario: 'הלקוח נראה מוכן',
    script: `"מעולה, אני רואה שזה מתאים לך בול.\n\nאז כדי שנתחיל לראות תוצאות כבר ב[זמן הקרוב], הצעד הבא הוא פשוט:\nאנחנו נסדיר את התשלום, אני אשלח לך את הסכם העבודה, ונתאם את פגישת ההתנעה שלנו ליום [יום].\n\nאיזה אמצעי תשלום עדיף לך - אשראי או העברה?"`,
    tips: [
      '🚀 הנח שהמכירה קרתה (Assumptive Close)',
      '🗺️ תן מפת דרכים ברורה לצעדים הבאים',
      '💳 שאל שאלת סגירה טכנית (אמצעי תשלום/מועד התחלה)'
    ],
    keywords: ['סגירה', 'תשלום', 'התחלה']
  }
];

const TYPE_CONFIG = {
  opening: { label: 'פתיחה וסינון', icon: Phone, color: 'bg-blue-100 text-blue-700' },
  discovery: { label: 'בירור צרכים', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
  pitch: { label: 'הצגת פתרון', icon: VideoIcon, color: 'bg-purple-100 text-purple-700' },
  objection: { label: 'טיפול בהתנגדות', icon: MessageCircle, color: 'bg-orange-100 text-orange-700' },
  closing: { label: 'סגירה', icon: BookMarked, color: 'bg-green-100 text-green-700' },
  followup: { label: 'פולואו-אפ', icon: Copy, color: 'bg-gray-100 text-gray-700' },
  general: { label: 'כללי', icon: MessageCircle, color: 'bg-slate-100 text-slate-700' }
};

export default function SalesScriptsLibrary() {
  const [selectedScript, setSelectedScript] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [interactionFormOpen, setInteractionFormOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: customScripts, isLoading } = useQuery({
    queryKey: ['salesScripts'],
    queryFn: () => entities.SalesScript.list('-created_date'),
    initialData: []
  });

  const allScripts = [...(customScripts || []).map(s => ({...s, id: s.id})), ...DEFAULT_SCRIPTS];

  const filteredScripts = filterType === 'all' 
    ? allScripts 
    : allScripts.filter(s => s.type === filterType);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הסקריפט הועתק!');
  };

  const handleScriptCreated = (newScript) => {
    queryClient.invalidateQueries({ queryKey: ['salesScripts'] });
    setSelectedScript(newScript);
  };

  if (selectedScript) {
    const TypeIcon = TYPE_CONFIG[selectedScript.type]?.icon || MessageCircle;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedScript(null)}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← חזור לרשימה
          </button>
          <Button 
            onClick={() => setInteractionFormOpen(true)} 
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            תעד שיחה ביומן
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100">
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{selectedScript.title}</h2>
                <p className="text-gray-600 mt-2 text-lg">סיטואציה: {selectedScript.scenario}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={TYPE_CONFIG[selectedScript.type]?.color || 'bg-gray-100 text-gray-800'}>
                  {TYPE_CONFIG[selectedScript.type]?.label || selectedScript.type}
                </Badge>
                {selectedScript.duration && <Badge variant="secondary">{selectedScript.duration}</Badge>}
                {selectedScript.is_custom && <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">נוצר ב-AI ✨</Badge>}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-inner">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                התסריט:
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(selectedScript.content || selectedScript.script)}
                className="gap-2 text-gray-500 hover:text-indigo-600"
              >
                <Copy className="w-4 h-4" />
                העתק
              </Button>
            </div>
            <div className="text-base text-gray-800 whitespace-pre-wrap font-sans leading-loose">
              {selectedScript.content || selectedScript.script}
            </div>
          </div>

          {(selectedScript.tips && selectedScript.tips.length > 0) && (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
              <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                דגשים וטיפים:
              </h3>
              <ul className="space-y-3">
                {selectedScript.tips.map((tip, idx) => (
                  <li key={idx} className="text-yellow-900 flex items-start gap-3 bg-white/50 p-2 rounded-lg">
                    <span className="mt-1 text-yellow-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SalesInteractionForm 
          open={interactionFormOpen} 
          onOpenChange={setInteractionFormOpen}
          onSuccess={() => {
            toast.success('שיחה נתועדה!');
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateScriptDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onScriptCreated={handleScriptCreated}
      />
      
      <SalesInteractionForm 
        open={interactionFormOpen} 
        onOpenChange={setInteractionFormOpen}
        onSuccess={() => {
          toast.success('שיחה נתועדה!');
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <Button 
            variant={filterType === 'all' ? 'default' : 'ghost'} 
            onClick={() => setFilterType('all')}
            size="sm"
            className="rounded-full"
          >
            הכל
          </Button>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <Button
              key={key}
              variant={filterType === key ? 'secondary' : 'ghost'}
              onClick={() => setFilterType(key)}
              size="sm"
              className={`rounded-full whitespace-nowrap ${filterType === key ? config.color : ''}`}
            >
              {config.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200 w-full md:w-auto transform hover:scale-105 transition-all duration-200 text-white font-bold"
          >
            <Wand2 className="w-4 h-4 animate-pulse" />
            צור תסריט חדש ב-AI
          </Button>
          <Button 
            variant="outline"
            onClick={() => setInteractionFormOpen(true)} 
            className="gap-2 w-full md:w-auto border-gray-300 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 text-green-600" />
            תיעוד שיחה ידני
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScripts.map((script, idx) => {
          const TypeIcon = TYPE_CONFIG[script.type]?.icon || MessageCircle;
          const typeColor = TYPE_CONFIG[script.type]?.color || 'bg-gray-100 text-gray-700';
          
          return (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedScript(script)}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
            >
              {script.is_custom && (
                <div className="absolute top-0 left-0 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg font-bold">
                  AI
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${typeColor} bg-opacity-20`}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                {script.duration && (
                  <Badge variant="outline" className="text-gray-500 border-gray-200 text-xs">
                    {script.duration}
                  </Badge>
                )}
              </div>
              
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
                {script.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                {script.scenario}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-medium">
                  {TYPE_CONFIG[script.type]?.label}
                </span>
                <span className="text-xs text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  צפה בתסריט
                  <span className="block rtl:rotate-180">←</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {filteredScripts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>לא נמצאו תסריטים בקטגוריה זו</p>
          <Button variant="link" onClick={() => setFilterType('all')} className="mt-2">
            הצג הכל
          </Button>
        </div>
      )}
    </div>
  );
}