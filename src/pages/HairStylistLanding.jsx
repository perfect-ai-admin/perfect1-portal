import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Scissors,
  MessageCircle, 
  Phone,
  Loader2,
  Star,
  Palette,
  Heart
} from 'lucide-react';
import SEOOptimized from './SEOOptimized';

export default function HairStylistLanding() {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setIsSubmitting(true);
    
    await base44.entities.Lead.create({
      ...formData,
      profession: 'מעצבת שיער',
      source_page: 'דף נחיתה - מעצבת שיער',
      status: 'new'
    });

    window.location.href = '/ThankYou';
  };

  return (
    <>
      <SEOOptimized
        title="פתיחת עוסק פטור מעצבת שיער 2026 - סלון ביתי או כיסא בסלון"
        description="מעצבת שיער שרוצה לפתוח סלון ביתי או כיסא בסלון? פתיחת עוסק פטור ב-249₪. כולל אפליקציה, ליווי ודוח שנתי. עבדי חוקית!"
        keywords="פתיחת עוסק פטור מעצבת שיער, מספרה עוסק פטור, סלון שיער ביתי עוסק פטור"
        canonical="https://perfect1.co.il/hair-stylist-osek-patur"
      />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#FF6347]/10 via-white to-[#FFE4E1]/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-[#1E3A5F] mb-6 leading-tight">
                  פתחי סלון או כיסא עצמאי באופן חוקי 💇‍♀️
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                  <strong className="text-[#FF6347]">249₪</strong> - עוסק פטור מלא + אפליקציה + ליווי
                </p>

                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-[#FF6347]/20">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-6 text-center flex items-center justify-center gap-2">
                    <Palette className="w-6 h-6 text-[#FF6347]" />
                    מחירון שירותי שיער (2026)
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-[#FF6347]/10 to-[#FF6347]/5">
                        <tr>
                          <th className="px-4 py-3 text-right text-gray-700 font-bold text-sm">שירות</th>
                          <th className="px-4 py-3 text-center text-gray-700 font-bold text-sm">מחיר ממוצע</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          { service: 'תספורת נשים', price: '100-200₪' },
                          { service: 'פן', price: '120-250₪' },
                          { service: 'צביעה מלאה', price: '300-600₪' },
                          { service: 'הבהרה + טונר', price: '400-800₪' },
                          { service: 'הייליטס / בליאז\'', price: '350-700₪' },
                          { service: 'טיפול קרטין', price: '500-1,200₪' },
                          { service: 'תוספות שיער', price: '800-2,500₪' },
                          { service: 'עיצוב כלות', price: '300-800₪' }
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-800 font-medium">{row.service}</td>
                            <td className="px-4 py-3 text-center text-[#27AE60] font-bold">{row.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    * מחירים משתנים לפי אזור, ניסיון, מוצרים ואורך שיער
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://wa.me/972502277087?text=היי, אני מעצבת שיער ואשמח לפתוח עוסק פטור" target="_blank" rel="noopener noreferrer" className="flex-1">
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
                {!isSuccess ? (
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
                        className="w-full h-14 text-xl font-bold bg-gradient-to-r from-[#FF6347] to-[#FF8C69] rounded-xl shadow-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : '💇 שלחי עכשיו'}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold">תודה רבה! 💕</h3>
                    <p className="text-gray-600 text-lg mt-4">נחזור אליך בהקדם</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Deductions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black text-[#1E3A5F] mb-12 text-center">
              מה מעצבת שיער יכולה לנכות? 🧾
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: '💈 מוצרים וציוד', items: ['מספריים מקצועיים', 'מכשירי חשמל (מייבש, מסלסל)', 'צבעי שיער ומוצרים', 'שמפו וטיפולים', 'תוספות שיער'] },
                { title: '🏠 הוצאות סלון', items: ['שכירות כיסא', 'חשמל ומים', 'ציוד ריהוט', 'שיפוצים', 'ניקיון'] },
                { title: '📚 פיתוח והשתלמות', items: ['קורסי צביעה', 'סדנאות מתקדמות', 'כנסים מקצועיים', 'מנויים מקצועיים', 'שיווק ופרסום'] }
              ].map((col, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-[#FF6347]/5 to-white rounded-2xl p-6 border-2 border-[#FF6347]/20"
                >
                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-4">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-700 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
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