import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Users, Sparkles, Shield, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-[#27AE60]/20 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-right"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8"
            >
              <Users className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white/90 text-sm font-medium">פותחים כ-2,000 עוסקים פטורים בשנה</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              רוצה לפתוח עסק?
              <br />
              <span className="text-[#D4AF37]">אנחנו נעשה את זה בשבילך!</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-xl lg:mr-0 lg:ml-auto mx-auto font-medium">
              ליווי מלא מהצעד הראשון - אתה עובד, אנחנו מטפלים בכל השאר.
              <br />
              <strong className="text-[#27AE60]">תוך 24-72 שעות תתחיל לעבוד חוקית!</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={createPageUrl('Contact')}>
                <Button 
                  size="lg" 
                  className="h-20 px-12 text-2xl font-black rounded-3xl bg-gradient-to-r from-[#27AE60] via-[#2ECC71] to-[#27AE60] hover:from-[#2ECC71] hover:via-[#27AE60] hover:to-[#2ECC71] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105 animate-pulse-glow"
                >
                  🚀 בוא נתחיל את העסק!
                  <ArrowLeft className="mr-3 w-6 h-6" />
                </Button>
              </Link>
              <a href="tel:0502277087">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-20 px-12 text-2xl font-black rounded-3xl border-4 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#1E3A5F] transition-all hover:scale-105 shadow-2xl"
                >
                  📞 התקשר עכשיו
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10"
            >
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                <span>מחיר שקוף</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                <span>רו"ח זמין</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                <span>24-72 שעות</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">מה כולל השירות?</h3>
                      <p className="text-white/60 text-sm">הכל כלול במחיר אחד</p>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {[
                      'פתיחת תיק במס הכנסה',
                      'רישום במע"מ כפטור',
                      'פתיחת תיק בביטוח לאומי',
                      'הנפקת חשבוניות/קבלות',
                      'ליווי שוטף ודיווחים',
                      'אפליקציה לניהול העסק'
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 text-white/90"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#27AE60]/20 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                        </div>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>



              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-[#27AE60] text-white rounded-full px-4 py-2 shadow-lg"
              >
                <span className="font-bold text-sm">⚡ מהיר ופשוט</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8F9FA"/>
        </svg>
      </div>
    </section>
  );
}