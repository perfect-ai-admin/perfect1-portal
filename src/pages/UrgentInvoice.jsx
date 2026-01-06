import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import SEOOptimized from './SEOOptimized';

export default function UrgentInvoice() {
  return (
    <>
      <SEOOptimized
        title="צריך חשבונית עכשיו? פתיחת עוסק פטור דחוף | Perfect One"
        description="לקוח מבקש חשבונית ואין לך עוסק? פותחים עוסק פטור מהיום להיום. פתרון מיידי להוצאת חשבוניות כחוק. בלי ריצות, בלי הסתבכויות."
        keywords="צריך חשבונית עכשיו, פתיחת עוסק דחוף, פתיחת עוסק להפקת חשבוניות, איך להוציא חשבונית כחוק, פתיחת עוסק מהיום להיום"
        canonical="https://perfect1.co.il/urgent-invoice"
      />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#0F2847]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-red-400/30">
                  <AlertCircle className="w-5 h-5 text-red-300 animate-pulse" />
                  <span className="text-red-100 text-sm font-bold">פתרון מיידי</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  צריך חשבונית
                  <br />
                  <span className="text-[#27AE60]">עכשיו?</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-4 leading-relaxed font-bold">
                  לקוח מחכה? אין לך עוסק?
                </p>
                <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                  פותחים עוסק פטור <strong className="text-[#D4AF37]">מהיום להיום</strong> ומוציאים חשבונית כחוק
                </p>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-3 text-white">
                    {[
                      { icon: CheckCircle, text: 'פתרון מיידי' },
                      { icon: Shield, text: 'חוקי 100%' },
                      { icon: Clock, text: 'בלי ריצות' },
                      { icon: CheckCircle, text: 'הכול אונליין' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-[#27AE60]" />
                        <span className="font-semibold text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, צריך חשבונית עכשיו - אשמח לייעוץ מיידי" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl bg-[#27AE60] hover:bg-[#229954] text-white shadow-2xl animate-pulse-glow">
                      <MessageCircle className="ml-3 w-6 h-6" />
                      פתרון מיידי בווטסאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button variant="outline" className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl border-4 border-white bg-white text-[#1E3A5F] hover:bg-white/90 shadow-2xl">
                      <Phone className="ml-3 w-6 h-6" />
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
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-white/20">
                 <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">⚡ צריך חשבונית?</h3>
                 <p className="text-gray-600 text-center mb-6">השאר פרטים - נחזור תוך דקות</p>
                 <LeadForm
                   sourcePage="דף דחוף - חשבונית"
                   compact={true}
                 />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                לקוח מבקש חשבונית – ואין לך עוסק?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                'לקוח לא משלם בלי חשבונית',
                'צריך עוסק בשביל חשבונית?',
                'איך להוציא חשבונית היום?'
              ].map((pain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-red-50 border-r-4 border-red-500 rounded-2xl p-6"
                >
                  <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                  <p className="text-lg font-bold text-gray-800">{pain}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-3xl p-8 text-white"
            >
              <p className="text-2xl md:text-3xl font-black mb-2">👉 אתה לא לבד</p>
              <p className="text-xl font-medium">ויש פתרון חוקי, פשוט ומהיר</p>
            </motion.div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                פתיחת עוסק להוצאת חשבונית
              </h2>
              <p className="text-xl text-gray-600">פתרון חוקי ומיידי</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl shadow-xl p-8"
              >
                <h3 className="text-2xl font-black text-[#1E3A5F] mb-6">אנחנו מטפלים עבורך ב:</h3>
                <ul className="space-y-4">
                  {[
                    'פתיחת עוסק דחוף',
                    'פתיחת עוסק מהיום להיום',
                    'פתיחת עוסק להפקת חשבוניות',
                    'הסבר ברור איך מוציאים חשבונית'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
                      <span className="text-lg font-medium text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border-r-4 border-blue-500">
                  <p className="font-bold text-gray-800">בלי חרטות. בלי "תלוי". בלי סיבוכים מול הרשויות.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:hidden bg-white rounded-3xl shadow-xl p-6"
              >
                <h3 className="text-2xl font-black text-[#1E3A5F] mb-2 text-center">⚡ צריך פתרון מיידי?</h3>
                <p className="text-gray-600 text-center mb-6">השאר פרטים - נחזור תוך דקות</p>
                <LeadForm
                  sourcePage="דף דחוף - חשבונית"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="hidden lg:block bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-3xl shadow-2xl p-8 text-white"
              >
                <h3 className="text-2xl font-black mb-6">מה כלול בשירות</h3>
                <ul className="space-y-4">
                  {[
                    'פתיחת עוסק פטור',
                    'טיפול מול הרשויות',
                    'ליווי ברור ומסודר',
                    'פתרון לבעיה של "חשבונית ללקוח בלי עוסק"',
                    'שקט נפשי – עובד חוקי'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60] flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-br from-[#27AE60] to-[#229954]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                צריך חשבונית עכשיו?
              </h2>
              <p className="text-2xl font-bold text-white/90 mb-8">זה הזמן לסגור את זה.</p>
              <p className="text-xl text-white/80 mb-10">
                השאר פרטים ואנחנו חוזרים אליך במהירות עם פתרון מיידי
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, צריך חשבונית עכשיו" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl bg-white text-[#27AE60] hover:bg-white/90 shadow-2xl">
                    <MessageCircle className="ml-3 w-6 h-6" />
                    פנייה מיידית בווטסאפ
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="w-full sm:w-auto h-20 px-12 text-2xl font-black rounded-3xl border-4 border-white bg-transparent text-white hover:bg-white hover:text-[#27AE60] shadow-2xl">
                    <Phone className="ml-3 w-6 h-6" />
                    התקשר עכשיו
                  </Button>
                </a>
              </div>
              <p className="text-white/70 mt-6">שיחה קצרה • בלי התחייבות • פתרון ברור</p>
            </motion.div>
          </div>
        </section>


      </main>
    </>
  );
}