import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, Camera, Shield, Clock, TrendingUp } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import SEOOptimized from './SEOOptimized';

export default function PhotographerLanding() {
  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור לצלמים | Perfect One"
        description="פתיחת עוסק צלם בליווי מלא. עוסק פטור צילום - טיפול מול הרשויות, בלי בירוקרטיה. רואה חשבון לצלמים. התחל לעבוד חוקי תוך 24-72 שעות."
        keywords="פתיחת עוסק צלם, עוסק פטור צילום, פתיחת תיק לצלם, רואה חשבון לצלמים, צלם עצמאי, עוסק פטור לצלמים"
        canonical="https://perfect1.co.il/photographer"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-white/90 text-sm font-medium">מתמחים בצלמים</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  צלם?
                  <br />
                  <span className="text-[#27AE60]">פותחים לך עוסק אונליין</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  פתיחת עוסק לצלמים בליווי מלא, בלי בירוקרטיה ובלי ריצות.
                  <br />
                  <strong className="text-[#D4AF37]">תתחיל לעבוד חוקי תוך 24-72 שעות!</strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <a href="https://wa.me/972502277087?text=היי, אני צלם ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl bg-[#25D366] hover:bg-[#20b858] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      דבר איתנו בווטסאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button variant="outline" className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl border-4 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#1E3A5F] shadow-2xl">
                      <Phone className="ml-3 w-6 h-6" />
                      0502277087
                    </Button>
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  {['ליווי מלא', 'בלי בירוקרטיה', 'תוך 24-72 שעות'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block"
              >
                <LeadForm
                  title="📸 צלם? בוא נפתח לך עוסק!"
                  subtitle="מלא פרטים ונחזור אליך תוך שעות"
                  defaultProfession="צלם"
                  sourcePage="דף נחיתה - צלם"
                  variant="card"
                  compact={true}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                השאלות שכל צלם שואל
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                'איך פותחים עוסק כצלם?',
                'עוסק פטור או מורשה לצילום?',
                'צריך רואה חשבון לצלם?',
                'איך מוציאים חשבוניות ללקוחות?'
              ].map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-6 border-r-4 border-[#27AE60]"
                >
                  <p className="text-lg font-bold text-[#1E3A5F]">{q}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-10"
            >
              <p className="text-2xl font-black text-[#27AE60]">
                במקום להסתבך – אנחנו עושים את זה בשבילך
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-20 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                  אתה מצלם –
                  <br />
                  <span className="text-[#27AE60]">אנחנו מטפלים בניירת</span>
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: 'פתיחת עוסק פטור לצלמים', color: 'text-[#27AE60]' },
                    { icon: Shield, text: 'טיפול מלא מול מס הכנסה, מע"מ וביטוח לאומי', color: 'text-[#1E3A5F]' },
                    { icon: TrendingUp, text: 'ליווי אישי והסברים פשוטים', color: 'text-[#D4AF37]' },
                    { icon: Clock, text: 'הכול אונליין - בלי ריצות', color: 'text-[#27AE60]' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                        <item.icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <p className="text-lg font-bold text-gray-800">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:hidden"
              >
                <LeadForm
                  title="📸 השאר פרטים"
                  subtitle="ונחזור אליך תוך שעות"
                  defaultProfession="צלם"
                  sourcePage="דף נחיתה - צלם"
                  variant="card"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="hidden lg:block bg-white rounded-3xl shadow-2xl p-10 border border-blue-100"
              >
                <h3 className="text-2xl font-black text-[#1E3A5F] mb-6">מה כולל השירות</h3>
                <ul className="space-y-4">
                  {[
                    'פתיחת תיק עוסק פטור',
                    'התאמה מלאה לצלמים',
                    'ליווי מקצועי וזמין',
                    'הסבר מה מותר ומה אסור',
                    'התחלה חוקית ושקט נפשי'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-12 text-center">
              Perfect One – הבית לעצמאיים
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'ניסיון בליווי צלמים ועצמאים',
                'התמחות בפתיחת תיקים לעסקים קטנים',
                'שירות אישי, ברור וזמין',
                'דגש על פשטות ושקט נפשי'
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 flex items-center gap-4"
                >
                  <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
                  <p className="text-lg font-bold text-[#1E3A5F]">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                רוצה להתחיל לעבוד כצלם חוקי כבר השבוע?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                השאר פרטים ונחזור אליך תוך שעות
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני צלם ואשמח לפתוח עוסק" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl bg-[#25D366] hover:bg-[#20b858] text-white shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl border-4 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                    <Phone className="ml-3 w-6 h-6" />
                    התקשר: 0502277087
                  </Button>
                </a>
              </div>
              <p className="text-white/60 mt-6">ללא התחייבות • שיחה קצרה • הסבר מלא לפני כל תשלום</p>
            </motion.div>
          </div>
        </section>

        {/* Mobile Form */}
        <section className="lg:hidden py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <LeadForm
              title="📸 צלם? בוא נפתח לך עוסק!"
              subtitle="מלא פרטים ונחזור אליך תוך שעות"
              defaultProfession="צלם"
              sourcePage="דף נחיתה - צלם"
              variant="card"
            />
          </div>
        </section>
      </main>
    </>
  );
}