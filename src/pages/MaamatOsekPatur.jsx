import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Phone, MessageCircle, AlertCircle, 
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

export default function MaamatOsekPatur() {
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
        source_page: 'מע״מ לעוסק פטור',
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
      question: "האם עוסק פטור פטור מחובה בתשלום מע״מ?",
      answer: "כן, עוסק פטור פטור מתשלום מע״מ בתנאי שהכנסתו לא עוברת את תקרת ההכנסה השנתית. כל עוד הוא שומר על התקרה - הוא לא משלם מע״מ."
    },
    {
      question: "מה הם התנאים לפטור ממע״מ?",
      answer: "עוסק פטור זכאי לפטור ממע״מ כל עוד הכנסתו השנתית לא עוברת את תקרת ההכנסה המופקדת (הנתונים משתנים מדי שנה). כל הכנסה מעבר לתקרה חייבת בתשלום מע״מ."
    },
    {
      question: "מה קורה כשהכנסתי עוברת את התקרה?",
      answer: "כשהכנסתך עוברת את התקרה, חייב להירשם כעוסק מורשה (רשום למע״מ) ולהתחיל לשלם מע״מ על כל הכנסה. הרישום חייב להיעשות בזמן, אחרת יכול להיווצר חוב וקנסות."
    },
    {
      question: "איך מודדים את התקרה?",
      answer: "התקרה נמדדת לפי סה״כ ההכנסות (לא הרווח). אם הכנסותיך עוברות את התקרה - פטור מע״מ מסתיים מיד או בתאריך שנקבע על ידי רשויות המס."
    },
    {
      question: "אם אני עוסק פטור - צריך לדווח על מע״מ?",
      answer: "לא, עוסק פטור לא מדווח על מע״מ כל עוד הוא תחת התקרה. אין חובה לדווח דוחות מע״מ חודשיים או דו-חודשיים."
    },
    {
      question: "מה ההבדל בין עוסק פטור למורשה במע״מ?",
      answer: "עוסק פטור: לא משלם מע״מ, לא מדווח למע״מ, אין חובה בניהול ספרים מסודר. עוסק מורשה: משלם ומדווח מע״מ בתדירות קבועה (חודשי או דו-חודשי)."
    },
    {
      question: "אם הכנסתי יורדת מהתקרה - אחזור לפטור?",
      answer: "בעקרון כן, אך צריך לבדוק את הנוסח המדויק עם מס הכנסה. לפעמים קיימת תקופת טרנזיציה או שנים שבהן לא ניתן לחזור לפטור."
    },
    {
      question: "מה קורה אם אני רשום למע״מ בטעות?",
      answer: "אם רשום למע״מ בטעות וההכנסה שלך מתחת לתקרה, אפשר להגיש בקשה לביטול הרישום. כדאי לפנות למס הכנסה בהקדם כדי להימנע מחוב מע״מ מיותר."
    },
    {
      question: "האם אני יכול להבחור להירשם למע״מ גם אם מתחת לתקרה?",
      answer: "כן, יש אפשרות להירשם למע״מ בהתנדבות גם אם מתחת לתקרה. זה יכול להיות כדאי אם אתה קונה הרבה יבואות שכוללות מע״מ, כי אתה יכול להחזיר את המע״מ."
    },
    {
      question: "מה הקשר בין מע״מ לדוח השנתי?",
      answer: "עוסק פטור לא דווח מע״מ בדוח שנתי, אבל חייב להגיש דוח שנתי למס הכנסה על הכנסות והוצאות. עוסק מורשה מדווח גם מע״מ וגם מס הכנסה."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/maamat-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - מע״מ לעוסק פטור"
        description="מדריך מקיף על מע״מ לעוסק פטור בישראל - פטור, תקרה הכנסה וחובות"
      />
      <SEOOptimized
        title="מע״מ לעוסק פטור – פטור, תקרה הכנסה וחובות | מדריך 2026"
        description="מדריך מלא על מע״מ לעוסק פטור בישראל: תנאי הפטור, תקרת הכנסה, מתי צריך להירשם כעוסק מורשה, טעויות נפוצות ותשובות לשאלות."
        keywords="מע״מ עוסק פטור, פטור ממע״מ, תקרת מע״מ, עוסק מורשה, הרשמה למע״מ"
        canonical="https://perfect1.co.il/maamat-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'מע״מ לעוסק פטור' }
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
                  <span className="text-[#27AE60] text-sm font-bold">פטור וחובות מע״מ</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  מע״מ לעוסק פטור – פטור, תקרה וחובות
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    עוסק פטור פטור מחובה בתשלום מע״מ כל עוד הכנסתו לא עוברת את התקרה.
                    <br />
                    <strong className="text-[#D4AF37]">הבנה נכונה של חובות ותקרות יכולה למנוע קנסות ובעיות</strong> בהמשך.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, רוצה לשמוע עוד על מע״מ לעוסק פטור" target="_blank" rel="noopener noreferrer">
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
                      'פטור ממע״מ - תנאים וחובות',
                      'תקרת הכנסה - מה קובע אותה',
                      'הרשמה למע״מ - כשמתי צריך',
                      'טעויות נפוצות ואיך להימנע',
                      'הבדל בין עוסק פטור למורשה',
                      'שאלות נפוצות וכל התשובות'
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

        {/* חובות עוסק פטור */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                מה מע״מ של עוסק פטור?
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  עוסק פטור בתנאים מסוימים פטור מחובה בתשלום מע״מ. הנה מה שחשוב לדעת:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">תנאי הפטור</h3>
                    <p className="text-gray-700">הכנסה שלא עוברת תקרה שנתית קבועה מהווה תנאי ראשון לפטור</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60] flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">חישוב התקרה</h3>
                    <p className="text-gray-700">התקרה נמדדת לפי סה״כ ההכנסות, לא לפי הרווח בפועל</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">חוזרים לדיווח?</h3>
                    <p className="text-gray-700">כשהכנסה עוברת את התקרה - חייב להירשם כעוסק מורשה</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-100">
                    <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-4">
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">דיווח דוח שנתי</h3>
                    <p className="text-gray-700">דוח שנתי הוא מנגנון שדרכו מס הכנסה יודע שאתה עוסק פטור</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F]">
                  <p className="text-lg">
                    <strong>חשוב:</strong> אפילו עוסק פטור חייב להגיש דוח שנתי למס הכנסה. זה מאשר את סטטוס הפטור.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* טעויות נפוצות */}
        <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                טעויות נפוצות בנושא מע״מ
              </h2>

              <p className="text-xl text-gray-700 text-center mb-10">
                הימנע מהטעויות האלה כדי לא להסתבך
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertCircle,
                    title: 'אי מעקב אחרי תקרת ההכנסה',
                    desc: 'לא לעקוב אחרי ההכנסה וחצי אם אתה קרוב לתקרה עלול להוביל לאי דיווח תקין בזמן. חשוב לבדוק מדי רבעון.'
                  },
                  {
                    icon: FileText,
                    title: 'הרישום המאוחר למע״מ',
                    desc: 'כשהכנסה חוזרת על התקרה, חייב להירשם מיד כעוסק מורשה. ם החמתך - קנסות וחוב ריבית.'
                  },
                  {
                    icon: AlertTriangle,
                    title: 'בלבול בין סה״כ הכנסה לרווח',
                    desc: 'התקרה מדוברת לפי סה״כ ההכנסות, לא הרווח. חשוב לעקוב לפי המחזור הכולל של המחזור.'
                  },
                  {
                    icon: HelpCircle,
                    title: 'אי הגשת דוח שנתי כמתבקע',
                    desc: 'גם עוסק פטור חייב להגיש דוח שנתי למס הכנסה. אי דיווח גורם לקנסות ומעיד על אי מסדרות.'
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

        {/* פתיחת עוסק פטור */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                פתיחת עוסק פטור במע״מ
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  מי שרוצה לפתוח עוסק פטור בעריכה מסודרת יכול לעשות זאת כחלק מתהליך של <Link to={createPageUrl('OsekPaturLanding')} className="text-[#1E3A5F] font-bold hover:text-[#27AE60] underline">פתיחת עוסק פטור בצורה מלאה</Link>.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-100">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6">איך זה עובד?</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">פתיחת עוסק:</strong>
                        <p className="mt-1">פתיחת תיק בעוסק פטור בכל הרשויות - מס הכנסה, מע״מ וביטוח לאומי</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">הודעה לגופים הרלוונטיים:</strong>
                        <p className="mt-1">רישום במע״מ כפטור (עד שתעברו את התקרה), רישום בביטוח לאומי</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">מעקב אחרי התקרה:</strong>
                        <p className="mt-1">ניהול מעקב עם רואה חשבון כדי לא לחצות את תקרת מע״מ בלי דיווח</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">דוח שנתי:</strong>
                        <p className="mt-1">הכנת והגשת דוח שנתי שמאשר את סטטוס הפטור וההכנסות</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 border-r-4 border-[#27AE60]">
                  <p className="text-lg">
                    <strong>המלצה:</strong> כדאי לעבוד עם רואה חשבון שמעקוב אחרי ההכנסות שלך כדי לא לפספס את התקרה בלי להירשם למע״מ בזמן.
                  </p>
                </div>
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
                כל מה שרצית לדעת על מע״מ לעוסק פטור
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
                לא בטוחים באם אתם פטורים ממע״מ?
              </h2>
              <p className="text-xl text-white/90">
                אפשר לבדוק את הסטטוס ולקבל הכוונה לפני שמתחייבים לתשלום
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