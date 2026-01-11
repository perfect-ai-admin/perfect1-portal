import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ChevronDown, Target, Brain, Package, Phone, Shield, CheckCircle, Award } from 'lucide-react';

export default function SalesAgentHandbook() {
  const [openStep, setOpenStep] = useState(null);

  const steps = [
    {
      number: 1,
      icon: <Target className="w-6 h-6" />,
      title: "הכרת הלקוח והתפקיד שלך",
      color: "from-blue-600 to-blue-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מטרת התפקיד שלך</h3>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded mb-6">
              <p className="text-lg font-bold text-blue-900 mb-3">הנקודה החשובה ביותר:</p>
              <p className="text-blue-800 text-lg leading-relaxed">
                אתה לא מוכר מוצר טכני. אתה נותן לאנשים <strong>שקט נפשי, ביטחון כלכלי וראש שקט</strong> מול הרשויות – 
                וגם כיוון ברור וחכם לפיתוח העסק שלהם.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מי הוא הלקוח שלך?</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">הפרופיל הטיפוסי:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">•</span>
                    <div>
                      <p className="font-semibold">עצמאי קטן/בינוני</p>
                      <p className="text-sm text-gray-600">מחזור של 0-500k בשנה</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">•</span>
                    <div>
                      <p className="font-semibold">מקצועות נפוצים</p>
                      <p className="text-sm text-gray-600">שליח, פרילנסר, מעצבת, קוסמטיקאית, מאפרת, מנהלת רשתות, מאמן כושר</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl">•</span>
                    <div>
                      <p className="font-semibold">גיל 22-45</p>
                      <p className="text-sm text-gray-600">דור שמחפש פתרונות דיגיטליים ומהירים</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-red-900 mb-4">הכאבים והפחדים שלו:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">מפחד מטעויות</p>
                      <p className="text-sm text-red-800">"מה אם אעשה משהו לא נכון וזה יעלה לי קנס?"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">לא מבין מס</p>
                      <p className="text-sm text-red-800">"מה ההבדל בין עוסק פטור למורשה? מתי אני צריך לדווח?"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">לא אוהב בירוקרטיה</p>
                      <p className="text-sm text-red-800">"אני רק רוצה לעבוד, לא להתעסק עם ניירת"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">מרגיש לבד</p>
                      <p className="text-sm text-red-800">"אין לי עם מי להתייעץ, אני לא יודע אם אני עושה נכון"</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">חושש מקנסות</p>
                      <p className="text-sm text-red-800">"שמעתי שמקבלים קנסות על דברים קטנים"</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מה הלקוח באמת מחפש?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-red-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">❌</span> הוא לא מחפש:
                </h4>
                <ul className="space-y-2 text-red-800">
                  <li>• רואה חשבון קלאסי</li>
                  <li>• מישהו שידבר איתו בשפה טכנית</li>
                  <li>• פתרון יקר ומסובך</li>
                  <li>• שירות שיגיד לו "עשה את זה בעצמך"</li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-green-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">✅</span> הוא כן מחפש:
                </h4>
                <ul className="space-y-2 text-green-800">
                  <li>• מישהו שיטפל בכל הבירוקרטיה בשבילו</li>
                  <li>• מישהו שייתן לו שקט נפשי</li>
                  <li>• כתובת אחת לכל שאלה</li>
                  <li>• מישהו שיגיד לו מה הצעד הבא בעסק</li>
                  <li>• פתרון זמין 24/7</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">💡 התפקיד שלך במשפט אחד:</h3>
              <p className="text-xl leading-relaxed">
                לגרום לו להרגיש ש<strong>הוא לא לבד</strong>, ושיש לו <strong>מערכת חכמה + אנשים אמיתיים</strong> 
                שמנהלים אותו נכון, דוחפים אותו קדימה, וזמינים לו תמיד.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">הפסיכולוגיה של הלקוח</h3>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <p className="text-gray-800 leading-relaxed mb-4">
                <strong>חשוב להבין:</strong> הלקוח שלך לא קם בבוקר וחיפש "דוח שנתי". 
                הוא חיפש דרך להירגע, לדעת שהוא מוגן, ולהרגיש שמישהו שומר עליו.
              </p>
              <p className="text-gray-800 leading-relaxed">
                כשאתה מדבר איתו – אל תמכור לו שירות טכני. תן לו הרגשה שסוף־סוף יש לו מישהו שבצד שלו.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 2,
      icon: <Brain className="w-6 h-6" />,
      title: "איך לחשוב נכון כמוכר",
      color: "from-purple-600 to-purple-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">החשיבה הנכונה</h3>
            <div className="bg-purple-50 border-r-4 border-purple-600 p-6 rounded mb-6">
              <p className="text-lg text-purple-900 leading-relaxed">
                המכירה הטובה ביותר היא כזו שבה הלקוח מרגיש שהבנת אותו, שאכפת לך ממנו, 
                ושהפתרון שלך ייתן לו בדיוק מה שהוא צריך – <strong>שקט, ביטחון וכיוון</strong>.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">השפה הנכונה</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-red-900 mb-4 flex items-center gap-2">
                  ❌ לעולם אל תגיד:
                </h4>
                <ul className="space-y-4">
                  <li className="border-b border-red-200 pb-3">
                    <p className="font-semibold text-red-900">"אנחנו מוכרים דוח שנתי"</p>
                    <p className="text-sm text-red-700 mt-1">למה לא? זה טכני, זה לא מעניין אותו, זה לא מדבר לכאב שלו</p>
                  </li>
                  <li className="border-b border-red-200 pb-3">
                    <p className="font-semibold text-red-900">"אנחנו עושים הנהלת חשבונות"</p>
                    <p className="text-sm text-red-700 mt-1">למה לא? הלקוח לא מחפש "הנהלת חשבונות", הוא מחפש שקט</p>
                  </li>
                  <li className="border-b border-red-200 pb-3">
                    <p className="font-semibold text-red-900">"זה עולה X שקלים"</p>
                    <p className="text-sm text-red-700 mt-1">למה לא? אתה מוכר מחיר, לא ערך</p>
                  </li>
                  <li>
                    <p className="font-semibold text-red-900">"זה חובה לדווח"</p>
                    <p className="text-sm text-red-700 mt-1">למה לא? אתה מפחיד אותו במקום לעזור לו</p>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2">
                  ✅ תמיד תגיד:
                </h4>
                <ul className="space-y-4">
                  <li className="border-b border-green-200 pb-3">
                    <p className="font-semibold text-green-900">"אנחנו לוקחים אחריות"</p>
                    <p className="text-sm text-green-700 mt-1">למה? זה נותן לו ביטחון שמישהו דואג</p>
                  </li>
                  <li className="border-b border-green-200 pb-3">
                    <p className="font-semibold text-green-900">"אנחנו דואגים שלא תסתבך"</p>
                    <p className="text-sm text-green-700 mt-1">למה? זה פותר את הכאב הכי גדול שלו</p>
                  </li>
                  <li className="border-b border-green-200 pb-3">
                    <p className="font-semibold text-green-900">"אתה עובד – אנחנו מול הרשויות"</p>
                    <p className="text-sm text-green-700 mt-1">למה? זה נותן לו חופש להתמקד במה שהוא אוהב</p>
                  </li>
                  <li>
                    <p className="font-semibold text-green-900">"יש לך ליווי חכם שזמין לך כל הזמן"</p>
                    <p className="text-sm text-green-700 mt-1">למה? זה מראה לו שהוא לא לבד</p>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">עקרונות יסוד במכירה</h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">1️⃣</span> תקשיב יותר מדי שאתה מדבר
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  אל תזרוק על הלקוח את כל המידע. תן לו לדבר, תשאל שאלות, תבין מה באמת מפריע לו. 
                  הלקוח צריך להרגיש שהבנת אותו – לא שניסית למכור לו.
                </p>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">2️⃣</span> דבר בשפה שלו, לא בשפה מקצועית
                </h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  אם הוא לא יודע מה זה "מע״מ תשומות" – אל תסביר לו. תגיד לו שאתה דואג שהוא לא ישלם יותר מדי מס.
                </p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600"><strong>דוגמה:</strong></p>
                  <p className="text-sm text-red-700 line-through mt-1">"אנחנו נטפל בדוח תקופתי ובדוח שנתי"</p>
                  <p className="text-sm text-green-700 mt-1">✅ "אנחנו דואגים שכל הדיווחים יהיו בזמן, ואתה לא תקבל קנס"</p>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">3️⃣</span> בנה אמון לפני מכירה
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  אל תנסה לסגור עסקה בשיחה הראשונה. תן לו להרגיש שאתה כאן בשבילו, לא רק בשביל העסקה. 
                  שאל שאלות, תן טיפים, הראה שאכפת לך.
                </p>
              </div>

              <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">4️⃣</span> דבר לראש שלו, לא לכיס שלו
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  אם אתה מדבר רק על מחיר, אתה הופך את השירות למוצר. תדבר על מה שהוא מקבל – 
                  שקט, ביטחון, מישהו שדואג לו, כיוון בעסק.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🧠 זכור תמיד:</h3>
              <p className="text-xl leading-relaxed">
                אתה לא רואה חשבון. אתה לא טכנאי. <strong>אתה הפנים של הביטחון.</strong>
              </p>
              <p className="text-lg mt-4">
                הלקוח לא קונה "דוח שנתי" – הוא קונה את ההרגשה שסוף־סוף יש לו מישהו שדואג לו.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 3,
      icon: <Package className="w-6 h-6" />,
      title: "המוצרים והשירותים שלנו",
      color: "from-green-600 to-green-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מה אנחנו מוכרים?</h3>
            <div className="bg-blue-50 border-r-4 border-blue-600 p-6 rounded mb-6">
              <p className="text-xl font-bold text-blue-900 mb-3">ההגדרה הנכונה של השירות:</p>
              <p className="text-lg text-blue-800 leading-relaxed">
                <strong>שירות ניהול וליווי חכם לעצמאי – שקט מול הרשויות וכיוון קדימה בעסק</strong>
              </p>
              <p className="text-blue-700 mt-3">
                זה לא סתם "דוח שנתי" – זה מערכת שלמה שדואגת שהלקוח יהיה מסודר, מוגן, ויתקדם.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">המוצרים שלנו (בפירוט)</h3>
            
            {/* פתיחת עוסק פטור */}
            <div className="mb-8 bg-white border-2 border-blue-300 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h4 className="text-xl font-bold">1. פתיחת עוסק פטור</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>למי זה מתאים:</strong> עצמאים עם מחזור עד 105k בשנה (שליחים, פרילנסרים, נותני שירות)
                </p>
                
                <div className="bg-blue-50 p-4 rounded">
                  <p className="font-bold text-blue-900 mb-2">מה כלול:</p>
                  <ul className="space-y-2 text-blue-800">
                    <li>• פתיחת תיק במס הכנסה</li>
                    <li>• רישום בביטוח לאומי</li>
                    <li>• הנפקת חשבוניות מס ראשונות</li>
                    <li>• ליווי צמוד בכל התהליך</li>
                    <li>• גישה לאפליקציה עם מלווה חכם</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <p className="font-bold text-green-900 mb-2">איך להציג את זה:</p>
                  <p className="text-green-800 italic">
                    "אנחנו פותחים לך את התיק בצורה נכונה מהפעם הראשונה, ככה שלא יהיו בעיות אחר־כך. 
                    אתה מקבל גם מלווה חכם שיענה לך על כל שאלה לאורך הדרך."
                  </p>
                </div>
              </div>
            </div>

            {/* ליווי חודשי */}
            <div className="mb-8 bg-white border-2 border-green-300 rounded-lg overflow-hidden">
              <div className="bg-green-600 text-white p-4">
                <h4 className="text-xl font-bold">2. ליווי חודשי לעוסק פטור</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>למי זה מתאים:</strong> מי שכבר פתח תיק ורוצה שמישהו ידאג לכל ההתנהלות השוטפת
                </p>
                
                <div className="bg-green-50 p-4 rounded">
                  <p className="font-bold text-green-900 mb-2">מה כלול:</p>
                  <ul className="space-y-2 text-green-800">
                    <li>• ניהול קבלות והוצאות</li>
                    <li>• תזכורות לתשלומים</li>
                    <li>• מעקב אחרי תקרת הכנסות</li>
                    <li>• דיווחים לביטוח לאומי</li>
                    <li>• מלווה חכם זמין 24/7</li>
                    <li>• ייעוץ והכוונה לצמיחה</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded">
                  <p className="font-bold text-green-900 mb-2">איך להציג את זה:</p>
                  <p className="text-green-800 italic">
                    "זה כמו שיש לך צוות שלם שדואג לך. אתה עובד, ואנחנו דואגים שכל הדיווחים יהיו בזמן, 
                    שלא תחרוג מתקרה, ושתמיד תדע מה המצב שלך. ויש לך גם מלווה חכם שתוכל לשאול אותו כל דבר, בכל זמן."
                  </p>
                </div>
              </div>
            </div>

            {/* דוח שנתי */}
            <div className="mb-8 bg-white border-2 border-purple-300 rounded-lg overflow-hidden">
              <div className="bg-purple-600 text-white p-4">
                <h4 className="text-xl font-bold">3. דוח שנתי לעוסק פטור</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>למי זה מתאים:</strong> מי שמחפש רק טיפול בדוח השנתי (לא מומלץ – כי בלי ליווי שוטף יש סיכון לטעויות)
                </p>
                
                <div className="bg-purple-50 p-4 rounded">
                  <p className="font-bold text-purple-900 mb-2">מה כלול:</p>
                  <ul className="space-y-2 text-purple-800">
                    <li>• הכנת הדוח השנתי</li>
                    <li>• הגשה למס הכנסה</li>
                    <li>• חישוב המס לתשלום</li>
                    <li>• ייעוץ על הפחתות</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded">
                  <p className="font-bold text-orange-900 mb-2">⚠️ חשוב לציין:</p>
                  <p className="text-orange-800">
                    "רוב הבעיות קורות בדיעבד – כשמגיעים לדוח ורואים שהיו טעויות כל השנה. 
                    אם אתה רוצה להיות ממש רגוע, כדאי ליווי חודשי שדואג לך כל הזמן."
                  </p>
                </div>
              </div>
            </div>

            {/* אפליקציה */}
            <div className="mb-8 bg-white border-2 border-orange-300 rounded-lg overflow-hidden">
              <div className="bg-orange-600 text-white p-4">
                <h4 className="text-xl font-bold">4. אפליקציה עם מלווה חכם</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>הערך המוסף הגדול שלנו:</strong> זה לא רק אפליקציה – זה "חבר עסקי" שזמין תמיד
                </p>
                
                <div className="bg-orange-50 p-4 rounded">
                  <p className="font-bold text-orange-900 mb-3">מה המלווה החכם עושה:</p>
                  <ul className="space-y-2 text-orange-800">
                    <li>• עונה על שאלות על מסים בשפה פשוטה</li>
                    <li>• נותן טיפים לחיסכון במס</li>
                    <li>• מסביר מה לעשות בכל מצב</li>
                    <li>• עוזר לתכנן צעדים קדימה בעסק</li>
                    <li>• זמין 24/7 – אפילו בשבת בלילה</li>
                  </ul>
                </div>

                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded mb-4">
                  <p className="font-bold text-red-900 mb-2">❌ לעולם אל תגיד:</p>
                  <ul className="space-y-1 text-red-800">
                    <li>• "יש לנו ChatBot"</li>
                    <li>• "זה בינה מלאכותית"</li>
                    <li>• "זה AI"</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded">
                  <p className="font-bold text-green-900 mb-2">✅ תמיד תגיד:</p>
                  <p className="text-green-800 italic">
                    "יש לך מלווה חכם שמכיר עצמאים, מכיר את החוקים, ויכול לעזור לך בכל שאלה – בכל זמן. 
                    זה כמו שיש לך יועץ פרטי שזמין לך גם בשבת בלילה."
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded mt-4">
                  <p className="font-bold text-purple-900 mb-2">💡 למה זה חזק במיוחד?</p>
                  <p className="text-purple-800">
                    כי רוב העצמאים עובדים לבד. אין להם עם מי להתייעץ. הם לא יודעים אם הם עושים נכון. 
                    המלווה החכם פותר את הבדידות הזו – הוא שם בשבילם תמיד.
                  </p>
                </div>
              </div>
            </div>

            {/* עוסק מורשה */}
            <div className="mb-8 bg-white border-2 border-indigo-300 rounded-lg overflow-hidden">
              <div className="bg-indigo-600 text-white p-4">
                <h4 className="text-xl font-bold">5. פתיחה וניהול עוסק מורשה</h4>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  <strong>למי זה מתאים:</strong> מי שחרג מתקרת 105k או מי שצריך להוציא חשבוניות מס עם מע״מ
                </p>
                
                <div className="bg-indigo-50 p-4 rounded">
                  <p className="font-bold text-indigo-900 mb-2">מה כלול:</p>
                  <ul className="space-y-2 text-indigo-800">
                    <li>• פתיחת תיק עוסק מורשה</li>
                    <li>• רישום במע״מ</li>
                    <li>• דיווחי מע״מ דו־חודשיים</li>
                    <li>• ניהול הנהלת חשבונות מלאה</li>
                    <li>• דוח שנתי ומקדמות מס</li>
                    <li>• ליווי צמוד + מלווה חכם</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
                  <p className="font-bold text-yellow-900 mb-2">⚠️ חשוב להסביר:</p>
                  <p className="text-yellow-800">
                    "עוסק מורשה זה יותר מסובך מעוסק פטור, אבל אנחנו דואגים לכל ההתנהלות בשבילך. 
                    אתה לא צריך להבין מע״מ או דיווחים – אנחנו עושים הכול."
                  </p>
                </div>
              </div>
            </div>

          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">💡 הנקודה החשובה:</h3>
              <p className="text-xl leading-relaxed">
                אל תמכור "מוצרים". תמכור <strong>פתרון לבעיה</strong>. הלקוח לא רוצה "דוח שנתי" – 
                הוא רוצה לישון בלילה בלי לחשוב על מסים.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 4,
      icon: <Phone className="w-6 h-6" />,
      title: "תסריט שיחה ושאלות",
      color: "from-orange-600 to-orange-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">פתיחת שיחה נכונה</h3>
            <div className="bg-orange-50 border-r-4 border-orange-600 p-6 rounded mb-6">
              <p className="text-lg font-bold text-orange-900 mb-3">הפתיחה שלך קובעת הכול</p>
              <p className="text-orange-800 leading-relaxed">
                אל תזרוק מידע. אל תנסה למכור מהר. תתחיל בלגרום ללקוח להרגיש שאתה כאן בשבילו.
              </p>
            </div>

            <div className="bg-blue-100 border-2 border-blue-400 p-6 rounded-lg mb-6">
              <p className="font-bold text-blue-900 mb-3">📞 הפתיחה המומלצת:</p>
              <p className="text-blue-800 italic text-lg leading-relaxed">
                "היי [שם], תודה שפנית אלינו! אני כאן כדי להבין איפה אתה היום עם העסק, 
                ואיך אנחנו יכולים לקחת ממך גם את ההתעסקות מול הרשויות וגם לעזור לך לבנות את העסק בצורה חכמה יותר."
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">השאלות שאתה חייב לשאול</h3>
            
            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <p className="font-bold text-lg text-gray-900 mb-3">1️⃣ "אתה עוסק פטור או מורשה?"</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2"><strong>למה חשוב:</strong></p>
                  <p className="text-gray-700">כדי להבין איזה שירות מתאים לו</p>
                </div>
                <div className="bg-blue-50 p-4 rounded mt-3">
                  <p className="text-sm text-blue-600 mb-2"><strong>אם הוא לא יודע:</strong></p>
                  <p className="text-blue-800">"בסדר גמור, אני אעזור לך להבין. בוא נתחיל מהמחזור שלך בשנה – בערך כמה?"</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <p className="font-bold text-lg text-gray-900 mb-3">2️⃣ "כבר פתחת תיק או שעדיין לא?"</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2"><strong>למה חשוב:</strong></p>
                  <p className="text-gray-700">כדי לדעת אם הוא צריך פתיחה או ליווי שוטף</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <p className="font-bold text-lg text-gray-900 mb-3">3️⃣ "יש מישהו שמטפל לך במסים היום?"</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2"><strong>למה חשוב:</strong></p>
                  <p className="text-gray-700">כדי להבין אם הוא לבד או שיש לו מישהו (ולמה הוא מחפש משהו אחר)</p>
                </div>
                <div className="bg-green-50 p-4 rounded mt-3">
                  <p className="text-sm text-green-600 mb-2"><strong>אם הוא אומר "כן":</strong></p>
                  <p className="text-green-800">"אוקיי, ומה גרם לך לחפש משהו אחר? מה חסר לך שם?"</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <p className="font-bold text-lg text-gray-900 mb-3">4️⃣ "מה הכי מלחיץ אותך בהתנהלות מול הרשויות?"</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2"><strong>למה חשוב:</strong></p>
                  <p className="text-gray-700">זו השאלה הכי חשובה! כאן הוא אומר לך מה הכאב האמיתי שלו</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded mt-3">
                  <p className="text-sm text-yellow-600 mb-2"><strong>דוגמאות לתשובות:</strong></p>
                  <ul className="space-y-1 text-yellow-800 text-sm">
                    <li>• "אני מפחד שאני עושה טעויות"</li>
                    <li>• "אני לא יודע אם אני בסדר"</li>
                    <li>• "אין לי זמן להתעסק עם זה"</li>
                    <li>• "אני חושש שאחרוג מהתקרה"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <p className="font-bold text-lg text-gray-900 mb-3">5️⃣ "איפה היית רוצה שהעסק שלך יהיה עוד שנה?"</p>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600 mb-2"><strong>למה חשוב:</strong></p>
                  <p className="text-gray-700">כדי להראות לו שאתה לא רק דואג לניירת – אתה גם עוזר לו לצמוח</p>
                </div>
                <div className="bg-purple-50 p-4 rounded mt-3">
                  <p className="text-sm text-purple-600 mb-2"><strong>איך להמשיך מכאן:</strong></p>
                  <p className="text-purple-800">"מעולה! חלק ממה שאנחנו עושים זה לא רק לדאוג למסים – אלא גם לעזור לך להגיע לשם. יש לנו מלווה חכם שעוזר לתכנן את הצעדים הבאים."</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">עקרונות בשיחה</h3>
            <div className="space-y-4">
              <div className="bg-red-50 border-r-4 border-red-500 p-6 rounded">
                <p className="font-bold text-red-900 mb-3">⚠️ חשוב מאוד:</p>
                <p className="text-red-800 text-lg">
                  <strong>תקשיב. אל תמכור עדיין.</strong>
                </p>
                <p className="text-red-700 mt-2">
                  בשלב הזה אתה אוסף מידע ומבנה אמון, לא סוגר עסקה. אם תנסה למכור מהר – תאבד אותו.
                </p>
              </div>

              <div className="bg-green-50 border-r-4 border-green-500 p-6 rounded">
                <p className="font-bold text-green-900 mb-3">✅ מה לעשות:</p>
                <ul className="space-y-2 text-green-800">
                  <li>• הראה שאתה מבין אותו</li>
                  <li>• חזור על מה שהוא אמר ("אז מה ששמעתי זה ש...")</li>
                  <li>• תן לו להרגיש שאתה בצד שלו</li>
                  <li>• הצע פתרון רק אחרי שהבנת את הכאב</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">💬 משפט סיום לשלב השאלות:</h3>
              <p className="text-xl leading-relaxed italic">
                "תודה שפתחת איתי. עכשיו אני מבין בדיוק איפה אתה ומה אתה צריך. 
                בוא אסביר לך איך אנחנו יכולים לעזור לך להיות רגוע ולהתקדם."
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 5,
      icon: <Shield className="w-6 h-6" />,
      title: "התנגדויות ותשובות",
      color: "from-red-600 to-red-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">איך לטפל בהתנגדויות</h3>
            <div className="bg-red-50 border-r-4 border-red-600 p-6 rounded mb-6">
              <p className="text-lg text-red-900 leading-relaxed">
                <strong>זכור:</strong> התנגדות זה לא "לא". זה "אני עדיין לא משוכנע" או "אני צריך עוד הסבר". 
                אל תיתפס למגננה – תקשיב, תבין, ותן מענה אמיתי.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">ההתנגדויות הנפוצות ואיך לטפל בהן</h3>
            
            <div className="space-y-6">
              {/* התנגדות 1 */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-red-100 p-4 border-b-2 border-gray-300">
                  <p className="font-bold text-xl text-red-900">❓ "אני יכול לעשות את זה לבד"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-700 mb-2"><strong>מה הוא באמת אומר:</strong></p>
                    <p className="text-yellow-800">"אני לא רוצה לשלם על משהו שאני חושב שאני יכול לעשות"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2"><strong>✅ התשובה הנכונה:</strong></p>
                    <p className="text-green-900 leading-relaxed">
                      "אתה לגמרי צודק – טכנית אפשר לעשות את זה לבד. השאלה היא האם <strong>שווה לקחת את הסיכון</strong>. 
                      גם לנהוג בלי ביטוח אפשר, אבל אם קורה משהו – זה עולה הרבה יותר. 
                      הרבה לקוחות שלנו באו אלינו בדיוק אחרי שעשו טעות קטנה שעלתה להם אלפי שקלים. 
                      ומעבר לזה – יש לך אצלנו גם מלווה חכם זמין לך 24/7, שזה משהו שאתה לא מקבל כשאתה לבד."
                    </p>
                  </div>
                </div>
              </div>

              {/* התנגדות 2 */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-red-100 p-4 border-b-2 border-gray-300">
                  <p className="font-bold text-xl text-red-900">❓ "זה יקר לי"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-700 mb-2"><strong>מה הוא באמת אומר:</strong></p>
                    <p className="text-yellow-800">"אני לא רואה את הערך"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2"><strong>✅ התשובה הנכונה:</strong></p>
                    <p className="text-green-900 leading-relaxed">
                      "אני מבין לגמרי. בוא נשים את זה בפרופורציה: טעות אחת במסים יכולה לעלות לך <strong>5,000-10,000 ש״ח בקנס</strong>. 
                      חריגה מתקרה בלי לדעת? עוד אלפים. כאן אתה משלם על <strong>שקט, ביטחון וליווי</strong> – 
                      לא רק על 'דוח'. אתה מקבל מישהו שדואג לך כל הזמן, 
                      ועוד מלווה חכם שיכול לעזור לך לחסוך במס ולהתקדם בעסק. זה לא הוצאה – זה השקעה בשקט שלך."
                    </p>
                  </div>
                </div>
              </div>

              {/* התנגדות 3 */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-red-100 p-4 border-b-2 border-gray-300">
                  <p className="font-bold text-xl text-red-900">❓ "אני קטן, לא צריך"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-700 mb-2"><strong>מה הוא באמת אומר:</strong></p>
                    <p className="text-yellow-800">"אני חושב שזה רק לעסקים גדולים"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2"><strong>✅ התשובה הנכונה:</strong></p>
                    <p className="text-green-900 leading-relaxed">
                      "דווקא להפך! עסקים קטנים מסתבכים <strong>הכי מהר</strong>, כי אין להם עם מי להתייעץ. 
                      הם לא יודעים מה מותר ומה אסור, מתי לדווח, איך לנהל נכון. 
                      וברגע שיש טעות – זה הופך למשהו גדול. אנחנו דואגים שתהיה מסודר מההתחלה, 
                      ויש לך גם מלווה חכם שיכול לענות לך על כל שאלה – בלי לחכות לרו״ח."
                    </p>
                  </div>
                </div>
              </div>

              {/* התנגדות 4 */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-red-100 p-4 border-b-2 border-gray-300">
                  <p className="font-bold text-xl text-red-900">❓ "אני צריך לחשוב על זה"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-700 mb-2"><strong>מה הוא באמת אומר:</strong></p>
                    <p className="text-yellow-800">"אני עדיין לא משוכנע" או "אני רוצה לבדוק עוד אפשרויות"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2"><strong>✅ התשובה הנכונה:</strong></p>
                    <p className="text-green-900 leading-relaxed">
                      "בטח! זה החלטה חשובה ואני לגמרי מבין. רק חשוב לי שתדע ש<strong>כל חודש בלי ניהול וליווי מסודר</strong> 
                      יכול לייצר בעיות אחורה – וזה בדיוק מה שאנחנו מונעים. 
                      אם תרצה, אני יכול לשלוח לך סיכום של מה שדיברנו ושתחזור אליי עם כל שאלה. 
                      ויש לי עוד שאלה – מה בדיוק אתה צריך לחשוב עליו? אולי אני יכול לעזור?"
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded mt-4">
                    <p className="text-sm text-blue-700 mb-2"><strong>💡 טיפ חשוב:</strong></p>
                    <p className="text-blue-800">
                      אל תלחץ. אם הוא רוצה לחשוב – תן לו. אבל נסה להבין <strong>מה מעכב אותו</strong>. 
                      לפעמים זו שאלה פשוטה שאתה יכול לענות עליה עכשיו.
                    </p>
                  </div>
                </div>
              </div>

              {/* התנגדות 5 */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-red-100 p-4 border-b-2 border-gray-300">
                  <p className="font-bold text-xl text-red-900">❓ "יש לי כבר רואה חשבון"</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-yellow-50 p-4 rounded">
                    <p className="text-sm text-yellow-700 mb-2"><strong>מה הוא באמת אומר:</strong></p>
                    <p className="text-yellow-800">"למה שאחליף?"</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2"><strong>✅ התשובה הנכונה:</strong></p>
                    <p className="text-green-900 leading-relaxed">
                      "זה מעולה! אבל תגיד לי – יש לך אצלו גם <strong>מלווה חכם שזמין לך 24/7</strong>? 
                      מישהו שאתה יכול לשאול אותו שאלה בשבת בלילה? 
                      אנחנו לא מחליפים רואה חשבון – אנחנו נותנים לך <strong>ליווי שוטף ותמיכה שוטפת</strong>, 
                      לא רק פעם בשנה. אם הרו״ח שלך עושה עבודה טובה, אתה יכול אפילו לשמור אותו ולקבל מאיתנו את הליווי החכם היומיומי."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">עקרונות לטיפול בהתנגדויות</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded">
                <p className="font-bold text-blue-900 mb-2">1. אל תתווכח</p>
                <p className="text-blue-800">אם הלקוח אומר "זה יקר" – אל תגיד "זה לא יקר". תסכים איתו ותסביר את הערך.</p>
              </div>

              <div className="bg-green-50 border-r-4 border-green-500 p-6 rounded">
                <p className="font-bold text-green-900 mb-2">2. הבן מה באמת מפריע לו</p>
                <p className="text-green-800">לפעמים "זה יקר" אומר "אני לא רואה את הערך". שאל: "מה מעכב אותך?"</p>
              </div>

              <div className="bg-purple-50 border-r-4 border-purple-500 p-6 rounded">
                <p className="font-bold text-purple-900 mb-2">3. תן דוגמאות אמיתיות</p>
                <p className="text-purple-800">"היה לנו לקוח ששילם 8,000 ש״ח קנס כי לא ידע שחרג מהתקרה"</p>
              </div>

              <div className="bg-orange-50 border-r-4 border-orange-500 p-6 rounded">
                <p className="font-bold text-orange-900 mb-2">4. אל תלחץ</p>
                <p className="text-orange-800">אם הוא צריך לחשוב – תן לו. מכירה בלחץ = לקוח לא מרוצה.</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🧠 זכור:</h3>
              <p className="text-xl leading-relaxed">
                התנגדות זה לא סוף המשחק. זו הזדמנות להבין יותר טוב מה הלקוח צריך ולעזור לו להגיע להחלטה נכונה.
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 6,
      icon: <CheckCircle className="w-6 h-6" />,
      title: "סגירת עסקה",
      color: "from-green-600 to-green-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">איך לסגור את העסקה</h3>
            <div className="bg-green-50 border-r-4 border-green-600 p-6 rounded mb-6">
              <p className="text-lg text-green-900 leading-relaxed">
                <strong>נקודה חשובה:</strong> עסקה טובה היא כזו שבה הלקוח <strong>מרגיש טוב</strong> עם ההחלטה. 
                אם הוא מרגיש לחוץ או שאתה דחפת אותו – זה לא ינצח לטווח ארוך.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">איך יודעים שהגיע הזמן לסגור?</h3>
            
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
              <p className="font-bold text-blue-900 mb-4">🎯 סימנים שהלקוח מוכן:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-blue-900">הוא שואל שאלות על הפרטים</p>
                    <p className="text-sm text-blue-700">"איך זה עובד בדיוק?", "מתי אני מתחיל?"</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-blue-900">הוא אומר משהו חיובי</p>
                    <p className="text-sm text-blue-700">"זה נשמע טוב", "זה בדיוק מה שאני צריך"</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-blue-900">הוא נרגע</p>
                    <p className="text-sm text-blue-700">אתה רואה שהוא פחות מתוח, יותר פתוח</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-blue-900">הוא שואל על מחיר</p>
                    <p className="text-sm text-blue-700">"כמה זה עולה?", "איך משלמים?"</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">איך לסגור נכון?</h3>
            
            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">שלב 1: סיכום מה שדיברתם</h4>
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-blue-900 mb-3"><strong>תגיד משהו כזה:</strong></p>
                  <p className="text-blue-800 italic">
                    "אוקיי, אז אם אני מבין נכון – אתה צריך מישהו שייקח ממך את כל ההתעסקות מול הרשויות, 
                    ידאג שלא תסתבך, ויהיה זמין לך בכל זמן לכל שאלה. נכון?"
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded mt-4">
                  <p className="text-green-700 text-sm"><strong>למה זה חשוב:</strong></p>
                  <p className="text-green-800 text-sm">כדי שהלקוח ירגיש שהבנת אותו, ושאתה לא מוכר לו משהו אחר</p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">שלב 2: הצגת הפתרון</h4>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-purple-900 mb-3"><strong>תגיד משהו כזה:</strong></p>
                  <p className="text-purple-800 italic">
                    "מעולה! אז מה שאנחנו מציעים לך זה [שם המוצר] – 
                    זה כולל ליווי שוטף מול כל הרשויות, מלווה חכם שזמין לך 24/7, 
                    ודאגה שתהיה תמיד מסודר וגם תתקדם בעסק. זה בדיוק מה שחיפשת, נכון?"
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">שלב 3: להציג את המחיר (בצורה נכונה)</h4>
                
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded mb-4">
                  <p className="font-bold text-red-900 mb-2">❌ אל תגיד:</p>
                  <p className="text-red-800 italic">"זה עולה 2,000 ש״ח"</p>
                  <p className="text-red-700 text-sm mt-2">למה לא? כי אתה הופך את השירות למחיר</p>
                </div>

                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded">
                  <p className="font-bold text-green-900 mb-2">✅ תגיד:</p>
                  <p className="text-green-800 italic">
                    "זה ליווי מלא שנותן לך שקט מול הרשויות, מלווה חכם זמין 24/7, 
                    ומישהו שחושב איתך על העסק. ההשקעה היא 150 ש״ח + מע״מ בחודש, לשנה – 
                    פחות ממנה אחת במסעדה, ובתמורה אתה מקבל שקט נפשי שלם."
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">שלב 4: סגירה רכה</h4>
                <div className="bg-orange-50 p-4 rounded">
                  <p className="text-orange-900 mb-3"><strong>תגיד משהו כזה:</strong></p>
                  <p className="text-orange-800 italic">
                    "אז מה אתה אומר? בוא נתחיל לדאוג לך, ואתה תוכל להתמקד בעבודה שלך בלי לדאוג מהרשויות."
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">מה לעשות אחרי הסגירה?</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-3">1️⃣ חיזוק ההחלטה</h4>
                <p className="text-blue-800">
                  "החלטה מעולה! אני כבר שולח לך את הפרטים למייל. 
                  תוך 24 שעות אנחנו מתחילים לדאוג לך."
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-3">2️⃣ הסבר את השלבים הבאים</h4>
                <p className="text-green-800">
                  "עכשיו מה שקורה: תקבל מייל עם כל הפרטים ולינק לאפליקציה. 
                  תכנס, תמלא כמה פרטים, ואנחנו כבר מתחילים לטפל בהכול. 
                  אם יש לך שאלות בדרך – המלווה החכם זמין לך, או שאתה מתקשר אליי."
                </p>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <h4 className="font-bold text-purple-900 mb-3">3️⃣ תן לו ביטחון</h4>
                <p className="text-purple-800">
                  "אתה עשית החלטה נכונה. מהיום אתה לא לבד בזה – אנחנו איתך."
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">🎯 משפט הזהב לסיום:</h3>
              <p className="text-xl leading-relaxed italic">
                "המטרה שלנו היא שתוכל להתעסק בעסק שלך – ואנחנו נדאג לשקט, לסדר, וגם לעזור לך להתקדם."
              </p>
            </div>
          </section>
        </div>
      )
    },
    {
      number: 7,
      icon: <Award className="w-6 h-6" />,
      title: "סיכום ועקרונות זהב",
      color: "from-yellow-600 to-yellow-700",
      content: (
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">עקרונות הזהב של נציג מכירות</h3>
            
            <div className="space-y-4">
              <div className="bg-white border-2 border-yellow-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🎯</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">אתה לא מוכר מוצר – אתה מוכר שקט</p>
                  <p className="text-gray-700">
                    הלקוח לא קם בבוקר וחיפש "דוח שנתי". הוא חיפש דרך להרגיש רגוע ומוגן.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-blue-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🤝</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">אתה לא רואה חשבון – אתה הפנים של הביטחון</p>
                  <p className="text-gray-700">
                    תפקידך להראות ללקוח שיש לו מישהו שדואג לו, לא רק עוד ספק שירות.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-green-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🧠</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">הלקוח לא רוצה לדעת הכול – הוא רוצה לדעת שמישהו יודע</p>
                  <p className="text-gray-700">
                    אל תנסה ללמד אותו מיסוי. תן לו להבין שאתה דואג לזה בשבילו.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🤖</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">והיום – יש לו גם אפליקציה עם מלווה חכם שתמיד איתו</p>
                  <p className="text-gray-700">
                    זה לא ChatBot – זה חבר עסקי שזמין 24/7, מבין עצמאים, ויכול לעזור בכל שאלה.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-orange-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">👂</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">תקשיב יותר מדי שאתה מדבר</p>
                  <p className="text-gray-700">
                    המכירה הטובה ביותר היא כזו שבה הלקוח מרגיש שהבנת אותו.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-red-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🎭</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">בנה אמון לפני מכירה</p>
                  <p className="text-gray-700">
                    אל תנסה לסגור עסקה בשיחה הראשונה. תן לו להרגיש שאתה כאן בשבילו.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-teal-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">💬</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">דבר לראש שלו, לא לכיס שלו</p>
                  <p className="text-gray-700">
                    אם אתה מדבר רק על מחיר, אתה הופך את השירות למוצר. תדבר על ערך.
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-pink-300 rounded-lg p-6 flex items-start gap-4">
                <span className="text-4xl">🚫</span>
                <div>
                  <p className="font-bold text-lg text-gray-900 mb-2">אתה לא משכנע – אתה מסביר</p>
                  <p className="text-gray-700">
                    אם אתה צריך ללחוץ על לקוח – זה אומר שהוא לא מבין את הערך. תסביר טוב יותר.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">משפטי מפתח – תחזור עליהם כל הזמן</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
                <p className="text-blue-900">"המטרה שלנו זה שלא תצטרך לחשוב על מסים בכלל"</p>
              </div>
              <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded">
                <p className="text-green-900">"אנחנו לא רק דואגים שתעמוד בדרישות – אנחנו עוזרים לך גם להתקדם"</p>
              </div>
              <div className="bg-purple-50 border-r-4 border-purple-500 p-4 rounded">
                <p className="text-purple-900">"יש לך מלווה חכם שמלווה אותך ביום־יום, לא רק פעם בשנה"</p>
              </div>
              <div className="bg-orange-50 border-r-4 border-orange-500 p-4 rounded">
                <p className="text-orange-900">"רוב הלקוחות שלנו באו אלינו אחרי טעויות שהם לא ידעו שעשו"</p>
              </div>
              <div className="bg-yellow-50 border-r-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-900">"אתה עובד – אנחנו מול הרשויות"</p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">איך יודעים שהשיחה הצליחה?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <h4 className="font-bold text-red-900 mb-3">❌ לא לפי:</h4>
                <ul className="space-y-2 text-red-800">
                  <li>• כמה דיברת</li>
                  <li>• כמה מידע העברת</li>
                  <li>• כמה פעמים אמרת "אנחנו"</li>
                </ul>
              </div>

              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-3">✅ כן לפי:</h4>
                <ul className="space-y-2 text-green-800">
                  <li>• כמה הלקוח נרגע</li>
                  <li>• כמה הוא שאל</li>
                  <li>• האם הוא אמר: "טוב שיש מי שמטפל בזה"</li>
                  <li>• או: "זה נותן לי ביטחון"</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-8 rounded-lg">
              <h3 className="text-3xl font-bold mb-6 text-center">🧠 משפט הזהב לסיום שיחה</h3>
              <p className="text-2xl leading-relaxed italic text-center">
                "המטרה שלנו היא שתוכל להתעסק בעסק שלך – ואנחנו נדאג לשקט, לסדר, וגם לעזור לך להתקדם."
              </p>
            </div>
          </section>

          <section className="mt-8">
            <div className="bg-gray-900 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-6">📌 סיכום אחרון</h3>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">
                  אתה לא סתם נציג מכירות. אתה השליח של הביטחון לעצמאים שמרגישים לבד. 
                  אתה הפנים של השירות שיכול לשנות להם את החיים.
                </p>
                <p className="text-lg leading-relaxed">
                  כל לקוח שאתה עוזר לו – זה לא רק עסקה. זה אדם אחד פחות שמודאג, 
                  אחד פחות שמפחד מקנסות, אחד פחות שמרגיש לבד.
                </p>
                <p className="text-xl font-bold text-yellow-400 mt-6">
                  תעשה את העבודה הזאת נכון – והם יזכרו אותך לטובה.
                </p>
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
        <title>חוברת הדרכה מפורטת לסוכן מכירות | Perfect One</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16" dir="rtl">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">חוברת הדרכה לסוכן מכירות</h1>
            <p className="text-2xl text-gray-200 mb-6">מדריך מקיף ב-7 שלבים</p>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              כל מה שאתה צריך כדי למכור נכון, לבנות אמון, ולעזור ללקוחות להרגיש רגועים ומוגנים
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-6 py-16" dir="rtl">
        <div className="space-y-6">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: step.number * 0.1 }}
            >
              <div className="border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
                <button
                  onClick={() => setOpenStep(openStep === step.number ? null : step.number)}
                  className={`w-full bg-gradient-to-r ${step.color} text-white p-6 flex items-center justify-between hover:opacity-90 transition`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold opacity-90">שלב {step.number}</p>
                      <p className="text-xl font-bold">{step.title}</p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-6 h-6 transition-transform ${openStep === step.number ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {openStep === step.number && (
                  <div className="p-8 bg-gray-50">
                    {step.content}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}