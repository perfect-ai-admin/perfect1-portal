import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, Shield, Clock, Users, Star, TrendingUp, FileText, Briefcase, Target, Zap, Award, Monitor, Smartphone, Wifi, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';


function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#3498DB]/50 transition-all"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <p className="text-lg font-bold text-[#1E3A5F]">{question}</p>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-[#3498DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        >
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function OsekPaturOnlineLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert('אנא מלא שם, טלפון ומייל');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'דף נחיתה - פתיחת עוסק פטור אונליין',
        status: 'new'
      });

      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      question: "איך פותחים עוסק פטור?",
      answer: "אתה משאיר פרטים, יועץ שלנו חוזר אליך, מנהל ייעוץ ראשוני, ואנחנו מספרים לך בדיוק מה צריך. התהליך כולל מילוי טופס, בדיקה של הנתונים וחתימה דיגיטלית."
    },
    {
      question: "איזה מסמכים צריך?",
      answer: "בדרך כלל: תעודת זהות, אישור בנק, וכמה פרטים נוספים. אנחנו נספר לך בדיוק מה צריך בייעוץ הראשוני שלך."
    },
    {
      question: "כמה זמן לוקח לרשויות לאשר?",
      answer: "זה תלוי במס הכנסה וביטוח לאומי, יכול להיות כמה ימים או שבועות. אנחנו מסבירים לך מה קורה בכל שלב ונתמוך בך בחזרות של הרשויות."
    },
    {
      question: "האם צריך לנסוע למשרד ממשלתי?",
      answer: "לא, אנחנו עוזרים לך דרך הממשק הדיגיטלי שלנו. אתה לא צריך לנסוע לשום מקום - הכל מהבית."
    },
    {
      question: "מה בדיוק אתם עוזרים לעשות?",
      answer: "אנחנו מלווים אותך בתהליך הייעוץ וההכנה: מנתחים את המצב שלך, משרטטים תכנית, מעזרים במילוי נתונים, בודקים הכל, ומסבירים מה קורה עם הרשויות."
    },
    {
      question: "האם חתימה דיגיטלית מוכרת חוקית?",
      answer: "כן, חתימה דיגיטלית מוכרת על פי חוק החתימה האלקטרונית ומקובלת בכל הרשויות."
    },
    {
      question: "כמה זה עולה?",
      answer: "זהו שירות פרטי בתשלום. לפרטים מדויקים, השאר פרטים וידברו אתך ישירות על העלויות."
    },
    {
      question: "מתי אקבל את הסטטוס של הרשויות?",
      answer: "אנחנו עוקבים אחר בקשתך בעיבוד הרשויות ומעדכנים אותך. זמן הוודאות של הרשויות בדרך כלל יותר מירך ימים."
    },
    {
      question: "מה קורה אם הרשויות דוחות?",
      answer: "בדרך כלל זה לא קורה, אבל אם יש בעיה, אנחנו עוזרים לתקן את הנתונים ולשלוח שוב."
    },
    {
      question: "יש לכם גם עוסק מורשה?",
      answer: "כן, גם עוסק מורשה - זה קצת יותר מסובך כי צריך לנהל ספרים. אנחנו עוזרים לשניהם."
    },
    {
      question: "האם השירות בטוח?",
      answer: "כן, כל המסמכים והנתונים שלך מוצפנים. אנחנו לא משתמשים בגוגל דרייב או אימיל - הכל דרך מערכת מאובטחת שלנו."
    },
    {
      question: "איך מתחילים?",
      answer: "אתה משאיר פרטים בטופס, יועץ שלנו חוזר אליך בוואטסאפ או טלפון, ומשם אנחנו מתכננים הכל ביחד."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/osek-patur-online" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - ייעוץ וליווי לפתיחת עוסק פטור"
        description="שירות פרטי בתשלום לייעוץ וליווי מקצועי בתהליך פתיחת עוסק פטור אונליין"
        address={{
          street: "",
          city: "",
          country: "ישראל"
        }}
        phone="+972-50-227-7087"
        website="https://perfect1.co.il"
      />
      <SEOOptimized
        title="דליווי מרחוק לפתיחת עוסק פטור - שירות דיגיטלי מלא | Perfect One"
        description="הקים עוסק פטור מהבית בלי צורך לנסוע. חתימה דיגיטלית בטוחה, ליווי מקצועי צמוד וטיפול בכל הרשויות. השאר פרטיך עכשיו."
        keywords="פתיחת עוסק פטור דיגיטלית, עוסק פטור מהבית, חתימה דיגיטלית לעוסק, הקמת עוסק אונליין"
        canonical="https://perfect1.co.il/osek-patur-online"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "ייעוץ וליווי לפתיחת עוסק פטור אונליין",
          "description": "שירות פרטי בתשלום לייעוץ וליווי מקצועי בתהליך פתיחת עוסק פטור",
          "url": "https://perfect1.co.il/osek-patur-online",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "telephone": "+972-50-227-7087",
            "sameAs": [
              "https://www.facebook.com/perfect1.co.il",
              "https://www.linkedin.com/company/perfect1",
              "https://www.instagram.com/perfect1.co.il"
            ]
          },
          "areaServed": {
            "@type": "Country",
            "name": "ישראל"
          },
          "serviceType": "ייעוץ וליווי עסקי"
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'פתיחת עוסק פטור אונליין' }
          ]} />
        </div>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#3498DB] via-[#2980B9] to-[#1E5F8C] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/40">
                  <span className="text-yellow-400 text-sm font-bold">⚠️ שירות ייעוץ וליווי פרטי בתשלום - Perfect One Ltd.</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  הקם עוסק פטור
                  <br />
                  <span className="text-[#D4AF37]">ישר מהמחשב שלך</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed font-medium">
                  ייעוץ מקצועי וליווי צמוד בתהליך פתיחת עוסק - בטוח ודיגיטלי, כולו מהבית
                </p>

                <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-2xl p-6 mb-8 border-2 border-white/40 shadow-2xl">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-2">
                      <Lock className="w-5 h-5 text-white" />
                      <span className="text-white text-sm font-black">מאובטח ותקני חוק</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-white">
                    {[
                      { icon: Monitor, text: 'מהמחשב או הנייד' },
                           { icon: Clock, text: 'בקצב שלך' },
                           { icon: Shield, text: 'הצפנה בנקאית' },
                           { icon: Users, text: 'ליווי ישיר' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                        <item.icon className="w-5 h-5 text-white" />
                        <span className="font-bold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-4 sm:px-8 lg:px-10 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg">
                    <Target className="ml-2 w-5 h-5" />
                    ייעוץ וליווי
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-4 sm:px-8 lg:px-10 text-base sm:text-lg lg:text-xl font-bold rounded-xl border-2 border-white bg-white text-[#3498DB] hover:bg-white/90 shadow-lg">
                      <MessageCircle className="ml-2 w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%233498DB' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='3' width='20' height='14' rx='2' ry='2'/%3E%3Cline x1='8' y1='21' x2='16' y2='21'/%3E%3Cline x1='12' y1='17' x2='12' y2='21'/%3E%3C/svg%3E"
                      alt="פתיחת עוסק פטור אונליין 100% דיגיטלי"
                      className="w-16 h-16 mx-auto mb-4"
                      width="64"
                      height="64"
                      loading="lazy"
                      decoding="async"
                    />
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">שירות ייעוץ דיגיטלי</h3>
                     <p className="text-gray-600">מלא עד סוף בממשק קל וידידותי</p>
                    </div>

                    <ul className="space-y-3">
                     {[
                        'ייעוץ בכל צעד של התהליך',
                        'העלאה בטוחה של מסמכים',
                        'חתימה דיגיטלית מוכרת חוקית',
                        'בדיקה מלא של כל הנתונים לפני הגשה',
                        'הכוונה בתהליך הרשויות',
                        'תמיכה בוואטסאפ וטלפון'
                      ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-3">כבר עזרנו ל-</p>
                    <p className="text-4xl font-black text-[#3498DB]">2000+</p>
                    <p className="text-gray-600 font-medium">עצמאיים לפתוח אונליין</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Questions Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                הכל מה שצריך לדעת לפני שמתחילים
              </h2>
              <p className="text-xl text-gray-600">
                תשובות ישירות ללא עיבוד או סיבובים
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'מה קורה כשאני מעביר את הנתונים?',
                'כמה זמן עד שאני מקבל את האישור?',
                'האם חתימה דיגיטלית כוללת חוקית?',
                'אני צריך להציג מסמכים תוספתיים?',
                'מה לוקח יותר זמן - דיגיטלי או פיזי?',
                'האם אוכל לעצור את התהליך באמצע?'
              ].map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-r-4 border-[#3498DB]"
                >
                  <p className="text-gray-700 font-bold">{q}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center bg-gradient-to-r from-[#3498DB] to-[#2980B9] rounded-2xl p-8 text-white"
            >
              <p className="text-2xl md:text-3xl font-black">
                🚀 התחלת העסק שלך צריכה להיות קלה
              </p>
              <p className="text-xl mt-2">זה אמור להיות פשוט, בטוח ומהיר</p>
            </motion.div>
          </div>
        </section>

        {/* Highlights - Speed & Support */}
        <section className="py-12 bg-gradient-to-r from-[#27AE60]/10 to-[#3498DB]/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Speed */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#27AE60] to-[#2ECC71] rounded-3xl shadow-xl p-8 text-white"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Zap className="w-10 h-10" />
                  <h3 className="text-3xl font-black">תהליך מואץ</h3>
                </div>
                <p className="text-lg text-white/90 font-bold mb-3">ליווי יעיל ומקצועי</p>
                <p className="text-white/80">אנחנו עוזרים לך בכל שלב - מילוי נכון, בדיקה וההכנה של המסמכים. החלק הממשלתי תלוי בעיבוד הרשויות.</p>
              </motion.div>

              {/* Support */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-3xl shadow-xl p-8 text-white"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="w-10 h-10" />
                  <h3 className="text-3xl font-black">בטיחות מוחלטת</h3>
                </div>
                <p className="text-lg text-white/90 font-bold mb-3">הצפנה וגנות מלאה של מידע</p>
                <p className="text-white/80">כל המסמכים והנתונים שלך מוצפנים בסטנדרט בנקאי. תקשורת ישירה דרך וואטסאפ וטלפון - אין מעבר בשירותי צד שלישי.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-[#27AE60]/10 text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6">
                ✅ התהליך שלנו - שלב אחרי שלב
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה קורה בכל שלב?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                ארבעה שלבים פשוטים עד שהעוסק שלך מופיע במערכת
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { icon: FileText, title: 'שלב 1: ייעוץ התחלתי', desc: 'אתה מסביר מה אתה צריך, אנחנו מברים את הכל ומכינים תכנית פעולה' },
                 { icon: Smartphone, title: 'שלב 2: איסוף מסמכים', desc: 'אנחנו מספרים לך בדיוק איזה מסמכים נדרשים - ת.ז., אישור בנק וכו\'' },
                 { icon: Lock, title: 'שלב 3: בדיקה וחתימה', desc: 'בודקים את כל הפרטים קודם, ואז אתה חותם דיגיטלית' },
                 { icon: Zap, title: 'שלב 4: הכוונה בתהליך הממשלתי', desc: 'אנחנו מסבירים לך מה קורה עם מס הכנסה וביטוח לאומי' },
                 { icon: Users, title: 'שלב 5: סיוע בעדכונים', desc: 'אנחנו זמינים בוואטסאפ וטלפון לכל שאלה שלך במהלך התהליך' },
                 { icon: CheckCircle, title: 'סוף התהליך', desc: 'כשהרשויות משלימות את העיבוד, אתה מקבל את האישורים' }
               ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#3498DB]/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3498DB] to-[#2980B9] flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-Page Strong CTA */}
        <section className="py-12 bg-gradient-to-br from-[#2980B9] to-[#3498DB]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
                💡 בואו נעשה את זה בצורה נכונה
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                מהיום, העוסק שלך קיים דיגיטלית
              </h2>
              <p className="text-xl text-white/90 mb-8">
                בואו נעזור לך לעשות את זה נכון. השאר פרטים עכשיו וניצור קשר.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={scrollToForm} className="h-12 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-white text-[#27AE60] hover:bg-white/90 shadow-lg">
                  <Target className="ml-2 w-5 h-5" />
                  פתח אונליין
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 sm:h-14 lg:h-16 px-6 sm:px-10 lg:px-12 text-base sm:text-lg lg:text-xl font-bold rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-lg">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כולל השירות?
              </h2>
              <p className="text-xl text-gray-600">כל מה שצריך לפתיחת עוסק – דיגיטלי ונוח</p>
            </motion.div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#3498DB]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'ייעוץ מקצועי בכל שלב',
                  'חתימה דיגיטלית מוכרת חוקית',
                  'בדיקה מלאה של כל הנתונים',
                  'הכוונה בתהליך הממשלתי',
                  'תמיכה בוואטסאפ וטלפון',
                  'שירות בתשלום'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why Online */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] mb-4">
                למה אונליין?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
               {[
                 { icon: Zap, title: 'ייעוץ מתחיל במהירות', desc: 'אחרי שתשאיר פרטים, יוועץ שלנו יחזור אליך בסמוך ונתכנן את הדרך הקדימה' },
                 { icon: Users, title: 'אדם אמיתי, לא קול רובוט', desc: 'יועץ אמיתי שיודע את תהליך הרשויות וידגים איתך בוואטסאפ וטלפון' },
                 { icon: CheckCircle, title: 'בדיקה מלאה לפני הגשה', desc: 'כל מסמך נבדק, כל פרט מוודא - זה מקטין טעויות ודוחות' },
                 { icon: Shield, title: 'אבטחה וסודיות מלאה', desc: 'כל הנתונים שלך מוצפנים - לא משתמשים בגוגל דרייב או אימיל' }
               ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-[#3498DB]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#3498DB]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#3498DB]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1E3A5F] mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gradient-to-br from-[#3498DB] via-[#2980B9] to-[#1E5F8C]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                רוצה ייעוץ בתהליך פתיחת עוסק?
              </h2>
              <p className="text-xl text-white/90">השאר פרטים ויועץ שלנו יחזור אליך בהקדם</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב ונתחיל את התהליך האונליין</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#D4AF37]/30">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">שם מלא *</label>
                    <Input
                      placeholder="איך קוראים לך?"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">טלפון *</label>
                    <Input
                      type="tel"
                      placeholder="050-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">מייל *</label>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 rounded-xl border-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">סוג עיסוק (לא חובה)</label>
                    <Input
                      placeholder="למשל: צלם, מעצב, מאמן כושר..."
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      className="h-12 rounded-xl border-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-[#3498DB] to-[#2980B9] hover:from-[#2980B9] hover:to-[#3498DB] text-white"
                  >
                    {isSubmitting ? 'שולח...' : 'בואו נתחיל'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    <a href="/privacy" className="text-blue-600 hover:underline">מדיניות פרטיות</a> • 
                    <a href="/terms" className="text-blue-600 hover:underline">תנאי שימוש</a>
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong className="text-blue-800">הבהרה חשובה:</strong> זהו שירות ייעוץ וליווי פרטי בתשלום ממ Perfect One Ltd., חברה עצמאית. 
                      השירות אינו חלק מהרשויות, אינו ייעוץ משפטי רשמי, ואינו מחליף יועץ משפטי או רואה חשבון. זמן אישור הרשויות (מס הכנסה, ביטוח לאומי) תלוי בעיבוד שלהן ולא בשלנו.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                שאלות נפוצות
              </h2>
              <p className="text-lg text-gray-600">כל מה שרצית לדעת על פתיחת עוסק פטור אונליין</p>
            </motion.div>

            <div className="space-y-4">
              {[
                {
                  q: 'כמה זמן לוקח לפתוח עוסק פטור אונליין?',
                  a: 'עם הסיוע האישי שלנו, התהליך מהיר ויעיל. יועץ אישי ילווה אותך בכל שלב - מילוי טופס, העלאת מסמכים וחתימה דיגיטלית.'
                },
                {
                  q: 'האם אפשר לפתוח לבד בלי עזרה?',
                  a: 'אפשר, אבל עם הליווי שלנו זה הרבה יותר קל וביטוח. אנחנו עוזרים בכל שלב - מילוי טופס, העלאת מסמכים וחתימה דיגיטלית.'
                },
                {
                  q: 'מה ההבדל בין עוסק פטור לעוסק מורשה?',
                  a: 'עוסק פטור - פתור ממס הכנסה ולא צריך לנהל ספרים או דוח שנתי מסובך. עוסק מורשה - צריך לנהל ספרים וליידע את הרשויות בהכנסות.'
                },
                {
                  q: 'האם צריך רואה חשבון?',
                  a: 'לא חובה, אבל זה משמעותי. אנחנו מעזרים בניהול הכנסות והוצאות דרך האפליקציה ומכינים את הדוח השנתי שלך.'
                },
                {
                  q: 'מה העלויות של השירות?',
                  a: 'זהו שירות פרטי בתשלום לייעוץ וליווי בפתיחת עוסק פטור. למידע מפורט על עלויות, אנא השאר פרטים ונחזור אליך עם הצעת מחיר מותאמת אישית.'
                },
                {
                  q: 'מה תקרת ההכנסות לעוסק פטור?',
                  a: 'לעוסק פטור אין תקרה של הכנסות - יכול להרוויח כמה שרוצה. אם תרצה להיות עוסק מורשה בעתיד, אתה יכול לעשות זאת בקלות.'
                }
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="landing" />



        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-[#27AE60] to-[#229954] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                חיפשת פתיחת עוסק פטור אונליין? 🌐
              </h2>
              <p className="text-xl text-white/90 mb-8">
                פותחים אונליין, בלי לצאת מהבית - <strong>עכשיו</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl bg-white text-[#27AE60] hover:bg-white/90 shadow-lg">
                  <Monitor className="ml-2 w-5 h-5" />
                  פתח אונליין
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-lg">
                    <MessageCircle className="ml-2 w-6 h-6" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}