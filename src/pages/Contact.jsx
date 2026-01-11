import React from 'react';
import { motion } from 'framer-motion';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import { Phone, MessageCircle, Mail, Clock, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadForm from '../components/forms/LeadForm';
import GoogleMapEmbed from '../components/maps/GoogleMapEmbed';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import ContactCategories from '../components/contact/ContactCategories';

export default function Contact() {
  const breadcrumbs = [
    { label: 'דף הבית', url: '/' },
    { label: 'צור קשר' }
  ];

  return (
    <>
      <LocalBusinessSchema />
      <SEOOptimized 
        {...seoPresets.contact}
        canonical="https://perfect1.co.il/contact"
      />
      <Breadcrumbs items={breadcrumbs} />
      <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
             צור קשר - פתיחת עסק בישראל
            </h1>
            <div className="text-xl text-white/80 max-w-2xl mx-auto">
             <InternalLinker
               content="מידע מקצועי, תהליכים מסודרים וליווי מול רשויות המס. אנחנו כאן לתמוך בך בכל סוג עסק - עוסק פטור, עוסק מורשה או חברה בע״מ."
               currentPage="Contact"
             />
            </div>
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
                <div className="text-gray-600 text-lg">
                  <InternalLinker
                    content="הצוות שלנו זמין לענות על כל שאלה לגבי פתיחת עסק בישראל. בחרו את הדרך הנוחה לכם ליצור קשר."
                    currentPage="Contact"
                  />
                </div>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E3A5F]">שם החברה</h3>
                    <p className="text-xl font-bold text-gray-800">פרפקט וואן</p>
                    <p className="text-gray-500 text-sm">מספר חברה: 516309747</p>
                  </div>
                </div>

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

                <a href="mailto:info@perfect1.co.il" className="block">
                  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-elegant transition-all flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1E3A5F]">אימייל</h3>
                      <p className="text-xl font-bold text-gray-800">info@perfect1.co.il</p>
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

              <MicroCTA text="מעדיפים להתחיל ישירות?" cta="השאירו פרטים ונחזור אליכם" variant="subtle" />
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

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 pb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-6">
              שאלות נפוצות
            </h2>
            <ContactCategories />
          </motion.div>

          {/* Google Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <GoogleMapEmbed 
              title="Perfect One - פתיחת עוסק פטור"
              address="שירות ארצי - זמינים בכל מקום בישראל"
              height="450px"
            />
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}