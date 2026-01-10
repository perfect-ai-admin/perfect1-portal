import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import FAQSchema from '../components/seo/FAQSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import PageTracker from '../components/seo/PageTracker';
import RelatedContent from '../components/seo/RelatedContent';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import UnifiedLeadForm from '../components/forms/UnifiedLeadForm';
import { Phone, MessageCircle, ChevronDown, ArrowRight, CheckCircle, TrendingUp, BarChart3, Shield, Zap, Clock, FileText, Archive } from 'lucide-react';

export default function ReceiptsIncome() {
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqs = [
    {
      question: 'האם צריך קבלה בכל פעם שמקבלים כסף?',
      answer: 'כן, לעוסק פטור חובה להעיד קבלה בכל פעם שמקבל כסף עבור שירות או מוצר. קבלה זו היא הוכחה חוקית לעסקה ודרישה משפטית של מס הכנסה וביטוח לאומי.'
    },
    {
      question: 'מה צריך להיות בקבלה חוקית?',
      answer: 'קבלה חוקית חייבת להכיל: שם מלא של הקבלן, כתובת (או מספר עוסק פטור), תיאור מדויק של השירות/המוצר, סכום החיוב, תאריך, וחתימת הקבלן. בלי אחד מהאלה - הקבלה לא חוקית.'
    },
    {
      question: 'אני יכול לתעד הכנסות בלי קבלות?',
      answer: 'לא. בלי קבלות, אתה לא יכול להוכיח שהכנסות אלו חוקיות. מס הכנסה יכול לדחות את ההוכחה שלך וגם לעמוד בקנסות וריבית על מסים מדומה.'
    },
    {
      question: 'איך אנחנו שומרים על קבלות?',
      answer: 'צריך לשמור על כל הקבלות במסדר חרוני לפחות 3 שנים. אנחנו ממליצים: אם רכשת מערכת דיגיטלית (אפליקציה) - זה עוזר להשמר אותן בעננים. אם עדיין דפים - סדר לך תיקיה ותשמור בטוח.'
    },
    {
      question: 'מה ההבדל בין קבלה לחשבוניה?',
      answer: 'קבלה היא אישור של קבלת כסף - פשוטה וקצרה. חשבוניה היא בקשה לתשלום עם פרטים מורחבים. לעוסק פטור, קבלה היא מה שחוקי ונדרש. חשבוניה אופציונלית.'
    },
    {
      question: 'איך מניהלים הכנסות חודשיות?',
      answer: 'הכנסות צריכות להיות תועדות חודשית: סכום כולל שנכנס, מקור כסף, תיאור קצר. בדוח שנתי, כל ההכנסות מתוסכמות ודיווחות למס הכנסה וביטוח לאומי.'
    },
    {
      question: 'מה קורה אם אני אפקיד קבלות?',
      answer: 'אם משהו אתה לא מדווח קבלות - מס הכנסה יכול לבדוק אותך ולהטיל קנסות. אם הוא מוצא הכנסות שלא דיווחת, זה עלול להיות עונשי. תמיד שמור על קבלות וקבלות דיגיטליות.'
    },
    {
      question: 'אפשר להשתמש באפליקציה לקבלות דיגיטליות?',
      answer: 'כן! אפליקציות קבלות דיגיטליות נחוצות ונוחות. הן משמרות הכנסות אוטומטית, מעקב קל, וגם לא צריך לדאוג על קבלות גופיות שיאבדו או יתבלו. אנחנו מספקים אפליקציה כזו.'
    },
    {
      question: 'כמה קבלות צריך לשמור בשנה?',
      answer: 'זה תלוי כמה עסקות יש לך. אם זה 5 עסקות בחודש - זה 60 בשנה. אם 10 ליום - זה עשרות מצבים. הנקודה: שמור הכל. חוקי, מס הכנסה יכול לבדוק כל קבלה אפילו שנים אחרי.'
    },
    {
      question: 'מה אם לא זיכרתי מה היתה הכנסה?',
      answer: 'זה בעיה. בלי קבלה - אתה לא יכול להוכיח הכנסה זו למס הכנסה. לכן, קריטי לשמור על קבלות מיד. אם איבדת קבלה, תיעד את זה בעמוד "הוצאות קבלות איבודות" בדוח השנתי.'
    }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <FAQSchema faqs={faqs.map(faq => ({ question: faq.question, answer: faq.answer }))} />
      <PageTracker pageUrl="/receipts-income" pageType="landing" />
      <SEOOptimized
        title="קבלות והכנסות לעוסק פטור | ניהול נכון וחוקי | Perfect One"
        description="איך מנהלים קבלות והכנסות כעוסק פטור בצורה מסודרת וחוקית. דרישות משפטיות, תעוד הכנסות, וקבלות דיגיטליות."
        keywords="קבלות עוסק פטור, ניהול הכנסות, קבלות דיגיטליות, תיעוד הכנסות, דרישות משפטיות קבלות"
        canonical="https://perfect1.co.il/receipts-income"
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "קבלות והכנסות לעוסק פטור",
          "description": "מדריך מלא על ניהול קבלות והכנסות לעוסק פטור בהתאם לחוק",
          "author": {
            "@type": "Organization",
            "name": "Perfect One"
          },
          "datePublished": "2024-01-01",
          "articleSection": "ניהול עוסק פטור"
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'קבלות והכנסות' }
          ]} />
        </div>
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                ✓ קבלות חוקיות וחתום
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                קבלות והכנסות לעוסק פטור
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto md:mx-0">
                איך מנהלים קבלות והכנסות בצורה מסודרת וחוקית בעיני מס הכנסה וביטוח לאומי
              </p>
              <p className="text-lg text-white/80 max-w-3xl mx-auto md:mx-0">
                מדריך מלא: דרישות משפטיות, תעוד נכון, וקבלות דיגיטליות
              </p>
            </motion.div>
          </div>
        </section>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* What's Required Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg mb-12 md:mb-20 border-t-4 border-amber-600">
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-8 text-center">
                מה צריך להיות בקבלה חוקית?
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { icon: FileText, title: 'שם הקבלן', desc: 'שם מלא של האדם או העסק המספק את השירות' },
                  { icon: Archive, title: 'כתובת', desc: 'כתובת הקבלן או מספר עוסק פטור' },
                  { icon: BarChart3, title: 'תיאור שירות', desc: 'תיאור מדויק של המוצר או השירות שסופק' },
                  { icon: CheckCircle, title: 'סכום', desc: 'סכום החיוב בשקלים חדשים' },
                  { icon: Clock, title: 'תאריך', desc: 'תאריך יום העסקה' },
                  { icon: Shield, title: 'חתימה', desc: 'חתימת הקבלן על הקבלה' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 md:p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-[#1E3A5F] text-base">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Why Important */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 md:mb-20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-amber-600"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">הוכחה משפטית</h3>
                <p className="text-gray-600">קבלה היא ההוכחה החוקית היחידה שלך שמקום זה מקבל כסף בחוקיות</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-600"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">דיווח נכון</h3>
                <p className="text-gray-600">בלי קבלות - לא יכול להוכיח הכנסות למס הכנסה וביטוח לאומי</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-yellow-600"
              >
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">הימנעות קנסות</h3>
                <p className="text-gray-600">קבלות חוקיות מגנות עליך מקנסות של מס הכנסה וביטוח לאומי</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-600"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">ניהול הכנסות</h3>
                <p className="text-gray-600">קבלות עוזרות לך לעקוב אחר הכנסות וניהול נכון של התזרים</p>
              </motion.div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-2 text-center">
                צריך עזרה בניהול קבלות?
              </h2>
              <p className="text-center text-white/90 mb-8">השאר פרטים ונעזור לך בניהול הכנסות וקבלות דיגיטליות</p>
              
              <div className="max-w-md mx-auto">
                <UnifiedLeadForm
                  variant="default"
                  title=""
                  ctaText="קבל עזרה בניהול קבלות"
                  successTitle="קיבלנו את הפרטים! ✓"
                  successMessage="נציג יצור איתך קשר ויעזור לך בניהול קבלות ודיגיטליזציה"
                  sourcePage="קבלות והכנסות"
                  fields={["name", "phone"]}
                  invertColors={true}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <a href="https://wa.me/972502277087?text=היי, צריך עזרה בניהול קבלות והכנסות" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-11 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    דבר בווצאפ
                  </Button>
                </a>
                <a href="tel:+972502277087" className="flex-1">
                  <Button className="w-full h-11 md:h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <Phone className="ml-2 w-5 h-5" />
                    התקשר עכשיו
                  </Button>
                </a>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 text-center">
                טיפים לניהול קבלות נכון
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: '📱 קבלות דיגיטליות', desc: 'השתמש באפליקציה לקבלות - קל יותר וآمن יותר' },
                  { title: '📁 ארכיון מסודר', desc: 'שמור קבלות ב-3 שנים בתיקיה מסודרת' },
                  { title: '✓ דיוק במיידע', desc: 'וודא שכל הפרטים בקבלה נכונים ומדויקים' },
                  { title: '📊 דוח חודשי', desc: 'סדר דוח חודשי של הכנסות ממקורות שונים' },
                  { title: '🔍 בדיקה שוטפת', desc: 'בדוק כל חודש שקבלות תואמות לפנקסים' },
                  { title: '💾 גיבוי דיגיטלי', desc: 'אם משתמש בקבלות דיגיטליות - ודא גיבוי בעננים' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border-r-4 border-amber-600"
                  >
                    <h3 className="font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 md:mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 md:mb-12 text-center">
                שאלות נפוצות על קבלות
              </h2>
              <div className="space-y-3 md:space-y-4">
                {faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-gray-200"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                      className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-bold text-[#1E3A5F] text-sm md:text-lg text-right">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 md:w-6 md:h-6 text-amber-600 transition-transform ${
                          expandedFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-gray-200"
                      >
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA - Open Osek Patur */}
            <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-8 md:p-10 mb-12 md:mb-20">
              <h2 className="text-2xl md:text-3xl font-black mb-4">עדיין לא פתחת עוסק פטור?</h2>
              <p className="text-white/90 mb-6">תחילה צריך לפתוח עוסק פטור, ואז אנחנו נעזור לך בניהול קבלות</p>
              <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                <Button className="h-12 px-8 bg-white text-green-600 hover:bg-gray-100 font-bold">
                  פתח עוסק פטור אונליין עכשיו
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </section>

            {/* Related Content */}
            <RelatedContent pageType="guide" />
          </motion.div>
        </div>
      </main>
    </>
  );
}