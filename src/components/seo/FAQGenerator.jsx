import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FAQGenerator - מחולל FAQ עם Schema אוטומטי
 * מייצר גם את התצוגה וגם את ה-JSON-LD Schema
 * 
 * Props:
 * - faqs: מערך של {question, answer}
 * - title: כותרת לסקציה (אופציונלי)
 */
export default function FAQGenerator({ faqs, title = "שאלות נפוצות" }) {
  // יצירת Schema.org FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* הטמעת Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* תצוגת FAQ */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600">
              מצא תשובות לשאלות הנפוצות ביותר
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-[#1E3A5F]/10 overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-right hover:no-underline">
                  <span className="text-lg font-bold text-[#1E3A5F]">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

/**
 * דוגמת שימוש:
 * 
 * const faqs = [
 *   {
 *     question: "כמה זמן לוקח לפתוח עוסק פטור?",
 *     answer: "התהליך לוקח 24-48 שעות עסקים בממוצע."
 *   },
 *   {
 *     question: "כמה עולה לפתוח עוסק פטור?",
 *     answer: "המחיר הוא 249₪ חד פעמי, כולל כל הטיפול מול הרשויות."
 *   }
 * ];
 * 
 * <FAQGenerator faqs={faqs} />
 */