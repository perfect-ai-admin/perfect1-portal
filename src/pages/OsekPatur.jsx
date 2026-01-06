import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, Clock, Shield, Award, FileText, Users, Zap } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';
import SEOOptimized, { seoPresets, schemaTemplates } from './SEOOptimized';

export default function OsekPatur() {
  return (
    <>
      <SEOOptimized 
        title="פתיחת עוסק פטור תוך 24-72 שעות | פרפקט וואן - 199₪ בלבד"
        description="פתיחת עוסק פטור מהירה ופשוטה. כולל: רישום במס הכנסה, מע״מ, ביטוח לאומי + ליווי מלא. 2,000+ עוסקים בשנה. התקשר עכשיו: 0502277087"
        keywords="פתיחת עוסק פטור, עוסק פטור, איך פותחים עוסק פטור, מחיר פתיחת עוסק פטור, פתיחת תיק במס הכנסה"
        canonical="https://perfect1.co.il/osek-patur"
        schema={schemaTemplates.service('פתיחת עוסק פטור', '199')}
      />
      
      <main className="min-h-screen">
        {/* Hero - Above the Fold */}
        <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center lg:text-right"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white font-bold">המרכז הארצי לעוסקים פטורים</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  פתיחת עוסק פטור
                  <br />
                  <span className="text-[#D4AF37]">תוך 24-72 שעות</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                  כל מה שצריך כדי להתחיל לעבוד חוקית - רישום במס הכנסה, מע״מ, ביטוח לאומי + ליווי מלא
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-white font-bold">2,000+ עוסקים בשנה</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Clock className="w-5 h-5 text-[#27AE60]" />
                    <span className="text-white font-bold">24-72 שעות</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Shield className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-white font-bold">מחיר קבוע 199₪</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="https://wa.me/972502277087?text=היי, מעוניין לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white shadow-2xl hover:scale-105 transition-all">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      שלח וואטסאפ עכשיו
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

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-8 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-[#27AE60]/10 text-[#27AE60] px-4 py-2 rounded-full mb-4">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold">תגובה תוך שעות</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#1E3A5F] mb-2">
                    פתח עוסק פטור היום
                  </h2>
                  <p className="text-gray-600">מלא פרטים ונחזור אליך מיד</p>
                </div>
                <LeadForm 
                  title=""
                  subtitle=""
                  sourcePage="דף עוסק פטור"
                  compact={false}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-4">
                מה כולל השירות?
              </h2>
              <p className="text-xl text-gray-600">הכל כלול במחיר אחד - 199₪ + מע״מ</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: 'פתיחת תיק במס הכנסה', desc: 'רישום רשמי במס הכנסה כעוסק פטור', color: '#1E3A5F' },
                { icon: Shield, title: 'רישום במע"מ כפטור', desc: 'פטור מגביית מע"מ עד 120,000₪', color: '#27AE60' },
                { icon: Users, title: 'פתיחת תיק בביטוח לאומי', desc: 'רישום וקבלת זכויות בביטוח לאומי', color: '#D4AF37' },
                { icon: CheckCircle, title: 'הדרכה מלאה', desc: 'הסבר על כל החובות והזכויות', color: '#3498DB' },
                { icon: Phone, title: 'תמיכה טלפונית', desc: 'זמינים לכל שאלה לאורך הדרך', color: '#9B59B6' },
                { icon: Zap, title: 'תהליך מהיר', desc: 'פתיחת התיק תוך 24-72 שעות', color: '#E67E22' }
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
              <p className="text-xl text-gray-600">4 צעדים פשוטים להתחלת עסק</p>
            </motion.div>

            <div className="space-y-6">
              {[
                { num: '1', title: 'יצירת קשר', desc: 'שולחים לנו וואטסאפ או מתקשרים - נענה מיד' },
                { num: '2', title: 'מסירת מסמכים', desc: 'שולחים תעודת זהות + אישור ניהול חשבון בנק' },
                { num: '3', title: 'הגשת בקשות', desc: 'אנחנו מגישים את הבקשות לכל הרשויות' },
                { num: '4', title: 'קבלת אישורים', desc: 'מקבלים את כל האישורים תוך 24-72 שעות' }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 bg-gray-50 rounded-2xl p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center flex-shrink-0">
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
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                מחיר שקוף - ללא הפתעות
              </h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-10 max-w-md mx-auto">
                <div className="text-7xl font-black text-[#D4AF37] mb-2">199₪</div>
                <div className="text-2xl text-white/90 mb-4">+ מע״מ</div>
                <div className="text-xl text-white font-bold">פתיחת תיק מלאה</div>
              </div>
              <a href="https://wa.me/972502277087?text=היי, מעוניין לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-16 px-12 text-xl font-black rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#c9a432] hover:to-[#D4AF37] text-[#1E3A5F] shadow-2xl hover:scale-105 transition-all">
                  <MessageCircle className="w-6 h-6 ml-2" />
                  בוא נתחיל!
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}