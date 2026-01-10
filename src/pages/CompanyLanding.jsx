import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import FAQSchema from '../components/seo/FAQSchema';
import PageTracker from '../components/seo/PageTracker';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const faqs = [
  {
    question: 'מה היתרון של חברה בע״מ על פני עוסק פטור או מורשה?',
    answer: 'חברה בע״מ מעניקה הגנה חוקית מלאה - ההתחייבויות של החברה לא יהיו על אחריות אישית שלך. כמו כן, היא נתפסת כיותר מקצועית וקונצרן בעסקים גדולים.'
  },
  {
    question: 'כמה עוסקים צריכים כדי לפתוח חברה בע״מ?',
    answer: 'חברה בע״מ יכולה להיות בעלות של אדם אחד ועד 50 בעלי מניות. אתה יכול לפתוח חברה בע״מ גם כעסק היחיד שלך.'
  },
  {
    question: 'כמה עולה לפתוח חברה בע״מ?',
    answer: 'עלויות היסוד כוללות הרשמה ברשם החברות (כ-2,000-3,000 ש״ח), וכן עלויות רואה חשבון וחוק שונות בגלל המורכבות של המבנה.'
  },
  {
    question: 'האם צריך רואה חשבון לחברה בע״מ?',
    answer: 'כן, חברה בע״מ חייבת בדוחות פיננסיים שנתיים ובדוח מס חברות שנתי, כך שרואה חשבון הוא חובה.'
  }
];

export default function CompanyLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Lead.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        category: 'company',
        notes: formData.notes,
        source_page: 'CompanyLanding',
        interaction_type: 'form',
        consent: true
      });
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = createPageUrl('ThankYou');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת חברה בע״מ בישראל | Perfect One"
        description="שירות מלא לפתיחת חברה בע״מ בישראל. דוחות כספיים, ניהול חשבונות, ייעוץ משפחתי ועוד"
        canonical="https://perfect1.co.il/company"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "פתיחת חברה בע״מ בישראל",
          "description": "שירות מקצועי לפתיחת חברה בע״מ עם ליווי צמוד"
        }}
      />
      <PageTracker 
        pageTitle="פתיחת חברה בע״מ"
        pageUrl="/company"
      />
      <FAQSchema faqs={faqs} />
      <LocalBusinessSchema />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Breadcrumbs items={[
              { label: 'בית', url: 'Home' },
              { label: 'פתיחת חברה בע״מ' }
            ]} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                פתיחת חברה בע״מ בישראל
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                כל מה שצריך לדעת על פתיחת חברה בע״מ - מרישום ברשם החברות ועד דוחות פיננסיים שנתיים
              </p>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F]"
                onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
              >
                קבל ייעוץ חינם עכשיו
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Key Info */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="grid md:grid-cols-3 gap-8"
            >
              <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">מה זו חברה בע״מ?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                    <span>ישות משפטית עצמאית</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                    <span>הגנה מלאה למייסדים</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                    <span>יכולת הנפקת מניות</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#27AE60] to-[#229954] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">היתרונות</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>הגנה חוקית וחוב מוגבל</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>אמינות בעסקים גדולים</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>יכולת גיוס הון</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#E74C3C] to-[#C0392B] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">האתגרים</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>עלויות הקמה וניהול גבוהות</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>דוחות פיננסיים חובה</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <span>רגולציה קפדנית</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-12 text-center">
              שאלות נפוצות
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-form" className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-2 text-center">
                רוצים ייעוץ מקצועי?
              </h2>
              <p className="text-gray-600 text-center mb-8">
                השאירו פרטים ואנחנו נחזור אליכם בתוך 24 שעות
              </p>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    תודה על פנייתכם!
                  </h3>
                  <p className="text-green-700">
                    אנחנו בקרוב נחזור אליכם
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      שם מלא
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] outline-none transition-colors"
                      placeholder="שם"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        טלפון
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] outline-none transition-colors"
                        placeholder="0501234567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        אימייל
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] outline-none transition-colors"
                        placeholder="example@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      הערות או שאלות נוספות
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1E3A5F] outline-none transition-colors h-32"
                      placeholder="אנא ספרו לנו קצת על החברה שלכם..."
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2C5282] hover:opacity-90 text-white"
                  >
                    שלח את הטופס
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                מוכנים להתחיל?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                צוות המומחים שלנו מלווה חברות בע״מ בכל שלב
              </p>
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold rounded-full bg-[#D4AF37] hover:bg-[#c9a432] text-[#1E3A5F]"
                >
                  צור קשר עכשיו
                  <ArrowLeft className="mr-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}