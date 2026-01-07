import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Sparkles, 
  Heart, 
  Calendar, 
  MessageCircle, 
  Phone,
  Loader2,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function MakeupArtistLandingNew() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'מאפרת',
      source_page: 'דף נחיתה - מאפרת',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור מאפרת 2026 - המדריך המלא + ליווי מקצועי"
        description="מאפרת שרוצה לעבוד חוקית? פתיחת עוסק פטור למאפרות ב-249₪ בלבד. כולל הנפקת קבלות, ליווי שוטף ודוח שנתי. התחילי לעבוד חוקית עוד היום!"
        keywords="פתיחת עוסק פטור למאפרת, מאפרת עוסק פטור, איפור עוסק פטור, פתיחת עסק למאפרת"
        canonical="https://perfect1.co.il/makeup-artist-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FF69B4]/10 via-white to-[#DDA0DD]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-[#FF69B4]/10 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-4 h-4 text-[#FF69B4]" />
                  <span className="text-sm font-bold text-[#FF69B4]">מיוחד למאפרות מקצועיות</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי עוסק פטור והתחילי לעבוד באופן חוקי כמאפרת 💄
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  <strong className="text-[#FF69B4]">249₪ בלבד</strong> - כולל הנפקת קבלות דיגיטליות, גישה לאפליקציה וליווי שוטף כל השנה
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    'פתיחה ב-48 שעות ⚡',
                    'קבלות דיגיטליות מהנייד 📱',
                    'ליווי חודשי כלול 💚',
                    'דוח שנתי כלול במחיר 📊'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://wa.me/972502277087?text=היי, אני מאפרת ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full h-16 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      התחילי עכשיו בוואטסאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087" className="flex-1">
                    <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-2xl">
                      <Phone className="w-6 h-6 ml-2" />
                      0502277087
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                {isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">תודה רבה! 💕</h3>
                    <p className="text-gray-600 text-lg">נחזור אליך תוך שעות</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">
                      קבלי ייעוץ חינם עכשיו 🎁
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        placeholder="שם מלא"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-14 text-lg rounded-xl border-2"
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="טלפון"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-14 text-lg rounded-xl border-2"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-[#FF1493] hover:to-[#FF69B4] rounded-xl shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : '✨ קבלי ייעוץ חינם'}
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Heart, number: '500+', label: 'מאפרות פתחו איתנו' },
                { icon: Star, number: '48 שעות', label: 'זמן פתיחה ממוצע' },
                { icon: TrendingUp, number: '100%', label: 'שביעות רצון' },
                { icon: Award, number: '7 שנים', label: 'ניסיון בתחום' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-[#1E3A5F] mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                למה מאפרות בוחרות בנו? 💕
              </h2>
              <p className="text-xl text-gray-600">הכי פשוט, הכי מהיר, הכי אמין</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: '📱 אפליקציה למאפרות',
                  desc: 'הנפקת קבלות ישירות מהנייד אחרי כל איפור - קל, מהיר ומקצועי'
                },
                {
                  title: '🎨 התאמה למאפרות',
                  desc: 'מבינים את הצרכים הייחודיים - איפור כלות, אירועים, צילומים ועוד'
                },
                {
                  title: '💰 שקיפות מלאה',
                  desc: '249₪ פעם אחת + 199₪ לחודש. הכל כלול - בלי הפתעות!'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">{item.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-4">
                מה כלול בחבילה למאפרות? 💄
              </h2>
            </motion.div>

            <div className="bg-gradient-to-br from-[#FF69B4]/5 to-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#FF69B4]/20">
              <div className="bg-gradient-to-r from-[#FF69B4] to-[#FF1493] p-6 text-center">
                <div className="text-5xl font-black text-white mb-2">249₪</div>
                <div className="text-white/90 text-lg">תשלום חד פעמי לפתיחה</div>
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  {[
                    'פתיחת תיק במס הכנסה ורישום כעוסק פטור',
                    'רישום בביטוח לאומי + הסדרת תשלומים',
                    'אפליקציה להנפקת קבלות מהנייד (iOS + Android)',
                    'הדרכה אישית על המערכת - בווידאו או בטלפון',
                    'גישה לפורטל ניהול אישי 24/7',
                    'תמיכה טכנית בוואטסאפ'
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white rounded-xl p-4">
                      <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
                      <span className="text-gray-700 text-lg">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#D4AF37]/10 rounded-2xl p-6 border-2 border-[#D4AF37]/30">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-black text-[#1E3A5F]">199₪ לחודש</div>
                    <div className="text-gray-600">ליווי חודשי + דוח שנתי</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      'ליווי חשבונאי חודשי + תמיכה בווצאפ',
                      'דוח שנתי למס הכנסה (שווה 1,199₪)',
                      'ייעוץ בניכויים ייחודיים למאפרות',
                      'תזכורות אוטומטיות לתשלומי מיסים'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Deductions */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-4">
                מה מאפרת יכולה לנכות? 🧾
              </h2>
              <p className="text-xl text-gray-600">כל ההוצאות האלה מפחיתות לך את המס!</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-[#FF69B4] mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  מוצרי איפור וציוד
                </h3>
                <ul className="space-y-3">
                  {[
                    'מוצרי איפור מקצועיים (MAC, NARS, Charlotte Tilbury)',
                    'מברשות ומסרקים מקצועיים',
                    'מזוודת איפור',
                    'כיסא ומראה מקצועיים',
                    'תאורה ניידת',
                    'מוצרי ניקוי וחיטוי'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-[#FF69B4] mb-6 flex items-center gap-3">
                  <Calendar className="w-6 h-6" />
                  הוצאות נוספות
                </h3>
                <ul className="space-y-3">
                  {[
                    'נסיעות ללקוחות (דלק, חניה)',
                    'קורסי איפור והשתלמויות',
                    'ביטוח ציוד',
                    'פרסום ושיווק (אינסטגרם, פייסבוק)',
                    'אתר אינטרנט ועיצוב גרפי',
                    'מנוי לאפליקציית קבלות (כלול אצלנו!)'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                מוכנה להתחיל? 💄
              </h2>
              <p className="text-xl text-white/90 mb-8">
                הצטרפי ל-500+ מאפרות שכבר עובדות איתנו
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני מאפרת ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button className="h-16 px-10 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                    <MessageCircle className="w-6 h-6 ml-2" />
                    וואטסאפ - תגובה מיידית
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="h-16 px-10 text-xl font-bold border-2 border-white text-white hover:bg-white hover:text-[#1E3A5F] rounded-2xl">
                    <Phone className="w-6 h-6 ml-2" />
                    0502277087
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