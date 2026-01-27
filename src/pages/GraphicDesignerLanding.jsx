import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, Palette, Shield, Clock, TrendingUp } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import SEOOptimized from './SEOOptimized';

export default function GraphicDesignerLanding() {
  return (
    <>
      <SEOOptimized
        title="סגירת עוסק פטור | Perfect One"
        description="סגירת עוסק פטור בליווי מלא מול מס הכנסה וביטוח לאומי. בלי בירוקרטיה, בלי שגיאות. תוך 48 שעות עוסקך סגור רשמית."
        keywords="סגירת עוסק פטור, סגירה לרשויות, סגרתי עוסק, סגירה טאקס, עוסק פטור סגור"
        canonical="https://perfect1.co.il/close-osek-patur"
      />
      <>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Palette className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-white/90 text-sm font-medium">מתמחים במעצבים</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  מעצב גרפי?
                  <br />
                  <span className="text-[#27AE60]">פותחים לך עוסק אונליין</span>
                </h1>

                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                  פתיחת עוסק למעצבים גרפיים בליווי מלא, בלי בירוקרטיה ובלי ריצות.
                  <br />
                  <strong className="text-[#D4AF37]">תתחיל לעבוד חוקי תוך 24-72 שעות!</strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <a href="https://wa.me/972502277087?text=היי, אני מעצב גרפי ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
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
                  title="🎨 מעצב? בוא נפתח לך עוסק!"
                  subtitle="מלא פרטים ונחזור אליך תוך שעות"
                  defaultProfession="מעצב גרפי"
                  sourcePage="דף נחיתה - מעצב גרפי"
                  variant="card"
                  compact={true}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problems Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                השאלות שכל מעצב גרפי שואל
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'סגירת עוסק פטור', description: 'לסיום עסקתך בחוקיות', link: '/close-osek-patur', icon: '📋' },
                { title: 'סגירת תיק במס הכנסה', description: 'ליישוב חובות וסגירה סופית', link: '/close-osek-patur-tax', icon: '💼' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <a href={item.link} className="block bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#1E3A5F] hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-2xl font-black text-[#1E3A5F] mb-2 group-hover:text-[#27AE60]">{item.title}</p>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                      <span className="text-4xl ml-4">{item.icon}</span>
                    </div>
                  </a>
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
                במקום לחפש תשובות – אנחנו עושים את זה בשבילך
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-20 bg-gradient-to-br from-[#F8F9FA] to-blue-50/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
                  אתה מתמקד בעיצוב –
                  <br />
                  <span className="text-[#27AE60]">אנחנו בכל השאר</span>
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: 'פתיחת עוסק פטור למעצב גרפי', color: 'text-[#27AE60]' },
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
                  title="🎨 השאר פרטים עכשיו"
                  subtitle="ונחזור אליך תוך שעות"
                  defaultProfession="מעצב גרפי"
                  sourcePage="דף נחיתה - מעצב גרפי"
                  variant="card"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="hidden lg:block"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-blue-100">
                  <h3 className="text-2xl font-black text-[#1E3A5F] mb-6">מה כולל השירות</h3>
                  <ul className="space-y-4">
                    {[
                      'פתיחת תיק עוסק פטור',
                      'התאמה למעצבים גרפיים',
                      'ליווי מקצועי וזמין',
                      'הסבר מה מותר ומה אסור',
                      'התחלה חוקית ושקט נפשי'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#27AE60]/20 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Perfect One */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                Perfect One – הבית לעצמאיים
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'ניסיון בליווי מעצבים גרפיים', icon: '✅' },
                { title: 'התמחות בפתיחת תיקים לעסקים קטנים', icon: '🎯' },
                { title: 'שירות אישי, ברור וזמין', icon: '💬' },
                { title: 'דגש על פשטות ושקט נפשי', icon: '🧘' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <p className="text-lg font-bold text-[#1E3A5F]">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 md:p-12"
            >
              <h2 className="text-2xl md:text-3xl font-black text-[#1E3A5F] text-center mb-2">
                מעוניין לפתוח עוסק גרפי?
              </h2>
              <p className="text-center text-gray-600 mb-8">
                שאר לנו את הפרטים שלך ונחזור אליך תוך שעות
              </p>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const name = e.target.name.value;
                const phone = e.target.phone.value;
                window.location.href = `https://wa.me/972502277087?text=שלום, שמי ${name} ומספר הטלפון שלי ${phone}`;
              }}>
                <input
                  type="text"
                  name="name"
                  placeholder="שם מלא"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="מספר טלפון"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                />
                <Button type="submit" className="w-full h-12 bg-[#1E3A5F] hover:bg-[#2C5282] text-white font-black rounded-xl">
                  שלח פרטים
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Mobile Form */}
        <section className="lg:hidden py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4">
            <LeadForm
              title="🎨 מעצב? בוא נפתח לך עוסק!"
              subtitle="מלא פרטים ונחזור אליך תוך שעות"
              defaultProfession="מעצב גרפי"
              sourcePage="דף נחיתה - מעצב גרפי"
              variant="card"
            />
          </div>
        </section>
      </>
    </>
  );
}