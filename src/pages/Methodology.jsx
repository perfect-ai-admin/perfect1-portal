import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Shield, Clock, TrendingUp, Award } from 'lucide-react';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import InternalLinker from '../components/seo/InternalLinker';
import LeadForm from '../components/forms/LeadForm';
import RelatedContent from '../components/seo/RelatedContent';

export default function Methodology() {
  const breadcrumbs = [
    { label: 'דף הבית', url: '/' },
    { label: 'המתודולוגיה שלנו' }
  ];

  const methodologySteps = [
    {
      icon: Users,
      title: 'שלב 1: ייעוץ אישי מקיף',
      description: 'שיחה אישית עם רואה חשבון מוסמך להבנת הצרכים המקצועיים, הכנסות צפויות והמלצה מדויקת',
      duration: '30-45 דקות',
      deliverables: ['ניתוח מקצועי', 'המלצות מותאמות אישית', 'תכנית פעולה ברורה']
    },
    {
      icon: Shield,
      title: 'שלב 2: רישום ואישורים',
      description: 'טיפול מקצועי בכל התהליך הבירוקרטי - רישום במס הכנסה, ביטוח לאומי ואישורים נדרשים',
      duration: '1-3 ימי עסקים',
      deliverables: ['רישום במס הכנסה', 'רישום בביטוח לאומי', 'אישור עוסק פטור']
    },
    {
      icon: Clock,
      title: 'שלב 3: הכשרה ותדריך',
      description: 'הדרכה מקיפה על ניהול נכון של עסק עצמאי - מחשבים, דוחות, הוצאות מוכרות ותזרים מזומנים',
      duration: 'שעה אחת',
      deliverables: ['מדריך דיגיטלי', 'תבניות וכלים', 'גישה למערכת ניהול']
    },
    {
      icon: TrendingUp,
      title: 'שלב 4: ליווי שוטף',
      description: 'זמינות מלאה לשאלות, ייעוץ חודשי, עדכוני רגולציה והכנת דוחות שנתיים',
      duration: 'לאורך כל השנה',
      deliverables: ['תמיכה טלפונית', 'עדכוני חוק', 'הכנת דוח שנתי']
    }
  ];

  const qualityStandards = [
    {
      icon: Award,
      title: 'רואי חשבון מוסמכים בלבד',
      description: 'כל הצוות שלנו מורכב מרואי חשבון מוסמכים עם ניסיון של מעל 15 שנה בתחום'
    },
    {
      icon: Shield,
      title: 'עמידה מלאה ברגולציה',
      description: 'כל התהליכים שלנו עומדים ברגולציה הישראלית ומעודכנים בזמן אמת לכל שינוי בחוק'
    },
    {
      icon: Clock,
      title: 'זמני תגובה מובטחים',
      description: 'תגובה תוך 24 שעות לכל פניה, פתיחת עוסק תוך 3 ימי עסקים מקסימום'
    },
    {
      icon: CheckCircle,
      title: 'ביקורת איכות כפולה',
      description: 'כל תיק עובר ביקורת של שני רואי חשבון שונים לפני הגשה לרשויות'
    }
  ];

  return (
    <>
      <SEOOptimized 
        title="המתודולוגיה שלנו - איך פותחים עוסק פטור ב-4 שלבים | Perfect One"
        description="גלו את המתודולוגיה המקצועית והמוכחת שלנו לפתיחת עוסקים פטורים. תהליך בן 4 שלבים, בפיקוח רואי חשבון מוסמכים, עם אחריות מלאה."
        keywords={['מתודולוגיה עוסק פטור', 'תהליך פתיחת עוסק', 'רואה חשבון מוסמך', 'פתיחת עוסק מקצועית', 'שלבי פתיחת עוסק']}
        canonical="https://perfect1.co.il/Methodology"
        schema={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "תהליך פתיחת עוסק פטור מקצועי",
          "description": "מדריך מקיף לפתיחת עוסק פטור בישראל בליווי מקצועי",
          "totalTime": "P3D",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "sameAs": [
              "https://www.facebook.com/perfect1.co.il",
              "https://www.linkedin.com/company/perfect1",
              "https://www.instagram.com/perfect1.co.il"
            ]
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "Perfect One",
            "url": "https://perfect1.co.il"
          },
          "about": {
            "@type": "Thing",
            "name": "עוסק פטור בישראל",
            "description": "מתודולוגיה מקצועית לפתיחת עוסקים פטורים"
          },
          "step": methodologySteps.map((step, idx) => ({
            "@type": "HowToStep",
            "position": idx + 1,
            "name": step.title,
            "text": step.description,
            "itemListElement": step.deliverables.map((item, i) => ({
              "@type": "HowToDirection",
              "position": i + 1,
              "text": item
            }))
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
              המתודולוגיה המקצועית שלנו
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              תהליך מוכח ומקצועי בן 4 שלבים, שפותח על ידי רואי חשבון מובילים בישראל.
              <strong> מעל 2,000 עוסקים פטורים </strong>פתחו איתנו בהצלחה בשנה האחרונה.
            </p>
          </motion.div>

          {/* Process Steps */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              תהליך העבודה שלנו - שקוף ומקצועי
            </h2>
            <div className="space-y-8">
              {methodologySteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-[#1E3A5F]">{step.title}</h3>
                        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <InternalLinker content={step.description} currentPage="Methodology" />
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">תוצרים:</p>
                        <ul className="space-y-2">
                          {step.deliverables.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0" />
                              <span>{item}</span>
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

          {/* Quality Standards */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              תקני האיכות שלנו
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {qualityStandards.map((standard, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <standard.icon className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{standard.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{standard.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Our Methodology Works */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-10 mb-16 text-white"
          >
            <h2 className="text-3xl font-black mb-6 text-center">למה המתודולוגיה שלנו עובדת?</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-black text-[#D4AF37] mb-2">2,000+</div>
                <p className="text-white/90">עוסקים פטורים פעילים</p>
              </div>
              <div>
                <div className="text-5xl font-black text-[#D4AF37] mb-2">98%</div>
                <p className="text-white/90">שביעות רצון לקוחות</p>
              </div>
              <div>
                <div className="text-5xl font-black text-[#D4AF37] mb-2">15+</div>
                <p className="text-white/90">שנות ניסיון בתחום</p>
              </div>
            </div>
          </motion.div>

          {/* Related Content */}
          <RelatedContent pageType="guide" />

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-[#1E3A5F] mb-4 text-center">
                מוכנים להתחיל בתהליך מקצועי?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                השאירו פרטים ונחזור אליכם תוך 24 שעות לייעוץ ראשוני ללא עלות
              </p>
              <LeadForm 
                title=""
                subtitle=""
                sourcePage="Methodology"
                variant="card"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}