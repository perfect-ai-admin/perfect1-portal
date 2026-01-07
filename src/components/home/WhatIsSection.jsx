import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';

export default function WhatIsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
            מה זה בעצם עוסק פטור?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            עוסק פטור הוא המסלול המשתלם ביותר לעצמאים עם הכנסות עד 120,000₪ בשנה
          </p>
        </motion.div>

        {/* Main Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#E8F4FD] to-white rounded-3xl p-8 md:p-12 mb-12 border border-[#1E3A5F]/10"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-loose mb-6">
              <strong>עוסק פטור</strong> הוא מסלול מיסוי המיועד לעצמאים עם הכנסות נמוכות יחסית. 
              במסלול זה אתה <strong>פטור מתשלום מע"מ</strong> ומהדיווח החודשי על מע"מ, מה שמפשט משמעותית את הניהול השוטף.
            </p>
            <p className="text-gray-700 text-lg leading-loose">
              זהו המסלול המומלץ למי שמתחיל את דרכו כעצמאי, או למי שהעסק שלו לא צפוי לחרוג מתקרת ההכנסה השנתית.
            </p>
          </div>
        </motion.div>

        {/* Key Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Who Is It For */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-elegant border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#27AE60] to-[#2ECC71] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-[#1E3A5F]">למי זה מתאים?</h3>
            </div>
            <ul className="space-y-4">
              {[
                'פרילנסרים ועצמאים מתחילים',
                'בעלי מקצוע חופשי (מעצבים, צלמים, מאמנים)',
                'מי שצפוי להרוויח עד 120,000₪ בשנה',
                'מי שרוצה לעבוד בצורה חוקית ופשוטה'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Key Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-elegant border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-[#1E3A5F]">היתרונות העיקריים</h3>
            </div>
            <ul className="space-y-4">
              {[
                'פטור מדיווח חודשי למע"מ',
                'ניהול פשוט ונוח יותר',
                'עלות נמוכה יותר לליווי חשבונאי',
                'אפשרות להוציא חשבוניות ולקבל העברות בנקאיות'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-amber-50 rounded-2xl p-8 border-2 border-amber-200"
        >
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-3">חשוב לדעת</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>תקרת ההכנסה:</strong> עוסק פטור מוגבל להכנסה של עד 120,000₪ לשנה (נכון ל-2024). 
                אם אתה צופה שתעבור את התקרה, כדאי לשקול מסלול של עוסק מורשה מלכתחילה.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>שים לב:</strong> לכל מקצוע יכולות להיות דרישות ספציפיות ונדבכים שונים בתהליך הפתיחה. 
                לכן חשוב לקבל ייעוץ מקצועי מותאם למקצוע שלך.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Simple Steps Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <h3 className="text-3xl font-black text-[#1E3A5F] mb-6">
            התהליך בקצרה
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'רישום במס הכנסה', desc: 'פתיחת תיק עוסק' },
              { step: '2', title: 'רישום בביטוח לאומי', desc: 'הרשמה כעצמאי' },
              { step: '3', title: 'התחלת עבודה', desc: 'הנפקת חשבוניות' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#1E3A5F] text-white font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-bold text-[#1E3A5F] mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}