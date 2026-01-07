import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Eye,
  MessageCircle, 
  Phone,
  Loader2,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function EyebrowStylistLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'מעצבת גבות',
      source_page: 'דף נחיתה - מעצבת גבות',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור למעצבות גבות 2026 - מיקרובליידינג ועיצוב גבות"
        description="מעצבת גבות שרוצה לעבוד חוקית? פתיחת עוסק פטור ב-249₪. כולל אפליקציה, ליווי ודוח שנתי. מושלם למיקרובליידינג, למינציה ועיצוב גבות."
        keywords="פתיחת עוסק פטור מעצבת גבות, מיקרובליידינג עוסק פטור, עיצוב גבות עוסק פטור"
        canonical="https://perfect1.co.il/eyebrow-stylist-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#CD853F]/10 via-white to-[#DEB887]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי עוסק פטור ותעבדי חוקית כמעצבת גבות 👁️
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                  <strong className="text-[#CD853F]">249₪</strong> - פתיחה מהירה + אפליקציה + ליווי שוטף
                </p>

                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 text-center">תמחור ממוצע (2026)</h3>
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { service: 'עיצוב גבות בשעווה', price: '50-100₪' },
                        { service: 'צביעת גבות', price: '40-80₪' },
                        { service: 'למינציה לגבות', price: '150-300₪' },
                        { service: 'מיקרובליידינג', price: '800-1,500₪' },
                        { service: 'חבילה חודשית', price: '200-350₪' }
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="py-3 text-gray-700 font-medium">{row.service}</td>
                          <td className="py-3 text-left text-[#27AE60] font-bold">{row.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://wa.me/972502277087?text=היי, אני מעצבת גבות ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full h-16 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      וואטסאפ עכשיו
                    </Button>
                  </a>
                  <a href="tel:0502277087" className="flex-1">
                    <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1E3A5F] rounded-2xl">
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
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold mb-4">תודה! 💕</h3>
                    <p className="text-gray-600 text-lg">נחזור אליך בהקדם</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">
                      השאירי פרטים 🎁
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
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#CD853F] to-[#DEB887] rounded-xl shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'קבלי ייעוץ חינם'}
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, number: '200+', label: 'מעצבות גבות איתנו', color: '#CD853F' },
                { icon: TrendingUp, number: '48h', label: 'פתיחה מהירה', color: '#27AE60' },
                { icon: Award, number: '100%', label: 'שביעות רצון', color: '#1E3A5F' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg text-center"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: stat.color + '20' }}>
                    <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl font-black mb-2" style={{ color: stat.color }}>{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-[#1E3A5F] to-[#2C5282]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              התחילי לעבוד חוקית עוד היום 👁️✨
            </h2>
            <p className="text-xl text-white/90 mb-8">
              הצטרפי למאות מעצבות גבות שכבר עובדות איתנו
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/972502277087?text=היי, אני מעצבת גבות ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer">
                <Button className="h-16 px-10 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                  <MessageCircle className="w-6 h-6 ml-2" />
                  וואטסאפ עכשיו
                </Button>
              </a>
              <a href="tel:0502277087">
                <Button variant="outline" className="h-16 px-10 text-xl font-bold border-2 border-white text-white hover:bg-white hover:text-[#1E3A5F] rounded-2xl">
                  <Phone className="w-6 h-6 ml-2" />
                  0502277087
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}