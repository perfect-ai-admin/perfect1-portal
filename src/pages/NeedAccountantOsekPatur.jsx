import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import {
  CheckCircle, Phone, MessageCircle, AlertCircle,
  Clock, DollarSign, FileText, Shield, AlertTriangle,
  TrendingUp, Zap, Award, ArrowRight, Building2, Users,
  BarChart3, Lock, Calculator, Eye
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function NeedAccountantOsekPatur() {
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
        source_page: 'צריך רואה חשבון לעוסק פטור',
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
      question: "האם עוסק פטור יכול להתנהל ללא רואה חשבון?",
      answer: "טכנית כן - אם העסק קטן, הוצאות מינימליות, והכנסות נמוכות. אך גם במקרה זה, רואה חשבון יכול לחסוך עבורך כסף בעתיד."
    },
    {
      question: "כמה עולה רואה חשבון לעוסק פטור?",
      answer: "זה משתנה - בין 150-300 ₪ לחודש בערך, בהתאם לעוסק. יש שירותים כמו שלנו שמתחילים מ-149 ₪ לחודש."
    },
    {
      question: "מה הסיבה הגדולה ביותר לשכור רואה חשבון?",
      answer: "טעויות משפטיות וקנסות. עוסק שלא מנהל נכון את החשבונות שלו יכול להיתקל בבדיקת מס הכנסה שתכלול קנסות גבוהים."
    },
    {
      question: "האם רואה חשבון יכול לחסוך לי כסף?",
      answer: "בעיקר כן. רואה חשבון יכול לגרום לך לשלם פחות מס בדרכים חוקיות, להימנע מטעויות יקרות, ולתכנן הוצאות בצורה חכמה."
    },
    {
      question: "מה קורה אם אני לא שומר תיעוד נכון?",
      answer: "אם נבדקת - עלול להיווצר חוב משמעותי, קנסות, וריבית. רואה חשבון מונע את זה מרכאש."
    },
    {
      question: "האם צריך רואה חשבון גם אם אנהל את העסק בעצמי?",
      answer: "לפחות בדיקה שנתית עדיף. גם אם אתה מנהל בעצמך, רואה חשבון יכול לחזור על כל משהו ולהבטיח שהכל נכון."
    },
    {
      question: "מהו ההבדל בין ניהול עצמי לשירות רואה חשבון?",
      answer: "בניהול עצמי - אתה אחראי לכל הטעויות. עם רואה חשבון - יש מישהו שמבקר ומבטיח תקינות. זו ביטוח בעצם."
    },
    {
      question: "כמה זמן לוקח רואה חשבון להכין דוח שנתי?",
      answer: "אם יש תיעוד סדור - 1-2 ימים. אם לא - זה יכול להמשך שבועות. עם ניהול שוטף - זה מהיר בהרבה."
    },
    {
      question: "האם רואה חשבון חייב לשמור סודיות?",
      answer: "כן, רואה חשבון מחויב בחוקי סודיות מקצועית. כל המידע שלך מוגן."
    },
    {
      question: "כיצד רואה חשבון מונע קנסות?",
      answer: "על ידי וודוא שאתה משלם את הדיווחים בזמן, דיווח נכון על הכנסות והוצאות, ופעם בשנה וודוא שהכל בסדר."
    }
  ];

  const reasons = [
    {
      icon: Shield,
      title: "הגנה משפטית",
      desc: "רואה חשבון מבטיח שהכל חוקי ותאום. זה ביטוח נגד בדיקות מס הכנסה.",
      color: "green"
    },
    {
      icon: DollarSign,
      title: "חיסכון בעלויות",
      desc: "זה שנראה כמו הוצאה - בעצם חוסך לך כסף. טעויות יכולות להוביל לקנסות יקרים.",
      color: "emerald"
    },
    {
      icon: Clock,
      title: "חיסכון בזמן",
      desc: "אתה משקיע שעות בניהול חשבונות. רואה חשבון עושה את זה בשבריר מהזמן.",
      color: "blue"
    },
    {
      icon: Zap,
      title: "ניהול מקצועי",
      desc: "לא צריך ללמוד חוקים ודיווחים. רואה חשבון יודע את הכל כבר.",
      color: "yellow"
    },
    {
      icon: Calculator,
      title: "תכנון מס חכם",
      desc: "ניתן להעביר הוצאות בדרך חוקית ולהפחית עלויות מס משמעותי.",
      color: "purple"
    },
    {
      icon: FileText,
      title: "תיעוד תקין",
      desc: "רואה חשבון מוודא שכל הרישומים בסדר וזמינים לבדיקה בכל זמן.",
      color: "indigo"
    },
    {
      icon: AlertTriangle,
      title: "הימנעות מטעויות",
      desc: "טעויות בדיווח יכולות להיות יקרות מאוד. רואה חשבון מונע אותן.",
      color: "red"
    },
    {
      icon: TrendingUp,
      title: "ייעוץ עסקי",
      desc: "רואה חשבון רואה את המצב הפיננסי שלך ויכול לתת עצות להגדלת הרווח.",
      color: "teal"
    },
    {
      icon: Award,
      title: "שקט נפשי",
      desc: "אתה יודע שהכל מנוהל בידי מקצועי. זה שווה את המחיר.",
      color: "amber"
    },
    {
      icon: Eye,
      title: "בדיקה חיצונית",
      desc: "מישהו חיצוני בודק אם הכל בסדר. זה מונע בעיות משפטיות.",
      color: "cyan"
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/need-accountant-osek-patur" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema 
        name="Perfect One - צריך רואה חשבון לעוסק פטור"
        description="מדריך מקיף למה צריך רואה חשבון כשאתה עוסק פטור בישראל"
      />
      <SEOOptimized
        title="צריך רואה חשבון לעוסק פטור? | 10 סיבות חשובות"
        description="למה צריך רואה חשבון לעוסק פטור: חיסכון כסף, הגנה משפטית, תכנון מס ודירוג עסקי. מדריך מלא עם טיפים."
        keywords="רואה חשבון עוסק פטור, צריך רואה חשבון, חשבון לעוסק פטור, ניהול חשבונות עוסק"
        canonical="https://perfect1.co.il/need-accountant-osek-patur"
      />

      <main className="pt-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'שירותים', url: 'Services' },
            { label: 'צריך רואה חשבון?' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <AlertCircle className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">שאלה זהובה</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  צריך רואה חשבון לעוסק פטור?
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                  <strong className="text-[#D4AF37]">התשובה פשוטה: כן.</strong>
                  <br />
                  גם אם לא חובה חוקית - זה חכמה פיננסית.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, רוצה ליעוץ לגבי רואה חשבון לעוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      שאל בווצאפ עכשיו
                    </Button>
                  </a>
                  <Button 
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                    variant="outline" 
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl"
                  >
                    <Calculator className="ml-3 w-5 h-5" />
                    בדיקה בחינם
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
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">למה צריך רואה חשבון?</h3>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'הגנה משפטית מלאה',
                      'חיסכון בעלויות מס',
                      'תכנון עסקי חכם',
                      'הימנעות מקנסות',
                      'שקט נפשי ומקצועי'
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

        {/* 10 Reasons Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-block bg-[#27AE60]/10 text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6">
                ✨ 10 סיבות חשובות
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה צריך רואה חשבון?
              </h2>
              <p className="text-xl text-gray-600">
                זה לא רק חובה - זה ביטוח על העסק שלך
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-t-4 border-transparent hover:border-[#27AE60]"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${reason.color}-100 flex items-center justify-center mb-4`}>
                    <reason.icon className={`w-6 h-6 text-${reason.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 leading-tight">{reason.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{reason.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* מה קורה בלי רואה חשבון */}
        <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-8 text-center">
                מה קורה בלי רואה חשבון?
              </h2>

              <div className="space-y-6">
                {[
                  { num: 1, title: 'טעויות בדיווח', desc: 'טעויות קטנות בדיווח יכולות להיות יקרות מאוד בהמשך' },
                  { num: 2, title: 'בדיקות מס הכנסה', desc: 'אם נבדקת ללא רואה חשבון - אתה לבד מול הבירוקרטיה' },
                  { num: 3, title: 'קנסות וריבית', desc: 'טעויות יכולות להוביל לקנסות עיכוב וריבית משמעותית' },
                  { num: 4, title: 'פניות חזוב', desc: 'אם משהו לא תאום - צריך לתקן את כל השנים הקודמות' },
                  { num: 5, title: 'קשיי מימון', desc: 'בנקים ספקים לא מעניינים אותם עסקים בלי חשבונות מסודרים' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-red-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black flex-shrink-0">
                        {item.num}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1E3A5F] mb-1">{item.title}</h3>
                        <p className="text-gray-700">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Link to Osek Patur Opening */}
        <section className="py-16 bg-gradient-to-r from-[#27AE60] to-[#2ECC71]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                עדיין לא פתחת עוסק פטור?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                התחל עם הצעד הראשון - פתח עוסק פטור בליווי מלא של רואה חשבון
              </p>
              <Link to={createPageUrl('OsekPaturLanding')}>
                <Button className="h-16 px-12 text-2xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <ArrowRight className="ml-3 w-7 h-7" />
                  פתח עוסק פטור עכשיו
                </Button>
              </Link>
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

        {/* Contact Form */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                בואו נדבר על הצרכים שלך
              </h2>
              <p className="text-xl text-white/90">
                בדיקה אישית בחינם - ללא התחייבות
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
                  <label className="block text-sm font-bold text-gray-700 mb-2">סוג עיסוק (לא חובה)</label>
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
                  {isSubmitting ? 'שולח...' : 'בדיקה בחינם - ללא התחייבות'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  אנחנו נחזור אליך בתוך 24 שעות • ייעוץ מקצועי • בלי ספאם
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