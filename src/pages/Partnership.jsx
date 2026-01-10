import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';
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
        <title>הצעה לשותפות אסטרטגית 50/50 – מיזם שירותים פיננסיים | Perfect One</title>
        <meta name="description" content="ניתוח עסקי מפורט להצעת שותפות 50/50 במיזם פתיחת וניהול עסקים בישראל. דוח P&L, תחזויות פעילות ושווי חברה." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white py-16" dir="rtl">
        <div className="max-w-6xl mx-auto px-6">
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
              הצעה לשותפות אסטרטגית במיזם שירותים פיננסיים לעצמאים
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-200 mb-4 max-w-3xl leading-relaxed"
            >
              ניתוח עסקי ותחזית – שותפות שווה (50/50) בעסק צומח עם בסיס כלכלי ברור
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-16" dir="rtl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Executive Summary */}
          <motion.div variants={itemVariants} className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">תקציר מנהלים</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                המיזם פועל כבית דיגיטלי לעצמאים ולעסקים קטנים בישראל, עם מנוע שיווקי פעיל המבוסס SEO, AEO וקמפיינים ממומנים, המייצר זרם קבוע של לידים בעלי כוונת רכישה גבוהה.
              </p>
              <p>
                המודל העסקי מבוסס על פתיחת תיקים, שירותי ניהול שנתיים וליווי מתמשך, עם פוטנציאל סקייל משמעותי ויכולת בניית פעילות רווחית ויציבה לאורך זמן.
              </p>
            </div>
          </motion.div>

          {/* מבנה השותפות */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">מבנה השותפות</h2>
            <div className="space-y-6">
              <div className="bg-white border border-gray-300 p-6 rounded-lg">
                <p className="text-lg font-bold text-gray-900 mb-4">הקמת חברה משותפת בבעלות 50% / 50%</p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>חלוקת אחריות ברורה בין שיווק לתפעול</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>פעילות מסודרת עם הנהלת חשבונות, עובדים ותהליכים</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-4">צד א' (יזם – תשתית דיגיטל)</h3>
                  <ul className="space-y-2 text-blue-900 text-sm">
                    <li>• טראפיק אורגני וממומן</li>
                    <li>• מערכות SEO / AEO / משפכי המרה</li>
                    <li>• תשתיות דיגיטל ולידים</li>
                    <li>• פיתוח מערכות וקנה מידה</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-4">צד ב' (שותף מקצועי – תפעול)</h3>
                  <ul className="space-y-2 text-green-900 text-sm">
                    <li>• ידע מקצועי וניסיון (רו״ח / יועץ מס / מנהל)</li>
                    <li>• ניהול תפעולי יומיומי</li>
                    <li>• טיפול בלקוחות וניהול צוות</li>
                    <li>• עמידה ברגולציה וטיפול בחובות</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* הנחות עבודה */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">הנחות עבודה – ניתוח שמרני</h2>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-3 px-4 text-right">פרמטר</th>
                    <th className="py-3 px-4 text-right">הנחה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-gray-900">לידים חודשיים</td>
                    <td className="py-3 px-4 text-gray-700">300–500</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">יחס סגירה ממוצע</td>
                    <td className="py-3 px-4 text-gray-700">20%–25%</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-gray-900">לקוחות חדשים בחודש</td>
                    <td className="py-3 px-4 text-gray-700">60–125</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">הכנסה ממוצעת ללקוח (שנתי)</td>
                    <td className="py-3 px-4 text-gray-700">2,000 ₪</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* תחזית פעילות חודשית */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">תחזית פעילות חודשית</h2>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-3 px-4 text-right">פרמטר</th>
                    <th className="py-3 px-4 text-right">תרחיש שמרני</th>
                    <th className="py-3 px-4 text-right">תרחיש גבוה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-gray-900">לידים</td>
                    <td className="py-3 px-4 text-gray-700">300</td>
                    <td className="py-3 px-4 text-gray-700">500</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">סגירות (20%–25%)</td>
                    <td className="py-3 px-4 text-gray-700">60</td>
                    <td className="py-3 px-4 text-gray-700">125</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-3 px-4 font-bold text-blue-900">הכנסה חודשית</td>
                    <td className="py-3 px-4 font-bold text-blue-600">120k ₪</td>
                    <td className="py-3 px-4 font-bold text-blue-600">250k ₪</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* דוח רווח והפסד */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">דוח רווח והפסד (P&L) חודשי – הערכה</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'תרחיש שמרני',
                  rows: [
                    { label: 'הכנסות', value: '120,000 ₪', bold: true },
                    { label: '  שירותים ופתיחות (60 × 2k)', value: '120,000 ₪' },
                    { label: '', value: '', spacer: true },
                    { label: 'הוצאות', value: '', bold: true },
                    { label: '  שיווק (300 לידים × 50 ₪)', value: '15,000 ₪' },
                    { label: '  פתיחה/טיפול (60 × 150 ₪)', value: '9,000 ₪' },
                    { label: '  עמלות מכירות (25%)', value: '30,000 ₪' },
                    { label: '  שכר ניהול שותף', value: '20,000 ₪' },
                    { label: '  תפעול ומערכות', value: '10,000 ₪' },
                    { label: '', value: '', spacer: true },
                    { label: 'רווח תפעולי', value: '36,000 ₪', highlight: true }
                  ]
                },
                {
                  title: 'תרחיש גבוה',
                  rows: [
                    { label: 'הכנסות', value: '250,000 ₪', bold: true },
                    { label: '  שירותים ופתיחות (125 × 2k)', value: '250,000 ₪' },
                    { label: '', value: '', spacer: true },
                    { label: 'הוצאות', value: '', bold: true },
                    { label: '  שיווק (500 לידים × 50 ₪)', value: '25,000 ₪' },
                    { label: '  פתיחה/טיפול (125 × 150 ₪)', value: '18,750 ₪' },
                    { label: '  עמלות מכירות (25%)', value: '62,500 ₪' },
                    { label: '  שכר ניהול שותף', value: '25,000 ₪' },
                    { label: '  תפעול ומערכות', value: '15,000 ₪' },
                    { label: '', value: '', spacer: true },
                    { label: 'רווח תפעולי', value: '103,750 ₪', highlight: true }
                  ]
                }
              ].map((scenario, idx) => (
                <div key={idx} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-white p-4">
                    <h3 className="font-bold">{scenario.title}</h3>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {scenario.rows.map((row, ridx) => (
                        <tr 
                          key={ridx}
                          className={`${
                            row.spacer ? 'bg-gray-100 h-2' :
                            row.highlight ? 'bg-green-50 border-t-2 border-gray-400' :
                            row.bold ? 'bg-gray-50 border-b border-gray-300' :
                            'border-b border-gray-200'
                          }`}
                        >
                          {!row.spacer && (
                            <>
                              <td className={`py-2 px-4 ${row.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {row.label}
                              </td>
                              <td className={`py-2 px-4 text-right ${row.highlight ? 'font-bold text-green-600' : row.bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                {row.value}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </motion.div>

          {/* רווח שנתי */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">רווח שנתי וצבירת לקוחות</h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border border-green-200">
                  <p className="text-sm text-gray-600 uppercase mb-2">לקוחות פעילים אחרי שנה</p>
                  <p className="text-3xl font-bold text-green-700">700–1,200</p>
                </div>
                <div className="bg-white p-4 rounded border border-green-200">
                  <p className="text-sm text-gray-600 uppercase mb-2">רווח תפעולי שנתי</p>
                  <p className="text-3xl font-bold text-green-700">500k–1.2M ₪</p>
                </div>
                <div className="bg-white p-4 rounded border border-green-200">
                  <p className="text-sm text-gray-600 uppercase mb-2">חלוקה משותפת</p>
                  <p className="text-3xl font-bold text-green-700">50% / 50%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* שווי חברה */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">שווי חברה – הערכה</h2>
            <p className="text-gray-700 mb-6">
              מיזמים בתחום שירותים פיננסיים עם הכנסה חוזרת נסחרים במכפילים של 2.5–4 על הרווח השנתי:
            </p>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-3 px-4 text-right">תרחיש</th>
                    <th className="py-3 px-4 text-right">רווח שנתי</th>
                    <th className="py-3 px-4 text-right">מכפיל</th>
                    <th className="py-3 px-4 text-right">שווי חברה</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-bold text-gray-900">שמרני</td>
                    <td className="py-3 px-4 text-gray-700">500k ₪</td>
                    <td className="py-3 px-4 text-gray-700">2.5–3</td>
                    <td className="py-3 px-4 font-bold text-blue-600">1.25–1.5M ₪</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="py-3 px-4 font-bold text-blue-900">צמיחה</td>
                    <td className="py-3 px-4 text-blue-900">1.2M ₪</td>
                    <td className="py-3 px-4 text-blue-900">3–4</td>
                    <td className="py-3 px-4 font-bold text-blue-700">3.6–4.8M ₪</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* יתרונות תחרותיים */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">יתרונות תחרותיים</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'מנוע לידים עצמאי (לא תלוי צד ג\')',
                'שילוב AI וליווי חכם ללקוח',
                'מודל הכנסה חוזרת (recurring revenue)',
                'אפשרות הרחבה לשירותים משלימים',
                'תהליכים מובנים והנהלה מקצועית',
                'בסיס לקוחות צומח וינטור מפעיל'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white border border-gray-200 p-4 rounded">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* אופן קבלת החלטות */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">אופן קבלת החלטות</h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 rounded">
                <p className="font-bold text-blue-900">החלטות אסטרטגיות</p>
                <p className="text-blue-800 text-sm mt-1">בהסכמה משותפת – חדירה לשירותים חדשים, הנפקות הון, שינוי מודל עסקי</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-4 rounded">
                <p className="font-bold text-green-900">תפעול שוטף ולקוחות</p>
                <p className="text-green-800 text-sm mt-1">באחריות השותף המקצועי – ניהול תיקים, ליווי, עמידה ברגולציה</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-4 rounded">
                <p className="font-bold text-purple-900">שיווק ופיתוח מערכות</p>
                <p className="text-purple-800 text-sm mt-1">באחריות היזם – לידים, SEO, קמפיינים, תשתיות דיגיטל</p>
              </div>
            </div>
          </motion.div>

          {/* סיכום */}
          <motion.div variants={itemVariants} className="bg-gray-900 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">סיכום</h2>
            <div className="space-y-4">
              <p>
                <strong>מדובר במיזם עם:</strong>
              </p>
              <ul className="space-y-2 text-gray-100">
                <li className="flex items-start gap-3">
                  <span>✓</span>
                  <span>בסיס כלכלי ברור ומעוגן במספרים</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>✓</span>
                  <span>יכולת סקייל משמעותית</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>✓</span>
                  <span>חלוקת תפקידים מאוזנת וברורה</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>✓</span>
                  <span>פוטנציאל בניית פעילות משמעותית לאורך זמן</span>
                </li>
              </ul>
              <p className="mt-6 border-t border-gray-700 pt-6">
                <strong>ההצעה מיועדת לשותף המעוניין להיות חלק מבניית עסק –</strong> לא משרה, לא השקעה פסיבית, ולא quick fix.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants}>
            <p className="text-lg text-gray-700 mb-8">
              <strong>במידה והניתוח רלוונטי –</strong> 
              <br />
              נשמח לקיים שיחה מקצועית ולהעמיק בנתונים, בתוכנית העבודה ובדרך הקדימה המשותפת.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Form Section */}
      <section className="bg-gray-900 py-16 border-t border-gray-700" dir="rtl">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">פרטיך</h2>
            <p className="text-gray-600 text-center text-sm mb-8">למה אנחנו חשובים להשם?</p>
            <PartnershipForm />
          </div>
        </div>
      </section>
    </>
  );
}