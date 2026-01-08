import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, AlertCircle, CheckCircle, BookOpen, ExternalLink } from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import InternalLinker from '../components/seo/InternalLinker';
import AnswerBlock from '../components/seo/AnswerBlock';

export default function Regulation() {
  const breadcrumbs = [
    { label: 'דף הבית', url: '/' },
    { label: 'רגולציה וחוקים' }
  ];

  const regulations = [
    {
      icon: Scale,
      title: 'חוק מס הכנסה (פקודת מס הכנסה)',
      description: 'עוסק פטור מוגדר על פי סעיף 9(8א) לפקודת מס הכנסה כעוסק שמחזורו השנתי אינו עולה על 120,000 ₪.',
      link: 'https://www.nevo.co.il/law_html/law01/082_001.htm',
      requirements: [
        'הכנסה שנתית עד 120,000 ₪',
        'פטור מהגשת דוח מע"מ',
        'חובת הגשת דוח שנתי למס הכנסה',
        'אפשרות לניכוי הוצאות מוכרות'
      ]
    },
    {
      icon: FileText,
      title: 'ביטוח לאומי - חובות ופטורים',
      description: 'עוסק פטור חייב בתשלומי ביטוח לאומי ממועד תחילת הפעילות, בהתאם לחוק הביטוח הלאומי.',
      link: 'https://www.btl.gov.il',
      requirements: [
        'רישום בביטוח לאומי תוך 30 יום מתחילת הפעילות',
        'תשלום דמי ביטוח חודשיים (כ-17% מההכנסה)',
        'זכאות לביטוח רפואי ותגמולי אבטלה',
        'חישוב לפי הכנסה שנתית או תשלום מינימום'
      ]
    },
    {
      icon: BookOpen,
      title: 'חוק עסקאות גופים ציבוריים',
      description: 'עוסק פטור זכאי לעבוד עם גופים ציבוריים בכפוף לעמידה בתנאים מסוימים.',
      link: 'https://www.gov.il/he/departments/policies/public_bodies',
      requirements: [
        'אישור ניהול פנקסי חשבונות (במקרים מסוימים)',
        'אישור על אי תלות בבחברים אחרים',
        'דוחות כספיים תקינים',
        'עמידה בהוראות החוק לעסקאות עם גופים ציבוריים'
      ]
    }
  ];

  const recentChanges = [
    {
      date: '01/01/2024',
      title: 'עדכון תקרת הכנסה לעוסק פטור',
      description: 'תקרת ההכנסה השנתית לעוסק פטור נותרה על 120,000 ₪. לא בוצע שינוי ב-2024.'
    },
    {
      date: '15/11/2023',
      title: 'שינוי בהגשת דוחות שנתיים',
      description: 'רשות המיסים הקלה על עוסקים פטורים בהגשת דוחות דיגיטליים דרך מערכת שירות זה.'
    },
    {
      date: '01/09/2023',
      title: 'הנחיות חדשות לביטוח לאומי',
      description: 'ביטוח לאומי פרסם הנחיות מעודכנות לחישוב דמי ביטוח לעוסקים עצמאיים.'
    }
  ];

  return (
    <>
      <SEOOptimized 
        title="רגולציה וחוקים לעוסק פטור בישראל 2024 | Perfect One"
        description="מדריך מקיף לכל הרגולציה והחוקים הרלוונטיים לעוסק פטור בישראל. מס הכנסה, ביטוח לאומי, עדכונים שוטפים ועמידה בחוק."
        keywords={['רגולציה עוסק פטור', 'חוקים עוסק פטור', 'מס הכנסה', 'ביטוח לאומי', 'חוק עסקאות גופים ציבוריים']}
        canonical="https://perfect1.co.il/Regulation"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "רגולציה לעוסק פטור בישראל",
          "description": "מידע רשמי על הרגולציה והחוקים החלים על עוסקים פטורים בישראל",
          "about": {
            "@type": "Thing",
            "name": "רגולציה עוסק פטור בישראל",
            "description": "חוקים ותקנות לעוסקים פטורים"
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "Perfect One",
            "url": "https://perfect1.co.il"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Perfect One",
            "sameAs": [
              "https://www.facebook.com/perfect1.co.il",
              "https://www.linkedin.com/company/perfect1",
              "https://www.instagram.com/perfect1.co.il"
            ]
          },
          "mainEntity": regulations.map(reg => ({
            "@type": "Thing",
            "name": reg.title,
            "description": reg.description
          }))
        }}
      />

      <div className="pt-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbs} />

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-6">
              רגולציה וחוקים - עוסק פטור 2024
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              כל המידע המשפטי והרגולטורי שצריך לדעת על פתיחה וניהול של עוסק פטור בישראל.
              <strong> מעודכן לשנת 2024</strong> בהתאם לכל שינויי החוק.
            </p>
          </motion.div>

          {/* Regulations */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              החוקים והתקנות החלים על עוסק פטור
            </h2>
            <div className="space-y-8">
              {regulations.map((reg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                      <reg.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">{reg.title}</h3>
                      <InternalLinker content={reg.description} currentPage="Regulation" />
                      <a 
                        href={reg.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#27AE60] hover:text-[#1E3A5F] font-semibold mt-3 transition-colors"
                      >
                        קישור לחוק הרשמי
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="mt-5 border-t border-gray-100 pt-5">
                        <p className="text-sm font-bold text-gray-700 mb-3">דרישות עיקריות:</p>
                        <ul className="space-y-2">
                          {reg.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              עדכונים רגולטוריים אחרונים
            </h2>
            <div className="space-y-4">
              {recentChanges.map((change, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-blue-50 border border-blue-200 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full">
                          {change.date}
                        </span>
                        <h3 className="text-lg font-bold text-blue-900">{change.title}</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{change.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              שאלות נפוצות על הרגולציה
            </h2>
            <div className="space-y-6">
              <AnswerBlock
                question="מה קורה אם עברתי את תקרת ה-120,000 ₪?"
                answer="אם עברת את תקרת ההכנסה של 120,000 ₪ בשנה, אתה מחויב להירשם כעוסק מורשה (עם מע''מ) תוך 30 יום. חשוב ליידע את רואה החשבון מיד כדי לבצע את המעבר בזמן ולמנוע קנסות."
              />
              <AnswerBlock
                question="האם חייב לשלם ביטוח לאומי מהיום הראשון?"
                answer="כן. חובת התשלום מתחילה מיום תחילת הפעילות כעוסק. יש להירשם בביטוח לאומי תוך 30 יום מתחילת הפעילות ולשלם דמי ביטוח באופן חודשי או רבעוני."
              />
              <AnswerBlock
                question="האם אני יכול לעבוד עם חברות גדולות כעוסק פטור?"
                answer="כן, עוסק פטור יכול לעבוד עם חברות גדולות וגופים ציבוריים. במקרים מסוימים יידרש אישור ניהול פנקסי חשבונות או תעודת עוסק פטור מרשות המיסים."
              />
            </div>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-orange-50 border-r-4 border-orange-500 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-black text-orange-900 mb-3">
                  ⚠️ הערת אחריות חשובה
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  המידע באתר זה הוא למטרות מידע כללי בלבד ואינו מהווה ייעוץ משפטי או חשבונאי.
                  <strong> לכל החלטה עסקית או משפטית יש להתייעץ עם רואה חשבון מוסמך או יועץ משפטי.</strong>
                </p>
                <p className="text-gray-700 leading-relaxed">
                  אנו ב-Perfect One מתחייבים לעדכן את המידע באופן שוטף, אך שינויים ברגולציה עלולים להתרחש בכל עת.
                  ליווי מקצועי מבטיח עמידה בכל הדרישות החוקיות.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}