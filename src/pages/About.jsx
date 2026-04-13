import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import { Phone, Mail, MessageCircle, Building2, Shield, Users, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-b from-violet-50/80 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              אודות פרפקט וואן
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              מערכת ניהול עסק חכמה שנבנתה כדי לעזור לעצמאים, פרילנסרים ובעלי עסקים קטנים בישראל לנהל את העסק שלהם בקלות ובמקצועיות.
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="py-12 md:py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-16">

            {/* Who We Are */}
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">מי אנחנו</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  פרפקט וואן היא חברת טכנולוגיה ישראלית המתמחה בפיתוח פתרונות דיגיטליים לעסקים קטנים ועצמאים. אנחנו מאמינים שלכל בעל עסק מגיעים כלים מקצועיים שעד היום היו שמורים רק לחברות גדולות.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  הפלטפורמה שלנו מאגדת תחת קורת גג אחת את כל מה שעסק צריך — מניהול לקוחות ולידים, דרך מיתוג ועיצוב, ועד ניהול כספים ודוחות. כך בעלי עסקים יכולים להתמקד במה שהם עושים הכי טוב, ולהשאיר את הביורוקרטיה לנו.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-violet-50 rounded-2xl p-6 text-center">
                  <Target className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm">מיקוד בעסקים קטנים</h3>
                  <p className="text-gray-500 text-xs mt-1">פתרונות מותאמים לשוק הישראלי</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm">אבטחה מתקדמת</h3>
                  <p className="text-gray-500 text-xs mt-1">הגנה על המידע העסקי שלך</p>
                </div>
                <div className="bg-teal-50 rounded-2xl p-6 text-center">
                  <Users className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm">ליווי אישי</h3>
                  <p className="text-gray-500 text-xs mt-1">תמיכה אנושית ומהירה</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-6 text-center">
                  <Building2 className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm">חברה ישראלית</h3>
                  <p className="text-gray-500 text-xs mt-1">מכירים את השוק מבפנים</p>
                </div>
              </div>
            </div>

            {/* What We Offer */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">מה אנחנו מציעים</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">ניהול לקוחות ולידים</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    מערכת CRM מתקדמת לניהול כל הלידים, הלקוחות והמכירות שלך במקום אחד. מעקב אוטומטי, תזכורות ודוחות חכמים.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">מיתוג ועיצוב</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    יצירת לוגו, כרטיסי ביקור דיגיטליים, דפי נחיתה, מצגות עסקיות וחומרים שיווקיים — הכל בקליק.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">מדריכים ומידע</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    מרכז מידע מקצועי לפתיחה, ניהול וסגירת עסקים בישראל. מדריכים, השוואות וכלים שיעזרו לך לקבל החלטות מושכלות.
                  </p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">פרטי החברה</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">שם החברה</p>
                    <p className="font-semibold text-gray-900">פרפקט וואן</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ח.פ</p>
                    <p className="font-semibold text-gray-900">516309747</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">אתר</p>
                    <p className="font-semibold text-gray-900">perfect1.co.il</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <a href="tel:0502277087" className="flex items-center gap-3 text-gray-700 hover:text-violet-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">טלפון</p>
                      <p className="font-semibold">050-227-7087</p>
                    </div>
                  </a>
                  <a href="mailto:yositaxes@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-violet-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">דוא"ל</p>
                      <p className="font-semibold">yositaxes@gmail.com</p>
                    </div>
                  </a>
                  <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp</p>
                      <p className="font-semibold">שלח/י הודעה</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="text-center pb-4">
              <p className="text-gray-500 text-sm">
                <a href="/Terms" className="text-violet-600 hover:text-violet-700 underline">תקנון ותנאי שימוש</a>
                {' '} | {' '}
                <a href="/Privacy" className="text-violet-600 hover:text-violet-700 underline">מדיניות פרטיות</a>
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
