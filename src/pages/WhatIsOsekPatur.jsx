import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import { CheckCircle, AlertCircle, HelpCircle, BookOpen, DollarSign, Shield } from 'lucide-react';

export default function WhatIsOsekPatur() {
  return (
    <>
      <SEOOptimized
        title="מה זה עוסק פטור? | הסבר מלא וברור"
        description="הסבר מקיף על עוסק פטור בישראל - מי יכול להיות עוסק פטור, מה הדרישות, מה זה אומר בפרקטיקה, וכי הוא לא מקום טוב לכולם"
        keywords="עוסק פטור, הגדרת עוסק פטור, מה זה עוסק פטור, כמה מרוויח עוסק פטור"
        canonical="https://perfect1.co.il/what-is-osek-patur"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'מה זה עוסק פטור' }
          ]} />
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                מה זה עוסק פטור?
              </h1>
              <p className="text-xl text-white/90">
                הסבר מלא וברור על מה זה אומר להיות עוסק פטור בישראל
              </p>
            </motion.div>
          </div>
        </section>

        {/* Definition */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50 border-l-4 border-[#1E3A5F] rounded-lg p-8 mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
                הגדרה בסיסית
              </h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                <strong>עוסק פטור</strong> הוא עצמאי שהכנסתו השנתית לא עוברת סכום מסוים (תקרה משתנה בעדכון תשלום), 
                והוא פטור מדיווח מע"מ וממצפה מס הכנסה מורכבה.
              </p>
              <p className="text-gray-700 mt-4">
                במילים פשוטות: אתה עובד כעצמאי, משלם מס על ההכנסה שלך, אבל לא צריך לנהל ספרים מורכבים או דוח שנתי מסובך.
              </p>
            </motion.div>

            {/* Who */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                למי זה מתאים?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: CheckCircle, title: 'צלמים ואנשי קריאייטיב', desc: 'כל מי שעובד בעצמאות בתחום האומנויות או העיצוב' },
                  { icon: CheckCircle, title: 'מעצבים ומתכנתים', desc: 'חברים עצמאיים שמתקבלים בעבודות פרילנס' },
                  { icon: CheckCircle, title: 'מדריכים ומאמנים', desc: 'אישים המלמדים קורסים או מלמדים מיומנויות' },
                  { icon: CheckCircle, title: 'נותני שירותים', desc: 'כל מי שמספק שירות ישיר (קוסמטיקה, תיקון, וכו\')' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    <item.icon className="w-8 h-8 text-[#27AE60] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                דרישות בסיסיות
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'הכנסה', desc: 'הכנסה שנתית שלא עוברת את התקרה המוגדרת (כ-324,000 ש״ח בעדכון אחרון)' },
                  { title: 'חשבון בנק', desc: 'חשבון בנק עיסקי (לא חובה משפטית, אבל חיוני לניהול תקין)' },
                  { title: 'תעודת זהות תקפה', desc: 'תעודה תקפה ישראלית או תעודת עבודה זרה' },
                  { title: 'ידע בסיסי', desc: 'הבנה בסיסית של דיווח הכנסה וביטוח לאומי' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-5 flex gap-4"
                  >
                    <Shield className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Obligations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                מה צריך לעשות?
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'דיווח הכנסה שנתי', desc: 'דיווח על הכנסתך לרשות המס בקובץ בודד בסוף השנה' },
                  { title: 'תשלום ביטוח לאומי', desc: 'תשלום חודשי לביטוח לאומי (הביטחון החברתי שלך)' },
                  { title: 'שמירת קבלות', desc: 'שמירת קבלות והוצאות (לא חובה משפטית, אבל המלצה חזקה)' },
                  { title: 'דיווח מס', desc: 'דיווח מס על הרווח שלך (בעד השנה הקלנדרית)' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-5 flex gap-4"
                  >
                    <BookOpen className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">
                יתרונות וחסרונות
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-[#27AE60] mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    יתרונות
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'לא צריך לנהל ספרים מורכבים',
                      'פטור מדיווח מע"מ',
                      'דוח שנתי פשוט וקצר',
                      'מחיר ביטוח לאומי נמוך יותר',
                      'פחות בירוקרטיה וניהול'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#E74C3C] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    מגבלות
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'תקרת הכנסה קבועה',
                      'אם חוצה את התקרה - חובה להיות עוסק מורשה',
                      'לא יכול להוציא חשבוניות עם מע"מ',
                      'פחות אמינות עם לקוחות גדולים',
                      'ניהול אישי של המס'
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-[#E74C3C] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Myths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 bg-yellow-50 border border-yellow-300 rounded-lg p-8"
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6 flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-yellow-600" />
                דברים שאנשים חושבים בטעות
              </h2>
              <div className="space-y-5">
                {[
                  { myth: 'עוסק פטור לא צריך לשלם מס', truth: 'עוסק פטור משלם מס הכנסה כמו כל אחד - פטור רק מדיווח מע"מ' },
                  { myth: 'עוסק פטור יכול לעבוד בלי להגיד לשום גורם', truth: 'צריך לדווח לרשות המס ולביטוח לאומי' },
                  { myth: 'אם מרוויח הרבה, זה לא משנה', truth: 'כשחוצה את התקרה, חובה משפטית להיות עוסק מורשה' },
                  { myth: 'לא צריך לשמור על קבלות', truth: 'המלצה חזקה לשמור - הרשות יכולה לבדוק' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <p className="font-bold text-gray-800 mb-2">❌ {item.myth}</p>
                    <p className="text-gray-700 ml-4">✅ {item.truth}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#27AE60] to-[#229954] rounded-lg p-8 text-center text-white"
            >
              <h2 className="text-2xl font-bold mb-3">
                מעוניין לפתוח עוסק פטור?
              </h2>
              <p className="mb-6 text-white/90">
                עכשיו שאתה מבין מה זה, בואו נעשה את זה בצורה נכונה
              </p>
              <Link to={createPageUrl('OsekPaturLanding')}>
                <Button className="bg-white text-[#27AE60] hover:bg-white/90 font-bold text-lg h-12 px-8">
                  למעבר לדף הפתיחה
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}