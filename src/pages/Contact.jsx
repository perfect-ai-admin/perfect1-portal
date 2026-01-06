import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadForm from '../components/forms/LeadForm';

export default function Contact() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              צור קשר
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              נשמח לענות על כל שאלה ולעזור לך להתחיל את הדרך כעצמאי
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
                  דברו איתנו
                </h2>
                <p className="text-gray-600 text-lg">
                  הצוות שלנו זמין לענות על כל שאלה. בחרו את הדרך הנוחה לכם ליצור קשר.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <a href="tel:0502277087" className="block">
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-elegant transition-all flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A5F]">טלפון</h3>
                      <p className="text-2xl font-bold text-gray-800">0502277087</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="https://wa.me/972502277087?text=היי, הגעתי מהאתר ואשמח לקבל ייעוץ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-elegant transition-all flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#25D366] flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A5F]">וואטסאפ</h3>
                      <p className="text-gray-600">לשיחה מהירה ונוחה</p>
                    </div>
                  </div>
                </a>

                <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#D4AF37] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E3A5F]">שעות פעילות</h3>
                    <p className="text-gray-600">א'-ה' 9:00-18:00</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-6 text-center text-white">
                  <p className="text-4xl font-black mb-2">2000+</p>
                  <p className="text-white/80">עוסקים פטורים בשנה</p>
                </div>
                <div className="bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] rounded-2xl p-6 text-center text-[#1E3A5F]">
                  <p className="text-4xl font-black mb-2">24h</p>
                  <p className="text-[#1E3A5F]/80">זמן תגובה מקסימלי</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <LeadForm 
                title="💼 השאר פרטים ונחזור אליך"
                subtitle="נציג יצור איתך קשר תוך 24 שעות"
                sourcePage="דף צור קשר"
                variant="card"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}