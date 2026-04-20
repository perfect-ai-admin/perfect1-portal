import React from 'react';
import PortalHeader from '@/portal/components/PortalHeader';
import PortalFooter from '@/portal/components/PortalFooter';
import FinalCTA from '@/components/marketing/FinalCTA';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: 'כללי',
    questions: [
      {
        question: 'מה זה ClientDashboard?',
        answer: 'ClientDashboard היא פלטפורמת SaaS בעברית לניהול עסק מקיף. היא משלבת שלושה מודולים: מנטורינג (ניהול מטרות), שיווק (מיתוג וקמפיינים) וניהול פיננסי – הכל בממשק אחד נוח ופשוט.',
      },
      {
        question: 'למי המערכת מתאימה?',
        answer: 'המערכת מתאימה לעסקים קטנים, עצמאים, יזמים וסטארטאפים שרוצים לנהל את העסק בצורה מסודרת ויעילה. לא צריך רקע טכני או ניסיון קודם בתוכנות ניהול.',
      },
      {
        question: 'כמה זמן לוקח להתחיל?',
        answer: 'ההרשמה לוקחת דקה אחת בלבד. תוך כמה דקות נוספות תוכל להגדיר את המטרה הראשונה שלך ולהתחיל לעבוד עם הכלים.',
      },
      {
        question: 'האם צריך ידע טכני?',
        answer: 'לא בכלל! המערכת נבנתה כך שכל אחד יכול להשתמש בה בקלות. הממשק בעברית, אינטואיטיבי, ויש הדרכה בכל שלב.',
      },
    ],
  },
  {
    title: 'מודולים ותכונות',
    questions: [
      {
        question: 'מה כולל מודול המנטורינג?',
        answer: 'מודול המנטורינג מאפשר לך להגדיר מטרות עסקיות, לקבל תוכנית פעולה מותאמת אישית, לעקוב אחרי התקדמות באמצעות משימות שבועיות, ולקבל תובנות והמלצות לשיפור.',
      },
      {
        question: 'אילו כלי מיתוג יש במערכת?',
        answer: 'במודול השיווק יש כלים ליצירת לוגו, דפי נחיתה, מצגות עסקיות, סטיקרים, עיצובים לרשתות חברתיות, כרטיסי ביקור דיגיטליים, חתימות מייל והצעות מחיר ממותגות.',
      },
      {
        question: 'מה כולל מודול השיווק?',
        answer: 'מעבר לכלי המיתוג, מודול השיווק כולל תבניות קמפיינים מוכנות (לרשתות חברתיות, גוגל ומייל), כלי SEO, ודוחות ביצועים.',
      },
      {
        question: 'מה כולל המודול הפיננסי?',
        answer: 'המודול הפיננסי מאפשר הפקת חשבוניות וקבלות, דוחות תזרים מזומנים ורווח והפסד, מעקב אחרי הוצאות והכנסות, והתראות על תשלומים.',
      },
    ],
  },
  {
    title: 'תמחור וחיוב',
    questions: [
      {
        question: 'מה ההבדל בין החבילות?',
        answer: 'החבילה החינמית מאפשרת התנסות בסיסית עם יעד אחד וכלים מוגבלים. ככל שהעסק גדל, החבילות המתקדמות מציעות יותר יעדים, כלי שיווק מתקדמים, מודול פיננסי מלא ותמיכה משודרגת.',
      },
      {
        question: 'האם אפשר לשדרג או לבטל?',
        answer: 'בהחלט. אפשר לשדרג או לשנמך חבילה בכל עת דרך הגדרות החשבון. אין התחייבות ואפשר לבטל בכל רגע.',
      },
      {
        question: 'מה אמצעי התשלום?',
        answer: 'אנחנו מקבלים כרטיסי אשראי וחיוב ישיר מחשבון בנק. התשלום מאובטח ומוצפן.',
      },
      {
        question: 'האם יש תקופת ניסיון?',
        answer: 'החבילה החינמית מאפשרת לך להתנסות במערכת ללא הגבלת זמן. זו הדרך הטובה ביותר להכיר את המערכת לפני שמשדרגים.',
      },
    ],
  },
  {
    title: 'תמיכה ועזרה',
    questions: [
      {
        question: 'איך מקבלים תמיכה?',
        answer: 'התמיכה תלויה בחבילה: בחבילה החינמית ו-Starter יש תמיכה במייל, ב-Growth יש גם צ\'אט, וב-Full יש תמיכה טלפונית ומנהל לקוח ייעודי.',
      },
      {
        question: 'האם יש הדרכות?',
        answer: 'כן! במערכת משולבים טיפים והדרכות בכל שלב. בנוסף, בחבילת Full מקבלים הדרכה אישית.',
      },
      {
        question: 'איך נרשמים?',
        answer: 'פשוט לוחצים על "התחל עכשיו", מזינים מייל וסיסמה – וזהו! תוכל להתחיל להשתמש במערכת מיד.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <PortalHeader />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              שאלות נפוצות
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              כל מה שרציתם לדעת על ClientDashboard
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-12 md:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${catIndex}-${index}`}
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
              </div>
            ))}
          </div>
        </section>

        <FinalCTA />
      </main>
      
      <PortalFooter />
    </div>
  );
}