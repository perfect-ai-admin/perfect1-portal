import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, TrendingUp, DollarSign, Users, Target, Briefcase, Rocket, Calculator } from 'lucide-react';
import PartnershipForm from '../components/partnership/PartnershipForm';
import Breadcrumbs from '../components/seo/Breadcrumbs';

export default function Partnership() {
  const [openStep, setOpenStep] = useState(null);

  const steps = [
    {
      number: 1,
      icon: <Target className="w-6 h-6" />,
      title: "המודל העסקי והפוטנציאל בשוק",
      color: "from-blue-600 to-blue-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">סקירת השוק בישראל</h3>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-4 md:p-6 rounded mb-6">
              <p className="text-base md:text-lg text-blue-900 leading-relaxed mb-4">
                בישראל יש <strong>כ-550,000 עצמאים ועסקים קטנים</strong> (עוסקים פטורים, מורשים, חברות בע"מ) שצריכים שירותי הנהלת חשבונות וייעוץ מס.
              </p>
              <div className="bg-white p-3 md:p-4 rounded-lg border-2 border-blue-300 mt-4">
                <p className="font-bold text-sm md:text-base text-blue-900 mb-3">📊 הפוטנציאל השנתי האמיתי - עסקים חדשים:</p>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">עוסקים פטורים</p>
                    <p className="text-xl md:text-3xl font-bold text-indigo-600">~80,000</p>
                    <p className="text-xs text-gray-500">נפתחים מדי שנה</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">עוסקים מורשים</p>
                    <p className="text-xl md:text-3xl font-bold text-teal-600">~15,000</p>
                    <p className="text-xs text-gray-500">נפתחים מדי שנה</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">חברות בע"מ</p>
                    <p className="text-xl md:text-3xl font-bold text-purple-600">~8,000</p>
                    <p className="text-xs text-gray-500">נפתחות מדי שנה</p>
                  </div>
                </div>
                <p className="text-blue-800 font-semibold mt-4 text-center text-sm md:text-base">
                  סה"כ פוטנציאל שנתי: <strong>~103,000 עסקים חדשים!</strong>
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">פילוח שוק היעד</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 md:p-6">
                <h4 className="font-bold text-base md:text-lg text-indigo-900 mb-3">עוסקים פטורים</h4>
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">~350,000</div>
                <p className="text-sm md:text-base text-gray-700 mb-4">מחזור עד 105k ₪ בשנה</p>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="text-xs md:text-sm font-semibold text-indigo-900">מחיר שירות ממוצע:</p>
                  <p className="text-xl md:text-2xl font-bold text-indigo-600">150-250 ₪/חודש</p>
                </div>
              </div>

              <div className="bg-white border-2 border-teal-200 rounded-lg p-4 md:p-6">
                <h4 className="font-bold text-base md:text-lg text-teal-900 mb-3">עוסקים מורשים</h4>
                <div className="text-2xl md:text-3xl font-bold text-teal-600 mb-2">~150,000</div>
                <p className="text-sm md:text-base text-gray-700 mb-4">מחזור מעל 105k ₪</p>
                <div className="bg-teal-50 p-3 rounded">
                   <p className="text-xs md:text-sm font-semibold text-teal-900">מחיר שירות ממוצע:</p>
                   <p className="text-xl md:text-2xl font-bold text-teal-600">350-500 ₪/חודש</p>
                 </div>
              </div>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-4 md:p-6">
                <h4 className="font-bold text-base md:text-lg text-purple-900 mb-3">חברות בע"מ</h4>
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">~50,000</div>
                <p className="text-sm md:text-base text-gray-700 mb-4">עסקים קטנים ובינוניים</p>
                <div className="bg-purple-50 p-3 rounded">
                   <p className="text-xs md:text-sm font-semibold text-purple-900">מחיר שירות ממוצע:</p>
                   <p className="text-xl md:text-2xl font-bold text-purple-600">1,200-3,000 ₪/חודש</p>
                 </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">המודל העסקי שלנו</h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
              <h4 className="font-bold text-xl text-green-900 mb-4">🎯 פוקוס: 3 קבוצות יעד מרכזיות</h4>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                   <p className="font-bold text-green-900 mb-2">1️⃣ עוסקים פטורים - הבסיס</p>
                   <p className="text-gray-700 text-sm">השוק הגדול ביותר (350k), נקודת כניסה נמוכה, צורך גבוה בשירות נגיש</p>
                   <p className="text-green-700 font-semibold mt-2">יעד: 500 לקוחות בשנה הראשונה</p>
                   <p className="text-green-600 text-sm mt-1">גידול של 500 לקוחות בכל שנה</p>
                 </div>

                <div className="bg-white p-4 rounded-lg border border-teal-200">
                   <p className="font-bold text-teal-900 mb-2">2️⃣ עוסקים מורשים - הצמיחה</p>
                   <p className="text-gray-700 text-sm">רווחיות גבוהה יותר, לקוחות יציבים, צורך במקצועיות</p>
                   <p className="text-teal-700 font-semibold mt-2">יעד: 300 לקוחות בשנה השנייה</p>
                 </div>

                <div className="bg-white p-4 rounded-lg border border-purple-200">
                   <p className="font-bold text-purple-900 mb-2">3️⃣ חברות בע"מ - הפרימיום</p>
                   <p className="text-gray-700 text-sm">רווחיות הכי גבוהה, שירות מקיף, נאמנות לקוח גבוהה</p>
                   <p className="text-purple-700 font-semibold mt-2">יעד: 70 לקוחות בשנה השניה</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">היתרון התחרותי שלנו</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3">💻 טכנולוגיה מתקדמת</h4>
                <ul className="space-y-2 text-blue-800">
                  <li>• פלטפורמה דיגיטלית מלאה</li>
                  <li>• בוט AI חכם זמין 24/7</li>
                  <li>• אוטומציה של תהליכים</li>
                  <li>• ממשק משתמש פשוט ונוח</li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-green-900 mb-3">🤝 שירות אישי ומקצועי</h4>
                <ul className="space-y-2 text-green-800">
                  <li>• רואי חשבון מוסמכים</li>
                  <li>• ליווי אישי צמוד</li>
                  <li>• מענה מהיר ואמין</li>
                  <li>• שקיפות מלאה</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🎯 המטרה</h3>
              <p className="text-xl leading-relaxed">
                להפוך לשירות המוביל בישראל לעצמאים וחברות קטנות - על ידי שילוב של <strong>טכנולוגיה מתקדמת</strong> 
                ו<strong>שירות אנושי מקצועי</strong>.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 2,
      icon: <Calculator className="w-6 h-6" />,
      title: "מודל הכנסות ורווחיות - 500 עוסקים פטורים",
      color: "from-green-600 to-green-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">תמחור השירותים</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-indigo-900 mb-3">עוסק פטור</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">ליווי חודשי</p>
                    <p className="text-2xl font-bold text-indigo-600">180 ₪</p>
                    <p className="text-xs text-gray-500 mt-1">ללא דוח שנתי</p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-teal-900 mb-3">עוסק מורשה</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">ליווי חודשי</p>
                    <p className="text-2xl font-bold text-teal-600">350 ₪</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">דוח שנתי</p>
                    <p className="text-2xl font-bold text-teal-600">1,200 ₪</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-purple-900 mb-3">חברה בע"מ</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">ליווי חודשי</p>
                    <p className="text-2xl font-bold text-purple-600">1,500 ₪</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">דוח שנתי</p>
                    <p className="text-2xl font-bold text-purple-600">8,000 ₪</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">פתיחת חברה</p>
                    <p className="text-2xl font-bold text-purple-600">3,500 ₪</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">תחזית שנה שניה - 500 עוסקים פטורים</h3>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-xl text-blue-900 mb-4">פילוח הכנסות חודשיות (ממוצע)</h4>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">ליווי חודשי (500 לקוחות × 180 ₪)</span>
                     <span className="text-2xl font-bold text-blue-600">90,000 ₪</span>
                   </div>
                   <p className="text-sm text-gray-600">בלבד</p>
                 </div>

                <div className="bg-blue-600 text-white p-4 rounded-lg">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">סה"כ הכנסות חודשיות:</span>
                     <span className="text-3xl font-bold">~90,000 ₪</span>
                   </div>
                 </div>

                 <div className="bg-green-600 text-white p-4 rounded-lg">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">סה"כ הכנסות שנתיות:</span>
                     <span className="text-3xl font-bold">~1,080,000 ₪</span>
                   </div>
                 </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מבנה העלויות (שנה ראשונה)</h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">פתיחת תיקים</p>
                    <p className="text-sm text-gray-600">500 תיקים × 70 ₪</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">35,000 ₪</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">אפליקציה (שנה ראשונה)</p>
                    <p className="text-sm text-gray-600">500 משתמשים × 18 ₪ × 12 חודשים</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">108,000 ₪</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">בוט וואטסאפ (שנה ראשונה)</p>
                    <p className="text-sm text-gray-600">500 משתמשים × 8 ₪ × 12 חודשים</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">48,000 ₪</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">הנהלת חשבונות</p>
                    <p className="text-sm text-gray-600">7,000 ₪ × 12 חודשים</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">84,000 ₪</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">מוקד מענה שאלות</p>
                    <p className="text-sm text-gray-600">8,000 ₪ × 12 חודשים</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">96,000 ₪</span>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">מנהל עבודה</p>
                    <p className="text-sm text-gray-600">8,000 ₪ × 12 חודשים</p>
                  </div>
                  <span className="text-xl font-bold text-red-600">96,000 ₪</span>
                </div>
              </div>

              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-red-900">סה"כ עלויות שנתיות:</span>
                  <span className="text-2xl font-bold text-red-600">467,000 ₪</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl">רווח תפעולי שנתי:</span>
                    <span className="text-3xl font-bold">~1,249,000 ₪</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/30 pt-3">
                    <span className="font-semibold">רווח לשותף (50/50):</span>
                    <span className="text-2xl font-bold">~624,500 ₪</span>
                  </div>
                  <p className="text-sm opacity-90 pt-2">* זה רק משנה ראשונה עם 500 עוסקים פטורים בלבד</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">💡 הערה חשובה</h3>
              <p className="text-lg leading-relaxed">
                זהו תרחיש שמרני עם <strong>500 עוסקים פטורים בלבד</strong>. כשנוסיף עוסקים מורשים וחברות - 
                הרווחיות גדלה משמעותית!
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 3,
      icon: <DollarSign className="w-6 h-6" />,
      title: "שנה שניה: המודל המלא משולב - 500 פטורים + 200 מורשים + 70 חברות",
      color: "from-purple-600 to-purple-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">שנה שנייה - המודל המלא משולב</h3>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-2xl text-purple-900 mb-4">📊 פילוח הכנסות חודשיות</h4>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-r-4 border-indigo-400">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">🟢 עוסקים פטורים (500 × 180 ₪)</span>
                     <span className="text-xl font-bold text-indigo-600">90,000 ₪</span>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg border-r-4 border-teal-400">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">🔵 עוסקים מורשים - ליווי (200 × 350 ₪)</span>
                     <span className="text-xl font-bold text-teal-600">70,000 ₪</span>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg border-r-4 border-teal-400">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">🔵 מורשים - דוחות שנתיים (200 × 1,200 / 12)</span>
                     <span className="text-xl font-bold text-teal-600">20,000 ₪</span>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg border-r-4 border-purple-400">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">🟣 חברות בע"מ - ליווי (70 × 2,000 ₪)</span>
                     <span className="text-xl font-bold text-purple-600">140,000 ₪</span>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg border-r-4 border-purple-400">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-gray-800">🟣 חברות - דוחות שנתיים (70 × 8,000 / 12)</span>
                     <span className="text-xl font-bold text-purple-600">46,667 ₪</span>
                   </div>
                 </div>

                 <div className="bg-purple-600 text-white p-4 rounded-lg">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">סה"כ הכנסות חודשיות:</span>
                     <span className="text-3xl font-bold">~371,667 ₪</span>
                   </div>
                 </div>

                 <div className="bg-green-600 text-white p-4 rounded-lg">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">סה"כ הכנסות שנתיות:</span>
                     <span className="text-3xl font-bold">~4,460,000 ₪</span>
                   </div>
                 </div>
               </div>
             </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
               <h4 className="font-bold text-lg text-yellow-900 mb-4">💰 מבנה עלויות שנה שנייה</h4>
               
               <div className="space-y-4">
                 <div className="bg-white p-4 rounded-lg">
                   <h5 className="font-bold text-gray-900 mb-3">1️⃣ עלויות קבועות חודשיות:</h5>
                   <div className="space-y-2 pl-4">
                     <div className="flex justify-between">
                       <span>משרה: שכירות + תשתיות</span>
                       <span className="font-bold">6,000 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span>ביטוחים ורישיונות</span>
                       <span className="font-bold">3,000 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span>ניהול וחשבונאות פנימית</span>
                       <span className="font-bold">8,000 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="font-semibold">סה"כ קבועות:</span>
                       <span className="font-bold">17,000 ₪</span>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">שנתי: 204,000 ₪</p>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg">
                   <h5 className="font-bold text-gray-900 mb-3">2️⃣ עלויות טכנולוגיה וניהול:</h5>
                   <div className="space-y-2 pl-4">
                     <div className="flex justify-between">
                       <span>אפליקציה (770 משתמשים × 15 ₪)</span>
                       <span className="font-bold">11,550 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span>בוט וואטסאפ (770 משתמשים × 8 ₪)</span>
                       <span className="font-bold">6,160 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span>מנהל עבודה + קול קנטר</span>
                       <span className="font-bold">57,983 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="font-semibold">סה"כ טכנולוגיה וניהול:</span>
                       <span className="font-bold">75,693 ₪</span>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">שנתי: 908,316 ₪</p>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg">
                   <h5 className="font-bold text-gray-900 mb-3">3️⃣ הנהלת חשבונות (35% מהכנסה מורשים וחברות):</h5>
                   <div className="space-y-2 pl-4">
                     <div className="flex justify-between text-sm text-gray-600">
                       <span>הכנסה מורשים (ליווי + דוחות):</span>
                       <span className="font-bold">1,080,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                       <span>הכנסה חברות (ליווי + דוחות):</span>
                       <span className="font-bold">2,240,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                       <span className="font-semibold">סה"כ להנהלה:</span>
                       <span className="font-bold">3,320,000 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2 mt-2">
                       <span className="font-semibold">הנהלה 35%:</span>
                       <span className="font-bold text-orange-600">1,162,000 ₪ שנתי</span>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">חודשי: 96,833 ₪</p>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg">
                   <h5 className="font-bold text-gray-900 mb-3">4️⃣ קול קנטר ותמיכה טלפונית:</h5>
                   <div className="space-y-2 pl-4">
                     <div className="flex justify-between text-sm text-gray-600">
                       <span>500 פטורים × 660 ₪ שנתי</span>
                       <span className="font-bold">330,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                       <span>200 מורשים × 660 ₪ שנתי</span>
                       <span className="font-bold">132,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm text-gray-600">
                       <span>70 חברות × 660 ₪ שנתי</span>
                       <span className="font-bold">46,200 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2 mt-2">
                       <span className="font-semibold">סה"כ קול קנטר:</span>
                       <span className="font-bold">508,200 ₪ שנתי</span>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">חודשי: 42,350 ₪</p>
                   </div>
                 </div>

                 <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mt-2">
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span>עלויות קבועות:</span>
                       <span className="font-bold">17,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span>עלויות טכנולוגיה וניהול:</span>
                       <span className="font-bold">75,693 ₪</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span>הנהלה (35%):</span>
                       <span className="font-bold">96,833 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="font-bold text-lg text-red-900">סה"כ עלויות חודשיות:</span>
                       <span className="text-2xl font-bold text-red-600">189,526 ₪</span>
                     </div>
                   </div>
                 </div>

                 <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-lg text-red-900">סה"כ עלויות שנתיות:</span>
                     <span className="text-2xl font-bold text-red-600">2,274,312 ₪</span>
                   </div>
                 </div>
               </div>
             </div>

             <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg">
               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-xl">רווח תפעולי חודשי:</span>
                   <span className="text-3xl font-bold">~181,141 ₪</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-bold text-xl">רווח תפעולי שנתי:</span>
                   <span className="text-3xl font-bold">~2,185,688 ₪</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-white/30 pt-3">
                   <span className="font-semibold text-xl">רווח לשותף (50/50):</span>
                   <span className="text-3xl font-bold">~1,092,844 ₪</span>
                 </div>
               </div>
             </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">צפי לשנים הבאות - גידול המערכת</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-lg border-l-4 border-indigo-400">
                   <div className="flex justify-between items-center mb-2">
                     <h5 className="font-bold text-indigo-900">שנה שלישית - כפול לקוחות</h5>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-700">גידול: <strong>500 → 1,000 פטורים | 200 → 400 מורשים | 70 → 140 חברות</strong></span>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-lg border-l-4 border-teal-400">
                   <div className="flex justify-between items-center mb-2">
                     <h5 className="font-bold text-teal-900">שנה רביעית - כפול 3 לקוחות</h5>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-700">גידול: <strong>500 → 1,500 פטורים | 200 → 600 מורשים | 70 → 210 חברות</strong></span>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">סיכום התחזית - שנה שניה עד רביעית</h3>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg p-6">
                <h4 className="font-bold text-2xl text-teal-900 mb-4">שנה שניה (בפועל)</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הרכב לקוחות:</p>
                    <p className="font-bold text-lg text-teal-700">500 פטורים + 200 מורשים + 70 חברות</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות חודשיות:</p>
                    <p className="font-bold text-2xl text-teal-600">~371,667 ₪</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות שנתיות:</p>
                    <p className="font-bold text-2xl text-teal-600">~4,460,000 ₪</p>
                  </div>
                  <div className="bg-teal-600 text-white p-4 rounded">
                    <p className="text-sm opacity-90 mb-1">רווח לשותף (50/50):</p>
                    <p className="font-bold text-3xl">~780,500 ₪</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-2xl text-blue-900 mb-4">שנה שלישית (כפול לקוחות)</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הרכב לקוחות:</p>
                    <p className="font-bold text-lg text-blue-700">1,000 פטורים + 400 מורשים + 140 חברות</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות חודשיות:</p>
                    <p className="font-bold text-2xl text-blue-600">~743,334 ₪</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות שנתיות:</p>
                    <p className="font-bold text-2xl text-blue-600">~8,920,000 ₪</p>
                  </div>
                  <div className="bg-blue-600 text-white p-4 rounded">
                    <p className="text-sm opacity-90 mb-1">רווח לשותף (50/50) בהנחת 35% רווח:</p>
                    <p className="font-bold text-3xl">~1,561,000 ₪</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-2xl text-purple-900 mb-4">שנה רביעית (כפול 3 לקוחות)</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הרכב לקוחות:</p>
                    <p className="font-bold text-lg text-purple-700">1,500 פטורים + 600 מורשים + 210 חברות</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות חודשיות:</p>
                    <p className="font-bold text-2xl text-purple-600">~1,115,001 ₪</p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">הכנסות שנתיות:</p>
                    <p className="font-bold text-2xl text-purple-600">~13,380,000 ₪</p>
                  </div>
                  <div className="bg-purple-600 text-white p-4 rounded">
                    <p className="text-sm opacity-90 mb-1">רווח לשותף (50/50) בהנחת 35% רווח:</p>
                    <p className="font-bold text-3xl">~2,341,500 ₪</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 4,
      icon: <TrendingUp className="w-6 h-6" />,
      title: "ביקוש שוק והערכת לידים חודשית",
      color: "from-orange-600 to-orange-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ביקוש שוק והערכת לידים חודשית</h3>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              הערכת ביקוש ריאלית מלידים אורגניים (SEO בלבד) לשלושה שירותים עיקריים בתחום הקמת עסקים בישראל:
            </p>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-indigo-900 mb-4">פתיחת עוסק פטור</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">נפח חיפושים חודשי מוערך:</p>
                    <p className="text-2xl font-bold text-indigo-600">3,500 – 5,500</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">לידים אורגניים בחודש (SEO):</p>
                    <p className="text-2xl font-bold text-indigo-600">180 – 450</p>
                  </div>
                  <div className="bg-indigo-100 border-r-4 border-indigo-600 p-3 rounded">
                    <p className="text-sm text-indigo-900"><strong>הערה:</strong> נפח גבוה, יזמים בתחילת הדרך, מנוע כניסה חזק לפאנל</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-teal-900 mb-4">פתיחת עוסק מורשה</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">נפח חיפושים חודשי מוערך:</p>
                    <p className="text-2xl font-bold text-teal-600">1,200 – 2,000</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">לידים אורגניים בחודש (SEO):</p>
                    <p className="text-2xl font-bold text-teal-600">70 – 200</p>
                  </div>
                  <div className="bg-teal-100 border-r-4 border-teal-600 p-3 rounded">
                    <p className="text-sm text-teal-900"><strong>הערה:</strong> כוונת רכישה גבוהה יותר, ערך לקוח מתמשך</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-purple-900 mb-4">פתיחת חברה בע״מ</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">נפח חיפושים חודשי מוערך:</p>
                    <p className="text-2xl font-bold text-purple-600">800 – 1,500</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-sm text-gray-600">לידים אורגניים בחודש (SEO):</p>
                    <p className="text-2xl font-bold text-purple-600">60 – 180</p>
                  </div>
                  <div className="bg-purple-100 border-r-4 border-purple-600 p-3 rounded">
                    <p className="text-sm text-purple-900"><strong>הערה:</strong> נפח נמוך יותר, לקוחות פרימיום, ערך חיי לקוח גבוה</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">סיכום אורגני חודשי</h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">סך חיפושים חודשיים:</span>
                    <span className="text-3xl font-bold text-orange-600">5,500 – 9,000</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">סך לידים אורגניים פוטנציאליים:</span>
                    <span className="text-3xl font-bold text-green-600">310 – 830</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">לקוחות אורגניים בחודש ללא פרסום ממומן</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🚀 תובנה למשקיעים</h3>
              <p className="text-lg leading-relaxed">
                באמצעות אסטרטגיית SEO ממוקדת ודפי נחיתה ייעודיים לכל סוג ישות, המערכת יכולה לייצר 
                <strong> מאות לידים איכותיים בחודש</strong> ללא תלות בפרסום ממומן, ולבנות <strong>מנוע צמיחה אורגני</strong>, 
                סקיילבילי ובעל יתרון תחרותי ארוך טווח. זו צמיחה בעלת עלות הזדמנות נמוכה וגרוע רווחיות גבוהה.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 5,
      icon: <Users className="w-6 h-6" />,
      title: "מבנה השותפות 50/50 ותפקידים",
      color: "from-teal-600 to-teal-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">חלוקת תפקידים ואחריות</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-blue-900 mb-4">👨‍💻 שותף A - טכנולוגיה ותשתית</h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-blue-900 mb-2">פיתוח ותחזוקה</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• הפלטפורמה הדיגיטלית</li>
                      <li>• בוט AI ואוטומציות</li>
                      <li>• ממשק משתמש</li>
                      <li>• שרתים ואבטחת מידע</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-blue-900 mb-2">שיווק דיגיטלי</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• ניהול קמפיינים</li>
                      <li>• SEO ותוכן</li>
                      <li>• רשתות חברתיות</li>
                      <li>• אתר ודפי נחיתה</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-blue-900 mb-2">אנליטיקה ומדידה</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• מעקב ביצועים</li>
                      <li>• דוחות ותובנות</li>
                      <li>• אופטימיזציה</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-green-900 mb-4">👔 שותף B - פעילות מקצועית</h4>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-green-900 mb-2">צוות מקצועי</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• גיוס רואי חשבון</li>
                      <li>• הכשרה וניהול</li>
                      <li>• בקרת איכות</li>
                      <li>• ייעוץ מקצועי</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-green-900 mb-2">מכירות ושירות</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• צוות נציגי מכירות</li>
                      <li>• שירות לקוחות</li>
                      <li>• תמיכה טלפונית</li>
                      <li>• חוויית לקוח</li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded">
                    <p className="font-semibold text-green-900 mb-2">תפעול ומשרד</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• ניהול יומיומי</li>
                      <li>• שכירות משרד</li>
                      <li>• רישוי וביטוחים</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מודל ההשקעה והמימון</h3>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded mb-6">
              <p className="text-lg text-blue-900 leading-relaxed">
                <strong>מודל המימון:</strong> ההשקעה היא בעובדים שינהלו את הלקוחות, יפתחו תיקים, ויטפלו בשירות השוטף. 
                אנחנו ממנים אותם ביחד בשותפות 50/50.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-xl text-yellow-900 mb-4">💰 איך זה עובד?</h4>

              <div className="bg-white border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <h5 className="font-bold text-lg text-yellow-900 mb-4">תקופות גבייה ראשונה לשותף A (שיווק)</h5>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded border-r-4 border-indigo-400">
                    <span className="font-semibold text-indigo-900">עוסק פטור:</span>
                    <span className="text-2xl font-bold text-indigo-600">12 חודשים</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-teal-50 rounded border-r-4 border-teal-400">
                    <span className="font-semibold text-teal-900">עוסק מורשה:</span>
                    <span className="text-2xl font-bold text-teal-600">9 חודשים</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded border-r-4 border-purple-400">
                    <span className="font-semibold text-purple-900">חברה בע"מ:</span>
                    <span className="text-2xl font-bold text-purple-600">6 חודשים</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-r-4 border-orange-500">
                  <p className="font-bold text-orange-900 mb-2">עלויות תפעול שנה ראשונה</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>הנהלת חשבונות:</span>
                      <span className="font-bold">84,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>מוקד מענה:</span>
                      <span className="font-bold">96,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>מנהל עבודה:</span>
                      <span className="font-bold">96,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>אפליקציה:</span>
                      <span className="font-bold">108,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>בוט וואטסאפ:</span>
                      <span className="font-bold">48,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>פתיחת תיקים:</span>
                      <span className="font-bold">35,000 ₪</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>סה"כ:</span>
                      <span className="text-red-600">467,000 ₪</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t-2 border-orange-200">
                    <p className="font-semibold text-orange-800">דמי ניהול לשותף B (פיקוח): 8,000 ₪ / חודש = 96,000 ₪ שנתי</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-5 rounded-lg">
                  <p className="font-bold text-xl mb-3">חישוב השקעה לשותף:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>חלק בעלויות שנה ראשונה (50%):</span>
                      <span className="font-bold">233,500 ₪</span>
                    </div>
                    <div className="flex justify-between border-t border-white/30 pt-2">
                      <span className="font-bold text-lg">סה"כ השקעה נדרשת לשותף:</span>
                      <span className="text-3xl font-bold">~234,000 ₪</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <h4 className="font-bold text-xl text-green-900 mb-4">📊 התמונה הכוללת - שנה ראשונה</h4>
              <p className="text-gray-700 text-sm mb-4">בשנה הראשונה עולויות גיוס הלקוחות גבוהות. כל שותף משקיע בשנה הראשונה:</p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border-r-4 border-red-400">
                  <div className="flex justify-between">
                    <span className="font-semibold">השקעה של כל שותף:</span>
                    <span className="font-bold text-red-600">250,000 ₪</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">כיסוי 50% מעלויות גיוס הלקוחות</p>
                </div>
                <div className="bg-white p-4 rounded">
                  <div className="flex justify-between">
                    <span className="font-semibold">סה"כ השקעה לחברה:</span>
                    <span className="font-bold text-orange-600">500,000 ₪</span>
                  </div>
                </div>
                <div className="bg-orange-100 border-r-4 border-orange-500 p-4 rounded">
                  <p className="text-orange-900 font-semibold">⚠️ בשנה הראשונה אין רווח - כל ההכנסות הולכות לעלויות גיוס הלקוחות</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">החזר השקעה (ROI)</h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              בשנה הראשונה אנחנו משקיעים בגיוס לקוחות. החזר ההשקעה מתחיל בשנה השניה כאשר לקוחות מתחילים להתחייב לתקופות ארוכות יותר.
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-r-4 border-teal-400">
                  <p className="font-semibold text-gray-800 mb-3">שנה שניה - החזר מלא</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">הכנסות מלקוחות מתמשכים:</span>
                      <span className="font-bold">1,080,000 ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">עלויות:</span>
                      <span className="font-bold">563,500 ₪</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">רווח:</span>
                      <span className="font-bold text-green-600">516,500 ₪</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">לכל שותף (50%):</span>
                      <span className="font-bold text-green-600">258,250 ₪</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-3">✓ החזר השקעה + רווח משמעותי</p>
                </div>

                <div className="bg-white p-4 rounded-lg border-r-4 border-blue-400">
                   <p className="font-semibold text-gray-800 mb-3">שנה שלישית - תיק קיים (500 פטורים)</p>
                   <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                       <span className="text-gray-600">הכנסות מתיק קיים:</span>
                       <span className="font-bold">1,080,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>(500 פטורים בלבד - אותו תיק כשנה שניה)</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="text-gray-600">הוצאות שנתיות:</span>
                       <span className="font-bold">467,000 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="font-semibold">רווח:</span>
                       <span className="font-bold text-blue-600">613,000 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold">לכל שותף (50%):</span>
                       <span className="font-bold text-blue-600">306,500 ₪</span>
                     </div>
                     <p className="text-xs text-blue-700 mt-2">רווחיות: 57% (ללא גיוס חדש)</p>
                   </div>
                 </div>

                 <div className="bg-white p-4 rounded-lg border-r-4 border-purple-400">
                   <p className="font-semibold text-gray-800 mb-3">שנה רביעית - תיק קיים (500 פטורים)</p>
                   <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                       <span className="text-gray-600">הכנסות מתיק קיים:</span>
                       <span className="font-bold">1,080,000 ₪</span>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500">
                       <span>(500 פטורים בלבד - אותו תיק כשנים קודמות)</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="text-gray-600">הוצאות שנתיות:</span>
                       <span className="font-bold">467,000 ₪</span>
                     </div>
                     <div className="flex justify-between border-t pt-2">
                       <span className="font-semibold">רווח:</span>
                       <span className="font-bold text-purple-600">613,000 ₪</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="font-semibold">לכל שותף (50%):</span>
                       <span className="font-bold text-purple-600">306,500 ₪</span>
                     </div>
                     <p className="text-xs text-purple-700 mt-2">רווחיות: 57% (ללא גיוס חדש)</p>
                   </div>
                 </div>

                 <div className="bg-green-100 border-r-4 border-green-600 p-4 rounded-lg mt-4">
                   <p className="text-sm text-green-900 font-semibold mb-2">✓ מודל בר-קיימא</p>
                   <p className="text-sm text-green-900 leading-relaxed">
                     כל שנה מתיק הלקוחות שנבנה בשנה הראשונה ממשיך להניב הכנסות. העלויות נשארות נמוכות יחסית כיוון שאין גיוס לקוחות חדש. הרווחיות עולה עם סקיילוג התיק.
                   </p>
                 </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">קבלת החלטות</h3>
            <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded">
                  <h5 className="font-bold text-purple-900 mb-2">החלטות יומיומיות</h5>
                  <p className="text-gray-700 text-sm">כל שותף מנהל את תחומי האחריות שלו באופן עצמאי</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <h5 className="font-bold text-purple-900 mb-2">החלטות אסטרטגיות</h5>
                  <p className="text-gray-700 text-sm">החלטות גדולות (השקעות, שינויים מבניים) - בהסכמה משותפת</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <h5 className="font-bold text-purple-900 mb-2">פיצול רווחים</h5>
                  <p className="text-gray-700 text-sm">חלוקה שווה 50/50 מדי רבעון</p>
                </div>

                <div className="bg-white p-4 rounded">
                  <h5 className="font-bold text-purple-900 mb-2">מנגנון פתרון סכסוכים</h5>
                  <p className="text-gray-700 text-sm">בוררות מוסכמת במקרה של אי-הסכמה</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">💼 שותפות פעילה - לא השקעה פסיבית</h3>
              <p className="text-lg leading-relaxed">
                זו <strong>שותפות אקטיבית</strong> שבה כל שותף תורם את המומחיות שלו ומשקיע זמן ומאמץ. 
                זו לא השקעה פיננסית בלבד - זו בניית עסק משותף שמתבסס על החוזקות של שני השותפים.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 6,
      icon: <Briefcase className="w-6 h-6" />,
      title: "שווי החברה ופוטנציאל יציאה",
      color: "from-indigo-600 to-indigo-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">שווי החברה לפי כפולות רווח</h3>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded mb-6">
              <p className="text-lg text-blue-900 leading-relaxed mb-3">
                <strong>חברות SaaS ושירותים פיננסיים</strong> נסחרות בכפולות של 3-8 מהרווח השנתי, תלוי בצמיחה ויציבות.
              </p>
              <p className="text-blue-800">
                נניח כפולה שמרנית של <strong>×5</strong> מהרווח התפעולי השנתי.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">תרחישי שווי</h3>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-green-900 mb-4">📊 סוף שנה 1 - 500 עוסקים פטורים</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">רווח תפעולי שנתי:</span>
                      <span className="text-xl font-bold text-green-600">300,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">כפולת שווי (×5):</span>
                      <span className="text-2xl font-bold text-green-600">1,500,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-green-600 text-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">שווי לשותף (50%):</span>
                      <span className="text-3xl font-bold">750,000 ₪</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-teal-900 mb-4">📊 סוף שנה 2 - 500 פטורים + 200 מורשים + 70 חברות</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">הכנסות שנתיות:</span>
                      <span className="text-xl font-bold text-teal-600">4,460,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">רווח תפעולי שנתי:</span>
                      <span className="text-xl font-bold text-teal-600">1,561,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">כפולת שווי (×5):</span>
                      <span className="text-2xl font-bold text-teal-600">7,805,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-teal-600 text-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">שווי לשותף (50%):</span>
                      <span className="text-3xl font-bold">3,902,500 ₪</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-purple-900 mb-4">📊 סוף שנה 3 - (1,000 פטורים + 400 מורשים + 140 חברות)</h4>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">הכנסות שנתיות:</span>
                      <span className="text-xl font-bold text-purple-600">8,920,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">רווח תפעולי שנתי (35% רווחיות):</span>
                      <span className="text-xl font-bold text-purple-600">3,122,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">כפולת שווי (×5):</span>
                      <span className="text-2xl font-bold text-purple-600">15,610,000 ₪</span>
                    </div>
                  </div>
                  <div className="bg-purple-600 text-white p-4 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">שווי לשותף (50%):</span>
                      <span className="text-3xl font-bold">7,805,000 ₪</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">תרחיש אופטימי - 5 שנים</h3>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-lg p-6">
            <h4 className="font-bold text-xl text-orange-900 mb-4">🚀 צמיחה מואצת - שנה 4 (כפול 3 לקוחות)</h4>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">עוסקים פטורים</p>
                <p className="text-3xl font-bold text-indigo-600">1,500</p>
              </div>
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">עוסקים מורשים</p>
                <p className="text-3xl font-bold text-teal-600">600</p>
              </div>
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">חברות בע"מ</p>
                <p className="text-3xl font-bold text-purple-600">210</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">הכנסות שנתיות:</span>
                  <span className="text-2xl font-bold text-orange-600">13,200,000 ₪</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">רווח תפעולי שנתי:</span>
                  <span className="text-2xl font-bold text-orange-600">9,000,000 ₪</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">כפולת שווי (×7 - חברה מבוססת):</span>
                  <span className="text-2xl font-bold text-orange-600">63,000,000 ₪</span>
                </div>
              </div>
              <div className="bg-orange-600 text-white p-5 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xl">שווי לשותף (50%):</span>
                  <span className="text-4xl font-bold">31,500,000 ₪</span>
                </div>
              </div>
            </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">אסטרטגיות יציאה אפשריות</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-green-900 mb-3">🏦 מכירה לרשת רו"ח גדולה</h4>
                <p className="text-gray-700 text-sm mb-4">
                  רשתות חשבונאיות מעוניינות לרכוש טכנולוגיה ותיק לקוחות מבוסס
                </p>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-green-900">זמן צפוי:</p>
                  <p className="text-green-700">3-5 שנים</p>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3">💼 מכירה לקרן השקעות</h4>
                <p className="text-gray-700 text-sm mb-4">
                  קרנות פרייבט אקוויטי מחפשות עסקים רווחיים עם צמיחה יציבה
                </p>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-blue-900">זמן צפוי:</p>
                  <p className="text-blue-700">4-6 שנים</p>
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-purple-900 mb-3">🔄 מכירה חלקית</h4>
                <p className="text-gray-700 text-sm mb-4">
                  מכירת 30-40% למשקיע אסטרטגי והמשך ניהול העסק
                </p>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-purple-900">זמן צפוי:</p>
                  <p className="text-purple-700">2-4 שנים</p>
                </div>
              </div>

              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-orange-900 mb-3">📈 IPO / מיזוג</h4>
                <p className="text-gray-700 text-sm mb-4">
                  הנפקה לציבור או מיזוג עם חברה ציבורית בתחום
                </p>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-orange-900">זמן צפוי:</p>
                  <p className="text-orange-700">5-7 שנים</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">💰 סיכום פוטנציאל יציאה</h3>
            <div className="space-y-3">
              <p className="text-lg">
                <strong>שנה 2:</strong> שווי לשותף ~3.9 מיליון ₪ | רווח שנתי: 1.56 מיליון ₪
              </p>
              <p className="text-lg">
                <strong>שנה 3:</strong> שווי לשותף ~7.7 מיליון ₪ | רווח שנתי: 3.08 מיליון ₪ (35% רווחיות)
              </p>
              <p className="text-lg">
                <strong>שנה 4:</strong> שווי לשותף ~31.5 מיליון ₪ | רווח שנתי: 4.5 מיליון ₪
              </p>
            </div>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 7,
      icon: <Rocket className="w-6 h-6" />,
      title: "השלבים הבאים וסגירת השותפות",
      color: "from-red-600 to-red-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">תהליך הצטרפות לשותפות</h3>
            <div className="space-y-4">
              <div className="bg-white border-r-4 border-blue-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">פגישת היכרות ראשונית</h4>
                    <p className="text-gray-700">דיון על החזון, היכולות, והציפיות המשותפות</p>
                    <p className="text-blue-600 font-semibold mt-2">משך: 1-2 שעות</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-green-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">הצגת מודל עסקי מפורט</h4>
                    <p className="text-gray-700">מצגת מלאה + דו"חות כספיים + תוכנית עבודה</p>
                    <p className="text-green-600 font-semibold mt-2">משך: 2-3 שעות</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-purple-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">בדיקת נאותות (Due Diligence)</h4>
                    <p className="text-gray-700">בדיקה הדדית של יכולות, נכסים קיימים, והתאמה</p>
                    <p className="text-purple-600 font-semibold mt-2">משך: 1-2 שבועות</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-orange-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">ניסוח הסכם שותפות</h4>
                    <p className="text-gray-700">הסכם משפטי מפורט המגדיר זכויות, חובות, ומנגנוני יציאה</p>
                    <p className="text-orange-600 font-semibold mt-2">משך: 1-2 שבועות</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-teal-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">חתימה והשקעה</h4>
                    <p className="text-gray-700">חתימה על ההסכם והעברת ההשקעה הראשונית</p>
                    <p className="text-teal-600 font-semibold mt-2">משך: יום אחד</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-white text-green-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    6
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">התחלת הפעילות!</h4>
                    <p className="text-lg">גיוס צוות, השקת פלטפורמה, תחילת שיווק</p>
                    <p className="font-semibold mt-2 text-yellow-300">זמן להשקה מלאה: 3-4 חודשים</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מה כלול בהסכם השותפות?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3">📋 סעיפים עיקריים</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>חלוקת בעלות 50/50</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>תפקידים ואחריות של כל שותף</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>מנגנון קבלת החלטות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>חלוקת רווחים והפסדים</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>זכויות קניין רוחני</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-purple-900 mb-3">🚪 מנגנוני יציאה</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>זכות סירוב ראשונה (Right of First Refusal)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>שיטת הערכת שווי במכירה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>תנאי פירוק שותפות</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>בוררות במקרה של מחלוקת</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>הגנות ואי-תחרות</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מה אנחנו מחפשים בשותף?</h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg text-yellow-900 mb-3">💼 מקצועיות</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• ניסיון בחשבונאות / רו"ח</li>
                    <li>• יכולת ניהול צוות</li>
                    <li>• מוניטין מקצועי</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-yellow-900 mb-3">🚀 יזמות</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• חשיבה עסקית</li>
                    <li>• נכונות לקחת סיכונים מחושבים</li>
                    <li>• רצון לבנות משהו גדול</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-yellow-900 mb-3">🤝 התאמה אישית</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• ערכים משותפים</li>
                    <li>• תקשורת פתוחה</li>
                    <li>• אמון הדדי</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-yellow-900 mb-3">💪 מחויבות</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• השקעת זמן ומשאבים</li>
                    <li>• חשיבה לטווח ארוך</li>
                    <li>• נכונות לעבודה קשה</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">שאלות נפוצות לפני החתימה</h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-gray-900 mb-2">מה קורה אם אחד מאיתנו רוצה לצאת?</h5>
                <p className="text-gray-700 text-sm">
                  ההסכם כולל מנגנון ברור: השותף השני מקבל זכות סירוב ראשונה לרכוש את החלק, 
                  או שנמכור יחד לצד שלישי. השווי נקבע לפי הערכה מוסכמת.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-gray-900 mb-2">מה אם אין הסכמה על החלטה חשובה?</h5>
                <p className="text-gray-700 text-sm">
                  מנגנון בוררות מוסכם יפתור מחלוקות. בנוסף, ההסכם מגדיר אילו החלטות דורשות הסכמה ואילו ניתן לקבל באופן עצמאי.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-gray-900 mb-2">האם אני חייב לעבוד במשרה מלאה?</h5>
                <p className="text-gray-700 text-sm">
                  כן, זו שותפות פעילה. שני השותפים מחויבים לתרום זמן ומאמץ משמעותי. 
                  עם זאת, ניתן להתאים את השעות לפי צרכים אישיים, בתנאי שהתוצאות מושגות.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h5 className="font-bold text-gray-900 mb-2">מתי נתחיל לראות רווחים?</h5>
                <p className="text-gray-700 text-sm">
                  על פי התחזית, רווח משמעותי יתחיל מסוף השנה הראשונה. בחודשים הראשונים ההשקעה תלך על בניית התשתית והצוות.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-10 rounded-lg text-center">
              <h3 className="text-3xl font-bold mb-6">🚀 מוכנים לבנות ביחד?</h3>
              <p className="text-xl mb-8 leading-relaxed">
                זו הזדמנות לבנות חברה מובילה בתחום הפיננסי-דיגיטלי בישראל, 
                עם פוטנציאל רווח של מאות אלפי שקלים בשנה ושווי של מיליוני שקלים בעתיד.
              </p>
              <div className="bg-white/20 p-6 rounded-lg inline-block">
                <p className="text-2xl font-bold mb-2">הצעד הבא:</p>
                <p className="text-lg">מלא את הטופס למטה ונתאם פגישה ראשונית</p>
              </div>
            </div>
          </section>
        </div>
      )
    }
  ];

  return (
    <>
      <Helmet>
        <title>שותפות עסקית 50/50 במיזם פיננסי | Perfect One</title>
        <meta name="description" content="הצעת שותפות אסטרטגית 50/50 במיזם פיננסי מבוסס טכנולוגיה. 500 עוסקים פטורים בשנה ראשונה, הכנסות של מיליוני שקלים ופוטנציאל יציאה משמעותי" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-12 md:py-20 min-h-screen flex items-center" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
          <Breadcrumbs 
            items={[
              { label: 'בית', url: 'Home' },
              { label: 'שותפות עסקית' }
            ]}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mt-16 space-y-6"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent">
              שותפות עסקית 50/50
            </h1>
            <p className="text-xl md:text-3xl font-bold text-cyan-300">במיזם פיננסי מוביל בישראל</p>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
            <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              מדריך מקיף ב-7 שלבים | חישובים מפורטים | תחזיות ריאליות | פוטנציאל יציאה משמעותי
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white" dir="rtl">
        <div className="space-y-4 md:space-y-6">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.number * 0.1 }}
            >
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white">
                <button
                  onClick={(e) => {
                    setOpenStep(openStep === step.number ? null : step.number);
                    if (openStep !== step.number) {
                      setTimeout(() => {
                        e.target.closest('.rounded-2xl').scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }}
                  className={`w-full bg-gradient-to-r ${step.color} text-white p-6 md:p-8 flex items-start md:items-center justify-between hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-white/25 rounded-full flex items-center justify-center flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-semibold opacity-90">שלב {step.number}</p>
                      <p className="text-sm md:text-lg font-bold leading-tight">{step.title}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 md:w-6 h-5 md:h-6 transition-transform duration-300 flex-shrink-0 ml-2`}
                    style={{ transform: openStep === step.number ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                
                {openStep === step.number && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100"
                  >
                    {step.content}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-16 md:py-24" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-4"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">
              מוכנים להתחיל? 🚀
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
            <p className="text-lg md:text-xl text-gray-300">
              מלאו את הטופס ונקבע פגישה לדיון בעומק
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl"
          >
            <PartnershipForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}