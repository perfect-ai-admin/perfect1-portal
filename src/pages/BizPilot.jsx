import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, ArrowLeft, MessageCircle, TrendingUp, Target, Users, Zap, Shield, Calendar, BarChart3, DollarSign, Lightbulb } from 'lucide-react';

export default function BizPilot() {
  return (
    <>
      <Helmet>
        <title>BizPilot - יועץ עסקי חכם שמנהל לך את העסק | Perfect One</title>
        <meta name="description" content="מערכת AI אחת שמלווה אותך כעצמאי: מדווחת, מסבירה, מזכירה, מנתחת – ועוזרת לך להרוויח יותר. עסק מסודר בלי לרדוף אחרי רואה חשבון ויועצים." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                יועץ עסקי חכם<br />שמנהל לך את העסק
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-3 font-medium">
                מיסים, מכירות וצמיחה
              </p>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
                מערכת AI אחת שמלווה אותך כעצמאי:<br />
                מדווחת, מסבירה, מזכירה, מנתחת – ועוזרת לך להרוויח יותר.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to={createPageUrl('Contact')}>
                  <Button 
                    size="lg" 
                    className="h-16 px-10 text-xl font-bold rounded-full bg-[#27AE60] hover:bg-[#2ECC71] text-white shadow-2xl animate-pulse-glow"
                  >
                    🟢 קבל הדגמה עכשיו
                    <ArrowLeft className="mr-2 w-6 h-6" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* הבעיה */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-8 text-center">
                עצמאי = הכל עליך. וזה מתיש.
              </h2>
              
              <div className="space-y-5 mb-8">
                {[
                  'לא בטוח מה הוצאה ומה לא',
                  'מפחד לפספס דיווח או לשלם קנס',
                  'לא יודע למה העסק לא גדל',
                  'מדבר עם רו״ח, יועץ, משווק – ואין תמונה אחת',
                  'הכול בראש. הכול דחוף.'
                ].map((problem, index) => (
                  <div key={index} className="flex items-start gap-4 bg-red-50 rounded-xl p-5 border-r-4 border-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2.5 flex-shrink-0" />
                    <p className="text-lg text-gray-800 font-medium">{problem}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border-2 border-orange-200">
                <p className="text-xl text-gray-800 font-semibold text-center">
                  רוב העצמאים לא נכשלים – הם פשוט עובדים <span className="text-orange-600">בלי מערכת חכמה</span> שמלווה אותם.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* הפתרון */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-6 text-center">
                המערכת שפועלת כמו שותף עסקי חכם
              </h2>
              
              <div className="bg-white rounded-3xl shadow-xl p-10 space-y-6">
                <p className="text-xl text-gray-800 leading-relaxed">
                  <span className="font-bold text-[#1E3A5F]">זה לא עוד תוכנה.</span><br />
                  <span className="font-bold text-[#1E3A5F]">וזה לא צ'אט נחמד.</span>
                </p>
                
                <p className="text-xl text-gray-800 leading-relaxed">
                  זו <span className="text-[#27AE60] font-bold text-2xl">מערכת AI</span> שמבינה:
                </p>

                <div className="space-y-4 pr-6">
                  {[
                    'איפה העסק שלך עומד',
                    'מה צריך לקרות עכשיו',
                    'ומי (או מה) צריך לפעול'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <CheckCircle className="w-8 h-8 text-[#27AE60] flex-shrink-0" />
                      <p className="text-xl text-gray-800 font-medium">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 mt-8">
                  <p className="text-2xl text-[#1E3A5F] font-bold text-center">
                    והכול – בשיחה אחת פשוטה.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* איך זה עובד */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-12 text-center">
                איך זה עובד? פשוט.
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 text-center relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                    1
                  </div>
                  <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-6 mt-4" />
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">
                    אתה מדבר איתה
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    בוואטסאפ / מערכת אחת<br />
                    (שאלות, מסמכים, התלבטויות)
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 text-center relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                    2
                  </div>
                  <Zap className="w-16 h-16 text-purple-600 mx-auto mb-6 mt-4" />
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">
                    המערכת פועלת
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p>✓ עונה</p>
                    <p>✓ מחשבת</p>
                    <p>✓ בודקת</p>
                    <p>✓ מזכירה</p>
                    <p>✓ ומפעילה את המודול הנכון</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 text-center relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                    3
                  </div>
                  <Target className="w-16 h-16 text-green-600 mx-auto mb-6 mt-4" />
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">
                    אתה מקבל
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-2">
                    <p>✓ תשובה ברורה</p>
                    <p>✓ פעולה אחת</p>
                    <p>✓ או החלטה חכמה</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 font-medium">
                    בלי בלגן. בלי לרדוף.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* מה המערכת עושה */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-12 text-center">
                כל מה שעסק קטן צריך – במקום אחד
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* מיסים ודיווחים */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F]">🧾 מיסים ודיווחים</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>מע״מ, מס הכנסה, מקדמות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>בדיקות חכמות לפני דיווח</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>סימולציות מס</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>תשובות מקצועיות מיידיות</span>
                    </li>
                  </ul>
                </div>

                {/* ניהול עסקי */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F]">💼 ניהול עסקי</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>הבנת הרווחיות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>זיהוי צווארי בקבוק</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>ניתוח מה עובד ומה לא</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>יעדים חודשיים ברורים</span>
                    </li>
                  </ul>
                </div>

                {/* שיווק ומכירות */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F]">📈 שיווק ומכירות</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>איפה להביא לקוחות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>תסריטי שיחה</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>טיפול בהתנגדויות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>פוקוס על ערוץ אחד שעובד</span>
                    </li>
                  </ul>
                </div>

                {/* סדר ותפעול */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E3A5F]">🛠 סדר ותפעול</h3>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>ניהול עומס</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>סדר יום פשוט</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>חיבור ליומן ולכלים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>פחות כאוס, יותר שליטה</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link to={createPageUrl('Contact')}>
                  <Button 
                    size="lg" 
                    className="h-14 px-10 text-lg font-bold rounded-full bg-[#27AE60] hover:bg-[#2ECC71]"
                  >
                    אני רוצה את זה
                    <ArrowLeft className="mr-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* למה זה שונה */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-12 text-center">
                זה לא רואה חשבון. וזה לא יועץ.
              </h2>

              <div className="space-y-6">
                <div className="bg-red-50 rounded-2xl p-6 border-r-4 border-red-400">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">❌</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">רו״ח</h3>
                      <p className="text-gray-700">מדווח בדיעבד</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border-r-4 border-red-400">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">❌</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">יועץ</h3>
                      <p className="text-gray-700">מדבר פעם בחודש</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-2xl p-6 border-r-4 border-red-400">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">❌</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">תוכנה</h3>
                      <p className="text-gray-700">נותנת כפתורים</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-4 border-green-400 shadow-xl mt-8">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">✅</div>
                    <div>
                      <h3 className="text-2xl font-black text-[#1E3A5F] mb-4">המערכת שלנו:</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <p className="text-lg font-medium text-gray-800">חיה איתך ביום־יום</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <p className="text-lg font-medium text-gray-800">יוזמת ולא רק מגיבה</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <p className="text-lg font-medium text-gray-800">מחברת בין כסף, החלטות וצמיחה</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <p className="text-lg font-medium text-gray-800">ויודעת מתי לעצור ולהעביר לאדם</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* למי זה מתאים */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-12 text-center">
                אם אתה עצמאי – זה בשבילך
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    מתאים למי:
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      <span>עוסק פטור / מורשה</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      <span>נותני שירות</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      <span>פרילנסרים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      <span>בעלי עסקים קטנים</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      <span>מי שרוצה סדר, ביטחון וצמיחה</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    לא מתאים למי:
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✖</span>
                      <span>מחפש "טריק מהיר"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">✖</span>
                      <span>לא רוצה לנהל עסק בצורה רצינית</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA סופי */}
        <section className="py-24 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                רוצה לנהל עסק חכם –<br />בלי להחזיק הכל בראש?
              </h2>
              
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="h-16 px-12 text-xl font-bold rounded-full bg-[#27AE60] hover:bg-[#2ECC71] text-white shadow-2xl animate-pulse-glow mb-6"
                >
                  🟢 קבל גישה / הדגמה למערכת
                  <ArrowLeft className="mr-2 w-6 h-6" />
                </Button>
              </Link>

              <p className="text-white/80 text-lg">
                בלי התחייבות. בלי בלבול. פשוט לראות אם זה מתאים.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}