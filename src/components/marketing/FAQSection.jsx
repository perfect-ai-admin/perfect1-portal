import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft } from 'lucide-react';

import { getSignupUrl } from '@/components/utils/tracking';

const faqs = [
  {
    question: 'למי המערכת מתאימה?',
    answer: 'ClientDashboard מתאימה לעסקים קטנים, עצמאים, יזמים וסטארטאפים שרוצים לנהל את העסק שלהם בצורה מסודרת ויעילה – בלי להתפזר בין כלים שונים.',
  },
  {
    question: 'כמה זמן לוקח להתחיל?',
    answer: 'ההרשמה לוקחת דקה אחת. תוך כמה דקות נוספות תוכל להגדיר את המטרה הראשונה שלך ולהתחיל לעבוד עם הכלים.',
  },
  {
    question: 'האם צריך ידע טכני?',
    answer: 'לא בכלל! המערכת נבנתה כך שכל אחד יכול להשתמש בה בקלות. הממשק בעברית, אינטואיטיבי, ויש הדרכה בכל שלב.',
  },
  {
    question: 'מה ההבדל בין החבילות?',
    answer: 'החבילה החינמית מאפשרת התנסות בסיסית. ככל שהעסק גדל, אפשר לשדרג לחבילות שמציעות יותר יעדים, כלי שיווק מתקדמים, מודול פיננסי מלא ותמיכה משודרגת.',
  },
  {
    question: 'האם אפשר לשדרג או לבטל?',
    answer: 'בהחלט. אפשר לשדרג או לשנמך חבילה בכל עת. אין התחייבות ואפשר לבטל בכל רגע.',
  },
  {
    question: 'איך נרשמים?',
    answer: 'פשוט לוחצים על "התחל עכשיו", מזינים מייל וסיסמה – וזהו! תוכל להתחיל להשתמש במערכת מיד.',
  },
];

export default function FAQSection({ showCTA = true }) {
  const SIGNUP_URL = getSignupUrl();
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-gray-600">
            כל מה שרציתם לדעת על ClientDashboard
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white border border-gray-100 rounded-xl px-6 data-[state=open]:shadow-md transition-all"
            >
              <AccordionTrigger className="text-right hover:no-underline py-5">
                <span className="font-semibold text-gray-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {showCTA && (
          <div className="text-center mt-12">
            <a href={SIGNUP_URL}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-violet-600/30">
                התחל עכשיו
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
            <p className="text-sm text-gray-400 mt-4">
              לוקח דקה להתחיל • ללא צורך בכרטיס אשראי
            </p>
          </div>
        )}
      </div>
    </section>
  );
}