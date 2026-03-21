import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import SafeCtaBar from '../components/cro/SafeCtaBar';
import LeadPopup from '../components/cro/LeadPopup';

import { CheckCircle, Phone, MessageCircle, Shield, Clock, Users, Star, TrendingUp, FileText, Briefcase, Target, Zap, Award, ArrowLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';
import FAQSchema from '../components/seo/FAQSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import RelatedContent from '../components/seo/RelatedContent';
import PageTracker from '../components/seo/PageTracker';

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#1E3A5F]/30 transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-bold text-[#1E3A5F]">{question}</h3>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function OsekPaturLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '', consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.phone) {
      setFormError('אנא מלא שם וטלפון');
      return;
    }
    if (!formData.consent) {
      setFormError('חובה לאשר את תנאי השימוש');
      return;
    }

    setIsSubmitting(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      await base44.functions.invoke('submitLead', {
        name: formData.name,
        phone: formData.phone,
        source_page: 'דף נחיתה - ליווי עצמאים',
        status: 'new',
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_term: urlParams.get('utm_term') || '',
        utm_content: urlParams.get('utm_content') || '',
        referrer: document.referrer || ''
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
      setFormError('אירעה שגיאה, אנא נסה שוב או צור קשר בטלפון.');
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    setShowLeadPopup(true);
  };

  const faqs = [
    {
      question: "מה ההבדל בין סוגי הרישום השונים לעצמאים?",
      answer: "יש כמה מסלולים לעצמאים – המסלול הנפוץ ביותר לעצמאים בתחילת הדרך הוא הקל והפשוט ביותר, עם פחות דיווחים ופחות חובות. אנחנו יודעים בדיוק מה מתאים לך."
    },
    {
      question: "האם צריך לשלם ביטוח לאומי?",
      answer: "כן, אבל בתעריף נמוך יותר. אנחנו עושים את החישוב בשבילך ודואגים שלא תשלם יותר מדי."
    },
    {
      question: "כמה עולה ליווי חודשי?",
      answer: "הליווי מתחיל מ-99₪ לחודש כולל דוחות, תשובות לשאלות, וניהול שוטף. זול יחסית לשקט הנפשי שזה נותן."
    },
    {
      question: "כמה זמן לוקח להתחיל?",
      answer: "התהליך מהיר – ברוב המקרים תוך 24-48 שעות תוכל להתחיל לעבוד כחוק ולהוציא חשבוניות."
    },
    {
      question: "מה אם יש לי שאלה מחוץ לשעות העבודה?",
      answer: "אנחנו משיבים בתחילת יום העסקים הבא. תשלח הודעה בוואטסאפ ותקבל תשובה מלאה."
    },
    {
      question: "האם אוכל לנהל הכנסות והוצאות בקלות?",
      answer: "בהחלט – אנחנו מספקים אפליקציה ייעודית קלה לשימוש. פשוט צלם את הקבלה ועלה, והכל מסודר."
    },
    {
      question: "מה קורה אם ההכנסות שלי גדלות?",
      answer: "זה חיובי! אנחנו נלווה אותך גם במעבר למסלול המתאים. לא צריך לדאוג – זה אפילו טוב."
    },
    {
      question: "האם אני יכול להעביר את החשבונות שלי מגורם אחר?",
      answer: "בהחלט. אנחנו נקבל את המידע הקיים ונמשיך משם. לא צריך להתחיל מאפס."
    }
  ];

  return (
    <>
      <PageTracker pageUrl="/OsekPaturLanding" pageType="landing" />
      <FAQSchema faqs={faqs} />
      <SEOOptimized
        title="ליווי לעצמאים חדשים - מתחילים עסק בצורה פשוטה | Perfect One"
        description="מתחילים לעבוד כעצמאים? ליווי מקצועי ואישי לכל השלבים – מההקמה ועד הדוח השנתי. תהליך מהיר, פשוט וללא כאב ראש."
        keywords="ליווי עצמאים, הקמת עסק, התחלת עסק, ליווי עסקי, ניהול עסק קטן, רישום עסק, שירות לעצמאים"
        canonical="https://perfect1.co.il/OsekPaturLanding"
        schema={{
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Perfect One - ליווי עצמאים חדשים",
          "description": "שירות ליווי מקצועי לעצמאים בתחילת הדרך – הקמה, ניהול שוטף ודוחות",
          "url": "https://perfect1.co.il/OsekPaturLanding",
          "telephone": "+972-55-970-0641",
          "priceRange": "₪₪",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IL"
          },
          "areaServed": {
            "@type": "Country",
            "name": "ישראל"
          },
          "serviceType": "ליווי עצמאים",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One"
          }
        }}
      />

      <main className="pt-14 md:pt-20 bg-[#F8F9FA]">
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs items={[
            { label: 'דף הבית', url: 'Home' },
            { label: 'ליווי לעצמאים חדשים' }
          ]} />
        </div>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center lg:text-right">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 md:mb-6">
                  <span className="text-[#27AE60] block md:inline">מתחילים עסק?</span> הדרך הקלה ביותר להיות עצמאי
                </h1>

                <p className="text-lg md:text-2xl text-white/90 mb-6 leading-relaxed font-medium px-2 md:px-0">
                  ליווי אישי ומקצועי מהרגע הראשון – אנחנו מטפלים בכל הבירוקרטיה, אתם מתמקדים בלהרוויח
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: CheckCircle, text: 'ליווי אישי מלא' },
                      { icon: Clock, text: 'תהליך מהיר' },
                      { icon: Shield, text: 'בלי כאב ראש' },
                      { icon: Star, text: 'שקט נפשי' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-[#27AE60]" />
                        <span className="font-semibold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Private service disclaimer */}
                <p className="text-xs text-white/50 mb-6 px-2">
                  השירות ניתן על ידי גורם פרטי ואינו קשור לרשויות המדינה
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-4 sm:px-8 lg:px-10 text-base sm:text-lg lg:text-xl font-bold rounded-xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-lg shadow-green-900/20 transition-all">
                    <Target className="ml-2 w-5 h-5" />
                    קבלו ליווי אישי עכשיו
                  </Button>
                  <a href="https://wa.me/972559700641?text=היי, אני מתעניין בליווי לעצמאים" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-4 sm:px-8 text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-lg">
                      <MessageCircle className="ml-2 w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-black text-[#1E3A5F] mb-1">יוצאים לדרך</h3>
                    <p className="text-sm text-gray-600">הדרך הקלה והמקצועית להיות עצמאי</p>
                  </div>

                  <ul className="space-y-2">
                    {[
                      'ליווי מלא בתהליך ההקמה',
                      'טיפול בכל הניירת והבירוקרטיה',
                      'אפליקציה לניהול הכנסות והוצאות',
                      'מענה מקצועי לכל שאלה',
                      'שקט נפשי מהיום הראשון'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-2">כבר עזרנו ל-</p>
                    <p className="text-3xl font-black text-[#1E3A5F]">2,000+</p>
                    <p className="text-xs text-gray-500">עצמאים בכל הארץ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-10 md:py-16 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6 shadow-sm">
                ✅ למה אלפי עצמאים בוחרים בנו
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-[#1E3A5F] mb-3 md:mb-4 leading-tight">
                ליווי מקצועי שחוסך לך זמן, כסף וכאב ראש
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 md:px-0">
                מתאים למי שרוצה להתחיל כעצמאי (למשל עוסק פטור) בצורה פשוטה ונכונה
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'אפס טעויות', desc: 'אנחנו בודקים כל מסמך בקפדנות לפני הגשה כדי להבטיח תהליך חלק ומהיר' },
                { icon: Clock, title: 'תהליך מהיר', desc: 'במקום שבועות של בירוקרטיה, אנחנו מזרזים את התהליך וחוסכים לך זמן יקר' },
                { icon: TrendingUp, title: 'ליווי שוטף מלא', desc: 'דיווחים, דוחות שנתיים, מענה לשאלות – הכל כלול. אתה מתמקד בעבודה' },
                { icon: FileText, title: 'שקיפות מלאה', desc: 'עדכונים בזמן אמת – תמיד תדע מה קורה ומה הצעד הבא' },
                { icon: Briefcase, title: 'אפליקציה חכמה', desc: 'ניהול הכנסות והוצאות בקלות – צלם קבלה והכל מסודר אוטומטית' },
                { icon: Award, title: 'ניסיון של 2,000+ עצמאים', desc: 'אנחנו מכירים כל ניואנס ויודעים בדיוק איך לחסוך לך כסף ועצבים' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#27AE60]/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 leading-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
              📊 הוכחה שזה עובד
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              2,000+ עצמאים כבר מלווים איתנו
            </h2>
            <p className="text-xl text-white/90 mb-8">
              כל חודש עוד עצמאים בוחרים בנו – כי פשוט, מקצועי, ובלי כאב ראש
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={scrollToForm} className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl bg-white text-[#27AE60] hover:bg-white/90 shadow-lg">
                <Target className="ml-2 w-5 h-5" />
                התחל עכשיו
              </Button>
              <a href="https://wa.me/972559700641?text=היי, אני מתעניין בליווי לעצמאים" target="_blank" rel="noopener noreferrer">
                <Button className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-lg">
                  <MessageCircle className="ml-2 w-5 h-5" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כלול בליווי שלנו
              </h2>
              <p className="text-xl text-gray-600">הכל במקום אחד – ליווי מלא + דוחות + אפליקציה</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#1E3A5F]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'ליווי מלא בהקמת העסק',
                  'טיפול בכל הניירת והבירוקרטיה',
                  'אפליקציה לניהול הכנסות והוצאות',
                  'ליווי חודשי שוטף',
                  'הכנה והגשת דוחות',
                  'תמיכה אישית ושקט נפשי'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למי הליווי שלנו מתאים?
              </h2>
              <p className="text-lg text-gray-600">עצמאים, פרילנסרים ונותני שירותים בכל תחום</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Briefcase, text: 'עצמאים שרוצים להתחיל נכון' },
                { icon: Users, text: 'פרילנסרים ונותני שירותים' },
                { icon: Award, text: 'בעלי מקצוע שרוצים לעבוד בחוקיות' },
                { icon: Target, text: 'כל מי שרוצה שקט נפשי בניהול העסק' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-[#27AE60]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <p className="text-lg font-bold text-gray-800">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Different */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-block bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-sm font-bold mb-6">
                🎯 מה מייחד אותנו
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                ליווי עסקי עם מקצועיות וגישה אישית
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { icon: Users, title: 'אנחנו מבינים אותך', desc: 'אנחנו עצמאים בעצמנו – מבינים בעומק את האתגרים שלך' },
                { icon: Zap, title: 'שירות אישי', desc: 'כל לקוח מקבל תשומת לב מלאה – לא מוקד טלפוני' },
                { icon: Briefcase, title: 'הכל במקום אחד', desc: 'אפליקציה, ליווי, דוחות – בלי להתרוצץ בין ספקים' },
                { icon: Award, title: 'אחריות מלאה', desc: 'אנחנו עומדים מאחורי כל שלב בתהליך' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center mb-2 md:mb-3">
                    <item.icon className="w-4 h-4 md:w-5 md:h-5 text-[#1E3A5F]" />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-[#1E3A5F] mb-1 leading-tight">{item.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8 md:py-20 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]" id="contact-form">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
              <div className="text-center lg:text-right">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 lg:mb-6 leading-tight">
                  רוצה להתחיל? <br className="hidden lg:block"/>
                  קבל ליווי אישי עכשיו
                </h2>
                <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6 lg:mb-8 max-w-lg mx-auto lg:mx-0">
                  השאירו פרטים ותקבלו שיחה קצרה – בלי התחייבות, בלי לחץ.
                </p>

                <div className="hidden lg:flex flex-col gap-4 text-white/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <span className="text-lg">בלי כאב ראש – אנחנו מטפלים בהכל</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <span className="text-lg">תהליך מהיר ומדויק</span>
                  </div>
                </div>
              </div>

              <div>
                {isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                    <p className="text-gray-600">נחזור אליך בקרוב</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 border-2 border-[#D4AF37]/30">
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">שם מלא *</label>
                        <Input
                          placeholder="איך קוראים לך?"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                          required
                          autoComplete="name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">טלפון *</label>
                        <Input
                          type="tel"
                          placeholder="050-1234567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-11 md:h-12 rounded-xl border-2 text-base shadow-sm focus:ring-2 focus:ring-[#27AE60] focus:border-transparent transition-all"
                          required
                          autoComplete="tel"
                        />
                      </div>

                      <div className="flex items-start space-x-3 space-x-reverse py-2">
                        <Checkbox 
                          id="landing-consent"
                          checked={formData.consent}
                          onCheckedChange={(checked) => setFormData({...formData, consent: checked})}
                          className="mt-1"
                        />
                        <label
                          htmlFor="landing-consent"
                          className="text-xs font-medium leading-relaxed text-gray-500"
                        >
                          אני מאשר/ת את <Link to="/Terms" className="underline" target="_blank">תנאי השימוש</Link> ו<Link to="/Privacy" className="underline" target="_blank">מדיניות הפרטיות</Link> ומסכימ/ה לקבלת פניות.
                        </label>
                      </div>

                      {formError && (
                        <p className="text-sm text-red-500 font-medium text-center">{formError}</p>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 md:h-14 text-base md:text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white mt-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin ml-2" />
                            שולח...
                          </>
                        ) : 'בדיקה ראשונית ללא התחייבות'}
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        🔒 ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                      </p>
                      <p className="text-[10px] text-gray-400 text-center">
                        השירות ניתן על ידי גורם פרטי ואינו קשור לרשויות המדינה
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-20 bg-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-black text-[#1E3A5F] mb-3 md:mb-4">מה אומרים עלינו?</h2>
              <p className="text-lg md:text-xl text-gray-600 px-4">אלפי עצמאים כבר נהנים מליווי מקצועי ושקט נפשי</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  text: "פשוט הצילו אותי. לא הבנתי כלום מהניירת. הם עשו הכל תוך יום אחד. השירות הכי יעיל שנתקלתי בו.",
                  name: "דניאל כ.",
                  role: "מעצב גרפי",
                  stars: 5
                },
                {
                  text: "החשש הכי גדול שלי היה לעשות טעויות בתהליך הבירוקרטי. הצוות נתן לי ביטחון מלא וליווי אישי מדהים.",
                  name: "שרה ל.",
                  role: "קוסמטיקאית",
                  stars: 5
                },
                {
                  text: "האפליקציה שלהם גאונית! אני מצלם קבלות והכל מסודר. שווה כל שקל רק בשביל השקט הנפשי.",
                  name: "עומר י.",
                  role: "מאמן כושר אישי",
                  stars: 5
                }
              ].map((review, i) => (
                <div 
                  key={i}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative"
                >
                  <div className="absolute -top-4 right-8 text-6xl text-[#D4AF37] opacity-20 font-serif">"</div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.stars)].map((_, s) => (
                      <Star key={s} className="w-5 h-5 text-[#D4AF37] fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-[#1E3A5F]">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E3A5F]">{review.name}</p>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                שאלות נפוצות
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </section>

        {/* Related Content */}
        <RelatedContent pageType="landing" />

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#0F2847] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-[#27AE60] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              מוכנים להתחיל? הליווי שלנו מחכה לכם
            </h2>
            <p className="text-xl text-white/90 mb-8">
              שיחה קצרה וחינם, בלי התחייבות – פשוט לשמוע מה הצעד הבא
            </p>
            <p className="text-sm text-white/50 mb-8">
              השירות ניתן על ידי גורם פרטי ואינו קשור לרשויות המדינה
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                <Target className="ml-3 w-6 h-6" />
                השאירו פרטים
              </Button>
              <a href="https://wa.me/972559700641?text=היי, אני מתעניין בליווי לעצמאים" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1E3A5F] shadow-2xl">
                  <MessageCircle className="ml-3 w-6 h-6" />
                  פנייה בוואטסאפ
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Safe CTA */}
      <SafeCtaBar 
        title="בדיקה ראשונית ללא התחייבות"
        subtitle="שם + טלפון בלבד"
        sourcePage="OsekPaturLanding - SafeCtaBar"
      />

      {/* Lead Popup - only on click */}
      <LeadPopup 
        open={showLeadPopup} 
        onClose={() => setShowLeadPopup(false)}
        sourcePage="דף נחיתה - ליווי עצמאים"
      />
    </>
  );
}