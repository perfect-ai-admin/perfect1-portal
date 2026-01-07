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
  Star,
  Heart,
  Sparkles
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function LashArtistLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'מעצבת ריסים',
      source_page: 'דף נחיתה - מעצבת ריסים',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור להארכת ריסים 2026 - מעצבות ריסים"
        description="מעצבת ריסים שרוצה לעבוד חוקית? פתיחת עוסק פטור ב-249₪. מושלם להארכת ריסים, למינציה וליפט. אפליקציה + ליווי + דוח שנתי."
        keywords="פתיחת עוסק פטור הארכת ריסים, מעצבת ריסים עוסק פטור, למינציה ריסים עוסק פטור"
        canonical="https://perfect1.co.il/lash-artist-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#8B4789]/10 via-white to-[#DDA0DD]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי סטודיו להארכת ריסים באופן חוקי 👀✨
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                  <strong className="text-[#8B4789]">249₪</strong> - כולל אפליקציה, ליווי חודשי ודוח שנתי
                </p>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">מחירון הארכת ריסים 2026</h3>
                  
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#8B4789] to-[#BA55D3]">
                      <tr>
                        <th className="px-4 py-3 text-right text-white font-bold">טיפול</th>
                        <th className="px-4 py-3 text-center text-white font-bold">זמן</th>
                        <th className="px-4 py-3 text-center text-white font-bold">מחיר</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { service: 'הארכה קלאסית - מלא', time: '120 דק\'', price: '250-400₪' },
                        { service: 'הארכת נפח (Volume)', time: '150 דק\'', price: '350-550₪' },
                        { service: 'מגה וולום (Mega)', time: '180 דק\'', price: '400-700₪' },
                        { service: 'מילוי (Fill)', time: '60 דק\'', price: '120-200₪' },
                        { service: 'הסרת ריסים', time: '30 דק\'', price: '50-80₪' },
                        { service: 'למינציה + ליפט', time: '60 דק\'', price: '150-300₪' }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700 font-medium">{row.service}</td>
                          <td className="px-4 py-3 text-center text-gray-600 text-sm">{row.time}</td>
                          <td className="px-4 py-3 text-center text-[#27AE60] font-bold">{row.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4 p-4 bg-[#8B4789]/5 rounded-xl">
                    <p className="text-sm text-gray-600 text-center">
                      💡 <strong>טיפ:</strong> חבילת תחזוקה חודשית (2 מילויים) - 350-600₪
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://wa.me/972502277087?text=היי, אני מעצבת ריסים ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full h-16 text-xl font-bold bg-[#25D366] hover:bg-[#128C7E] rounded-2xl shadow-xl">
                      <MessageCircle className="w-6 h-6 ml-2" />
                      התחילי עכשיו
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
                {!isSuccess ? (
                  <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">
                      קבלי ייעוץ חינם 🎁
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
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#8B4789] to-[#BA55D3] rounded-xl"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : '✨ שלחי עכשיו'}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold">תודה! 💕</h3>
                    <p className="text-gray-600 text-lg mt-4">נחזור אליך בהקדם</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-[#1E3A5F] mb-12 text-center">
              מה כולל השירות? 📦
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#8B4789] mb-6">✨ בפתיחה (249₪)</h3>
                <ul className="space-y-3">
                  {[
                    'פתיחת תיק במס הכנסה',
                    'רישום בביטוח לאומי',
                    'אפליקציה להנפקת קבלות',
                    'הדרכה אישית',
                    'גישה לפורטל 24/7'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#8B4789] mb-6">💚 ליווי חודשי (199₪)</h3>
                <ul className="space-y-3">
                  {[
                    'ליווי חשבונאי מקצועי',
                    'דוח שנתי למס הכנסה',
                    'ייעוץ בניכויים',
                    'תמיכה בוואטסאפ',
                    'תזכורות אוטומטיות'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#27AE60]" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}