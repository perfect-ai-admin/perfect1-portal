import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Phone, MessageCircle, Sparkles, Shield, Clock, Heart, Star, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function MakeupArtistLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: 'מאפרת'
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
        source_page: 'דף נחיתה - מאפרת',
        status: 'new'
      });

      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור מאפרת | המרכז לעוסקים פטורים"
        description="פתיחת עוסק פטור למאפרות בליווי מלא, אונליין, בלי בירוקרטיה. התחילי לעבוד חוקי ולהוציא קבלות. 0502277087"
        keywords="פתיחת עוסק פטור מאפרת, עוסק פטור למאפרות, רואה חשבון למאפרת, מאפרת עצמאית, איפור כלות"
        canonical="https://perfect1.co.il/makeup-artist"
      />
      <main className="pt-20 bg-[#F8F9FA]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 right-20 w-64 h-64 bg-rose-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-rose-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-rose-400/30">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                  <span className="text-rose-700 text-sm font-bold">מיוחד למאפרות</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1E3A5F] leading-tight mb-6">
                  מאפרת?
                  <br />
                  <span className="text-rose-600">פותחים לך עוסק פטור תוך דקות</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed font-medium">
                  פתיחת עוסק למאפרות אונליין,
                  <br />
                  <strong className="text-[#1E3A5F]">בליווי מלא, בלי בירוקרטיה ובלי כאב ראש</strong>
                </p>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-rose-200 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Heart, text: 'ליווי אישי' },
                      { icon: Shield, text: 'עבודה חוקית' },
                      { icon: Clock, text: 'הכל אונליין' },
                      { icon: CheckCircle, text: 'מחיר ברור' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-rose-600" />
                        <span className="font-medium text-gray-700 text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl">
                    <Sparkles className="ml-3 w-6 h-6" />
                    השאירי פרטים - ונפתח לך עוסק
                  </Button>
                  <a href="https://wa.me/972502277087?text=היי, אני מאפרת ורוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white shadow-2xl">
                      <MessageCircle className="ml-3 w-5 h-5" />
                      דברי איתנו בווצאפ
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
                id="lead-form"
              >
                {isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-rose-200">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-rose-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה! 💄</h3>
                    <p className="text-gray-600">נציגה תחזור אלייך בהקדם</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-rose-200">
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">💄 השאירי פרטים</h3>
                    <p className="text-gray-600 text-center mb-6">ונפתח לך עוסק</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label className="text-gray-700 font-medium mb-2">שם מלא *</Label>
                        <Input
                          placeholder="שם מלא"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-gray-700 font-medium mb-2">טלפון *</Label>
                        <Input
                          type="tel"
                          placeholder="טלפון"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-12 rounded-xl border-2"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-gray-700 font-medium mb-2">סוג עיסוק</Label>
                        <Select value={formData.profession} onValueChange={(value) => setFormData({ ...formData, profession: value })}>
                          <SelectTrigger className="h-12 rounded-xl border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="מאפרת">מאפרת</SelectItem>
                            <SelectItem value="איפור כלות">איפור כלות</SelectItem>
                            <SelectItem value="איפור אירועים">איפור אירועים</SelectItem>
                            <SelectItem value="איפור קבוע">איפור קבוע</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                      >
                        {isSubmitting ? 'שולח...' : 'השאירי פרטים ונחזור אלייך'}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום
                      </p>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                הכירי את הבעיות האלה?
              </h2>
              <p className="text-xl text-gray-600">כל מאפרת מכירה את הסיטואציות האלה</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                'כלה מבקשת קבלה ואין לך עוסק?',
                'לא יודעת איך לעבוד חוקי ומסודר?',
                'מפחדת לטעות מול רשויות המס?',
                'רוצה להתחיל נכון אבל לא יודעת איך?'
              ].map((pain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-rose-50 border-r-4 border-rose-500 rounded-2xl p-6"
                >
                  <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                  <p className="text-lg font-bold text-gray-800">{pain}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-white"
            >
              <p className="text-2xl md:text-3xl font-black mb-2">💖 אנחנו כאן בשבילך</p>
              <p className="text-xl font-medium">נטפל בזה בשבילך - מההתחלה ועד הסוף</p>
            </motion.div>
          </div>
        </section>

        {/* Mid-Page CTA */}
        <section className="py-12 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
                ⏰ תפסיקי לדחות - זה הזמן
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                מוכנה להתחיל לעבוד חוקית?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאירי פרטים עכשיו ונחזור אלייך תוך שעות עם כל המידע
              </p>
              <Button onClick={scrollToForm} size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl bg-white text-rose-600 hover:bg-white/90 shadow-2xl">
                <Sparkles className="ml-3 w-7 h-7" />
                כן, אני רוצה לפתוח עוסק!
              </Button>
              <p className="text-white/80 mt-4">✨ ללא התחייבות • שיחה קצרה • הסבר ברור</p>
            </motion.div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-rose-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                את מאפרת - אנחנו מטפלים בניירת
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, title: 'פתיחת עוסק למאפרות', desc: 'מותאם למקצוע שלך' },
                { icon: Shield, title: 'טיפול מול הרשויות', desc: 'מס הכנסה וביטוח לאומי' },
                { icon: Heart, title: 'ליווי אישי', desc: 'תמיד זמינים לעזרה' },
                { icon: Clock, text: 'הכל אונליין', desc: 'בלי ריצות' },
                { icon: Sparkles, title: 'מחיר שקוף', desc: 'ללא עלויות נסתרות' },
                { icon: Star, title: 'שקט נפשי', desc: 'עובדת חוקית' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-rose-100"
                >
                  <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 relative overflow-hidden">
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
                רוצה להתחיל לעבוד חוקי כבר השבוע?
              </h2>
              <p className="text-xl text-white/90 mb-8">השאירי פרטים ונחזור אלייך במהירות</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={scrollToForm} className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-rose-600 hover:bg-white/90 shadow-2xl">
                  <Sparkles className="ml-3 w-6 h-6" />
                  השאירי פרטים
                </Button>
                <a href="https://wa.me/972502277087?text=היי, אני מאפרת ורוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-rose-600 shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    וואטסאפ
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mobile Form */}
        <section className="lg:hidden py-10 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            {isSuccess ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-rose-200">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה! 💄</h3>
                <p className="text-gray-600">נחזור אלייך בקרוב</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-rose-200">
                <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">💄 השאירי פרטים</h3>
                <p className="text-gray-600 text-center mb-6">ונפתח לך עוסק</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="שם מלא *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="טלפון *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl"
                    required
                  />
                  <Select value={formData.profession} onValueChange={(value) => setFormData({ ...formData, profession: value })}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="מאפרת">מאפרת</SelectItem>
                      <SelectItem value="איפור כלות">איפור כלות</SelectItem>
                      <SelectItem value="איפור אירועים">איפור אירועים</SelectItem>
                      <SelectItem value="איפור קבוע">איפור קבוע</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-500"
                  >
                    {isSubmitting ? 'שולח...' : 'השאירי פרטים'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    ללא התחייבות • שיחה קצרה • הסבר מלא
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}