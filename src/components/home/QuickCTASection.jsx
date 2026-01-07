import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Clock, Shield } from 'lucide-react';
import LeadForm from '../forms/LeadForm';

export default function QuickCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-semibold">פתיחה מהירה תוך 24 שעות</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-6">
              מוכן להתחיל?
              <br />
              <span className="text-[#D4AF37]">בוא נפתח לך עוסק!</span>
            </h2>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              אל תחכה יותר - תוך 24 שעות תוכל להתחיל לעבוד באופן חוקי ולהנפיק חשבוניות. 
              השאר פרטים ונחזור אליך תוך דקות.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Clock, text: 'פתיחה תוך 24 שעות' },
                { icon: Shield, text: 'ליווי מלא ומקצועי' },
                { icon: Zap, text: 'תשלום רק לאחר פתיחה' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span className="text-lg font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Phone CTA for Mobile */}
            <div className="lg:hidden">
              <a href="tel:0502277087">
                <Button 
                  size="lg"
                  className="w-full h-14 bg-[#D4AF37] hover:bg-[#F4D03F] text-[#1E3A5F] font-bold text-lg rounded-xl"
                >
                  התקשר עכשיו: 0502277087
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-[#1E3A5F] mb-2">
                📋 השאר פרטים
              </h3>
              <p className="text-gray-600">נחזור אליך תוך שעות ספורות</p>
            </div>
            
            <LeadForm 
              title=""
              subtitle=""
              sourcePage="דף בית - CTA מהיר אחרי תהליך"
              variant="inline"
            />

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                ✅ <strong>2,000+ עוסקים</strong> פתחנו בהצלחה
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}