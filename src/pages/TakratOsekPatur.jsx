import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Phone, MessageCircle, AlertCircle, Clock,
  FileText, Users, Calculator, AlertTriangle,
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

export default function TakratOsekPatur() {
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
        source_page: 'תקרת עוסק פטור',
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
      question: "מה זו תקרת עוסק פטור?",
      answer: "תקרת עוסק פטור היא סכום הכנסה שנתי מקסימלי - כל עוד אתה מתחתיה, אתה פטור מרישום למע״מ ומניהול ספרים מסודר. כשאתה חוצה אותה - חייב להירשם כעוסק מורשה."
    },
    {
      question: "האם הכנסה כשכיר נחשבת לתקרה?",
      answer: "לא! התקרה נחשבת רק על הכנסה מעוסק פטור (עצמאיות). אם אתה גם שכיר - שכרך כשכיר לא נחשב לתקרה. רק הרווח מהעוסק שלך משפיע."
    },
    {
      question: "מה הסכום המדויק של התקרה ב-2026?",
      answer: "תקרת ההכנסה לעוסק פטור בשנת 2026 היא 122,833 ₪. זהו סכום המבוסס על הצמדת מדד ודורש עדכון מדי שנה."
    },
    {
      question: "מה קורה כשאני חוצה את התקרה?",
      answer: "כשהכנסה שלך עוברת את התקרה, חייב להירשם כעוסק מורשה (רשום למע״מ). מרגע הרישום צריך לשלם מע״מ על המכירות וליהול ניהול ספרים מסודר."
    },
    {
      question: "כמה מהר צריך להירשם אחרי חציית התקרה?",
      answer: "צריך להירשם בתוך זמן סביר (בדרך כלל עד סוף החודש בו חצית). אם תעכבת - יכול להיווצר חוב ריבית וקנסות."
    },
    {
      question: "האם אפשר להחזור לעוסק פטור אחרי הרישום?",
      answer: "בעקרון אפשר, אך יש תנאים וזמנים מסוימים. בדרך כלל צריך להיות מתחת לתקרה לשנה שלמה כדי להחזור לפטור."
    },
    {
      question: "איך אני יודע אם אני קרוב לתקרה?",
      answer: "עדיף לעקוב אחרי הכנסות כל רבעון ולחשב את סכום הרווח. אם אתה קרוב - כדאי להתייעץ עם רואה חשבון מיד."
    },
    {
      question: "האם צריך להודיע על חציית התקרה?",
      answer: "כן, חייב להודיע למס הכנסה וללמע״מ על הרישום כעוסק מורשה. זה בדרך כלל נעשה דרך בקשה מסודרת."
    },
    {
      question: "מה ההבדל בהוצאות כשאתה מורשה?",
      answer: "כעוסק מורשה, צריך ניהול ספרים מדויק יותר, דיווח מע״מ בתדירות קבועה (חודשית או דו-חודשית), וחישוב מדויק של מע״מ על כל עסקה."
    },
    {
      question: "האם תקרת עוסק פטור משתנה מדי שנה?",
      answer: "כן, התקרה משתנה מדי שנה בהתאם להצמדה. חשוב לעדכן את עצמך כל שנה בסכום החדש כדי לא להיות בהפתעה."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/takrat-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - תקרת עוסק פטור 2026"
        description="מדריך מקיף על תקרת עוסק פטור בישראל - כמה הכנסה מותרת והמעבר לעוסק מורשה"
      />
      <SEOOptimized
        title="תקרת עוסק פטור 2026 – כמה הכנסה מותרת? | מדריך מלא"
        description="תקרת ההכנסה לעוסק פטור בישראל 2026: כמה אתה יכול להרוויח, מה קורה כשאתה חוצה, והבדל בין עוסק פטור למורשה. הכנסה כשכיר לא נחשבת!"
        keywords="תקרת עוסק פטור, תקרה 2026, עוסק פטור מורשה, הכנסה עוסק פטור, כמה יכול להרוויח"
        canonical="https://perfect1.co.il/takrat-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'תקרת עוסק פטור' }
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
                  <span className="text-[#27AE60] text-sm font-bold">כמה יכול להרוויח?</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  תקרת עוסק פטור 2026 – כמה הכנסה מותרת?
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    כל עוד הכנסתך כעצמאי מתחת לתקרה - אתה פטור מרישום למע״מ.
                    <br />
                    <strong className="text-[#D4AF37]">חצייה בטעות יכולה להוביל לבעיות משפטיות ותשלומים גבוהים</strong>.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#D4AF37] to-amber-400 rounded-3xl p-6 border-2 border-amber-300 mb-8 text-center">
                  <p className="text-sm text-amber-900 mb-2">תקרת ההכנסה לשנת 2026</p>
                  <p className="text-4xl md:text-5xl font-black text-amber-900">₪122,833</p>
                  <p className="text-sm text-amber-800 mt-2">זהו הסכום השנתי המקסימלי להישאר כעוסק פטור</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, רוצה לדעת אם אני קרוב לתקרה של עוסק פטור" target="_blank" rel="noopener noreferrer">
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
                      'מה זו תקרת עוסק פטור',
                      'הסכום המדויק ל-2026',
                      'מה קורה כשאתה חוצה',
                      'הכנסה כשכיר לא נחשבת!',
                      'המעבר לעוסק מורשה',
                      'טעויות נפוצות ואיך להימנע'
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

        {/* מה זו התקרה */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                מה זו תקרת עוסק פטור?
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  תקרת עוסק פטור היא סכום הכנסה שנתי מקסימלי. כל עוד אתה מתחתיה - אתה נהנה מהטבות עוסק פטור.
                  כשאתה חוצה אותה - המצב משתנה במהירות.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">עוסק פטור - מתחת לתקרה</h3>
                    <p className="text-gray-700">לא משלם מע״מ, לא מדווח מע״מ, מינימום ניהול ספרים</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-100">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-4">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">עוסק מורשה - מעבר לתקרה</h3>
                    <p className="text-gray-700">משלם מע״מ, דיווח בתדירות קבועה, ניהול ספרים מדויק</p>
                  </div>
                </div>

                {/* משפט חץ - הכנסה כשכיר לא נחשבת */}
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-3xl p-8 border-2 border-amber-300">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">⚡</div>
                    <div>
                      <h3 className="text-2xl font-black text-amber-900 mb-2">משפט חשוב מלא!</h3>
                      <p className="text-lg text-amber-900 font-bold">
                        התקרה נחשבת רק על הכנסה כעצמאי (עוסק פטור). אם אתה גם שכיר - השכר שלך כשכיר לא משפיע על התקרה בכלל. רק הרווח מהעוסק שלך חשוב.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F]">
                  <p className="text-lg">
                    <strong>למה זה חשוב:</strong> הרבה עוסקים חדשים חוששים שהכנסתם הכוללת תחצה את התקרה - אבל בעצם רק הכנסה מהעוסק שלהם משנה.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* חציית התקרה */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                מה קורה כשאתה חוצה את התקרה?
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  חציית התקרה אומר שעברת מעוסק פטור לעוסק מורשה. זה לא משהו שקורה בשקט.
                </p>

                <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-[#27AE60]" />
                    השלבים החדשים
                  </h3>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <strong className="text-[#1E3A5F]">הודעה למס הכנסה:</strong>
                        <p className="mt-1">צריך להודיע שאתה משנה לעוסק מורשה</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#27AE60] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <strong className="text-[#1E3A5F]">רישום למע״מ:</strong>
                        <p className="mt-1">אתה רשום כעוסק מורשה ומתחיל לשלם מע״מ</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <strong className="text-[#1E3A5F]">דיווח מע״מ קבוע:</strong>
                        <p className="mt-1">דיווח מע״מ חודשי או דו-חודשי לפי הזמנת מס הכנסה</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <strong className="text-[#1E3A5F]">ניהול ספרים מסודר:</strong>
                        <p className="mt-1">חובה לנהל ספרים מדויקים וחשבוניות רשמיות</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* טעויות נפוצות */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                טעויות נפוצות בנושא תקרה
              </h2>

              <p className="text-xl text-gray-700 text-center mb-10">
                הימנע מהטעויות האלה
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertCircle,
                    title: 'אי מעקב אחרי ההכנסות',
                    desc: 'לא לעקוב על הכנסות וחצייה בטעות לתקרה. חשוב לבדוק מדי רבעון.'
                  },
                  {
                    icon: FileText,
                    title: 'ספירת הכנסה כשכיר לתקרה',
                    desc: 'טעות נפוצה היא לחשוב שגם השכר כשכיר משפיע. זה לא נכון - רק הכנסה מהעוסק חשובה.'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'ההרשמה המאוחרת למע״מ',
                    desc: 'חציית התקרה בלי הרישום בזמן למע״מ יוצרת חוב ריבית וקנסות.'
                  },
                  {
                    icon: HelpCircle,
                    title: 'לא להתייעץ בזמן',
                    desc: 'אם אתה קרוב לתקרה - טוב יותר להתייעץ עם רואה חשבון קודם לכן.'
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

        {/* FAQ */}
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
                כל מה שרצית לדעת על תקרת עוסק פטור
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

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                אתה קרוב לתקרה?
              </h2>
              <p className="text-xl text-white/90">
                בואו נבדוק ביחד ונתכננו את הצעדים הנכונים
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