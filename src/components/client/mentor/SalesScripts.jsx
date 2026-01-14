import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Play, BookMarked, MessageCircle, Phone, VideoIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import SalesInteractionForm from '../sales/SalesInteractionForm';

const SALES_SCRIPTS = [
  {
    id: '1',
    title: 'טלפון ראשון עם לקוח פוטנציאלי',
    duration: '2-3 דקות',
    type: 'phone',
    scenario: 'לקוח חדש קרא לך',
    script: `שלום! אני [שמך] מ-[שם העסק].\n\nתודה שקראת! אני שמח שאתה מעוניין.\n\nלפני שאני מספר על הטרנג - אפשר שתגיד לי:\n1. מה הביא אותך אלי בדיוק?\n2. מה הגדול ביותר שאתה מחפש עזרה בו?\n\n[האזן בעיון]\n\nבדיוק! אני מכיר את הבעיה הזו. להרבה אנשים זה קצה קשה.\n\nאנחנו עוזרים לעסקים בדיוק בממצב שלך על ידי [benefit כללי].\n\nיש לי כמה דקות עכשיו - אפשר לך?\n\n[כן] → "בואו נראה אם זה הפתרון הנכון לך"\n[לא] → "בוא נתאם זמן שנוח לך עוד השבוע"`,
    tips: [
      '🎯 שמור על הקו רך ותופעל - לא מכונה',
      '👂 האזן יותר מדברת (70% האזנה, 30% דבור)',
      '❓ שאל שאלות פתוחות - לא סגורות',
      '⏱️ שמור על זמן - לא תפעל יותר מ-3 דקות בשיחה ראשונה'
    ],
    keywords: ['יצירת קשר', 'טלפוני', 'חימום']
  },
  {
    id: '2',
    title: 'אחרי השתמעות הצרכים - הצעה קלה',
    duration: '1-2 דקות',
    type: 'phone',
    scenario: 'שמעת את הצרכים של הלקוח',
    script: `בהתבסס על מה שחיכינו - נראה לי שיש לנו פתרון טוב בשבילך.\n\nעכשיו, יש לנו שתי דרכים לעבוד:\n\nאפשרות 1: התייעצות חד-פעמית [מחיר]\n- בדיוק מה שאתה צריך עכשיו\n- זה לוקח [זמן]\n\nאפשרות 2: תוכנית שלנו המלאה [מחיר גבוה יותר]\n- עזרה ממשיכה\n- שינוי ממשי בתוך [אורך זמן]\n\nמה שקולים בעינייך?\n\n[אם הוא בוחר] → "מעולה! בואו נתחיל"\n[אם הוא מהסס] → "אני יודע זה החלטה - בואו נדבר עוד על זה"`,
    tips: [
      '💰 אל תאמור מחיר לפני שתשמע צרכים',
      '✅ כל אפשרות צריכה להיות "עדיפה"',
      '🚫 אל תתחרות בעצמך - תשאל מה חשוב להם',
      '📊 תן choices - לא תנו ultimatum'
    ],
    keywords: ['הצעה', 'סגירה רכה', 'מחיר']
  },
  {
    id: '3',
    title: 'טיפול בהתנגדויות',
    duration: '2-3 דקות',
    type: 'objection',
    scenario: 'הלקוח אומר "זה יקר מדי"',
    script: `[אם אמר "יקר"]
"אני מבין! זה השקעה. בואו נחזור רגע...\nאתה אמרת שהבעיה הגדולה שלך היא [בעיה].\nכמה זה עולה לך כל חודש - לא לפתור את זה?"\n\n[בחשבו משהו]\n\n"בדיוק! אז בעצם, ההשקעה שלנו היא בעצם חיסכון בשבילך.\nבנוסף, אנחנו עובדים עם [מס'] לקוחות שחסכו [סכום] בחצי שנה"`,
    tips: [
      '🎯 תמיד חזור לערך - לא על המחיר',
      '🏆 תן דוגמאות מלקוחות אחרים',
      '⏰ תנחה - "בואו נתחיל עם [חלק קטן יותר]"',
      '🔄 התנגדות = עניין - לא סיבה לשלוח להודעה'
    ],
    keywords: ['התנגדויות', 'מחיר', 'שיקום']
  },
  {
    id: '4',
    title: 'סגירה וקביעת המפגש הבא',
    duration: '1 דקה',
    type: 'closing',
    scenario: 'הלקוח מעוניין',
    script: `"מעולה! אני שמח שנהיה עובדים ביחד.\n\nאז הנה מה שנעשה:\n1. בשבוע הקרוב אנחנו נחתום על [מסמך]\n2. אנחנו נדבר ב- [יום/שעה] עבור [מה שנעשה בפגישה הראשונה]\n3. והתוצאה הראשונה שאתה תראה ב- [שבועות]\n\nיום טוב? [כן] → "מעולה, עד [יום]"`,
    tips: [
      '✅ תמיד סגור עם שלוש צעדים ברורים',
      '📅 קבע בדיוק: יום, שעה, מה',
      '📧 שלח בדוא"ל: אישור של מה שנאמר',
      '🔔 תזכיר שעה לפני הפגישה'
    ],
    keywords: ['סגירה', 'עסקה', 'אישור']
  }
];

export default function SalesScripts() {
  const [selectedScript, setSelectedScript] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הסקריפט הועתק!');
  };

  if (selectedScript) {
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
            onClick={() => setFormOpen(true)} 
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            תעד שיחה שעשיתי
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedScript.title}</h2>
                <p className="text-gray-600 mt-2">סיטואציה: {selectedScript.scenario}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{selectedScript.type === 'phone' ? '☎️ טלפוני' : selectedScript.type === 'objection' ? '⚠️ התנגדויות' : '✅ סגירה'}</Badge>
                <Badge variant="secondary">{selectedScript.duration}</Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-gray-900">הסקריפט:</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(selectedScript.script)}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                העתק
              </Button>
            </div>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
              {selectedScript.script}
            </pre>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-4">💡 טיפים חשובים:</h3>
            <ul className="space-y-2">
              {selectedScript.tips.map((tip, idx) => (
                <li key={idx} className="text-blue-800 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              תרגול עם AI
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <VideoIcon className="w-5 h-5" />
              ראה וידאו דוגמה
            </Button>
          </div>
        </div>

        <SalesInteractionForm 
          open={formOpen} 
          onOpenChange={setFormOpen}
          onSuccess={() => {
            toast.success('שיחה נתועדה! הנתונים שלך מעודכנים כעת');
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <SalesInteractionForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        onSuccess={() => {
          toast.success('שיחה נתועדה! 📊 הנתונים שלך עודכנו');
        }}
      />

      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setFormOpen(true)} 
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          📝 תעד שיחה חדשה
        </Button>
      </div>

      {SALES_SCRIPTS.map((script, idx) => (
        <motion.div
          key={script.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => setSelectedScript(script)}
          className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-500 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {script.type === 'phone' && <Phone className="w-5 h-5 text-blue-600" />}
                {script.type === 'objection' && <MessageCircle className="w-5 h-5 text-orange-600" />}
                {script.type === 'closing' && <BookMarked className="w-5 h-5 text-green-600" />}
                <h3 className="font-bold text-gray-900">{script.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{script.scenario}</p>
              <div className="flex gap-2">
                {script.keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right ml-4">
              <Badge>{script.duration}</Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}