import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Sparkles, 
  Heart, 
  Shield,
  MessageCircle, 
  Phone,
  Loader2,
  Star,
  Users,
  Clock
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function CosmeticianLandingNew() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'קוסמטיקאית',
      source_page: 'דף נחיתה - קוסמטיקאית',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור קוסמטיקאית 2026 - המדריך המלא + ליווי מקצועי"
        description="קוסמטיקאית שרוצה לעבוד חוקית? פתיחת עוסק פטור לקוסמטיקאיות ב-249₪ בלבד. כולל אפליקציה, ליווי שוטף ודוח שנתי. פתחי קליניקה חוקית!"
        keywords="פתיחת עוסק פטור קוסמטיקאית, קוסמטיקאית עוסק פטור, קליניקת קוסמטיקה עוסק פטור"
        canonical="https://perfect1.co.il/cosmetician-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#DDA0DD]/10 via-white to-[#FFE4E1]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-[#DDA0DD]/10 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-4 h-4 text-[#DDA0DD]" />
                  <span className="text-sm font-bold text-[#DDA0DD]">מיוחד לקוסמטיקאיות</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי קליניקה חוקית ב-48 שעות ✨
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  <strong className="text-[#DDA0DD]">249₪ בלבד</strong> - קבלי עוסק פטור + אפליקציה להנפקת קבלות + ליווי שוטף כל השנה
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    'פתיחה ב-48 שעות ⚡',
                    'קבלות דיגיטליות 📱',
                    'ביטוח אחריות כלול 🛡️',
                    'דוח שנתי חינם 📊'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://wa.me/972502277087?text=היי, אני קוסמטיקאית ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full h-16 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      פתחי עכשיו בוואטסאפ
                    </Button>
                  </a>
                  <a href="tel:0502277087" className="flex-1">
                    <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-2xl">
                      <Phone className="w-6 h-6 ml-2" />
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
                {isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">תודה רבה! 💕</h3>
                    <p className="text-gray-600 text-lg">נחזור אליך תוך שעות</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">
                      קבלי ייעוץ חינם עכשיו 🎁
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        placeholder="שם מלא"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-14 text-lg rounded-xl border-2"
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="טלפון"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-14 text-lg rounded-xl border-2"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#DDA0DD] to-[#BA55D3] hover:from-[#BA55D3] hover:to-[#DDA0DD] rounded-xl shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : '✨ קבלי ייעוץ חינם'}
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Treatment Pricing Table */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-black text-[#1E3A5F] mb-4">
                תמחור ממוצע לטיפולים 💆‍♀️
              </h2>
              <p className="text-xl text-gray-600">כך קוסמטיקאיות מתמחרות (2026)</p>
            </motion.div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#DDA0DD] to-[#BA55D3]">
                  <tr>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg">סוג הטיפול</th>
                    <th className="px-6 py-4 text-center text-white font-bold text-lg">משך (דקות)</th>
                    <th className="px-6 py-4 text-center text-white font-bold text-lg">מחיר ממוצע</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { treatment: 'טיפול פנים בסיסי', duration: '60', price: '200-350₪' },
                    { treatment: 'פילינג כימי', duration: '45', price: '250-450₪' },
                    { treatment: 'טיפול אנטי אייג\'ינג', duration: '75', price: '350-600₪' },
                    { treatment: 'טיפול באקנה', duration: '60', price: '250-400₪' },
                    { treatment: 'הסרת שיער בשעווה (פנים)', duration: '30', price: '80-150₪' },
                    { treatment: 'עיסוי פנים לימפתי', duration: '45', price: '200-350₪' },
                    { treatment: 'מזותרפיה', duration: '45', price: '300-500₪' },
                    { treatment: 'חבילת טיפולים (5)', duration: '300', price: '900-2,000₪' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">{row.treatment}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.duration}</td>
                      <td className="px-6 py-4 text-center text-[#27AE60] font-bold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                * המחירים משתנים לפי אזור, ניסיון ומוצרים בשימוש
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Users, number: '300+', label: 'קוסמטיקאיות פתחו איתנו' },
                { icon: Clock, number: '24 שעות', label: 'תמיכה זמינה' },
                { icon: Star, number: '4.9/5', label: 'דירוג ממוצע' },
                { icon: Shield, number: '100%', label: 'ביטחון ואמינות' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#DDA0DD] to-[#BA55D3] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black text-[#1E3A5F] mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                מוכנה לפתוח קליניקה באופן חוקי? ✨
              </h2>
              <p className="text-xl text-white/90 mb-8">
                הצטרפי ל-300+ קוסמטיקאיות שכבר עובדות איתנו
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/972502277087?text=היי, אני קוסמטיקאית ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                  <Button className="h-16 px-10 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                    <MessageCircle className="w-6 h-6 ml-2" />
                    וואטסאפ - תגובה מיידית
                  </Button>
                </a>
                <a href="tel:0502277087">
                  <Button variant="outline" className="h-16 px-10 text-xl font-bold border-2 border-white text-white hover:bg-white hover:text-[#1E3A5F] rounded-2xl">
                    <Phone className="w-6 h-6 ml-2" />
                    0502277087
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}