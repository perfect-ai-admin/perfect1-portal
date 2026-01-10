import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { CheckCircle, BarChart3, Zap, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';

export default function MonthlyMonitoringLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'דף ליווי חודשי',
        category: 'monthly_support',
        notes: 'מעוניין בליווי חודשי לעוסק פטור',
        status: 'new'
      });
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/ThankYou';
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה, נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    { icon: '📱', title: 'אפליקציה להפקת קבלות', desc: 'קבלות דיגיטליות בשניה' },
    { icon: '📊', title: 'מעקב הכנסות והוצאות', desc: 'ניהול מלא ושקוף' },
    { icon: '🏛️', title: 'דיווחים שוטפים לרשויות', desc: 'הכל מטופל עבורך' },
    { icon: '👨‍💼', title: 'רו"ח זמין לכל שאלה', desc: 'תמיכה מקצועית ישירה' },
    { icon: '💡', title: 'ייעוץ מס שוטף', desc: 'אופטימיזציה מס חכמה' },
    { icon: '🚀', title: 'סגירת תיק בעת הצורך', desc: 'תהליך פשוט וישר' }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <SEOOptimized
        title="ליווי חודשי לעוסק פטור | מעקב הכנסות והוצאות - 199₪ לחודש"
        description="ליווי חודשי לעוסק פטור עם אפליקציה, דיווחים לרשויות, וגישה לרואה חשבון. השאר פרטים וקבל ייעוץ חינם."
        keywords="ליווי חודשי עוסק פטור, מעקב הכנסות הוצאות, דיווחים לרשויות, רואה חשבון עוסק פטור"
        canonical="https://perfect1.co.il/monthly-monitoring"
      />

      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                ✓ 1000+ עוסקים פטורים מוקדים
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                ליווי חודשי לעוסק פטור
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                הנח את כל הניהול החשבונאי בידיים מקצועיות.
                <br/>
                אנחנו נדאג לדיווחים, ההכנסות, ההוצאות - ואתה תתרכז בעסק שלך.
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
                <Button className="h-14 px-8 text-lg font-black bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl">
                  199₪ לחודש
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Button>
              </div>

              <p className="text-white/80 text-sm md:text-base">
                לעוסק פטור שיודע את ערכו
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כולל השירות
              </h2>
              <p className="text-xl text-gray-600">כל מה שצריך כדי לנהל עוסק פטור בנכון</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold text-[#1E3A5F] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    {benefit.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Side - Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                  עוסק פטור שקר בראש
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#1E3A5F] mb-1">אין דאגות מס</h3>
                      <p className="text-gray-700">הכל מטופל בידיים מקצועיות</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#1E3A5F] mb-1">חסכון בזמן</h3>
                      <p className="text-gray-700">יותר זמן לעסק, פחות אדמיניסטרציה</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#1E3A5F] mb-1">דיווחים מדויקים</h3>
                      <p className="text-gray-700">לא תהיה בעיה עם הרשויות</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#1E3A5F] mb-1">ייעוץ שוטף</h3>
                      <p className="text-gray-700">רו"ח זמין בכל שאלה</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-700">
                  <strong>רק 199₪ לחודש</strong> לשקט מנטלי שלם.
                </p>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl">
                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה!</h3>
                      <p className="text-gray-600">נחזור אליך בהקדם עם פרטים נוספים</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">
                        רוצה להתחיל?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        השאר פרטים ונעזור לך להבין אם זה הפתרון הנכון
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          placeholder="שם מלא *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12"
                          required
                        />
                        <Input
                          type="tel"
                          placeholder="טלפון *"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-12"
                          required
                        />
                        <Input
                          type="email"
                          placeholder="אימייל (אופציונלי)"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12"
                        />

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                        >
                          {isSubmitting ? 'שולח...' : 'בדיקה ללא התחייבות'}
                        </Button>
                      </form>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-sm mb-4 text-center">או צור קשר ישירות:</p>
                        <div className="flex gap-3">
                          <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full h-11 bg-green-100 hover:bg-green-200 text-green-700 font-bold">
                              <MessageCircle className="ml-2 w-4 h-4" />
                              WhatsApp
                            </Button>
                          </a>
                          <a href="tel:+972502277087" className="flex-1">
                            <Button className="w-full h-11 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold">
                              <Phone className="ml-2 w-4 h-4" />
                              טלפון
                            </Button>
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Open Osek Patur First */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 border-2 border-blue-200"
            >
              <div className="flex gap-4 mb-6">
                <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F]">
                  עדיין לא פתחת עוסק פטור?
                </h2>
              </div>

              <p className="text-gray-700 text-lg mb-6">
                לא בעיה! אתה יכול לפתוח עוסק פטור בקלות אונליין בהצעה מיוחדת של 199₪ בלבד, ותוך 24-48 שעות הכל יהיה מוכן.
              </p>

              <p className="text-gray-600 mb-8">
                אחרי שפותחים את העוסק פטור, תוכל להתחיל מיד עם ליווי חודשי כדי שהכל יהיה מסודר מיום אחד.
              </p>

              <Link to={createPageUrl('OsekPaturOnlineLanding')} className="inline-block">
                <Button className="h-14 px-8 text-lg font-black bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                  ✓ פתח עוסק פטור אונליין עכשיו
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl font-black text-[#1E3A5F] mb-12">
                מה אומרים עלינו
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6">
                  <p className="text-5xl font-black text-green-600 mb-2">1000+</p>
                  <p className="text-gray-600">עוסקים פטורים מוקדים</p>
                </div>
                <div className="p-6">
                  <p className="text-5xl font-black text-blue-600 mb-2">4.9★</p>
                  <p className="text-gray-600">דירוג ממוצע מלקוחות</p>
                </div>
                <div className="p-6">
                  <p className="text-5xl font-black text-purple-600 mb-2">24/7</p>
                  <p className="text-gray-600">תמיכה לכל שאלה</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}