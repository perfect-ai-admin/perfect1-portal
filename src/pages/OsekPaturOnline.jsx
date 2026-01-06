import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, Laptop, Smartphone, Clock, Shield, Zap, Globe, Lock, FileText } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import SEOOptimized, { schemaTemplates } from './SEOOptimized';

export default function OsekPaturOnline() {
  return (
    <>
      <SEOOptimized 
        title="פתיחת עוסק פטור אונליין - 100% דיגיטלי | פרפקט וואן"
        description="פתיחת עוסק פטור אונליין ללא יציאה מהבית! חתימה דיגיטלית, העלאת מסמכים מהנייד, מעקב בזמן אמת. תוך 24-72 שעות. התקשר: 0502277087"
        keywords="פתיחת עוסק פטור אונליין, פתיחת עוסק מהבית, פתיחת עוסק דיגיטלי, חתימה דיגיטלית עוסק פטור"
        canonical="https://perfect1.co.il/osek-patur-online"
        schema={schemaTemplates.service('פתיחת עוסק פטור אונליין', '199')}
      />
      
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#3498DB] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Laptop className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white font-bold">100% דיגיטלי</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  פתיחת עוסק פטור
                  <br />
                  <span className="text-[#D4AF37]">אונליין מהבית</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                  ללא יציאה מהבית! חתימה דיגיטלית, העלאת מסמכים מהנייד, ומעקב סטטוס בזמן אמת
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Smartphone className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-white font-bold">מהנייד או מהמחשב</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Clock className="w-5 h-5 text-[#27AE60]" />
                    <span className="text-white font-bold">24-72 שעות</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Lock className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-white font-bold">מאובטח לחלוטין</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, מעוניין לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-2xl hover:scale-105 transition-all">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      פתח אונליין עכשיו
                    </Button>
                  </a>
                  <a href="tel:0502277087">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-3 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-105">
                      <Phone className="w-6 h-6 ml-2" />
                      0502277087
                    </Button>
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">תהליך מהיר ופשוט</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#1E3A5F] mb-2">
                    מלא פרטים ונתחיל
                  </h2>
                  <p className="text-gray-600">הכל מהנייד או מהמחשב</p>
                </div>
                <LeadForm 
                  title=""
                  subtitle=""
                  sourcePage="דף עוסק פטור אונליין"
                  compact={false}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Online Features */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                למה לפתוח אונליין?
              </h2>
              <p className="text-xl text-gray-600">כל היתרונות של פתיחה דיגיטלית</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Smartphone, title: 'מהנייד או המחשב', desc: 'פותחים את התיק מכל מקום, בכל זמן', color: '#3498DB' },
                { icon: Lock, title: 'חתימה דיגיטלית', desc: 'חתימה מאובטחת ללא צורך בהדפסה', color: '#27AE60' },
                { icon: Globe, title: 'העלאת מסמכים', desc: 'צלם מהנייד והעלה ישירות למערכת', color: '#9B59B6' },
                { icon: Clock, title: 'מעקב בזמן אמת', desc: 'עדכונים לגבי סטטוס הפתיחה בזמן אמת', color: '#E67E22' },
                { icon: Shield, title: 'אבטחת מידע', desc: 'המסמכים שלך מאובטחים ומוצפנים', color: '#1E3A5F' },
                { icon: Zap, title: 'תהליך מהיר', desc: 'פחות זמן המתנה, יותר יעילות', color: '#D4AF37' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all group"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                איך זה עובד?
              </h2>
              <p className="text-xl text-gray-600">3 צעדים פשוטים מהנייד</p>
            </motion.div>

            <div className="space-y-6">
              {[
                { num: '1', title: 'מלא טופס אונליין', desc: 'מילוי טופס קצר עם הפרטים האישיים שלך' },
                { num: '2', title: 'העלה מסמכים', desc: 'צלם והעלה: תעודת זהות + אישור בנק' },
                { num: '3', title: 'חתום דיגיטלית', desc: 'חתימה דיגיטלית מאובטחת ואנחנו מטפלים בשאר' }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 bg-blue-50 rounded-2xl p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3498DB] to-[#2C5282] flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-black text-white">{step.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">{step.title}</h3>
                    <p className="text-lg text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Price CTA */}
        <section className="py-20 bg-gradient-to-br from-[#3498DB] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                אותו מחיר, יותר נוחות
              </h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-10 max-w-md mx-auto">
                <div className="text-7xl font-black text-[#D4AF37] mb-2">199₪</div>
                <div className="text-2xl text-white/90 mb-4">+ מע״מ</div>
                <div className="text-xl text-white font-bold">פתיחה מלאה אונליין</div>
              </div>
              <a href="https://wa.me/972502277087?text=היי, מעוניין לפתוח עוסק פטור אונליין" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#c9a432] hover:to-[#D4AF37] text-[#1E3A5F] shadow-2xl hover:scale-105 transition-all">
                  <Laptop className="w-6 h-6 ml-2" />
                  פתח אונליין עכשיו!
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}