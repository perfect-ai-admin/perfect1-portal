import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'מי יכול להיות עוסק פטור?',
    answer: 'כל אדם שעוסק בעסק עצמאי ומחזור העסקאות השנתי שלו אינו עולה על 120,000 ש"ח (נכון לשנת 2024). יש לציין שלא כל מקצוע מאפשר להיות עוסק פטור - לדוגמה, רופאים, עורכי דין ורואי חשבון חייבים להיות עוסקים מורשים.'
  },
  {
    question: 'מה ההבדל בין עוסק פטור לעוסק מורשה?',
    answer: 'עוסק פטור פטור מגביית מע"מ ומהגשת דוחות תקופתיים למע"מ. עוסק מורשה מחויב לגבות מע"מ מלקוחותיו, להגיש דוחות דו-חודשיים, אך יכול לקזז מע"מ על הוצאות. בנוסף, לעוסק פטור יש תקרת הכנסה שנתית, בעוד לעוסק מורשה אין מגבלה.'
  },
  {
    question: 'כמה זמן לוקחת פתיחת עוסק פטור?',
    answer: 'התהליך אצלנו לוקח בדרך כלל בין 24 ל-72 שעות עסקים. אנחנו מטפלים בכל הבירוקרטיה מולך - פתיחת תיק במס הכנסה, רישום במע"מ ופתיחת תיק בביטוח לאומי.'
  },
  {
    question: 'מה קורה אם אני עובר את תקרת ההכנסה?',
    answer: 'אם מחזור העסקאות שלך עובר את 120,000 ש"ח בשנה, עליך לעבור לסטטוס של עוסק מורשה. אנחנו נעזור לך בתהליך המעבר ונדאג שהכל יתבצע בצורה חלקה.'
  },
  {
    question: 'האם אני צריך לשלם ביטוח לאומי?',
    answer: 'כן, עוסק פטור חייב בתשלום דמי ביטוח לאומי. עד רווח שנתי של 50,000 ש"ח התשלום הוא כ-7%, ומעל סכום זה כ-17%. אנחנו נעזור לך להבין את החישובים ולהגיש את הדיווחים.'
  },
  {
    question: 'איך מפיקים חשבונית כעוסק פטור?',
    answer: 'עוסק פטור מפיק קבלות ולא חשבוניות מס (כי הוא לא גובה מע"מ). אנחנו מספקים לך אפליקציה נוחה להפקת קבלות דיגיטליות בקלות ובמהירות.'
  },
  {
    question: 'מה כולל הליווי החודשי שלכם?',
    answer: 'הליווי החודשי כולל: אפליקציה להפקת קבלות ומעקב הכנסות/הוצאות, גישה לרו"ח או יועץ מס לכל שאלה, דיווחים שוטפים לרשויות, וייעוץ מס שוטף. אנחנו כאן בשבילך לאורך כל הדרך.'
  },
  {
    question: 'האם אפשר לסגור את התיק אם אני מפסיק לעבוד?',
    answer: 'בהחלט! אם תחליט להפסיק את העסק, אנחנו נטפל בסגירת התיק מולך ברשויות ללא עלות נוספת (במסגרת הליווי החודשי).'
  }
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-[#F8F9FA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E3A5F]/10 mb-6">
            <HelpCircle className="w-8 h-8 text-[#1E3A5F]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-gray-600 text-lg">
            כל מה שרציתם לדעת על פתיחת עוסק פטור
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-2xl shadow-sm border-none overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 text-right hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-[#1E3A5F] [&[data-state=open]]:text-white">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}