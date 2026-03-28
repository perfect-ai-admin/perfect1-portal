import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, TrendingUp, Shield, Rocket } from 'lucide-react';

// Context-specific learning content (section 4.1.3)
const EDUCATIONAL_CONTENT = {
  registration: {
    title: 'למה חשוב להתחיל נכון?',
    icon: Rocket,
    color: 'blue',
    mainPoint: 'הרגישה הראשונה קובעת את הכיוון של כל העסק',
    sections: [
      {
        title: '🎯 בסיס יציב = צמיחה בריאה',
        content: 'עסקים שמתחילים עם תשתית נכונה (בנק, מערכות, תהליכים) חווים 3x פחות בעיות בשנה הראשונה.',
        type: 'insight'
      },
      {
        title: '💰 למה זה משתלם?',
        content: 'השקעה של שעתיים בהקמה נכונה חוסכת שבועות של תיקונים בהמשך. דוגמה: בחירת בנק נכון חוסכת ₪3,000+ בשנה בעמלות.',
        type: 'value'
      },
      {
        title: '⚡ הטעות השכיחה',
        content: 'רוב העצמאים קופצים ישר למכירות ושוכחים לבנות תשתית. התוצאה? בלגן בחשבוניות, בעיות במס, ולחץ מיותר.',
        type: 'warning'
      },
      {
        title: '✅ מה עושים נכון',
        content: 'עבור שלב אחרי שלב: עוסק פטור → בנק עסקי → מערכות ניהול → ואז תתחיל למכור בראש שקט.',
        type: 'action'
      }
    ]
  },
  first_invoice: {
    title: 'למה החשבונית הראשונה כל כך משמעותית?',
    icon: TrendingUp,
    color: 'green',
    mainPoint: 'זה הרגע שהופך אותך מחולם לעסק אמיתי',
    sections: [
      {
        title: '🚀 רגע מכונן',
        content: 'החשבונית הראשונה היא הנקודה שבה אתה רשמית "עצמאי". לא רק בניירות - במציאות.',
        type: 'insight'
      },
      {
        title: '💡 מה זה אומר על העסק',
        content: 'לקוח ששילם = אימות שהשירות שלך שווה כסף. זה אבן הבוחן האמיתית לרעיון העסקי.',
        type: 'value'
      },
      {
        title: '📊 למה לעקוב אחרי זה',
        content: 'כל חשבונית מספרת סיפור: מי הלקוח, כמה הרווחת, האם המחיר נכון. זה המידע שיעזור לך לצמוח.',
        type: 'insight'
      },
      {
        title: '✅ מה חשוב לזכור',
        content: 'חשבונית ראשונה לא חייבת להיות מושלמת. חשוב שהיא תקינה חוקית ושתלמד ממנה לפעם הבאה.',
        type: 'action'
      }
    ]
  },
  first_client: {
    title: 'למה לקוח חוזר זה המפתח?',
    icon: Shield,
    color: 'purple',
    mainPoint: 'עסק יציב נבנה על לקוחות חוזרים, לא על חד-פעמיים',
    sections: [
      {
        title: '💰 הכלכלה של לקוח חוזר',
        content: 'השגת לקוח חדש עולה פי 5 מלקוח חוזר. לקוח שחזר 3 פעמים? יש סיכוי של 70% שיישאר איתך לטווח ארוך.',
        type: 'value'
      },
      {
        title: '🎯 איך זה קורה?',
        content: 'לקוח חוזר מרוצה = המלצות חינם. כל המלצה = לקוח חדש בעלות אפס. זה מנוע הצמיחה האמיתי.',
        type: 'insight'
      },
      {
        title: '⚡ מה צריך לעשות',
        content: 'מעקב אחרי הלקוח הראשון, תקשורת טובה, ושירות מעל ומעבר. זה ההשקעה החשובה ביותר.',
        type: 'action'
      }
    ]
  },
  monthly_report: {
    title: 'למה דוח חודשי הוא לא סתם ניירת?',
    icon: TrendingUp,
    color: 'yellow',
    mainPoint: 'דוח חודשי = לוח המחוונים של העסק שלך',
    sections: [
      {
        title: '📊 הבדיקת מציאות',
        content: 'בלי דוח חודשי, אתה מנחש. עם דוח - אתה יודע בדיוק: מה נכנס, מה יוצא, והאם אתה רווחי באמת.',
        type: 'insight'
      },
      {
        title: '💡 למה זה משנה',
        content: 'החלטות עסקיות טובות נשענות על נתונים. דוח חודשי עוזר לזהות בעיות מוקדם ולנצל הזדמנויות.',
        type: 'value'
      },
      {
        title: '✅ דוגמה מהחיים',
        content: 'ראית ירידה ב-15% בהכנסות? אפשר להגיב מיד במקום לגלות את זה רק אחרי 6 חודשים.',
        type: 'action'
      }
    ]
  },
  annual_report: {
    title: 'למה דוח שנתי הוא לא סתם חובה?',
    icon: Shield,
    color: 'red',
    mainPoint: 'דוח שנתי = ה"תעודת בגרות" של העסק שלך',
    sections: [
      {
        title: '🎓 סיכום השנה',
        content: 'דוח שנתי מראה את התמונה המלאה: האם צמחת? האם השגת את המטרות? מה עבד ומה לא?',
        type: 'insight'
      },
      {
        title: '💰 למה זה חשוב למס',
        content: 'דוח שנתי נכון = פחות בעיות עם רשויות, פחות קנסות, ושקט נפשי. זה גם משפיע על זכאות למשכנתא ואשראי.',
        type: 'value'
      },
      {
        title: '✅ מה צריך לעשות',
        content: 'הכן את הדוח מראש, שמור תיעוד של כל השנה, ותתייעץ עם רואה חשבון אם צריך.',
        type: 'action'
      }
    ]
  }
};

export default function WhyThisMattersPanel({ currentMilestone }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const content = EDUCATIONAL_CONTENT[currentMilestone] || EDUCATIONAL_CONTENT.registration;
  const Icon = content.icon;

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  const iconBgColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-right p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColors[content.color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{content.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{content.mainPoint}</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {content.sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${
                    section.type === 'warning' ? 'bg-red-50 border-r-4 border-red-500' :
                    section.type === 'value' ? 'bg-green-50 border-r-4 border-green-500' :
                    section.type === 'action' ? 'bg-blue-50 border-r-4 border-blue-500' :
                    'bg-gray-50 border-r-4 border-gray-300'
                  }`}
                >
                  <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{section.content}</p>
                </motion.div>
              ))}

              {/* Action CTA */}
              <div className={`bg-gradient-to-r ${colorClasses[content.color]} p-4 rounded-xl text-white mt-6`}>
                <p className="text-sm font-semibold">
                  💡 זכור: כל שלב במסע העסקי בנוי על הקודם. תיקח את הזמן לעשות את זה נכון.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}