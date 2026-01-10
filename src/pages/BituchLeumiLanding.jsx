import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, Phone, MessageCircle, Shield, Clock, 
  AlertCircle, TrendingDown, FileText, Users, Calculator,
  ChevronDown, Building2, Receipt, HelpCircle, CheckSquare
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

export default function BituchLeumiLanding() {
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
        source_page: 'ביטוח לאומי לעוסק פטור',
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
      question: "האם עוסק פטור חייב בביטוח לאומי?",
      answer: "כן, עוסק פטור חייב לדווח לביטוח לאומי ולשלם דמי ביטוח לאומי לפי ההכנסות. הרישום נעשה אוטומטית בעת פתיחת העוסק, והתשלום נקבע לפי רווח העסק."
    },
    {
      question: "מה קורה אם לא נרשמתי לביטוח לאומי?",
      answer: "אי רישום עלול לגרום לחוב מצטבר, קנסות והשלכות על זכויות עתידיות. חשוב להירשם מיד עם פתיחת העסק כדי להימנע מבעיות."
    },
    {
      question: "האם יש פטור מתשלום ביטוח לאומי?",
      answer: "בהכנסה נמוכה מסכום מסוים, ייתכן ולא יהיה תשלום או שהוא יהיה מינימלי. עם זאת, חשוב לדווח בכל מקרה כדי לשמור על רצף זכויות."
    },
    {
      question: "איך מתעדכנים התשלומים לביטוח לאומי?",
      answer: "ביטוח לאומי שולח דרישת תשלום רבעונית על בסיס הכנסה משוערת, ולאחר הגשת הדוח השנתי מתבצעת התאמה סופית לפי הרווח בפועל."
    },
    {
      question: "מה הקשר בין דוח שנתי לביטוח לאומי?",
      answer: "הדוח השנתי מדווח על ההכנסה בפועל, ולפי זה ביטוח לאומי מחשב את התשלום הסופי. אם שילמת יותר - תקבל החזר, ואם פחות - תתבקש להשלים."
    },
    {
      question: "האם יש הטבות לעוסקים חדשים?",
      answer: "עוסקים חדשים יכולים להיות זכאים להנחות בשנה הראשונה, בהתאם לתנאים מסוימים. כדאי לבדוק זכאות עם סניף ביטוח לאומי או יועץ מקצועי."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/bituch-leumi-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - ביטוח לאומי לעוסק פטור"
        description="מדריך מקיף על ביטוח לאומי לעוסק פטור - תשלומים, חובות וזכויות"
      />
      <SEOOptimized
        title="ביטוח לאומי לעוסק פטור – תשלומים, חובות וזכויות | מדריך 2026"
        description="כל מה שצריך לדעת על ביטוח לאומי לעוסק פטור בישראל: חובות רישום, גובה תשלום, זכויות, טעויות נפוצות ועוד. מדריך מקיף ועדכני."
        keywords="ביטוח לאומי עוסק פטור, תשלום ביטוח לאומי עצמאי, רישום ביטוח לאומי, דמי ביטוח לאומי, זכויות עצמאים"
        canonical="https://perfect1.co.il/bituch-leumi-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'ביטוח לאומי לעוסק פטור' }
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
                  <Shield className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">מדריך מקיף 2026</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  ביטוח לאומי לעוסק פטור – תשלומים, חובות וזכויות
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    ביטוח לאומי הוא אחד הגופים הראשונים שעוסק פטור חייב לדווח להם.
                    <br />
                    <strong className="text-[#D4AF37]">הרישום והתשלום משפיעים על זכויות עתידיות</strong> כמו דמי לידה, פנסיה וקצבאות.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, רוצה לשמוע עוד על ביטוח לאומי לעוסק פטור" target="_blank" rel="noopener noreferrer">
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
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">מה כולל המדריך?</h3>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'רישום בביטוח לאומי - איך ומתי',
                      'חישוב תשלום - כמה תשלם',
                      'זכויות עצמאים - מה מגיע לך',
                      'טעויות נפוצות ואיך להימנע',
                      'דוח שנתי והשפעתו',
                      'הנחות ופטורים אפשריים'
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

        {/* רישום עוסק פטור בביטוח לאומי */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                רישום עוסק פטור בביטוח לאומי
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  הרישום בביטוח לאומי נעשה <strong className="text-[#1E3A5F]">אוטומטית עם פתיחת העוסק</strong>.
                  מס הכנסה מעביר את הפרטים לביטוח לאומי, והם מתחילים לדווח לך על תשלום חודשי/רבעוני.
                </p>

                <div className="grid md:grid-cols-3 gap-6 my-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-100">
                    <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">מתי נרשמים?</h3>
                    <p className="text-gray-700">מיד עם פתיחת העוסק, הרישום נעשה אוטומטית</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60] flex items-center justify-center mb-4">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">איך נקבע התשלום?</h3>
                    <p className="text-gray-700">לפי הכנסה משוערת, מתעדכן בדוח שנתי</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-100">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center mb-4">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">הכנסה נמוכה?</h3>
                    <p className="text-gray-700">ייתכן תשלום מופחת או אפס, אך חשוב לדווח</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F]">
                  <p className="text-lg">
                    <strong>חשוב לדעת:</strong> גם אם ההכנסה נמוכה, יש לדווח כדי לשמור על רצף זכויות.
                    אי דיווח עלול לפגוע בזכויות עתידיות כמו דמי לידה, פנסיה ומחלה.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* כמה משלם עוסק פטור */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                כמה משלם עוסק פטור לביטוח לאומי?
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  התשלום לביטוח לאומי מבוסס על <strong className="text-[#1E3A5F]">הרווח השנתי</strong> שלך,
                  ולא על המחזור (ההכנסות הכוללות).
                </p>

                <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-gray-100">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 flex items-center gap-3">
                    <Receipt className="w-7 h-7 text-[#27AE60]" />
                    שלבי התשלום
                  </h3>

                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <strong className="text-[#1E3A5F]">מקדמות חודשיות/רבעוניות:</strong>
                        <p className="mt-1">ביטוח לאומי משער לך הכנסה ושולח דרישת תשלום קבועה</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#27AE60] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <strong className="text-[#1E3A5F]">דוח שנתי:</strong>
                        <p className="mt-1">מגישים דוח למס הכנסה עם הרווח בפועל</p>
                      </div>
                    </li>

                    <li className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <strong className="text-[#1E3A5F]">התאמה סופית:</strong>
                        <p className="mt-1">ביטוח לאומי מחשב מחדש - אם שילמת יותר תקבל החזר, אם פחות תשלים</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 border-2 border-amber-200">
                  <p className="text-lg font-bold text-gray-800">
                    💡 <strong>טיפ:</strong> כדאי לשמור כסף בצד להתאמה השנתית. לפעמים צריך להשלים סכום משמעותי.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* פתיחת עוסק פטור מול ביטוח לאומי */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6 text-center">
                פתיחת עוסק פטור מול ביטוח לאומי
              </h2>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-xl">
                  בעת <Link to={createPageUrl('OsekPaturLanding')} className="text-[#1E3A5F] font-bold hover:text-[#27AE60] underline">פתיחת עוסק פטור</Link>,
                  חשוב לבצע רישום מסודר גם בביטוח לאומי כחלק מ<Link to={createPageUrl('Services')} className="text-[#1E3A5F] font-bold hover:text-[#27AE60] underline">תהליך פתיחת עוסק פטור המלא</Link>.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-100">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6">מה עושים בפועל?</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">מילוי טופס לביטוח לאומי:</strong>
                        <p className="mt-1">מסמכים שמגישים למס הכנסה מועברים אוטומטית</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">קבלת דרישת תשלום ראשונה:</strong>
                        <p className="mt-1">תוך כמה שבועות תגיע דרישה למקדמות</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <CheckSquare className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-[#1E3A5F]">הסדרת תשלום:</strong>
                        <p className="mt-1">אפשר לשלם דרך אתר ביטוח לאומי או הוראת קבע</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-2xl p-6 border-r-4 border-[#27AE60]">
                  <p className="text-lg">
                    <strong>המלצה:</strong> השתמש בשירות ליווי חודשי שכולל גם ניהול תשלומים לביטוח לאומי.
                    כך לא תפספס תשלום ותישאר מסודר לאורך כל השנה.
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
                טעויות נפוצות בביטוח לאומי
              </h2>

              <p className="text-xl text-gray-700 text-center mb-10">
                הימנע מהטעויות האלה כדי לא להסתבך
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: AlertCircle,
                    title: 'אי רישום בזמן',
                    desc: 'לא לדווח מיד עם פתיחת העוסק עלול לגרום לחוב מצטבר וקנסות. חשוב לוודא שהפרטים הועברו מיד.'
                  },
                  {
                    icon: FileText,
                    title: 'דיווח הכנסה שגוי',
                    desc: 'להעריך הכנסה גבוהה מדי יגרום לתשלום מופרז. הכנסה נמוכה מדי עלולה לגרום לחוב בהתאמה השנתית.'
                  },
                  {
                    icon: TrendingDown,
                    title: 'חוב מצטבר בלי ידיעה',
                    desc: 'לא לעקוב אחרי הדרישות ולא לשלם בזמן יוצר חוב שגדל עם ריבית והצמדה. כדאי לבדוק מעמד כל רבעון.'
                  },
                  {
                    icon: HelpCircle,
                    title: 'ויתור על זכויות',
                    desc: 'לא לדווח כשאין הכנסה גורם לפגיעה ברצף הזכויות. חשוב לדווח גם בשנים רזות כדי לשמור על זכויות עתידיות.'
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
        <section className="py-16 bg-white">
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
                כל מה שרצית לדעת על ביטוח לאומי לעוסק פטור
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

        {/* CTA רך */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                רוצה לוודא שאתה מסודר מול ביטוח לאומי?
              </h2>
              <p className="text-xl text-white/90">
                אפשר לבדוק את המצב ולקבל הכוונה לפני שמצטברים חובות
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