import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

export default function SalesAgentHandbook() {
  const [openSection, setOpenSection] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const CollapsibleSection = ({ title, icon, content, isOpen, onToggle }) => (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full bg-gray-900 text-white p-4 flex items-center justify-between hover:bg-gray-800 transition"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-bold text-left">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-6 bg-white space-y-4">
          {content}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title>חוברת הדרכה לסוכן מכירות | Perfect One</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12" dir="rtl">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-4">
              חוברת הדרכה לסוכן מכירות
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-200 max-w-3xl">
              שירותי ניהול וליווי חכם לעוסקים פטורים ומורשים
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16" dir="rtl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >

          {/* 1. מטרת התפקיד */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🎯 מטרת התפקיד שלך"
              isOpen={openSection === 'purpose'}
              onToggle={() => toggleSection('purpose')}
              content={
                <div className="space-y-6">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                    <p className="font-bold text-blue-900 mb-2">הנקודה החשובה:</p>
                    <p className="text-blue-800">
                      אתה לא מוכר מוצר. אתה נותן לאנשים <strong>שקט, ביטחון וראש שקט</strong> מול הרשויות – וגם כיוון קדימה בעסק.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">מי הוא הלקוח שלך?</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span>מפחד מטעויות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span>לא מבין מס</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span>לא רוצה הסתבכויות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span>מרגיש לבד בעסק</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span>רוצה לדעת שמישהו "שומר עליו" וגם עוזר לו להתקדם</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="font-bold text-green-900 mb-3">המשימה שלך:</p>
                    <p className="text-green-800">
                      גרום לו להרגיש שהוא <strong>לא לבד</strong>, ושיש לו <strong>מערכת חכמה + אנשים אמיתיים</strong> שמנהלים אותו נכון ודוחפים אותו קדימה.
                    </p>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 2. איך לחשוב נכון */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🧠 איך לחשוב נכון כמוכר (חשוב מאוד)"
              isOpen={openSection === 'mindset'}
              onToggle={() => toggleSection('mindset')}
              content={
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <p className="font-bold text-red-900 mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5" /> מה לא להגיד:
                      </p>
                      <ul className="space-y-2 text-red-800 text-sm">
                        <li>"אנחנו מוכרים דוח שנתי"</li>
                        <li>"אנחנו עושים הנהלת חשבונות"</li>
                        <li>"זה עולה X"</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                      <p className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> מה כן להגיד:
                      </p>
                      <ul className="space-y-2 text-green-800 text-sm">
                        <li>"אנחנו לוקחים אחריות"</li>
                        <li>"אנחנו דואגים שלא תסתבך"</li>
                        <li>"אתה עובד – אנחנו מול הרשויות"</li>
                        <li>"יש לך ליווי חכם שזמין לך כל הזמן"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 3. מי הלקוחות */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="👤 מי הלקוחות שאתה מדבר איתם?"
              isOpen={openSection === 'customers'}
              onToggle={() => toggleSection('customers')}
              content={
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="font-bold text-gray-900 mb-3">העוסק הפטור / המורשה הטיפוסי:</p>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>✓ עצמאי קטן / מתחיל</li>
                      <li>✓ שליח, פרילנסר, נותן שירות</li>
                      <li>✓ לא אוהב בירוקרטיה</li>
                      <li>✓ לא מבין מיסוי</li>
                      <li>✓ חושש מקנסות</li>
                      <li>✓ רוצה להיות "בסדר" עם המדינה</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <p className="font-bold text-red-900 mb-2">מה הוא לא מחפש:</p>
                      <p className="text-red-800 text-sm">רואה חשבון</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                      <p className="font-bold text-green-900 mb-2">מה הוא כן מחפש:</p>
                      <ul className="space-y-1 text-green-800 text-sm">
                        <li>• מישהו שיטפל בזה בשבילו</li>
                        <li>• מישהו שייתן לו שקט</li>
                        <li>• מישהו שיגיד לו מה הצעד הבא בעסק</li>
                      </ul>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 4. השירות שאנחנו מוכרים */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🧩 מה השירות שאנחנו מוכרים?"
              isOpen={openSection === 'service'}
              onToggle={() => toggleSection('service')}
              content={
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">ההגדרה הנכונה:</p>
                    <p className="text-blue-800 text-lg">
                      <strong>שירות ניהול וליווי חכם לעצמאי – שקט מול הרשויות וכיוון בעסק</strong>
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 mb-3">מה זה כולל (בלי להיכנס לפרטים טכניים):</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>פתיחה מסודרת של העסק</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>ניהול שוטף מול הרשויות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>תזכורות ודיווחים</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>טיפול בבעיות אם קורות</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>כתובת אחת לכל שאלה</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>אפליקציה עם מלווה חכם (AI) שזמין 24/7</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-4 rounded">
                    <p className="font-bold text-purple-900 mb-2">💡 כך את מציג את זה:</p>
                    <p className="text-purple-800 text-sm">
                      <strong>"זה לא רק מוקד תמיכה – זה ליווי חכם שחושב איתך על העסק, זמין כל הזמן, ויודע בדיוק מה צריך לעצמאים מצליחים."</strong>
                    </p>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 5. המלווה החכם */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🤖 השיטה החדשה – המלווה החכם שלנו"
              isOpen={openSection === 'ai'}
              onToggle={() => toggleSection('ai')}
              content={
                <div className="space-y-6">
                  <div className="bg-orange-50 border border-orange-300 p-4 rounded">
                    <p className="font-bold text-orange-900 mb-3">לא להגיד:</p>
                    <ul className="space-y-1 text-orange-800 text-sm">
                      <li>❌ "יש לנו ChatBot"</li>
                      <li>❌ "AI"</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-300 p-4 rounded">
                    <p className="font-bold text-green-900 mb-3">כן להגיד:</p>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>✅ "יש לך מלווה חכם לעסק"</li>
                      <li>✅ "מישהו שאתה יכול לשאול אותו כל דבר, בכל זמן"</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">הניסוח הנכון:</p>
                    <p className="text-blue-800">
                      "מעבר לליווי האנושי, אתה מקבל גם אפליקציה עם מלווה חכם שמכיר עצמאים, מסים, והתנהלויות עסקית – ככה שאתה אף פעם לא לבד."
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-300 p-4 rounded">
                    <p className="font-bold text-purple-900 mb-3">למה זה חזק במיוחד?</p>
                    <ul className="space-y-2 text-purple-800 text-sm">
                      <li>• הם עובדים לבד (שליחים, פרילנסרים)</li>
                      <li>• אין להם עם מי להתייעץ</li>
                      <li>• הם לא יודעים איך להתקדם</li>
                      <li>• הזמן שלהם שווה כסף</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 text-white p-4 rounded">
                    <p className="font-bold mb-2">💬 משפט להשתמש:</p>
                    <p>
                      "גם אם אתה שליח היום – זה לא אומר שזה חייב להישאר ככה. המלווה החכם עוזר לך לחשוב איך להפוך את הזמן שלך לעסק שעובד בשבילך."
                    </p>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 6. תסריט שיחה */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🗣️ תסריט שיחה – פתיחה נכונה"
              isOpen={openSection === 'script'}
              onToggle={() => toggleSection('script')}
              content={
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">פתיחת השיחה:</p>
                    <p className="text-blue-800 italic">
                      "המטרה שלי היא להבין איפה אתה היום, ואיך אנחנו יכולים לקחת ממך גם את ההתעסקות מול הרשויות וגם לעזור לך לבנות את העסק בצורה חכמה."
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="font-bold text-gray-900 mb-3">שאלות חובה:</p>
                    <ol className="space-y-2 text-gray-700 text-sm">
                      <li>1️⃣ אתה עוסק פטור או מורשה?</li>
                      <li>2️⃣ כבר פתחת תיק או שעדיין לא?</li>
                      <li>3️⃣ יש מישהו שמטפל לך במסים היום?</li>
                      <li>4️⃣ מה הכי מלחיץ אותך בהתנהלות מול מס הכנסה / מע״מ / ביטוח לאומי?</li>
                      <li>5️⃣ איפה היית רוצה שהעסק שלך יהיה עוד שנה?</li>
                    </ol>
                  </div>

                  <div className="bg-red-50 border border-red-300 p-4 rounded">
                    <p className="font-bold text-red-900 mb-2">⚠️ חשוב:</p>
                    <p className="text-red-800">
                      <strong>תקשיב. אל תמכור עדיין.</strong> בשלב הזה אתה אוסף מידע ומבנה אמון, לא סוגר עסקה.
                    </p>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 7. משפטי מפתח */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="💬 משפטי מפתח שמוכרים נכון"
              isOpen={openSection === 'keyPhrases'}
              onToggle={() => toggleSection('keyPhrases')}
              content={
                <div className="space-y-3">
                  {[
                    '"המטרה שלנו זה שלא תצטרך לחשוב על מסים בכלל"',
                    '"רוב הלקוחות שלנו באו אלינו אחרי טעויות שהם לא ידעו שעשו"',
                    '"אנחנו לא מחפשים להעמיס – אלא לעשות סדר"',
                    '"יש לך גם מלווה חכם שמלווה אותך ביום־יום, לא רק פעם בשנה"',
                    '"אתה לא רק עומד בדרישות – אתה גם מתקדם בעסק"'
                  ].map((phrase, idx) => (
                    <div key={idx} className="bg-white border border-blue-200 p-4 rounded flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800">{phrase}</p>
                    </div>
                  ))}
                </div>
              }
            />
          </motion.div>

          {/* 8. התנגדויות */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🛑 התנגדויות נפוצות – ואיך לענות"
              isOpen={openSection === 'objections'}
              onToggle={() => toggleSection('objections')}
              content={
                <div className="space-y-6">
                  {[
                    {
                      q: '"אני יכול לעשות את זה לבד"',
                      a: 'נכון, גם אפשר לנהוג בלי ביטוח. השאלה אם שווה לקחת את הסיכון מול רשויות המס – ועוד לבד, בלי מישהו שזמין לך.'
                    },
                    {
                      q: '"זה יקר לי"',
                      a: 'טעויות במסים עולות הרבה יותר. כאן אתה קונה שקט, ליווי חכם וזמינות – לא רק שירות טכני.'
                    },
                    {
                      q: '"אני קטן, לא צריך"',
                      a: 'דווקא עסקים קטנים מסתבכים הכי מהר, כי הם לא יודעים מה מותר ומה אסור – ואין להם עם מי להתייעץ.'
                    },
                    {
                      q: '"אחשוב על זה"',
                      a: 'ברור. רק חשוב לי שתדע שכל חודש בלי ניהול וליווי מסודר יכול לייצר בעיות אחורה – וזה בדיוק מה שאנחנו מונעים.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-red-50 p-4 border-b border-gray-300">
                        <p className="font-bold text-red-900">{item.q}</p>
                      </div>
                      <div className="bg-white p-4">
                        <p className="text-gray-700">✅ {item.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </motion.div>

          {/* 9. איך למכור ביטחון */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🔐 איך למכור ביטחון (ולא מחיר)"
              isOpen={openSection === 'selling'}
              onToggle={() => toggleSection('selling')}
              content={
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-300 p-4 rounded">
                      <p className="font-bold text-red-900 mb-2">❌ במקום להגיד:</p>
                      <p className="text-red-800">"זה עולה 2,000 ₪"</p>
                    </div>
                    <div className="bg-green-50 border border-green-300 p-4 rounded">
                      <p className="font-bold text-green-900 mb-2">✅ תגיד:</p>
                      <p className="text-green-800">"זה ליווי שנתי שנותן לך שקט מול הרשויות ומישהו שחושב איתך על העסק."</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-300 p-4 rounded">
                    <p className="font-bold text-blue-900 mb-2">אם צריך להזכיר מחיר:</p>
                    <p className="text-blue-800">
                      "זה שירות מתמשך, לא פעולה חד־פעמית. אתה מקבל ליווי אנושי + מלווה חכם באפליקציה."
                    </p>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 10. אונליין מול שיחה */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🧾 אונליין מול שיחה – איך להציג"
              isOpen={openSection === 'channels'}
              onToggle={() => toggleSection('channels')}
              content={
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-purple-50 border border-purple-300 p-4 rounded">
                    <p className="font-bold text-purple-900 mb-3">📱 פתיחה אונליין:</p>
                    <ul className="space-y-2 text-purple-800 text-sm">
                      <li>✓ למי שרוצה מהר</li>
                      <li>✓ למי שיודע מה הוא צריך</li>
                      <li>✓ תהליך דיגיטלי מלא + ליווי חכם</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-300 p-4 rounded">
                    <p className="font-bold text-green-900 mb-3">☎️ שיחה וליווי:</p>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>✓ למי שצריך הסבר</li>
                      <li>✓ למי שחושש</li>
                      <li>✓ למי שרוצה מישהו שילווה אותו יד־ביד</li>
                    </ul>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 11. איך יודעים שהצליחו */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="🎯 איך יודעים שהשיחה הצליחה?"
              isOpen={openSection === 'success'}
              onToggle={() => toggleSection('success')}
              content={
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-300 p-4 rounded">
                    <p className="font-bold text-red-900 mb-2">לא לפי:</p>
                    <p className="text-red-800">כמה דיברת</p>
                  </div>

                  <div className="bg-green-50 border border-green-300 p-4 rounded">
                    <p className="font-bold text-green-900 mb-3">כן לפי:</p>
                    <ul className="space-y-2 text-green-800 text-sm">
                      <li>✓ כמה הלקוח נרגע</li>
                      <li>✓ כמה הוא שאל</li>
                      <li>✓ האם הוא אמר: "טוב שיש מי שמטפל בזה"</li>
                      <li>✓ או: "זה נותן לי ביטחון"</li>
                    </ul>
                  </div>
                </div>
              }
            />
          </motion.div>

          {/* 12. משפט הזהב */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-yellow-900 to-orange-900 text-white p-8 rounded-lg border-2 border-yellow-600">
              <h3 className="text-xl font-bold mb-4">🧠 משפט הזהב לסיום שיחה</h3>
              <p className="text-lg italic">
                "המטרה שלנו היא שתוכל להתעסק בעסק שלך – ואנחנו נדאג לשקט, לסדר, וגם לעזור לך להתקדם."
              </p>
            </div>
          </motion.div>

          {/* 13. סיכום */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="📌 סיכום לנציג"
              isOpen={openSection === 'summary'}
              onToggle={() => toggleSection('summary')}
              content={
                <div className="space-y-4">
                  {[
                    {
                      icon: '🛡️',
                      text: 'אתה לא מוכר מוצר – אתה מוכר שקט'
                    },
                    {
                      icon: '🤝',
                      text: 'אתה לא רואה חשבון – אתה הפנים של הביטחון'
                    },
                    {
                      icon: '🧠',
                      text: 'הלקוח לא רוצה לדעת הכול – הוא רוצה לדעת שמישהו יודע'
                    },
                    {
                      icon: '🤖',
                      text: 'והיום – יש לו גם אפליקציה עם מלווה חכם שתמיד איתו'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-gray-300 p-4 rounded flex items-start gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-gray-800 font-bold">{item.text}</p>
                    </div>
                  ))}
                </div>
              }
            />
          </motion.div>

          {/* אמנה של סוכן */}
          <motion.div variants={itemVariants}>
            <CollapsibleSection
              title="⚡ אמנה של סוכן מכירות"
              isOpen={openSection === 'covenant'}
              onToggle={() => toggleSection('covenant')}
              content={
                <div className="space-y-3">
                  {[
                    '✓ אתה מקשיב יותר מדי מדברת',
                    '✓ אתה בונה אמון לפני מכירה',
                    '✓ אתה מודיע לראש הלקוח, לא לכיסו',
                    '✓ אתה מוגיד "שקט", "ביטחון", "ליווי" – לא "דוח", "חוק" או "טכני"',
                    '✓ אתה תמיד חוזר עם מסר אחד בלבד',
                    '✓ אתה לא משכנע – אתה מסביר'
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-green-300 p-3 rounded text-gray-800">
                      {item}
                    </div>
                  ))}
                </div>
              }
            />
          </motion.div>

        </motion.div>
      </section>
    </>
  );
}