import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Sparkles, Check, Zap } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const SIGNUP_URL = "https://perfect-dashboard.com/login?from_url=https%3A%2F%2Fperfect-dashboard.com%2FClientDashboard";

export default function SocialDesignsPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-pink-50 via-white to-gray-50">
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Share2 className="w-4 h-4" />
                עיצובים לרשתות
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                תוכן ויזואלי לפייסבוק
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                צור פוסטים מעוצבים ומקצועיים לפייסבוק, אינסטגרם ורשתות חברתיות נוספות
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-pink-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">איך זה עובד?</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xl mb-4">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">בחר סוג פוסט</h4>
                  <p className="text-gray-600">מבצע, הודעה, סטורי, או תוכן חינוכי</p>
                </div>
                
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xl mb-4">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">AI מעצב</h4>
                  <p className="text-gray-600">יצירת עיצוב ייחודי מותאם לפלטפורמה</p>
                </div>
                
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xl mb-4">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">פרסם ישירות</h4>
                  <p className="text-gray-600">הורד או פרסם ישירות לרשתות</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">מידות מדויקות</h5>
                    <p className="text-gray-600 text-sm">מותאם לכל פלטפורמה - פייסבוק, אינסטגרם, לינקדאין</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">סגנונות מגוונים</h5>
                    <p className="text-gray-600 text-sm">מינימליסטי, צבעוני, אלגנטי ועוד</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">טקסט אוטומטי</h5>
                    <p className="text-gray-600 text-sm">AI כותב כותרות וטקסטים אטרקטיביים</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">תמונות וגרפיקה</h5>
                    <p className="text-gray-600 text-sm">תמונות רלוונטיות ואייקונים מעוצבים</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a href={SIGNUP_URL}>
                <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-pink-600/25">
                  צור עיצוב לרשתות עכשיו
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </a>
              <p className="text-gray-500 text-sm mt-4">התחל בחינם • ללא צורך בכרטיס אשראי</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}