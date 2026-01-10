import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, Users, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import PartnershipForm from '../components/partnership/PartnershipForm';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Partnership() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>שותפות 50/50 - מיזם גדל בתחום עסקים | Perfect One</title>
        <meta name="description" content="מחפשים שותף מקצועי לשותפות שווה (50/50). משלבים טראפיק ומערכות עם ניסיון תפעולי. לרו״ח, יועצי מס ומנהלי משרדות." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://perfect1.co.il/Partnership" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white py-16" dir="rtl">
        <div className="max-w-5xl mx-auto px-6">
          <Breadcrumbs items={[
            { label: 'בית', url: 'Home' },
            { label: 'שותפות' }
          ]} />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl font-bold mb-6 leading-tight"
            >
              מחפשים שותף מקצועי למיזם צומח בתחום פתיחת וניהול עסקים
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-blue-100 mb-4 max-w-3xl leading-relaxed"
            >
              שותפות שווה (50/50) – שילוב של טראפיק, מערכות ושיווק עם ניסיון מקצועי ותפעול
            </motion.p>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-blue-200"
            >
              רציני, לטווח ארוך, בדרך מחוברת.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-6 py-16" dir="rtl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* מה המיזם עושה */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">מה המיזם עושה</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              המיזם פועל כבית דיגיטלי לעצמאים ולעסקים בישראל, ומרכז:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>פתיחת עוסק פטור / מורשה / חברה בע״מ</strong> – תהליכים מנוהלים, מאובטחים וממומחים</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>שירותים שוטפים</strong> – ליווי רציף מול רשויות המס, דוחות שנתיים, ייעוץ</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>תהליכים דיגיטליים</strong> – אתר, SEO, AEO, קמפיינים ממומנים</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>הזרמת לידים איכותיים</strong> – אנשים עם כוונת רכישה גבוהה, חיפוש אקטיבי</span>
              </li>
            </ul>
          </motion.div>

          {/* מה כבר קיים היום */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">מה כבר קיים היום</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'אתר פעיל עם עשרות עמודי תוכן וסילואים ממתכננים',
                'תשתית SEO / AEO ארוכת טווח (דירוג אורגני, דירוג AI)',
                'תהליכי פתיחה אונליין מפותחים',
                'קמפיינים ממומנים פעילים (Google, Facebook)',
                'פוטנציאל לידים חודשי גבוה',
                'מערכת ניהול lead מתקדמת'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* מודל השותפות */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">מודל השותפות</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-2xl font-bold text-blue-600">50%</span>
                <div>
                  <p className="font-bold">שותפות שווה אמיתית</p>
                  <p className="text-sm text-gray-600 mt-1">לא עובד סטאף, לא עמית – שותף שיושב בטיים וקובע כיוונים</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl font-bold text-blue-600">0₪</span>
                <div>
                  <p className="font-bold">אין השקעה כספית נדרשת</p>
                  <p className="text-sm text-gray-600 mt-1">בשלב הראשון – רק עבודה, ניסיון ודחיפה משותפת</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">חלוקת אחריות ברורה</p>
                  <p className="text-sm text-gray-600 mt-1">אתה מביא את הניסיון המקצועי, אני מביא את המערכות והטראפיק</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">בניית פעילות לטווח ארוך</p>
                  <p className="text-sm text-gray-600 mt-1">לא quick fix – השקעה במערכות, בתהליכים, בצמיחה בת קיימא</p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* מה אני מביא */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">מה אני מביא לשולחן</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'טראפיק אורגני וממומן',
                  desc: 'משתמשים פעילים שמחפשים דבר בדיוק זה'
                },
                {
                  title: 'מערכות SEO / AEO / GEO',
                  desc: 'דירוג בגוגל, תשובות בAI, קביעות מקומיות'
                },
                {
                  title: 'בניית משפכים והמרות',
                  desc: 'מהחיפוש עד ללקוח – תהליך מהונדס'
                },
                {
                  title: 'פיתוח אתר ותשתיות דיגיטל',
                  desc: 'כל הכלים שצריך כדי להיראות מקצועי'
                },
                {
                  title: 'חשיבה יזמית',
                  desc: 'למצוא הזדמנויות, לא רק לחזור על אותו דבר'
                },
                {
                  title: 'Accountability',
                  desc: 'הבטחות שאני עומד בהן, מטרות שאנחנו משיגים ביחד'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* מה אני מחפש */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">מה אני מחפש בשותף</h2>
            <p className="text-gray-700 mb-6">שותף שמגיע מאחד מהתחומים הבאים ובעל:</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>ניסיון בתחום:</strong> רו״ח, יועץ מס, מנהל משרד, או גורם בעל ניסיון תפעולי בשירותים פיננסיים / משפטיים</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>ניהול לקוחות וביצוע:</strong> יודע לנהל תהליכים, לסגור עסקות, ללוות משתמשים מהתחלה לסוף</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>הבנה רגולטורית:</strong> מכיר רשויות, דיווחים, משפט מס, ביטוח לאומי, מע״מ</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>דחיפה ודמיון:</strong> לא מחפש "עוד לקוח" – אתה רוצה לבנות משהו רציני, שיגדל, שיהיה משלך</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>פתיחות לשותפות אמיתית:</strong> זה לא סיפור של "אני במחסן שלי" – זה דיאלוג, החלטות משותפות, צמיחה משותפת</span>
              </li>
            </ul>
          </motion.div>

          {/* למי זה לא מתאים */}
          <motion.div variants={itemVariants} className="bg-amber-50 border border-amber-200 p-8 rounded-xl">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">למי זה לא מתאים</h2>
                <ul className="space-y-2 text-amber-900">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>מי שמחפש שכר, בונוס או תנאים שנתיים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>מי שמחפש השקעה פסיבית (כלומר, לא רוצה לעבוד)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>מי שלא יכול / לא פנוי להיות בקו הראשון של ניהול ויצירת פניות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>מי שמחפש "דרך מהירה להרוויח" – זה לא כן</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* דאשבורד עסקי */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">הניתוח העסקי – דאשבורד</h2>
            
            {/* KPI קלאסי */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'הכנסה לקוח שנתי', value: '2,000 ₪', color: 'blue' },
                { label: 'עלות טיפול', value: '450 ₪', color: 'red' },
                { label: 'רווח ברוטו', value: '1,550 ₪', color: 'yellow' },
                { label: 'עמלת מכירות', value: '450 ₪', color: 'purple' }
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-${kpi.color}-50 border border-${kpi.color}-200 p-4 rounded-lg`}>
                  <p className={`text-sm text-${kpi.color}-900 mb-2`}>{kpi.label}</p>
                  <p className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* פוטנציאל מכירות שנתי */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">פוטנציאל מכירות (שנתי)</h3>
              
              <div className="space-y-6">
                {/* תרחישים */}
                {[
                  {
                    name: 'תרחיש שמרני',
                    leads_month: 30,
                    conversion: 0.30,
                    desc: '30 לידים/חודש, 30% המרה'
                  },
                  {
                    name: 'תרחיש ממוצע',
                    leads_month: 50,
                    conversion: 0.35,
                    desc: '50 לידים/חודש, 35% המרה (מומלץ)',
                    recommended: true
                  },
                  {
                    name: 'תרחיש אגרסיבי',
                    leads_month: 80,
                    conversion: 0.40,
                    desc: '80 לידים/חודש, 40% המרה'
                  }
                ].map((scenario, idx) => {
                  const closures_month = Math.floor(scenario.leads_month * scenario.conversion);
                  const closures_year = closures_month * 12;
                  const revenue = closures_year * 2000;
                  const profit = (closures_year * 1550) - (closures_year * 450);

                  return (
                    <div 
                      key={idx}
                      className={`border rounded-lg p-6 ${scenario.recommended ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className={`font-bold text-lg ${scenario.recommended ? 'text-blue-900' : 'text-gray-900'}`}>
                            {scenario.name}
                            {scenario.recommended && ' ✓'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{scenario.desc}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">לידים בחודש</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{scenario.leads_month}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">סגירות בחודש</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{closures_month}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">סגירות בשנה</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{closures_year}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">רווח שנתי</p>
                          <p className={`text-xl font-bold mt-1 ${scenario.recommended ? 'text-blue-600' : 'text-green-600'}`}>
                            {(profit / 1000).toFixed(0)}k ₪
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">הכנסה שנתית</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{(revenue / 1000).toFixed(0)}k ₪</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">הוצאות שנתיות</p>
                          <p className="text-lg font-bold text-red-600 mt-1">{(closures_year * 450 / 1000).toFixed(0)}k ₪</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">רווח טהור</p>
                          <p className={`text-lg font-bold mt-1 ${scenario.recommended ? 'text-blue-600' : 'text-green-600'}`}>
                            {(profit / 1000).toFixed(0)}k ₪
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* חזות השנה */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold mb-6">חזות העסק – שנה 1 (התרחיש הממוצע)</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-blue-200 text-sm uppercase mb-2">לידים שנתיים</p>
                  <p className="text-4xl font-bold mb-2">600</p>
                  <p className="text-blue-300 text-xs">50 לידים/חודש × 12</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm uppercase mb-2">סגירות שנתיות</p>
                  <p className="text-4xl font-bold mb-2">210</p>
                  <p className="text-blue-300 text-xs">35% conversion rate</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm uppercase mb-2">רווח שנתי</p>
                  <p className="text-4xl font-bold mb-2">325k ₪</p>
                  <p className="text-blue-300 text-xs">בעסק כולל + משותף</p>
                </div>
              </div>
            </div>

            {/* תחרויות וסיכונים */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-orange-900 mb-4">⚠️ תחרויות וסיכונים</h3>
              <div className="space-y-3 text-orange-900">
                <div className="flex items-start gap-3">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>תחרות דירוג:</strong> אתרים אחרים בתחום (עוסק פטור, רואי חשבון מקוונים)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>שינויים רגולטוריים:</strong> חוקים על עוסקים, מע״מ, ביטוח לאומי</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>התפזרות פוקוס:</strong> הוספת שירותים חדשים בלי חזון ברור</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-bold flex-shrink-0">•</span>
                  <span><strong>איכות הטיפול:</strong> אם התיקים לא מטופלים כראוי = חזרה ודברים שליליים</span>
                </div>
              </div>
            </div>

            {/* שווי העסק (Valuation) */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8">
              <h3 className="text-lg font-bold text-green-900 mb-4">📊 שווי העסק (Valuation)</h3>
              <p className="text-green-900 mb-6">
                בהנחה שחיזוי ממוצע נכון (210 סגירות/שנה, 325k ₪ רווח):
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { multiplier: 2, value: 650, label: 'Conservative (2x)' },
                  { multiplier: 3, value: 975, label: 'Fair Value (3x)' },
                  { multiplier: 4, value: 1300, label: 'Aggressive (4x)' }
                ].map((val, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-bold mb-2">{val.label}</p>
                    <p className="text-2xl font-bold text-green-600">{val.value}k ₪</p>
                    <p className="text-xs text-green-600 mt-1">(רווח × {val.multiplier})</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-green-800 mt-6">
                זה אומר: עסק שנוצר ממספר, יכול להיות שווה 650k–1.3M ₪ בשנה הראשונה בלבד.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants}>
            <p className="text-lg text-gray-700 mb-8 mt-12">
              <strong>אם זה נשמע רלוונטי – השאר פרטים ונשוחח.</strong> 
              <br />
              אני אחזור אליך תוך 48 שעות.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Form Section */}
      <section className="bg-gray-50 py-16 border-t border-gray-200" dir="rtl">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">פרטיך</h2>
          <PartnershipForm />
        </div>
      </section>
    </>
  );
}