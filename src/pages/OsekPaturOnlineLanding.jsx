import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, Shield, Clock, Users, Star, TrendingUp, FileText, Briefcase, Target, Zap, Award, Monitor, Smartphone, Wifi, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function OsekPaturOnlineLanding() {
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
        source_page: 'דף נחיתה - פתיחת עוסק פטור אונליין',
        status: 'new'
      });

      const message = `🌐 ליד חדש - פתיחת עוסק פטור אונליין!

👤 שם: ${formData.name}
📞 טלפון: ${formData.phone}
💼 עיסוק: ${formData.profession || 'לא צוין'}

📍 מקור: דף נחיתה פתיחת עוסק פטור אונליין
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
        title="פתיחת עוסק פטור אונליין - 100% דיגיטלי מהבית | Perfect One"
        description="פתיחת עוסק פטור אונליין בלי לצאת מהבית! תהליך מקוון לחלוטין - חתימה דיגיטלית, העלאת מסמכים מהנייד, וליווי מלא. מתחילים לעבוד חוקי תוך 24-48 שעות. 0502277087"
        keywords="פתיחת עוסק פטור אונליין, פתיחת עוסק אונליין, פתיחת עוסק פטור דיגיטלי, פתיחת עוסק מהבית, פתיחת עוסק ללא יציאה מהבית"
        canonical="https://perfect1.co.il/osek-patur-online"
      />
      <main className="pt-20 bg-[#F8F9FA]">
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
                <div className="inline-flex items-center gap-2 bg-[#27AE60]/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#27AE60]/30">
                  <Wifi className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">100% דיגיטלי - בלי לצאת מהבית</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  פתיחת עוסק פטור
                  <br />
                  <span className="text-[#27AE60]">אונליין 🌐</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  פותחים עוסק פטור בלי לצאת מהבית
                  <br />
                  <strong className="text-[#D4AF37]">תהליך מקוון לחלוטין - פשוט, מהיר וחוקי</strong>
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: Monitor, text: '100% אונליין' },
                      { icon: Smartphone, text: 'מהנייד שלך' },
                      { icon: Lock, text: 'חתימה דיגיטלית' },
                      { icon: Clock, text: 'תוך 24-48 שעות' }
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
                    פתח עוסק אונליין עכשיו
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#3498DB] hover:bg-white/90 shadow-2xl">
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דבר איתנו בווצאפ
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
                    <Monitor className="w-16 h-16 text-[#3498DB] mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">תהליך מקוון לחלוטין</h3>
                    <p className="text-gray-600">מהספה שלך, בלי ריצות</p>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'פתיחה דיגיטלית 100%',
                      'חתימה מאובטחת אונליין',
                      'העלאת מסמכים מהנייד',
                      'מעקב סטטוס בזמן אמת',
                      'ללא צורך להגיע פיזית',
                      'תמיכה בוואטסאפ 24/7'
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
                שאלות שחיפשת בגוגל?
              </h2>
              <p className="text-xl text-gray-600">
                במקום לחפש תשובות – <strong className="text-[#27AE60]">פותחים אונליין עכשיו</strong>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'איך פותחים עוסק פטור אונליין?',
                'פתיחת עוסק פטור בלי לצאת מהבית',
                'פתיחת עוסק דיגיטלי',
                'חתימה דיגיטלית לפתיחת עוסק',
                'פתיחת עוסק מהנייד',
                'פתיחת עוסק ללא יציאה מהבית'
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
                💻 תפסיק לחפש – פתח אונליין עכשיו
              </p>
              <p className="text-xl mt-2">כל התהליך מקוון, בלי לצאת מהבית</p>
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
              <div className="inline-block bg-[#3498DB]/10 text-[#3498DB] px-6 py-2 rounded-full text-sm font-bold mb-6">
                🌐 הפתרון האונליין
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                פותחים עוסק פטור אונליין – איך זה עובד?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                תהליך דיגיטלי מלא, בלי צורך להגיע לשום מקום
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Smartphone, title: 'מילוי טופס מקוון', desc: 'כל הפרטים מתמלאים בצורה נוחה מהנייד או מהמחשב' },
                { icon: FileText, title: 'העלאת מסמכים דיגיטלית', desc: 'צילום תעודת זהות ואישור בנק - ישירות מהטלפון' },
                { icon: Lock, title: 'חתימה דיגיטלית מאובטחת', desc: 'חותמים על המסמכים בצורה מאובטחת ומוכרת חוקית' },
                { icon: Zap, title: 'אנחנו מגישים את הבקשות', desc: 'אנחנו מטפלים בכל ההגשות מול הרשויות' },
                { icon: Clock, title: 'מעקב בזמן אמת', desc: 'עדכונים שוטפים על התקדמות התהליך' },
                { icon: CheckCircle, title: 'קבלת אישורים למייל', desc: 'כל האישורים מגיעים ישירות למייל שלך' }
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
        <section className="py-12 bg-gradient-to-br from-[#27AE60] to-[#229954]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6 border border-white/30">
                ⏰ מוכן לפתוח אונליין?
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                פותחים עוסק פטור מהבית – עכשיו
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאר פרטים ונתחיל את התהליך האונליין תוך שעות
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <Target className="ml-3 w-7 h-7" />
                  פתח אונליין עכשיו
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="h-20 px-12 text-2xl font-black rounded-3xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-7 h-7" />
                    פנייה בווצאפ
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
                מה כולל השירות האונליין?
              </h2>
              <p className="text-xl text-gray-600">כל מה שצריך לפתיחת עוסק – דיגיטלי ונוח</p>
            </motion.div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-xl p-8 md:p-10 border-2 border-[#3498DB]/10">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'תהליך מקוון לחלוטין',
                  'חתימה דיגיטלית מאובטחת',
                  'העלאת מסמכים מהנייד',
                  'מעקב סטטוס בזמן אמת',
                  'ללא צורך להגיע פיזית',
                  'תמיכה בוואטסאפ 24/7'
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
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה לפתוח עוסק אונליין?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Clock, title: 'חוסך זמן', desc: 'בלי לבזבז זמן על נסיעות והמתנות' },
                { icon: Smartphone, title: 'נוח ופשוט', desc: 'הכל מהטלפון או מהמחשב שלך' },
                { icon: Shield, title: 'מאובטח וחוקי', desc: 'חתימה דיגיטלית מוכרת על פי חוק' },
                { icon: Zap, title: 'מהיר יותר', desc: 'תהליך מואץ ללא עיכובים' }
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
                מוכן לפתוח עוסק אונליין?
              </h2>
              <p className="text-xl text-white/90">מלא פרטים ונתחיל את התהליך הדיגיטלי</p>
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
                    {isSubmitting ? 'שולח...' : 'פתח עוסק אונליין עכשיו'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    ללא התחייבות • תהליך מקוון מלא • תמיכה 24/7
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
                חיפשת פתיחת עוסק פטור אונליין? 🌐
              </h2>
              <p className="text-xl text-white/90 mb-8">
                פותחים אונליין, בלי לצאת מהבית - <strong>עכשיו</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <Monitor className="ml-3 w-6 h-6" />
                  פתח אונליין עכשיו
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה בווצאפ
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