import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Phone, MessageCircle, Shield, Clock, TrendingDown, DollarSign, FileText, Users, Sparkles, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function PricingLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
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
        source_page: 'דף נחיתה - מחיר',
        status: 'new'
      });

      const message = `💰 ליד חדש - מחיר!

👤 שם: ${formData.name}
📞 טלפון: ${formData.phone}
📧 אימייל: ${formData.email || 'לא צוין'}

📍 מקור: דף נחיתה מחיר
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
    document.getElementById('pricing-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEOOptimized
        title="כמה עולה לפתוח עוסק פטור? מחיר ברור וללא הפתעות | המרכז לעוסקים פטורים"
        description="מחפש לדעת כמה עולה לפתוח עוסק פטור? מחיר ברור, שקוף וידוע מראש. בלי אותיות קטנות, בלי הפתעות. פתיחה אונליין וליווי מלא. 0502277087"
        keywords="כמה עולה לפתוח עוסק פטור, מחיר רואה חשבון לעוסק פטור, עלות פתיחת תיק, מחיר חשבונאי לעוסק פטור, מחיר פתיחת עוסק פטור"
        canonical="https://perfect1.co.il/pricing-landing"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847] overflow-hidden">
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
                  <DollarSign className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-[#27AE60] text-sm font-bold">מחיר ברור ושקוף</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  כמה עולה לפתוח
                  <br />
                  <span className="text-[#D4AF37]">עוסק פטור?</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  אצלנו תקבל מחיר ברור, שקוף וידוע מראש
                  <br />
                  <strong className="text-[#27AE60]">בלי הפתעות ובלי אותיות קטנות</strong>
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: CheckCircle, text: 'מחיר קבוע' },
                      { icon: Shield, text: 'בלי הפתעות' },
                      { icon: Clock, text: 'שקוף מראש' },
                      { icon: TrendingDown, text: 'מחיר הוגן' }
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
                    <DollarSign className="ml-3 w-6 h-6" />
                    קבל הצעת מחיר עכשיו
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, רוצה לדעת כמה עולה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דבר איתנו בווצאפ
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#D4AF37]">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-bold mb-4">
                      ⭐ המחיר הכי שקוף בשוק
                    </div>
                    <h3 className="text-3xl font-black text-[#1E3A5F] mb-2">פתיחת עוסק פטור</h3>
                    <p className="text-gray-600">מחיר ידוע מראש - בלי "תלוי"</p>
                  </div>

                  <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-6 mb-6 text-center">
                    <p className="text-white/80 text-sm mb-2">מחיר מיוחד ל-</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-white">?</span>
                    </div>
                    <p className="text-white/60 text-sm mt-2">השאר פרטים ונגלה לך</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {[
                      'מחיר ברור ללא הפתעות',
                      'ללא עמלות נסתרות',
                      'תשלום קבוע וידוע מראש',
                      'ליווי מלא כלול במחיר',
                      'בלי תוספות בדיעבד'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button onClick={scrollToForm} className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white">
                    קבל את המחיר המלא
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-black text-[#27AE60] mb-2">0₪</div>
                <p className="text-gray-600 font-medium">עמלות נסתרות</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#1E3A5F] mb-2">100%</div>
                <p className="text-gray-600 font-medium">שקיפות מחיר</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#27AE60] mb-2">2000+</div>
                <p className="text-gray-600 font-medium">עוסקים פעילים</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Pricing Section */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-[#27AE60]/10 text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6">
                💰 בוא נדבר מחיר
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#1E3A5F] mb-4">
                המחיר לפתיחת עוסק פטור – בצורה פשוטה
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                אצלנו לא תמצא <strong className="text-red-600">"תלוי"</strong>, <strong className="text-red-600">"בערך"</strong> או <strong className="text-red-600">"נדבר בטלפון"</strong>
                <br />
                אנחנו מאמינים בשקיפות מלאה, כדי שתדע בדיוק למה אתה נכנס.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {[
                { icon: CheckCircle, title: 'מחיר פתיחה חד-פעמי', desc: 'ברור מראש - אין עלויות נוספות' },
                { icon: DollarSign, title: 'תשלום חודשי קבוע', desc: 'ללא הפתעות - סכום קבוע כל חודש' },
                { icon: Shield, title: 'בלי התחייבויות נסתרות', desc: 'הכל שקוף - מה שאתה רואה זה מה שאתה משלם' },
                { icon: AlertCircle, title: 'בלי תוספות בדיעבד', desc: 'אין תוספות מפתיעות - המחיר סופי' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#27AE60]/20"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#27AE60]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-[#27AE60]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Fair Price */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה המחיר שלנו הוגן?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: TrendingDown, text: 'אתה לא משלם על משרד מפואר - אנחנו עובדים בצורה חכמה' },
                { icon: Clock, text: 'הכול מתבצע אונליין - חוסך לך זמן ולנו עלויות' },
                { icon: Sparkles, text: 'תהליך יעיל ומהיר - בלי בזבוז זמן, בלי עלויות מיותרות' },
                { icon: Users, text: 'שירות ממוקד לעצמאים בתחילת הדרך - אנחנו מבינים אותך' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#1E3A5F]" />
                  </div>
                  <p className="text-gray-700 font-medium text-lg">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 text-center bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-3xl p-8 text-white"
            >
              <p className="text-2xl md:text-3xl font-black mb-2">👉 אתה משלם רק על מה שאתה באמת צריך</p>
              <p className="text-xl">בלי עלויות מיותרות, בלי תוספות מפתיעות</p>
            </motion.div>
          </div>
        </section>

        {/* Mid-Page Strong CTA */}
        <section className="py-12 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-[#D4AF37]/20 backdrop-blur-sm text-[#D4AF37] px-6 py-2 rounded-full text-sm font-bold mb-6 border border-[#D4AF37]/30">
                ⏰ מוכן לקבל מחיר ברור?
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                רוצה לדעת בדיוק כמה זה עולה לך?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאר פרטים וקבל הצעת מחיר ברורה ומפורטת - ללא התחייבות
              </p>
              <Button onClick={scrollToForm} size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                <DollarSign className="ml-3 w-7 h-7" />
                קבל הצעת מחיר עכשיו
              </Button>
              <p className="text-white/80 mt-4">✨ ללא התחייבות • שיחה קצרה • מחיר ברור</p>
            </motion.div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כלול במחיר?
              </h2>
              <p className="text-xl text-gray-600">הכל שקוף - בואו נראה מה אתם מקבלים</p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-[#27AE60]/20">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'פתיחת תיק עוסק פטור',
                  'טיפול מלא מול מס הכנסה, מע״מ וביטוח לאומי',
                  'ליווי אישי וזמין',
                  'התחלה חוקית ושקט נפשי',
                  'בלי ריצות, בלי בירוקרטיה',
                  'תמיכה מלאה בכל שלב'
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
                    <span className="text-lg font-medium text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-12 bg-white">
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
                'מי שמחפש מחיר ברור וללא הפתעות',
                'מי שרוצה לפתוח עוסק בלי להסתבך',
                'מי שלא רוצה "ליפול" על עלויות מיותרות',
                'עצמאים בתחילת הדרך שרוצים להתחיל נכון'
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-[#27AE60]/10 to-[#2ECC71]/10 border-r-4 border-[#27AE60] rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-[#27AE60] flex-shrink-0" />
                    <p className="text-lg font-bold text-gray-800">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50" id="pricing-form">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                קבל הצעת מחיר מפורטת
              </h2>
              <p className="text-xl text-gray-600">מלא פרטים ונחזור אליך עם המחיר המלא והמדויק</p>
            </motion.div>

            {isSuccess ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נחזור אליך בקרוב עם הצעת מחיר מפורטת</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#1E3A5F]/20">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="שם מלא *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl border-2"
                    required
                  />

                  <Input
                    type="tel"
                    placeholder="טלפון *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-2"
                    required
                  />

                  <Input
                    type="email"
                    placeholder="אימייל (אופציונלי)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 rounded-xl border-2"
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71] hover:from-[#2ECC71] hover:to-[#27AE60] text-white"
                  >
                    {isSubmitting ? 'שולח...' : 'קבל הצעת מחיר ברורה'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    שיחה קצרה • בלי התחייבות • הכול ברור מראש
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
                רוצה לדעת בדיוק כמה זה עולה לך?
              </h2>
              <p className="text-xl text-white/90 mb-8">קבל הצעת מחיר ברורה ומפורטת - ללא התחייבות</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                  <DollarSign className="ml-3 w-6 h-6" />
                  השאר פרטים וקבל מחיר ברור
                </Button>
                <a href="https://wa.me/972502277087?text=היי, רוצה לדעת כמה עולה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווצאפ
                  </Button>
                </a>
              </div>

              <p className="text-white/80">שיחה קצרה • בלי התחייבות • הכול ברור מראש</p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}