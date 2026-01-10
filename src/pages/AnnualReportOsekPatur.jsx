import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle } from 'lucide-react';

export default function AnnualReportOsekPatur() {
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
        source_page: 'דוח שנתי לעוסק פטור',
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
        title="דוח שנתי לעוסק פטור - מדריך מלא 2026 | Perfect One"
        description="הדוח השנתי לעוסק פטור - מתי להגיש, מה כולל, איך מוגישים למס הכנסה."
        canonical="https://perfect1.co.il/annual-report-osek-patur"
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              דוח שנתי לעוסק פטור
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              מדריך לדוח השנתי - המסמך הקריטי ביותר לעוסק פטור
            </p>

            <div className="space-y-6 mb-16">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-r-4 border-purple-600">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">מתי מגישים דוח שנתי?</h3>
                <p className="text-gray-700">עד ל-31 באפריל בשנה שלאחר שנת הדיווח</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-r-4 border-blue-600">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">מה כולל הדוח?</h3>
                <p className="text-gray-700">הכנסות בפועל, הוצאות מלא, חישוב רווח/הפסד והתאמות ביטוח לאומי</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-r-4 border-indigo-600">
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-3">השפעה חשובה</h3>
                <p className="text-gray-700">מהדוח תלוי ביטוח לאומי מחדש, זיכויים / חובות בעתיד</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                לא כדאי להשליך את הדוח השנתי
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
                  {isSubmitting ? 'שולח...' : 'בדיקה והכוונה לדוח שנתי'}
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