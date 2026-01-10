import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Phone, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

export default function NeedAccountantOsekPatur() {
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
        source_page: 'צריך רואה חשבון לעוסק פטור',
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
        title="צריך רואה חשבון לעוסק פטור? | Perfect One"
        description="האם צריך רואה חשבון כשאתה עוסק פטור? מדריך מלא על צורכים פיננסיים וחוקיים."
        canonical="https://perfect1.co.il/need-accountant-osek-patur"
      />

      <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-[#1E3A5F] mb-6 text-center">
              צריך רואה חשבון לעוסק פטור?
            </h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
              התשובה תלויה בגודל העסק שלך וברמת המורכבות שלו
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-green-50 rounded-2xl p-8 border-2 border-green-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-700">תורם רואה חשבון</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>✓ עסק מורכב עם הוצאות רבות</li>
                  <li>✓ הכנסה גבוהה</li>
                  <li>✓ צריך ייעוץ מקצועי</li>
                  <li>✓ רוצה להיות בטוח במס הכנסה</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <XCircle className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-blue-700">לא בהכרח צריך</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li>• עסק קטן וסתם</li>
                  <li>• הכנסה נמוכה</li>
                  <li>• מעט הוצאות</li>
                  <li>• אתה יכול לנהל זאת בעצמך</li>
                </ul>
              </motion.div>
            </div>

            <div className="bg-cyan-600 text-white rounded-3xl p-8 md:p-12 shadow-2xl">
              <h2 className="text-3xl font-black mb-8 text-center">
                בואו נבדוק אם אתה צריך רואה חשבון
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
                  className="w-full h-12 bg-white text-cyan-600 hover:bg-gray-100 font-bold"
                >
                  {isSubmitting ? 'שולח...' : 'בדיקה אישית בחינם'}
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