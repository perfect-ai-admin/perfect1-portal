import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MessageCircle, ArrowLeft, Star, Clock, Shield, Award } from 'lucide-react';
import LeadForm from '../components/forms/LeadForm';

// This page is designed for multi-domain setup where each profession has its own domain
// Example: meatzev-grafi.osek-patur.co.il

const professionLandingData = {
  'meatzev-grafi': {
    name: 'מעצב גרפי',
    icon: '🎨',
    color: '#FF6B6B',
    heroTitle: 'פתיחת עוסק פטור למעצבים גרפיים',
    heroSubtitle: 'התחל לעבוד חוקית תוך 24-72 שעות',
    description: 'עולם העיצוב הגרפי מציע אינסוף הזדמנויות. הגיע הזמן להפוך את העיצובים שלך לעסק רווחי וחוקי.',
    services: [
      'עיצוב לוגואים ומיתוג',
      'עיצוב לרשתות חברתיות',
      'עיצוב חומרי שיווק',
      'עיצוב אתרים',
      'עיצוב אריזות מוצרים'
    ],
    tips: [
      'תוכנות עיצוב (Adobe CC) מוכרות כהוצאה',
      'ציוד מחשוב מוכר',
      'קורסים והשתלמויות מוכרים',
      'שמור קבלות על כל רכישה'
    ]
  }
};

export default function ProfessionLanding() {
  // In real multi-domain setup, you'd detect the domain/subdomain here
  // For now, we'll use URL params as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const professionSlug = urlParams.get('p') || 'meatzev-grafi';
  
  const data = professionLandingData[professionSlug] || professionLandingData['meatzev-grafi'];

  return (
    <main className="min-h-screen">
      {/* Hero Section - Above the Fold */}
      <section 
        className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] overflow-hidden"
      >
        {/* Background Pattern */}
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
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-2xl mx-auto lg:mr-0 lg:ml-auto"
                style={{ backgroundColor: data.color + '30' }}
              >
                {data.icon}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                {data.heroTitle}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                {data.heroSubtitle}
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white font-bold">2,000+ עוסקים בשנה</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-[#27AE60]" />
                  <span className="text-white font-bold">24-72 שעות</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-white font-bold">ליווי מלא</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={`https://wa.me/972502277087?text=היי, אני ${data.name} ומעוניין לפתוח עוסק פטור`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-6 h-6 ml-2" />
                    שלח וואטסאפ עכשיו
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-16 px-10 text-xl font-black rounded-2xl border-3 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-105 shadow-xl"
                  >
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
                  <Award className="w-5 h-5" />
                  <span className="font-bold">הצעה מיוחדת למקצוע</span>
                </div>
                <h2 className="text-2xl font-black text-[#1E3A5F] mb-2">
                  פתיחת תיק תוך 24-72 שעות
                </h2>
                <p className="text-gray-600">מלא פרטים ונחזור אליך היום</p>
              </div>
              <LeadForm 
                title=""
                subtitle=""
                defaultProfession={data.name}
                sourcePage={`Landing - ${data.name}`}
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
            <p className="text-xl text-gray-600">הכל כלול במחיר אחד</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📝', title: 'פתיחת תיק במס הכנסה', desc: 'אנחנו מטפלים בכל הבירוקרטיה' },
              { icon: '💳', title: 'רישום במע"מ כפטור', desc: 'פטור מגביית מע"מ עד 120K' },
              { icon: '🛡️', title: 'ביטוח לאומי', desc: 'פתיחת תיק ודיווחים' },
              { icon: '📱', title: 'אפליקציה לניהול', desc: 'מעקב הכנסות והוצאות' },
              { icon: '👨‍💼', title: 'רו"ח זמין', desc: 'יועץ מס לכל שאלה' },
              { icon: '✅', title: 'ליווי מלא', desc: 'נלווה אותך לאורך כל הדרך' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services for Profession */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-[#1E3A5F] mb-6">
                שירותים נפוצים במקצוע
              </h2>
              <ul className="space-y-3">
                {data.services.map((service, index) => (
                  <li key={index} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <CheckCircle className="w-6 h-6 text-[#27AE60] flex-shrink-0" />
                    <span className="text-lg text-gray-700">{service}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-black text-[#1E3A5F] mb-6">
                טיפים חשובים למקצוע
              </h2>
              <ul className="space-y-3">
                {data.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 bg-[#D4AF37]/10 rounded-xl p-4">
                    <span className="text-2xl">💡</span>
                    <span className="text-lg text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-[#1E3A5F] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              מחירים שקופים
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-5xl font-black text-[#D4AF37] mb-2">199₪</div>
                <div className="text-sm text-white/70 mb-4">+מע"מ</div>
                <div className="text-xl font-bold">פתיחת תיק</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-5xl font-black text-[#D4AF37] mb-2">149₪</div>
                <div className="text-sm text-white/70 mb-4">+מע"מ לחודש</div>
                <div className="text-xl font-bold">ליווי חודשי</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-5xl font-black text-[#D4AF37] mb-2">500₪</div>
                <div className="text-sm text-white/70 mb-4">+מע"מ לשנה</div>
                <div className="text-xl font-bold">דוח שנתי</div>
              </div>
            </div>
            <a
              href={`https://wa.me/972502277087?text=היי, אני ${data.name} ומעוניין לפתוח עוסק פטור`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                className="h-16 px-12 text-xl font-black rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] hover:from-[#c9a432] hover:to-[#D4AF37] text-[#1E3A5F] shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-6 h-6 ml-2" />
                בוא נתחיל!
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-[#D4AF37] to-[#F4D03F]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black text-[#1E3A5F] mb-6">
              מוכן להתחיל?
            </h2>
            <p className="text-xl text-[#1E3A5F]/80 mb-8">
              הצטרף לאלפי העצמאים שכבר עובדים באופן חוקי
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/972502277087?text=היי, אני ${data.name} ומעוניין לפתוח עוסק פטור`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-2xl bg-[#1E3A5F] hover:bg-[#2C5282] text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6 ml-2" />
                  דבר איתנו בוואטסאפ
                </Button>
              </a>
              <a href="tel:0502277087">
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-2xl border-3 border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white transition-all hover:scale-105 shadow-xl"
                >
                  <Phone className="w-6 h-6 ml-2" />
                  0502277087
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}