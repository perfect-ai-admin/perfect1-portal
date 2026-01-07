import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Sparkles, 
  MessageCircle, 
  Phone,
  Loader2,
  Star,
  Heart,
  Zap
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function ManicuristLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'מניקוריסטית',
      source_page: 'דף נחיתה - מניקוריסטית',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור למניקוריסטיות 2026 - תא עצמאי או סלון ביתי"
        description="מניקוריסטית שרוצה לפתוח תא בסלון או סלון ביתי? פתיחת עוסק פטור ב-249₪. כולל אפליקציה, ליווי שוטף ודוח שנתי. התחילי לעבוד חוקית!"
        keywords="פתיחת עוסק פטור מניקוריסט, מניקוריסטית עוסק פטור, תא עצמאי עוסק פטור, סלון ביתי עוסק פטור"
        canonical="https://perfect1.co.il/manicurist-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#FF1493]/10 via-white to-[#FFB6C1]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי תא עצמאי או סלון ביתי חוקית 💅
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  <strong className="text-[#FF1493]">249₪ בלבד</strong> - עוסק פטור + אפליקציה + ליווי שוטף כל השנה
                </p>

                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">תמחור ממוצע למניקוריסטיות (2026):</h3>
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { service: 'מניקור + ג\'ל', price: '80-150₪' },
                        { service: 'פדיקור + ג\'ל', price: '100-180₪' },
                        { service: 'בניית ציפורניים', price: '120-250₪' },
                        { service: 'חבילה חודשית', price: '300-500₪' }
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
                  <a href="https://wa.me/972502277087?text=היי, אני מניקוריסטית ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
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
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">תודה! 💕</h3>
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
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#FF1493] to-[#FF69B4] rounded-xl shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : '✨ שלחי עכשיו'}
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* What Can You Deduct */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-[#1E3A5F] mb-12 text-center">
              מה מניקוריסטית יכולה לנכות? 🧾
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: '💅 מוצרים וציוד',
                  items: ['ג\'ל ולק מקצועיים', 'מברשות וכלים', 'מנורת UV/LED', 'שולחן ושרפרף', 'מוצרי ניקוי']
                },
                {
                  title: '🏠 הוצאות מקום',
                  items: ['שכירות תא בסלון', 'חשמל ומים', 'אינטרנט', 'ביטוח תכולה', 'שיפוצים וציוד']
                },
                {
                  title: '📚 פיתוח מקצועי',
                  items: ['קורסי העשרה', 'כנסים וסדנאות', 'ספרות מקצועית', 'מנויים מקצועיים', 'פרסום ושיווק']
                }
              ].map((col, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-[#FF1493]/5 to-white rounded-2xl p-6 border-2 border-[#FF1493]/20"
                >
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}