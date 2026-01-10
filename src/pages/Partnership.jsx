import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircle, Users, TrendingUp, Zap, AlertCircle } from 'lucide-react';
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

          {/* מודל כלכלי */}
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">הכלכליות – בצורה גלויה</h2>
            <p className="text-gray-700 mb-6">
              אני מאמין בשקיפות מלאה. הנה המספרים:
            </p>

            {/* ההכנסה והוצאות */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">מודל חד (למדגם ממוצע)</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">הכנסה ממוצעת מלקוח (שנתי)</span>
                  <span className="text-2xl font-bold text-blue-600">2,000 ₪</span>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm font-bold text-red-900 mb-3">הוצאות קבועות:</p>
                  <div className="space-y-2 text-red-900">
                    <div className="flex justify-between">
                      <span>עלות פתיחת תיק / טיפול טכני</span>
                      <span>− 100 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>עלות שיווק (ממומן / תוכן / מערכת)</span>
                      <span>− 350 ₪</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg border border-green-200">
                  <span className="text-green-900 font-bold">רווח גולמי לפני מכירות</span>
                  <span className="text-3xl font-bold text-green-600">1,550 ₪</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                זה הסכום שממנו אתה צריך לשלם לנציג מכירות ועדיין להישאר רווחי.
              </p>

              {/* 3 מודלים */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4">3 מודלים אפשריים (עמלה לעסקה)</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'מודל בטוח',
                      amount: '250–300 ₪',
                      remaining: '1,250 ₪',
                      pros: ['רווחי מאוד'],
                      cons: ['נציגים חזקים פחות יתלהבו']
                    },
                    {
                      title: 'מודל מאוזן ✓',
                      amount: '400–500 ₪',
                      remaining: '1,100 ₪',
                      pros: ['עדיין רווחי', 'נציג טוב רעב יעבוד', 'אפשר סקייל'],
                      cons: [],
                      recommended: true
                    },
                    {
                      title: 'מודל תותח',
                      amount: '600–700 ₪',
                      remaining: '900 ₪',
                      pros: ['לסגירות קשות'],
                      cons: ['לא מומלץ לשלב ראשוני']
                    }
                  ].map((model, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-4 ${model.recommended ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <p className={`font-bold mb-3 ${model.recommended ? 'text-blue-900' : 'text-gray-900'}`}>
                        {model.title}
                      </p>
                      <p className={`text-2xl font-bold mb-2 ${model.recommended ? 'text-blue-600' : 'text-gray-700'}`}>
                        {model.amount}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        נשאר לך: <strong>{model.remaining}</strong>
                      </p>
                      <div className="space-y-1 text-xs">
                        {model.pros.map((pro, i) => (
                          <div key={i} className="flex items-start gap-2 text-green-700">
                            <span>✓</span>
                            <span>{pro}</span>
                          </div>
                        ))}
                        {model.cons.map((con, i) => (
                          <div key={i} className="flex items-start gap-2 text-red-700">
                            <span>✗</span>
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ההמלצה */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded">
              <h3 className="font-bold text-blue-900 mb-3">👉 ההמלצה שלי</h3>
              <p className="text-blue-900 mb-4">
                <strong>עמלה של 400–500 ₪ לעסקה סגורה</strong>, בלי שכר בסיס, בלי התחייבות. תשלום רק על לקוח משלם.
              </p>
              <p className="text-sm text-blue-800">
                זה שומר את הרווחיות שלך, מושך נציג טוב, ואפשר לסקלות כשגדלות המכירות.
              </p>
            </div>

            {/* מדרגות */}
            <div className="bg-gray-50 border border-gray-200 p-6 mb-8 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-4">שדרוג חכם (כשגדלות המכירות)</h4>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">1–20 סגירות בחודש</span>
                  <span className="font-bold text-gray-900">400 ₪</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">21–50 סגירות</span>
                  <span className="font-bold text-gray-900">450 ₪</span>
                </div>
                <div className="flex justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">50+ סגירות</span>
                  <span className="font-bold text-gray-900">500 ₪</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                כך אתה שומר רווחיות, הנציג רץ חזק, ואין תקרת זכוכית.
              </p>
            </div>

            {/* סיכום */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 rounded-lg">
              <h4 className="font-bold text-green-900 mb-4">סיכום – מה הצפי בפועל</h4>
              <div className="space-y-3 text-green-900">
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span>מחיר לקוח (ממוצע)</span>
                  <span className="font-bold">2,000 ₪</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span>עלות (בלי מכירות)</span>
                  <span className="font-bold">450 ₪</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-green-200">
                  <span>עמלת מכירות (450 ₪ משולם)</span>
                  <span className="font-bold">450 ₪</span>
                </div>
                <div className="flex justify-between bg-white p-3 rounded mt-4 border border-green-200">
                  <span className="font-bold text-lg">רווח לקוח בודד</span>
                  <span className="font-bold text-lg text-green-600">~1,100 ₪</span>
                </div>
              </div>
              <p className="text-sm text-green-900 mt-6 font-semibold">
                ב־100 לקוחות בחודש:
              </p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                👉 110,000 ₪ רווח גולמי
              </p>
              <p className="text-xs text-green-800 mt-2">
                (לפני הנהלה, שכר עצמי, ייעוץ וכדומה)
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