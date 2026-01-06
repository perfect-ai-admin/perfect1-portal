import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Phone, MessageCircle, Wrench, Shield, Clock, FileText, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOOptimized from './SEOOptimized';

export default function ComputerTechnicianLanding() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profession: 'טכנאי מחשבים'
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
        source_page: 'דף נחיתה - טכנאי מחשבים',
        status: 'new'
      });

      const message = `🔧 ליד חדש - טכנאי!

👤 שם: ${formData.name}
📞 טלפון: ${formData.phone}
💼 מקצוע: ${formData.profession}

📍 מקור: דף נחיתה טכנאי מחשבים
📅 ${new Date().toLocaleString('he-IL')}`;

      window.open(`https://wa.me/972502277087?text=${encodeURIComponent(message)}`, '_blank');
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור לטכנאי מחשבים וסלולר | Perfect One"
        description="פתיחת עוסק פטור לטכנאי מחשבים וטכנאי סלולר. ליווי מלא, בלי בירוקרטיה, בלי ריצות. התחל לעבוד חוקי ולהוציא חשבוניות. 0502277087"
        keywords="פתיחת עוסק טכנאי מחשבים, עוסק פטור טכנאי סלולר, פתיחת תיק טכנאי מחשבים, רואה חשבון לטכנאים, טכנאי עצמאי, עוסק פטור תיקון מחשבים"
        canonical="https://perfect1.co.il/computer-technician"
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
                  <Wrench className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-white text-sm font-bold">מיוחד לטכנאים</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  טכנאי מחשבים או סלולר?
                  <br />
                  <span className="text-[#27AE60]">פותחים לך עוסק פטור אונליין</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  פתיחת עוסק לטכנאים בליווי מלא,
                  <br />
                  <strong className="text-[#D4AF37]">בלי בירוקרטיה ובלי ריצות</strong>
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {[
                      { icon: Shield, text: 'עבודה חוקית' },
                      { icon: FileText, text: 'חשבוניות ללקוחות' },
                      { icon: Clock, text: 'הכל אונליין' },
                      { icon: CheckCircle, text: 'ליווי מלא' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-[#27AE60]" />
                        <span className="font-medium text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, אני טכנאי ורוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      דבר איתנו בווצאפ עכשיו
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <Phone className="ml-3 w-5 h-5" />
                      0502277087
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                {isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                    <p className="text-gray-600">נציג יצור איתך קשר בהקדם</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">🔧 השאר פרטים</h3>
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
                            <SelectItem value="טכנאי מחשבים">טכנאי מחשבים</SelectItem>
                            <SelectItem value="טכנאי סלולר">טכנאי סלולר</SelectItem>
                            <SelectItem value="טכנאי מחשבים וסלולר">מחשבים + סלולר</SelectItem>
                            <SelectItem value="טכנאי שטח">טכנאי שטח</SelectItem>
                          </SelectContent>
                        </Select>
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
                שאלות שטכנאים שואלים
              </h2>
              <p className="text-xl text-gray-600">במקום לבזבז זמן – אנחנו עושים את זה בשבילך</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                'איך פותחים עוסק כטכנאי מחשבים?',
                'עוסק פטור או מורשה לתיקונים?',
                'צריך רואה חשבון לטכנאי?',
                'איך מוציאים חשבוניות ללקוחות?'
              ].map((question, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-r-4 border-[#1E3A5F]"
                >
                  <AlertCircle className="w-8 h-8 text-[#1E3A5F] mb-3" />
                  <p className="text-lg font-bold text-gray-800">{question}</p>
                </motion.div>
              ))}
            </div>
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
              <div className="inline-block bg-[#27AE60]/20 backdrop-blur-sm text-[#27AE60] px-6 py-2 rounded-full text-sm font-bold mb-6 border border-[#27AE60]/30">
                ⏰ זה הזמן לפעול
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                מוכן להתחיל לעבוד חוקית?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                השאר פרטים עכשיו ונחזור אליך תוך שעות עם כל המידע
              </p>
              <Button 
                onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                size="lg" 
                className="h-20 px-12 text-2xl font-black rounded-3xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl"
              >
                <Wrench className="ml-3 w-7 h-7" />
                כן, אני רוצה לפתוח עוסק!
              </Button>
              <p className="text-white/80 mt-4">✨ ללא התחייבות • שיחה קצרה • הסבר ברור</p>
            </motion.div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                אתה מתקן – אנחנו מטפלים בניירת
              </h2>
              <p className="text-xl text-gray-600">הפתרון המושלם לטכנאים עצמאיים</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Wrench, title: 'פתיחת עוסק פטור לטכנאי מחשבים וסלולר', desc: 'התאמה מדויקת למקצוע שלך' },
                { icon: Shield, title: 'טיפול מלא מול מס הכנסה, מע״מ וביטוח לאומי', desc: 'אנחנו מדברים בשבילך' },
                { icon: Users, title: 'ליווי אישי והסברים פשוטים', desc: 'תמיד זמינים לשאלות' },
                { icon: Clock, title: 'הכול אונליין', desc: 'בלי ריצות, בלי תורים' },
                { icon: FileText, title: 'מחיר ברור וללא הפתעות', desc: 'שקיפות מלאה' },
                { icon: TrendingUp, title: 'התחלה חוקית ושקט נפשי', desc: 'עובד לפי החוק' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#27AE60]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-[#27AE60]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
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
                מה כולל השירות
              </h2>
            </motion.div>

            <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-3xl shadow-2xl p-8 md:p-10 text-white">
              <ul className="grid md:grid-cols-2 gap-6">
                {[
                  'פתיחת תיק עוסק פטור',
                  'התאמה לטכנאי מחשבים וסלולר',
                  'ליווי מקצועי וזמין',
                  'הסבר מה מותר ומה אסור',
                  'התחלה חוקית ושקט נפשי',
                  'תמיכה בכל שלב'
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
                    <span className="text-lg font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה המרכז לעוסקים פטורים?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Users, text: 'ניסיון בליווי טכנאים ועצמאים בתחילת הדרך' },
                { icon: Shield, text: 'התמחות בפתיחת תיקים לעסקים קטנים' },
                { icon: MessageCircle, text: 'שירות אישי, ברור וזמין' },
                { icon: CheckCircle, text: 'דגש על פשטות ושקט נפשי' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <p className="text-lg text-gray-700 font-medium">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-br from-[#27AE60] to-[#229954]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                רוצה להתחיל לעבוד כטכנאי חוקי כבר השבוע?
              </h2>
              <p className="text-xl text-white/90 mb-8">השאר פרטים ונחזור אליך במהירות</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a href="https://wa.me/972502277087?text=היי, אני טכנאי ורוצה לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווצאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <Phone className="ml-3 w-6 h-6" />
                    התקשר עכשיו
                  </Button>
                </a>
              </div>

              <p className="text-white/80">ללא התחייבות • שיחה קצרה • הסבר מלא</p>
            </motion.div>
          </div>
        </section>

        {/* Mobile Form */}
        <section className="lg:hidden py-10 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            {isSuccess ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">תודה על הפנייה!</h3>
                <p className="text-gray-600">נציג יצור איתך קשר בהקדם</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">🔧 השאר פרטים</h3>
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
                      <SelectItem value="טכנאי מחשבים">טכנאי מחשבים</SelectItem>
                      <SelectItem value="טכנאי סלולר">טכנאי סלולר</SelectItem>
                      <SelectItem value="טכנאי מחשבים וסלולר">מחשבים + סלולר</SelectItem>
                      <SelectItem value="טכנאי שטח">טכנאי שטח</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#27AE60] to-[#2ECC71]"
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
      </main>
    </>
  );
}