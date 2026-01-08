import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Lightbulb } from 'lucide-react';
import AnswerBlock from './AnswerBlock';
import FAQSchema from './FAQSchema';

export default function ProfessionContent({ profession, slug }) {
  // Generate AI-Readable Answer Block
  const quickAnswer = profession.quickAnswer || `${profession.name} עצמאי בישראל יכול לפתוח עוסק פטור אם הכנסתו השנתית אינה עולה על 120,000 ₪ ואינו מחויב במע"מ. התהליך כולל רישום במס הכנסה וביטוח לאומי תוך 24-72 שעות.`;

  // Generate FAQ data
  const faqs = profession.faqs || [
    {
      question: `מי צריך עוסק פטור בתחום ${profession.name}?`,
      answer: `כל ${profession.name} עצמאי בישראל שעובד עם לקוחות פרטיים או עסקיים ומרוויח עד 120,000 ₪ לשנה זקוק לעוסק פטור כדי לעבוד באופן חוקי ולהוציא חשבוניות מס.`
    },
    {
      question: `מתי עוסק פטור לא מתאים ל${profession.name}?`,
      answer: `אם צפוי לעבור את תקרת ההכנסה של 120,000 ₪ לשנה, או אם עובד בעיקר עם חברות גדולות שדורשות ניכוי מע"מ, כדאי לשקול עוסק מורשה במקום עוסק פטור.`
    },
    {
      question: `כמה זמן לוקח לפתוח עוסק פטור ל${profession.name}?`,
      answer: `תהליך פתיחת עוסק פטור לוקח 24-72 שעות מרגע הגשת המסמכים. אנחנו מטפלים בכל הבירוקרטיה - רישום במס הכנסה, ביטוח לאומי ומע"מ.`
    }
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />

      <div className="space-y-12">
        {/* Quick Answer Block - AEO Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-blue-50 border-r-4 border-blue-600 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-2">
                תשובה מהירה - פתיחת עוסק פטור {profession.name}
              </h2>
              <p className="text-gray-800 leading-relaxed">
                {quickAnswer}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        {profession.fullContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: profession.fullContent }}
            />
          </motion.div>
        )}

        {/* Who Needs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
            מי צריך עוסק פטור בתחום {profession.name}?
          </h2>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <ul className="space-y-3">
              {(profession.whoNeeds || [
                `${profession.name} עצמאי שעובד עם לקוחות פרטיים`,
                `${profession.name} שמרוויח עד 120,000 ₪ בשנה`,
                `${profession.name} שמתחיל את הדרך המקצועית`,
                `${profession.name} שרוצה לעבוד באופן חוקי ולהוציא חשבוניות`
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* When Not Suitable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">
            מתי עוסק פטור לא מתאים ל{profession.name}?
          </h2>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <ul className="space-y-3">
              {(profession.notSuitable || [
                'כשההכנסה השנתית צפויה לעלות על 120,000 ₪',
                'כשעובדים בעיקר עם חברות גדולות שדורשות ניכוי מע"מ',
                'כשיש צורך בייבוא/ייצוא סחורות',
                'כשיש שותפים עסקיים נוספים'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">
            שאלות נפוצות - עוסק פטור {profession.name}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <AnswerBlock key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">סיכום - עוסק פטור {profession.name}</h2>
          <p className="leading-relaxed text-white/95 mb-4">
            {profession.summary || `פתיחת עוסק פטור ${profession.name} בישראל היא תהליך פשוט ומהיר שלוקח 24-72 שעות. התהליך כולל רישום במס הכנסה, פטור ממע"מ, ורישום בביטוח לאומי. עם Perfect One, אתה מקבל ליווי מקצועי מלא - מהרגע הראשון ועד הדוח השנתי.`}
          </p>
          <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
            <Lightbulb className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/90">
              <strong>טיפ מקצועי:</strong> פתח עוסק פטור כבר עכשיו, גם אם טרם התחלת לעבוד. כך תוכל לרשום את כל ההוצאות מהיום הראשון ולמקסם זיכויי מס.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}