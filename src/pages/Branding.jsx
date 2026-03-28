import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag, Presentation, FileText, Palette, Share2, CreditCard, Mail, Sticker, Sparkles, Zap } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

const SIGNUP_URL = "https://perfect-dashboard.com/login";

const brandingProducts = [
  {
    icon: Palette,
    title: 'יצירת לוגו חכם',
    description: 'עיצוב לוגו מקצועי בדקה',
    color: 'yellow',
  },
  {
    icon: Presentation,
    title: 'דף נחיתה ממותג',
    description: 'דפי נחיתה שממירים לקוחות',
    color: 'green',
  },
  {
    icon: FileText,
    title: 'מצגת עסקית',
    description: 'מצגות מרשימות במהירות',
    color: 'blue',
  },
  {
    icon: Sticker,
    title: 'סטיקר לעסק',
    description: 'מדבקות ממותגות להדפסה',
    color: 'purple',
  },
  {
    icon: Share2,
    title: 'עיצובים לרשתות',
    description: 'תוכן ויזואלי לפייסבוק',
    color: 'pink',
  },
  {
    icon: CreditCard,
    title: 'כרטיס ביקור דיגיטלי',
    description: 'כרטיס שנשלח באופן קשר',
    color: 'cyan',
  },
  {
    icon: Mail,
    title: 'חתימה מקצועית',
    description: 'חתימת מייל שמותגת חשבון',
    color: 'orange',
  },
  {
    icon: Tag,
    title: 'הצעת מחיר ממותגת',
    description: 'הצעות שמותגות עסקאות',
    color: 'indigo',
  },
];

const colorClasses = {
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', hover: 'hover:bg-yellow-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'hover:bg-green-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:bg-blue-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'hover:bg-purple-100' },
  pink: { bg: 'bg-pink-50', icon: 'text-pink-600', hover: 'hover:bg-pink-100' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', hover: 'hover:bg-cyan-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'hover:bg-orange-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
};

export default function BrandingPage() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-gradient-to-b from-violet-50 via-white to-gray-50">
        {/* Hero Banner */}
        <section className="py-16 md:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              מיתוג ופיתוח מותג
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              בתוך כלי המערכת שיווקית לך לבנות נכסי אימייג' לעסק
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              המערכת משתמשת ב-AI מתקדם כדי ליצור עבורך נכסי מיתוג מקצועיים תוך דקות ספורות. 
              פשוט תגיד מה אתה צריך, והמערכת תייצר עבורך עיצובים מותאמים אישית לעסק שלך.
            </p>

            {/* AI Process Explanation */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 max-w-4xl mx-auto border border-violet-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">איך זה עובד?</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-right">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg mb-3">1</div>
                  <h4 className="font-semibold text-gray-900">ספר לנו מה אתה צריך</h4>
                  <p className="text-gray-600 text-sm">תאר את העסק שלך, הסגנון שאתה אוהב, והמסר שאתה רוצה להעביר</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg mb-3">2</div>
                  <h4 className="font-semibold text-gray-900">ה-AI יוצר עבורך</h4>
                  <p className="text-gray-600 text-sm">המערכת מנתחת את הצרכים שלך ויוצרת עיצובים מקצועיים תוך שניות</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg mb-3">3</div>
                  <h4 className="font-semibold text-gray-900">הורד והשתמש</h4>
                  <p className="text-gray-600 text-sm">קבל קבצים מוכנים לשימוש, ערוך ושנה בקלות עד לתוצאה המושלמת</p>
                </div>
              </div>
            </div>

            <a href={SIGNUP_URL}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-14 text-lg font-medium shadow-xl shadow-violet-600/25">
                התחבר למערכת והתחל ליצור
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">כלי המיתוג שלנו</h2>
            <p className="text-gray-600 text-center mb-12 text-lg">בחר את הכלי שאתה צריך וצור נכס מיתוג מקצועי תוך דקות</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {brandingProducts.map((product, index) => {
                const Icon = product.icon;
                const colors = colorClasses[product.color];
                
                return (
                  <div
                    key={index}
                    className={`${colors.bg} ${colors.hover} border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group`}
                  >
                    <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-7 h-7 ${colors.icon}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  מוכן לבנות את המותג שלך?
                </h2>
                
                <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">
                  הצטרף למאות עסקים שכבר משתמשים ב-AI שלנו כדי ליצור נכסי מיתוג מקצועיים בקלות ובמהירות
                </p>
                
                <a href={SIGNUP_URL}>
                  <Button className="bg-white text-violet-700 hover:bg-violet-50 rounded-xl px-8 h-14 text-lg font-medium shadow-xl">
                    כניסה למערכת
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </a>
                
                <p className="text-violet-200 text-sm mt-4">
                  התחל בחינם • ללא צורך בכרטיס אשראי
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}