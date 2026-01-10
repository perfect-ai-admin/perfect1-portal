import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Phone, MessageCircle, AlertCircle, 
  FileText, Users, Calculator, ChevronDown, AlertTriangle,
  CheckSquare, HelpCircle, TrendingUp, Building2, Receipt
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MasHaKnasaOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('אנא מלא שם וטלפון');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'מס הכנסה לעוסק פטור',
        category: 'osek_patur',
        status: 'new'
      });

      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "האם עוסק פטור משלם מס הכנסה?",
      answer: "כן, עוסק פטור חייב לדווח למס הכנסה על הרווח שלו ולשלם מס הכנסה בהתאם. אם הרווח נמוך או אפילו יש הפסד - לא משלמים מס, אבל חשוב להגיש דוח."
    },
    {
      question: "מתי מדווחים למס הכנסה?",
      answer: "יש להגיש דוח שנתי עד ה-31 במאי של השנה שלאחר שנת המס. למשל, דוח על הכנסות של 2025 מוגש עד מאי 2026."
    },
    {
      question: "מה קורה אם לא מדווחים למס הכנסה?",
      answer: "אי דיווח יכול להוביל לקנסות כבדים, חוב מצטבר עם ריבית והצמדה, וספקות לגבי משיכת סיוע ממשלתי. חשוב להגיש דוח גם אם ההכנסות נמוכות."
    },
    {
      question: "האם חייבים רואה חשבון?",
      answer: "לא חובה חוקית, אבל זה מומלץ מאוד. רואה חשבון יעזור להכין דוח מדויק, יוודא שאתה לא משלם יותר מדי מס, ויחסוך לך זמן וספקות."
    },
    {
      question: "איך מחושב המס של עוסק פטור?",
      answer: "המס מחושב על ה**רווח** (הכנסות פחות הוצאות), לא על המחזור הכולל. אם הוצאותיך גבוהות מההכנסות - אפילו אין מס לשלם."
    },
    {
      question: "צריך להעביר מס מראש או רק בדוח שנתי?",
      answer: "בדרך כלל עוסקים פטורים משלמים מס רק בדוח השנתי. אם יש הכנסה גבוהה מאוד, ייתכן שתתבקש לשלם מס מקדמות, אבל זה נדיר."
    },
    {
      question: "מה ההבדל בין עוסק פטור לעוסק מורשה במס הכנסה?",
      answer: "עוסק פטור פטור מחובה בניהול ספרים מסודר. עוסק מורשה צריך לנהל ספרים מדויקים ולדווח בתדירות גבוהה יותר (חודשית או דו-חודשית)."
    },
    {
      question: "איפה משלמים מס הכנסה?",
      answer: "הדוח השנתי מוגש דרך אתר מס הכנסה (אתמול עם תעודה דיגיטלית). התשלום יכול להיות דרך העברה בנקאית, כרטיס אשראי, או דרך שירות מס הכנסה."
    },
    {
      question: "אם אני עוסק אני יכול להוריד הוצאות?",
      answer: "כן, הוצאות לגיטימיות הקשורות לעסק - שכירות משרד, ציוד, תחזוקה וכו' - ניתן להוריד מההכנסות. זה מקטין את המס שאתה משלם."
    },
    {
      question: "מה הקשר בין דוח שנתי לדיווח למס הכנסה?",
      answer: "הדוח השנתי הוא בדיוק הדיווח למס הכנסה. בו אתה מדווח על הכנסות, הוצאות, רווח וה-מס שצריך לשלם בהתאם."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/mas-haknasa-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - מס הכנסה לעוסק פטור"
        description="מדריך מקיף על מס הכנסה לעוסק פטור בישראל - חובות דיווח, חישוב מס וטעויות נפוצות"
      />
      <SEOOptimized
        title="מס הכנסה לעוסק פטור – חובות, דיווחים ומה חשוב לדעת | 2026"
        description="מדריך מלא על מס הכנסה לעוסק פטור בישראל: חובות דיווח, איך מחשבים מס, טעויות נפוצות, דוח שנתי ותשובות לשאלות נפוצות."
        keywords="מס הכנסה עוסק פטור, דיווח מס לעצמאי, דוח שנתי עוסק פטור, חובות מס, עוסק פטור ומס הכנסה"
        canonical="https://perfect1.co.il/mas-haknasa-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'מס הכנסה לעוסק פטור' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#27AE60] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <AlertTriangle className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">חובות שחשוב לדעת</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  מס הכנסה לעוסק פטור – חובות, דיווחים ומה חשוב לדעת
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    עוסק פטור חייב בדיווח למס הכנסה, גם אם ההכנסות נמוכות.
                    <br />
                    <strong className="text-[#D4AF37]">הבנה נכונה של החובות מול מס הכנסה יכולה למנוע קנסות ובעיות</strong> בהמשך.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, רוצה לשמוע עוד על מס הכנסה לעוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      שאל אותנו בווצאפ
                    </Button>
                  </a>
                  <Button 
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline" 
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl"
                  >
                    <FileText className="ml-3 w-5 h-5" />
                    בדיקה והכוונה
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] mx-auto mb-4 flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">מה כולל המדריך?</h3>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'חובות עוסק פטור מול מס הכנסה',
                      'איך מחושב המס בפועל',
                      'דיווח שנתי - מה וכמתי',
                      'טעויות נפוצות ואיך להימנע',
                      'שאלות נפוצות וכל התשובות',
                      'הכוונה מסודרת לדיווח נכון'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* H2: חובות עוסק פטור */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                מה החובות של עוסק פטור מול מס הכנסה?
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  עוסק פטור חייב בדיווח למס הכנסה על הכנסותיו בדומה לכל עצמאי אחר. הנה החובות העיקריות:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">דוח שנתי</h3>
                    <p className="text-gray-700">הגשת דוח שנתי למס הכנסה עד ה-31 במאי של השנה שלאחר שנת המס</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60] flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">חישוב ודיווח מס</h3>
                    <p className="text-gray-700">דיווח על הרווח וחישוב מס הכנסה בהתאם לשיעור המס החל</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">דיווח הכנסות</h3>
                    <p className="text-gray-700">רישום מדויק של כל הכנסות העסק במהלך השנה</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-100">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-4">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">ניהול הוצאות</h3>
                    <p className="text-gray-700">תיעוד כל הוצאות חוקיות הקשורות לעסק</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F]">
                  <p className="text-lg">
                    <strong>חשוב:</strong> הדיווח הוא חיוני גם אם אין הכנסה או אם יש הפסד. אי דיווח יכול להוביל לקנסות משמעותיים.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* H2: טעויות נפוצות */}
        <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                טעויות נפוצות של עוסקים פטורים במס הכנסה
              </h2>

              <p className="text-xl text-gray-700 text-center mb-10">
                הימנע מהטעויות האלה כדי לא להסתבך עם מס הכנסה
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertCircle,
                    title: 'אי דיווח הכנסות',
                    desc: 'לא לדווח על כל ההכנסות או להסתיר הכנסות יכול להוביל לביקורת מס, קנסות כבדים וחובות עם ריבית.'
                  },
                  {
                    icon: FileText,
                    title: 'בלבול בין עוסק פטור ומורשה',
                    desc: 'כל עוסק חייב לדעת מאיזה סוג הוא כדי לדווח נכון. בלבול עלול להוביל לדוח לא תקני.'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'חוסר ניהול הוצאות',
                    desc: 'אם לא תתעדו הוצאות חוקיות - תשלמו מס גבוה מהנדרש. שמרו קבלות של כל הוצאה קשורה לעסק.'
                  },
                  {
                    icon: HelpCircle,
                    title: 'אי דיווח בזמן',
                    desc: 'הגשת דוח מאוחר גורמת לקנס. אם אתם בספק - טוב יותר להגיש דוח, אפילו עם השתמכות.'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-red-500 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* H2: פתיחת תיק עוסק פטור במס הכנסה */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                פתיחת תיק עוסק פטור במס הכנסה
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  מי שעדיין לא פתח תיק יכול לבצע זאת כחלק מתהליך של <Link to={createPageUrl('OsekPaturLanding')} className="text-[#1E3A5F] font-bold hover:text-[#27AE60] underline">פתיחת עוסק פטור בצורה מסודרת</Link> מול כל הרשויות.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-100">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6">איך זה עובד?</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">הגשת טופס פתיחת עוסק:</strong>
                        <p className="mt-1">מגישים טופס 101 (או דרך הנהלת מס הכנסה) עם הפרטים הדרושים</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">קבלת מספר עסק:</strong>
                        <p className="mt-1">מס הכנסה מנפיק מספר עסק וביום 1 של עסקך אתה רשום רשמית</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">הודעה לביטוח לאומי ומע"מ:</strong>
                        <p className="mt-1">מס הכנסה מעביר את הפרטים לגופים אחרים (אם צריך)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">התחלת דיווח שנתי:</strong>
                        <p className="mt-1">מהיום הראשון של העסק תחזיקו ניהול הכנסות והוצאות</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 border-r-4 border-[#27AE60]">
                  <p className="text-lg">
                    <strong>המלצה:</strong> השתמש בשירות מסודר לפתיחת עוסק כדי לוודא שהכל מעובד נכון מההתחלה. זה יחסוך לך ספקות בהמשך.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                שאלות נפוצות
              </h2>
              <p className="text-lg text-gray-600 text-center mb-10">
                כל מה שרצית לדעת על מס הכנסה לעוסק פטור
              </p>

              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`item-${i}`}
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#1E3A5F]/30 transition-all px-6"
                  >
                    <AccordionTrigger className="text-right hover:no-underline py-4">
                      <span className="text-lg font-bold text-[#1E3A5F]">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-700 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                לא בטוחים איך נכון להתנהל מול מס הכנסה?
              </h2>
              <p className="text-xl text-white/90">
                אפשר לבדוק ולקבל הכוונה מסודרת לפני שמגישים דוחות
              </p>
            </motion.div>

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
                  <label className="block text-sm font-bold text-gray-700 mb-2">מקצוע (לא חובה)</label>
                  <Input
                    placeholder="למשל: צלם, מעצב, מאמן..."
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="h-12 rounded-xl border-2"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה והכוונה לעוסק פטור'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  ללא התחייבות • ייעוץ והכוונה מקצועית • תמיכה 24/7
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="landing" />
      </main>
    </>
  );
}