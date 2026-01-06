import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, Shield, Clock, Users, Star, TrendingUp, FileText, Briefcase, Target, Zap, Award, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function OsekPaturLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'דף נחיתה - פתיחת עוסק פטור',
        status: 'new'
      });

      const message = `🚀 ליד חדש - פתיחת עוסק פטור!

👤 שם: ${formData.name}
📞 טלפון: ${formData.phone}
💼 עיסוק: ${formData.profession || 'לא צוין'}

📍 מקור: דף נחיתה פתיחת עוסק פטור
📅 ${new Date().toLocaleString('he-IL')}`;

      window.open(`https://wa.me/972502277087?text=${encodeURIComponent(message)}`, '_blank');
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור - ליווי מלא + אפליקציה + דוח שנתי | Perfect One"
        description="פתיחת עוסק פטור בליווי מלא תוך 24-48 שעות. כולל: טיפול מול הרשויות, אפליקציה לניהול העסק, ליווי חודשי מלא והכנת דוח שנתי. התחל לעבוד חוקי עכשיו! ☎ 0502277087"
        keywords="פתיחת עוסק פטור, פתיחת עוסק פטור אונליין, איך לפתוח עוסק פטור, רואה חשבון לפתיחת עוסק, פתיחת תיק עוסק פטור, עוסק פטור לעצמאי חדש, ליווי עוסק פטור, אפליקציה לעוסק פטור"
        canonical="https://perfect1.co.il/osek-patur"
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "פתיחת עוסק פטור",
          "description": "שירות מלא לפתיחת עוסק פטור כולל ליווי חודשי ודוח שנתי",
          "provider": {
            "@type": "Organization",
            "name": "Perfect One",
            "url": "https://perfect1.co.il",
            "telephone": "+972-50-227-7087"
          },
          "areaServed": "IL",
          "offers": {
            "@type": "Offer",
            "price": "249",
            "priceCurrency": "ILS"
          }
        }}
      />
      <main className="pt-20 bg-[#F8F9FA]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847] overflow-hidden">
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
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <Zap className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">מתחילים לעבוד חוקי עכשיו</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  פתיחת עוסק פטור אונליין
                  <br />
                  <span className="text-[#27AE60]">פשוט, מהיר וחוקי</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  אנחנו פותחים לך עוסק פטור בליווי מלא
                  <br />
                  <strong className="text-[#D4AF37]">בלי בירוקרטיה ובלי התעסקות</strong>
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: CheckCircle, text: 'ליווי מלא' },
                      { icon: Clock, text: 'תהליך מהיר' },
                      { icon: Shield, text: 'בלי בירוקרטיה' },
                      { icon: Star, text: 'שקט נפשי' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-[#27AE60]" />
                        <span className="font-semibold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                    <Target className="ml-3 w-6 h-6" />
                    השאר פרטים – ונפתח לך עוסק
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דבר איתנו בווצאפ עכשיו
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
                    <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">מתחילים נכון</h3>
                    <p className="text-gray-600">אנחנו עושים את זה בשבילך</p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'פתיחת תיק עוסק פטור',
                      'טיפול מול כל הרשויות',
                      'אפליקציה לניהול העסק',
                      'ליווי שוטף + הכנת דוח שנתי',
                      'תמיכה אישית וזמינה'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-3">כבר עזרנו ל-</p>
                    <p className="text-4xl font-black text-[#1E3A5F]">2000+</p>
                    <p className="text-gray-600 font-medium">עצמאיים להתחיל נכון</p>
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
                שאלות שחיפשת בגוגל?
              </h2>
              <p className="text-xl text-gray-600">
                במקום לחפש תשובות – <strong className="text-[#27AE60]">אנחנו עושים את זה בשבילך</strong>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'איך פותחים עוסק פטור?',
                'עוסק פטור או מורשה?',
                'צריך רואה חשבון לפתיחת עוסק?',
                'כמה זמן לוקח לפתוח עוסק פטור?',
                'איך מתחילים לעבוד חוקי?',
                'איך פותחים תיק עוסק פטור?'
              ].map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-r-4 border-[#1E3A5F]"
                >
                  <p className="text-gray-700 font-bold">{q}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-2xl p-8 text-white"
            >
              <p className="text-2xl md:text-3xl font-black">
                💡 תפסיק לחפש תשובות – תתחיל לעבוד
              </p>
              <p className="text-xl mt-2">אנחנו מטפלים בכל הבירוקרטיה עבורך</p>
            </motion.div>
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
                ✨ הפתרון שלך
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                כל פתיחת העוסק – במקום אחד
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                אנחנו מטפלים בכל התהליך מול הרשויות, כדי שתוכל להתמקד במה שאתה עושה הכי טוב
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: 'פתיחת עוסק פטור', desc: 'כל התהליך מתבצע בליווי מלא - בלי ריצות' },
                { icon: Users, title: 'טיפול מול כל הרשויות', desc: 'מס הכנסה, מע"מ וביטוח לאומי - אנחנו מטפלים בהכל' },
                { icon: Smartphone, title: 'אפליקציה לניהול העסק', desc: 'מערכת דיגיטלית לניהול הכנסות, הוצאות והפקת קבלות' },
                { icon: TrendingUp, title: 'ליווי חודשי מלא', desc: 'ליווי שוטף מול הרשויות ומענה לכל שאלה' },
                { icon: FileText, title: 'הכנת דוח שנתי', desc: 'אנחנו מכינים ומגישים את הדוח השנתי בשבילך' },
                { icon: Shield, title: 'שקט נפשי מלא', desc: 'עובדים חוקית ומסודרים מהיום הראשון' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-[#27AE60]/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 leading-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-Page Strong CTA */}
        <section className="py-12 bg-gradient-to-br from-[#27AE60] to-[#229954]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
                ⏰ מוכן להתחיל?
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                רוצה לפתוח עוסק פטור ולהתחיל לעבוד?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאר פרטים ונחזור אליך תוך שעות - ללא התחייבות
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <Target className="ml-3 w-7 h-7" />
                  השאר פרטים ונחזור אליך
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="h-20 px-12 text-2xl font-black rounded-3xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-7 h-7" />
                    פנייה מיידית בווצאפ
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
              <p className="text-xl text-gray-600">הכל שקוף - בואו נראה מה אתם מקבלים</p>
            </motion.div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#1E3A5F]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'פתיחת תיק עוסק פטור',
                  'טיפול מלא מול כל הרשויות',
                  'אפליקציה לניהול הכנסות והוצאות',
                  'ליווי חודשי מלא',
                  'הכנת והגשת דוח שנתי',
                  'תמיכה אישית ושקט נפשי'
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

        {/* Who Is This For */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למי זה מתאים?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Briefcase, text: 'עצמאיים בתחילת הדרך' },
                { icon: Users, text: 'פרילנסרים ונותני שירותים' },
                { icon: Award, text: 'בעלי מקצוע' },
                { icon: Target, text: 'כל מי שצריך לפתוח עוסק פטור ולהתחיל לעבוד' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-r-4 border-[#27AE60]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <p className="text-lg font-bold text-gray-800">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] px-6 py-2 rounded-full text-sm font-bold mb-6">
                ⭐ למה Perfect One
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                Perfect One – הבית לעצמאיים
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Award, title: 'ניסיון בליווי אלפי עצמאיים', desc: 'עזרנו ל-2000+ עצמאיים להתחיל נכון' },
                { icon: Target, title: 'התמחות בעוסקים קטנים', desc: 'אנחנו מתמחים בפתיחת עוסקים קטנים ובינוניים' },
                { icon: MessageCircle, title: 'שירות אישי וברור', desc: 'ללא חאפרות, בשפה פשוטה ונגישה' },
                { icon: Shield, title: 'שקיפות ושקט נפשי', desc: 'מחיר ברור, ליווי מלא, בלי הפתעות' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-[#1E3A5F]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]" id="contact-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                מוכן לפתוח עוסק פטור?
              </h2>
              <p className="text-xl text-white/90">מלא פרטים ונחזור אליך תוך שעות</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב ונתחיל את התהליך</p>
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
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                  >
                    {isSubmitting ? 'שולח...' : 'השאר פרטים ונחזור אליך'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>

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
                חיפשת פתיחת עוסק פטור – הגעת למקום הנכון
              </h2>
              <p className="text-xl text-white/90 mb-8">
                אנחנו עושים את זה בשבילך, <strong>עכשיו</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <Target className="ml-3 w-6 h-6" />
                  השאר פרטים עכשיו
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווצאפ
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