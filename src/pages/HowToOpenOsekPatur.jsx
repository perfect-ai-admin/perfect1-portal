import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { CheckCircle, FileText, Phone, MessageCircle } from 'lucide-react';

export default function HowToOpenOsekPatur() {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...formData,
        source_page: 'איך פותחים עוסק פטור',
        category: 'osek_patur',
        status: 'new'
      });
      window.location.href = '/ThankYou';
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOOptimized
        title="איך פותחים עוסק פטור - מדריך שלב אחר שלב | Perfect One"
        description="הדרך המהירה ביותר לפתוח עוסק פטור בישראל. מדריך מעשי עם כל השלבים והמסמכים הדרושים."
        canonical="https://perfect1.co.il/how-to-open-osek-patur"
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              איך פותחים עוסק פטור בישראל?
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              מדריך שלב אחר שלב לפתיחת עוסק פטור - כל מה שצריך לדעת להתחיל נכון
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1E3A5F]">תהליך הפתיחה</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  פתיחת עוסק פטור כוללת עבודה מול מס הכנסה, ביטוח לאומי ומעבודות חיוביות. יש לנו גם אפשרות לפתיחה אונליין מהבית.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1E3A5F]">מסמכים נדרשים</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  תעודת זהות, כתובת משרד/עבודה, הוכחה על קשר לעסק וכמה מסמכים נוספים בהתאם לתחום.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
              <h2 className="text-3xl font-black text-[#1E3A5F] mb-8 text-center">
                בואו נפתח את עוסקך בנכון
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'קבל הכוונה חינם'}
                </Button>
              </form>

              <div className="flex gap-4 mt-6 pt-6 border-t">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href="tel:+972502277087" className="flex-1">
                  <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    <Phone className="ml-2 w-5 h-5" />
                    טלפון
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}