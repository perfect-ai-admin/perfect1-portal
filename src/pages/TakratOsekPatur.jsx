import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle } from 'lucide-react';

export default function TakratOsekPatur() {
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
        source_page: 'תקרת עוסק פטור',
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
        title="תקרת עוסק פטור 2026 - כמה הכנסה מותרת | Perfect One"
        description="תקרת ההכנסה לעוסק פטור בישראל 2026 - כמה אתה יכול להרוויח בלי להפוך למורשה."
        canonical="https://perfect1.co.il/takrat-osek-patur"
      />

      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              תקרת עוסק פטור 2026
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              כמה הכנסה מותרת לעוסק פטור לפני שהוא צריך להפוך למורשה?
            </p>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8 md:p-12 mb-16 border-2 border-purple-300">
              <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6 text-center">
                התקרה לשנת 2026
              </h2>
              <p className="text-xl text-gray-800 text-center font-bold mb-4">
                עוסק פטור יכול להרוויח עד לסכום מסוים בשנה ללא מע״מ
              </p>
              <p className="text-gray-700 text-center">
                כשאתה חוצה את התקרה, אתה חייב להירשם כעוסק מורשה ולשלם מע״מ על המכירות שלך.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-purple-600">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">פטור מע״מ</h3>
                <p className="text-gray-700">כל עוד הכנסתך מתחת לתקרה, אתה פטור מהרישום למע״מ וחיסכון משמעותי.</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-orange-600">
                <h3 className="text-2xl font-bold text-orange-700 mb-4">מעבר לתקרה</h3>
                <p className="text-gray-700">כשאתה חוצה את התקרה, צריך להירשם כמורשה וההתמודדות מסתבכת.</p>
              </div>
            </div>

            <div className="bg-purple-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                בואו נבדוק אם אתה קרוב לתקרה
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <Input
                  placeholder="שם מלא *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Input
                  type="tel"
                  placeholder="טלפון *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 bg-white/20 border-white/30 text-white placeholder-white/70"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-white text-purple-600 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה סטטוס תקרה'}
                </Button>
              </form>

              <div className="flex gap-4 pt-6 border-t border-white/20">
                <a href="https://wa.me/972502277087" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full h-12 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    WhatsApp
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