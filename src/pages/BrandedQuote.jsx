import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, Check, Zap } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const SIGNUP_URL = "https://www.perfect1.co.il/login?from_url=https%3A%2F%2Fwww.perfect1.co.il%2FAPP";

export default function BrandedQuotePage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Tag className="w-4 h-4" />
                הצעת מחיר ממותגת
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                הצעות שמותגות עסקאות
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                צור הצעות מחיר מקצועיות וממותגות שגורמות ללקוחות לומר "כן"
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-indigo-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">איך זה עובד?</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mb-4">1</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">הזן פרטי פרויקט</h4>
                  <p className="text-gray-600">שירותים, מחירים, ופרטי לקוח</p>
                </div>
                
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mb-4">2</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">AI יוצר הצעה</h4>
                  <p className="text-gray-600">מסמך מעוצב עם כל הפרטים</p>
                </div>
                
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mb-4">3</div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">שלח ללקוח</h4>
                  <p className="text-gray-600">PDF מוכן או שיתוף באימייל</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">חישוב אוטומטי</h5>
                    <p className="text-gray-600 text-sm">סכומים, הנחות ומע"מ מחושבים אוטומטית</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">תנאים משפטיים</h5>
                    <p className="text-gray-600 text-sm">תנאי תשלום ואספקה מוכנים</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">מעקב הצעות</h5>
                    <p className="text-gray-600 text-sm">ראה אם הלקוח פתח את ההצעה</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">עיצוב ממותג</h5>
                    <p className="text-gray-600 text-sm">צבעי החברה והלוגו בכל עמוד</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <a href={SIGNUP_URL}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-indigo-600/25">
                  צור הצעת מחיר עכשיו
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