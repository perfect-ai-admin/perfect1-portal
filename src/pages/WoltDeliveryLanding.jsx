import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, MessageCircle, Phone, Zap, Clock, Shield, Users, ArrowLeft, Bike, FileText, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function WoltDeliveryLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: 'שליח וולט'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const whatsappMessage = 'היי, אני שליח וולט ורוצה לפתוח עוסק פטור מהר. אשמח לעזרה';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'דף נחיתה - שליח וולט',
        status: 'new'
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור לשליח וולט - מהיר ופשוט | Perfect One"
        description="צריך עוסק פטור בשביל וולט? אנחנו פותחים לך עוסק לשליח תוך 24 שעות. שירות מהיר, פשוט וללא בירוקרטיה. התחל לעבוד עכשיו!"
        keywords="עוסק פטור וולט, פתיחת עוסק לשליח, עוסק לשליח וולט, חשבונית לשליח, תיק עוסק פטור שליח"
        canonical={`https://perfect1.co.il${window.location.pathname}`}
      />

      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir="rtl">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#00C2E8] via-[#00A8D0] to-[#0090B8] py-16 sm:py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* Logo */}
              <div className="mb-8">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Perfect One</h3>
                <p className="text-white/90 text-sm sm:text-base">הבית לעצמאיים</p>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                <Bike className="w-4 h-4" />
                <span>מיוחד לשליחי וולט</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                שליח וולט?
                <br />
                פותחים לך עוסק פטור <span className="text-[#FFD700]">במהירות</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
                פתיחת עוסק לשליחים אונליין, בלי בירוקרטיה ובלי כאבי ראש
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href={`https://wa.me/972502277087?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-16 px-8 text-lg font-bold rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-2xl hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6 ml-2" />
                    דבר איתנו בווצאפ עכשיו
                  </Button>
                </a>
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('lead-form').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto h-16 px-8 text-lg font-bold rounded-full bg-white text-[#00C2E8] hover:bg-gray-50 shadow-2xl hover:scale-105 transition-transform"
                >
                  <Zap className="w-6 h-6 ml-2" />
                  השאר פרטים – ונפתח לך עוסק
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#FFD700]" />
                  <span>פתיחה תוך 24 שעות</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#FFD700]" />
                  <span>הכול אונליין</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problems Section - Google Search Style */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                שאלות שכולם שואלים
              </h2>
              <p className="text-lg text-gray-600">במקום לחפש בגוגל – יש לנו את כל התשובות</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { q: 'איך פותחים עוסק לשליח?', icon: '🤔' },
                { q: 'צריך עוסק בשביל וולט?', icon: '🛵' },
                { q: 'איך מוציאים חשבונית כשליח?', icon: '📄' },
                { q: 'עוסק פטור או מורשה לשליח?', icon: '❓' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-200 hover:border-[#00C2E8] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-lg font-semibold text-gray-800">{item.q}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center bg-[#00C2E8]/10 rounded-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">
                במקום להסתבך – אנחנו עושים את זה בשבילך ✨
              </h3>
              <p className="text-lg text-gray-700">
                לא צריך להבין הכול, פשוט לתת לנו לטפל בזה
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                אתה רוכב – אנחנו מטפלים בניירת 🚴‍♂️
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                כל מה שצריך כדי להתחיל לעבוד כשליח חוקי ולהוציא חשבוניות
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: <FileText className="w-8 h-8 text-[#00C2E8]" />,
                  title: 'פתיחת עוסק פטור לשליחים',
                  desc: 'פותחים לך תיק עוסק במס הכנסה, ביטוח לאומי ומע"מ'
                },
                {
                  icon: <Shield className="w-8 h-8 text-[#00C2E8]" />,
                  title: 'טיפול מלא מול הרשויות',
                  desc: 'אנחנו דואגים לכל הטפסים והאישורים - אתה לא צריך לעשות כלום'
                },
                {
                  icon: <Users className="w-8 h-8 text-[#00C2E8]" />,
                  title: 'ליווי אישי והסבר פשוט',
                  desc: 'מישהו זמין לך בטלפון ובווצאפ להסביר הכול בפשטות'
                },
                {
                  icon: <Zap className="w-8 h-8 text-[#00C2E8]" />,
                  title: 'הכול אונליין',
                  desc: 'לא צריך לנסוע לשום מקום - הכול מתבצע מהנייד'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כולל השירות? 📋
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#00C2E8]/10 to-white rounded-3xl p-8 border-2 border-[#00C2E8]/20"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'פתיחת תיק עוסק פטור',
                  'התאמה לשליחי וולט ומשלוחים',
                  'הסבר איך לעבוד חוקי',
                  'התחלה מהירה בלי עיכובים',
                  'מחיר ברור וללא הפתעות',
                  'זמינות בווצאפ לכל שאלה'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-white p-4 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#00C2E8] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                למה Perfect One? 🏆
              </h2>
              <p className="text-xl text-white/90">הבית לעצמאיים – ובמיוחד לשליחים</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <TrendingUp className="w-8 h-8" />, text: 'ניסיון בליווי שליחים ועצמאים צעירים' },
                { icon: <Clock className="w-8 h-8" />, text: 'התמחות בפתיחת עוסקים מהירה' },
                { icon: <Users className="w-8 h-8" />, text: 'שירות אנושי, זמין וברור' },
                { icon: <Zap className="w-8 h-8" />, text: 'מיקוד בפשטות ומהירות' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
                >
                  <div className="text-[#FFD700] mb-4 flex justify-center">{item.icon}</div>
                  <p className="text-white font-medium leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + Form Section */}
        <section id="lead-form" className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                רוצה להתחיל לעבוד כשליח כבר היום? 🚀
              </h2>
              <p className="text-xl text-gray-600">השאר פרטים ונחזור אליך תוך שעות ספורות</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#00C2E8]/20"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    placeholder="שם מלא *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00C2E8]"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder="טלפון *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00C2E8]"
                    required
                  />
                </div>

                <div>
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00C2E8] px-4"
                  >
                    <option value="שליח וולט">שליח וולט</option>
                    <option value="שליח כללי">שליח כללי</option>
                    <option value="שליח משלוחים">שליח משלוחים</option>
                  </select>
                </div>

                <div className="bg-[#00C2E8]/10 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-[#00C2E8] to-[#0090B8] hover:from-[#0090B8] hover:to-[#00C2E8] text-white shadow-lg"
                >
                  {isSubmitting ? 'שולח...' : 'שלח ונתחיל לעבוד 🚀'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">או</p>
                <a href={`https://wa.me/972502277087?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full h-14 bg-[#25D366] hover:bg-[#128C7E] text-white text-lg font-bold rounded-xl">
                    <MessageCircle className="w-5 h-5 ml-2" />
                    פנייה מיידית בווצאפ
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <a href="tel:0502277087" className="text-[#00C2E8] hover:text-[#0090B8] font-bold text-lg flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                או התקשר: 050-227-7087
              </a>
            </motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-black text-[#00C2E8] mb-2">+2,000</div>
                <div className="text-gray-600">עוסקים נפתחו</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#00C2E8] mb-2">24 שעות</div>
                <div className="text-gray-600">זמן פתיחה ממוצע</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#00C2E8] mb-2">4.9★</div>
                <div className="text-gray-600">דירוג ממוצע</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#00C2E8] mb-2">100%</div>
                <div className="text-gray-600">שביעות רצון</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}